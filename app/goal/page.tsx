'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { useCalculator } from '@/contexts/CalculatorContext';
import { formatWeight, formatLength } from '@/lib/units';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Apple } from 'lucide-react';
import { ContactPopup } from '@/components/ui/contact-popup';
import { useRouter } from 'next/navigation';

export default function GoalPage() {
  const {
    userData,
    calculations,
    proteinPerKg,
    setProteinPerKg,
    targetWeight,
    setTargetWeight,
    isTargetWeightEnabled,
    setIsTargetWeightEnabled,
    targetWeightCalculations,
    calculateWithTargetWeight
  } = useCalculator();
  const router = useRouter();

  // All hooks must be called before any conditional logic
  const [selectedGoal, setSelectedGoal] = useState('stay-fit');
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  // Local state for target weight input (for display purposes)
  const [targetWeightInput, setTargetWeightInput] = useState('');
  const [activelyEditingTargetWeight, setActivelyEditingTargetWeight] = useState(false);
  // Track user-adjusted target weights per goal to preserve them
  const [userAdjustedWeights, setUserAdjustedWeights] = useState<{
    'lose-weight'?: string;
    'gain-muscles'?: string;
  }>({});
  // Local state for protein input (for display purposes)
  const [proteinInput, setProteinInput] = useState('');
  const [activelyEditingProtein, setActivelyEditingProtein] = useState(false);
  const isInitialized = useRef(false);
  const logCount = useRef(0);

  // Helper functions - defined before useEffect hooks to avoid hoisting issues

  // Helper function to validate target weight input
  const isTargetWeightValid = (value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) return false;

    const minValue = getSliderMin();
    const maxValue = getSliderMax();
    return numericValue >= minValue && numericValue <= maxValue;
  };

  // Helper function to validate protein input
  const isProteinValid = (value: string) => {
    const numericValue = parseFloat(value);
    return !isNaN(numericValue) && numericValue >= 0.1 && numericValue <= 5.0;
  };

  // Helper function to get current weight in display units
  const getCurrentWeightInDisplayUnits = () => {
    // Return a safe default if userData is not available
    if (!userData.weight) return 70; // Default weight in kg

    if (userData.unitSystem === 'imperial') {
      return Math.round(userData.weight * 2.20462);
    }
    return Math.round(userData.weight * 10) / 10;
  };

  // Goal-specific slider ranges
  const getSliderMin = () => {
    // Return safe defaults if userData is not available
    if (!userData.weight) return 40; // Safe minimum

    const currentWeight = getCurrentWeightInDisplayUnits();
    if (selectedGoal === 'lose-weight') {
      // For weight loss, allow going down to a reasonable minimum
      return Math.max(currentWeight - 100, currentWeight * 0.7); // Don't go below 70% of current weight
    } else if (selectedGoal === 'gain-muscles') {
      // For muscle gain, start from current weight
      return currentWeight;
    }
    // Default range
    return currentWeight - 100;
  };

  const getSliderMax = () => {
    // Return safe defaults if userData is not available
    if (!userData.weight) return 200; // Safe maximum

    const currentWeight = getCurrentWeightInDisplayUnits();
    if (selectedGoal === 'lose-weight') {
      // For weight loss, max should be current weight
      return currentWeight;
    } else if (selectedGoal === 'gain-muscles') {
      // For muscle gain, allow significant gain
      return currentWeight + 100;
    }
    // Default range
    return currentWeight + 100;
  };

  // Sync target weight input with actual target weight value
  useEffect(() => {
    if (!activelyEditingTargetWeight) {
      if (targetWeight && parseFloat(targetWeight) > 0) {
        setTargetWeightInput(targetWeight);
      } else {
        setTargetWeightInput('');
      }
    }
  }, [targetWeight, activelyEditingTargetWeight]);

  // Sync protein input with actual protein value
  useEffect(() => {
    if (!activelyEditingProtein) {
      setProteinInput(proteinPerKg.toString());
    }
  }, [proteinPerKg, activelyEditingProtein]);

  // Auto-disable target weight for "Maintain" goal and enable for others
  // Preserve user-adjusted target weights when switching between goals
  useEffect(() => {
    // Only run if userData is available
    if (!userData.weight || !userData.height) return;

    const currentWeightInDisplayUnits = getCurrentWeightInDisplayUnits();

    if (selectedGoal === 'stay-fit') {
      // Disable target weight for maintain goal
      if (isTargetWeightEnabled) {
        setIsTargetWeightEnabled(false);
      }
    } else {
      // Enable target weight for lose/gain goals
      if (!isTargetWeightEnabled) {
        setIsTargetWeightEnabled(true);
      }

      // Check if user has a previously adjusted weight for this goal
      const goalKey = selectedGoal as 'lose-weight' | 'gain-muscles';
      const savedWeight = userAdjustedWeights[goalKey];

      if (savedWeight) {
        // Restore the user's previously adjusted weight for this goal
        setTargetWeight(savedWeight);
        setTargetWeightInput(savedWeight);
      } else {
        // First time on this goal, set to current weight
        setTargetWeight(currentWeightInDisplayUnits.toString());
        setTargetWeightInput(currentWeightInDisplayUnits.toString());
      }
    }
  }, [selectedGoal, isTargetWeightEnabled, setIsTargetWeightEnabled, userData.weight, userData.height, userAdjustedWeights]);

  const handleContactSubmit = (contactData: { name: string; email: string }) => {
    // Here you would typically send the data to your backend
    console.log('Contact data submitted:', contactData);
    console.log('User data:', userData);
    console.log('Calculations:', calculations);

    // Simulate API call
    setTimeout(() => {
      // Redirect to root page for fresh start
      router.push('/');
    }, 3000);
  };

  // Calculate goal-specific calorie target using current weight for metabolism
  const getCalorieTarget = () => {
    // Always use current weight calculations for BMR/TDEE (metabolism based on current body)
    const currentCalculations = calculations;

    if (!currentCalculations) {
      return 2000; // Fallback value
    }

    // Get calorie target based on selected goal - but always from current weight metabolism
    switch (selectedGoal) {
      case 'lose-weight':
        // For weight loss, adjust deficit based on target weight difference
        if (isTargetWeightEnabled && targetWeight) {
          const currentWeightKg = userData.weight;
          const targetWeightKg = getTargetWeightInKg();
          const weightDifference = currentWeightKg - targetWeightKg; // Positive for weight loss

          // Base weight loss calories
          let lossCalories = currentCalculations.calorieTargets.slowLoss;

          // Adjust based on how much weight they want to lose
          if (weightDifference > 0) {
            // More aggressive deficit for larger weight loss goals, but keep it safe
            // Reduce 25-50 calories per 10kg (22lbs) of target loss, max 200 calories additional deficit
            const additionalDeficit = Math.min(200, (weightDifference / 10) * 35);
            lossCalories -= additionalDeficit;

            // Safety check: never go below BMR
            const minCalories = currentCalculations.bmr;
            lossCalories = Math.max(lossCalories, minCalories);
          }

          return lossCalories;
        }
        return currentCalculations.calorieTargets.slowLoss;
      case 'gain-muscles':
        // For muscle gain, adjust calories based on target weight difference
        if (isTargetWeightEnabled && targetWeight) {
          const currentWeightKg = userData.weight;
          const targetWeightKg = getTargetWeightInKg();
          const weightDifference = targetWeightKg - currentWeightKg;

          // Base muscle gain calories
          let gainCalories = currentCalculations.calorieTargets.muscleGain;

          // Adjust based on how much weight they want to gain
          if (weightDifference > 0) {
            // More aggressive surplus for larger weight gain goals
            // Add 50-100 calories per 10kg (22lbs) of target gain
            const additionalCalories = Math.min(300, (weightDifference / 10) * 75);
            gainCalories += additionalCalories;
          }

          return gainCalories;
        }
        return currentCalculations.calorieTargets.muscleGain;
      case 'stay-fit':
        return currentCalculations.calorieTargets.maintenance;
      default:
        return currentCalculations.calorieTargets.maintenance;
    }
  };

  // Helper function to get target weight in kg for calculations
  const getTargetWeightInKg = () => {
    const targetValue = parseFloat(targetWeight || '0');
    if (isNaN(targetValue) || targetValue <= 0) {
      return userData.weight; // Fallback to current weight
    }
    if (userData.unitSystem === 'imperial') {
      return targetValue / 2.20462; // Convert lbs to kg
    }
    return targetValue; // Already in kg
  };



  const calorieTarget = getCalorieTarget();

  // Calculate goal-specific macro distribution
  const getMacroDistribution = () => {
    switch (selectedGoal) {
      case 'lose-weight':
        return { protein: 30, carbs: 35, fats: 30, fiber: 5 }; // High protein for satiety
      case 'gain-muscles':
        return { protein: 25, carbs: 45, fats: 25, fiber: 5 }; // High carbs for energy
      case 'stay-fit':
        return { protein: 20, carbs: 50, fats: 25, fiber: 5 }; // Balanced distribution
      default:
        return { protein: 20, carbs: 50, fats: 25, fiber: 5 };
    }
  };

  const macroDistribution = getMacroDistribution();

  // Calculate actual protein intake based on goal and user preference
  const targetWeightForProtein = (isTargetWeightEnabled && selectedGoal !== 'stay-fit')
    ? getTargetWeightInKg()
    : userData.weight;
  // Use proteinPerKg setting (which is actually grams per pound in the UI)
  const goalProteinIntake = targetWeightForProtein * 2.20462 * proteinPerKg; // Convert kg to lbs, then multiply by g/lb setting

  // Calculate protein percentage from actual protein needs
  const proteinCalories = goalProteinIntake * 4;
  const calculatedProteinPercentage = (proteinCalories / calorieTarget) * 100;

  // Ensure protein percentage is reasonable (10-40%)
  const proteinPercentage = Math.min(40, Math.max(10, calculatedProteinPercentage));

  // Calculate remaining percentages proportionally
  const remainingPercentage = 100 - proteinPercentage;
  const baseFatPercentage = macroDistribution.fats;
  const baseFiberPercentage = macroDistribution.fiber;
  const baseCarbPercentage = macroDistribution.carbs;

  // Scale non-protein macros proportionally to fit remaining percentage
  const totalNonProtein = baseFatPercentage + baseFiberPercentage + baseCarbPercentage;
  const fatPercentage = (baseFatPercentage / totalNonProtein) * remainingPercentage;
  const fiberPercentage = (baseFiberPercentage / totalNonProtein) * remainingPercentage;
  const carbPercentage = (baseCarbPercentage / totalNonProtein) * remainingPercentage;

  const nutritionData = {
    totalCalories: Math.round(calorieTarget),
    totalKJ: Math.round(calorieTarget * 4.184),
    macros: [
      {
        name: 'Proteins',
        amount: Math.round(goalProteinIntake),
        unit: 'g',
        percentage: Math.round(proteinPercentage),
        color: '#F44336'
      },
      {
        name: 'Carbohydrate',
        amount: Math.round((calorieTarget * carbPercentage / 100) / 4),
        unit: 'g',
        percentage: Math.round(carbPercentage),
        color: '#0091EA'
      },
      {
        name: 'Fats',
        amount: Math.round((calorieTarget * fatPercentage / 100) / 9),
        unit: 'g',
        percentage: Math.round(fatPercentage),
        color: '#FFC107'
      },
      {
        name: 'Fiber',
        amount: Math.round((calorieTarget * fiberPercentage / 100) / 2), // Fiber provides ~2 cal/g, not 4
        unit: 'g',
        percentage: Math.round(fiberPercentage),
        color: '#8BC34A'
      }
    ]
  };

  // 🔍 CONTROLLED LOGGING - Prevent Cascading Triggers
  useEffect(() => {
    // Set initialization flag after first render
    const timer = setTimeout(() => {
      if (!isInitialized.current) {
        isInitialized.current = true;
        console.log('='.repeat(80));
        console.log('🎯 GOAL PAGE - INITIAL LOAD COMPLETE');
        console.log('='.repeat(80));
        logCompleteData();
      }
    }, 100); // Small delay to prevent cascade

    return () => clearTimeout(timer);
  }, []);

  // 🔍 CONTROLLED LOGGING - Only After Initialization
  useEffect(() => {
    if (isInitialized.current) {
      console.log('='.repeat(80));
      console.log('🎯 GOAL SELECTION CHANGED');
      console.log('='.repeat(80));
      console.log('📊 Selected Goal:', selectedGoal);
      logCompleteData();
    }
  }, [selectedGoal]);

  useEffect(() => {
    if (isInitialized.current) {
      console.log('='.repeat(80));
      console.log('🎯 TARGET WEIGHT CHANGED');
      console.log('='.repeat(80));
      console.log('📊 Target Weight Enabled:', isTargetWeightEnabled);
      console.log('📊 Target Weight Value:', targetWeight);
      logCompleteData();
    }
  }, [targetWeight, isTargetWeightEnabled]);



  // 🔍 COMPREHENSIVE LOGGING FUNCTION
  const logCompleteData = () => {
    console.log('🚀 GOAL PAGE - COMPLETE DATA ANALYSIS');
    console.log('='.repeat(80));

    // Always use current weight calculations for basic metrics (Phase 2 logic)
    const currentCalculations = calculations;

    if (currentCalculations) {
      console.log('🔥 Energy Calculations (Current Weight Metabolism):', {
        bmr: `${Math.round(currentCalculations.bmr)} calories/day`,
        tdee: `${Math.round(currentCalculations.tdee)} calories/day`
      });

      console.log('🎯 Calorie Targets (Goal-Based):', {
        maintenance: `${Math.round(currentCalculations.calorieTargets.maintenance)} calories/day`,
        slowLoss: `${Math.round(currentCalculations.calorieTargets.slowLoss)} calories/day`,
        rapidLoss: `${Math.round(currentCalculations.calorieTargets.rapidLoss)} calories/day`,
        muscleGain: `${Math.round(currentCalculations.calorieTargets.muscleGain)} calories/day`
      });

      console.log('💪 Body Composition:', {
        bmi: `${currentCalculations.bmi.value.toFixed(1)} (${currentCalculations.bmi.category})`,
        bodyFat: userData.bodyFat ? `${userData.bodyFat}%` : 'Not provided'
      });

      console.log('💧 Additional Metrics:', {
        waterWeightFluctuation: currentCalculations.waterWeightFluctuation ? `${(currentCalculations.waterWeightFluctuation * 2.20462).toFixed(1)} lbs` : 'Not calculated',
        proteinIntake: currentCalculations.proteinIntake ? `${currentCalculations.proteinIntake.toFixed(1)}g (legacy - now using custom)` : 'Not calculated'
      });
    } else {
      console.log('❌ No calculations available');
    }
  };

  const goals = [
    { id: 'lose-weight', label: 'Lose', active: selectedGoal === 'lose-weight' },
    { id: 'stay-fit', label: 'Maintain', active: selectedGoal === 'stay-fit' },
    { id: 'gain-muscles', label: 'Gain', active: selectedGoal === 'gain-muscles' }
  ];

  // Redirect to home if calculations are missing (after all hooks have been called)
  if (!calculations || !userData.weight || !userData.height) {
    // Trigger redirect
    if (typeof window !== 'undefined') {
      router.push('/');
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center overflow-hidden md:min-h-screen md:bg-gray-50 md:flex-none md:items-start md:overflow-visible">
      <div className="max-w-2xl mx-auto w-full h-full md:h-auto md:p-4">
        <Card className="shadow-lg w-full h-full flex flex-col md:h-auto" style={{ backgroundColor: '#F5F5F5' }}>
          <CardHeader className="text-center pb-6 flex-shrink-0">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Your Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-y-auto md:overflow-y-visible md:space-y-6">
            <div className="space-y-6 flex-1 md:flex-none">

              {/* Goal Selection */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-800">I want to:</span>
                </div>

                <div className="flex gap-2">
                  {goals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => {
                        setSelectedGoal(goal.id);
                        // Immediately reset target weight to current weight when switching goals
                        // This ensures the slider doesn't maintain values from previous selections
                        if (goal.id !== 'stay-fit') {
                          const currentWeightInDisplayUnits = getCurrentWeightInDisplayUnits();
                          setTargetWeight(currentWeightInDisplayUnits.toString());
                          setTargetWeightInput(currentWeightInDisplayUnits.toString());
                        }
                      }}
                      className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${goal.active
                        ? 'text-white shadow-md'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      style={{
                        backgroundColor: goal.active ? '#31860A' : undefined,
                        borderRadius: '12px'
                      }}
                    >
                      {goal.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Content Based on Selected Goal */}
              {selectedGoal === 'stay-fit' && (
                <>
                  {/* Protein Intake for Maintain */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700">
                        Protein Intake (g per lb body weight):
                      </span>
                      <Input
                        type="number"
                        value={proteinInput}
                        onFocus={() => setActivelyEditingProtein(true)}
                        onBlur={() => {
                          setActivelyEditingProtein(false);
                          // Only update if valid, otherwise keep input to show error
                          if (isProteinValid(proteinInput)) {
                            const value = parseFloat(proteinInput);
                            setProteinPerKg(value);
                          }
                        }}
                        onChange={(e) => {
                          setProteinInput(e.target.value);
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0.1 && value <= 5.0) {
                            setProteinPerKg(value);
                          }
                        }}
                        className={`text-center w-20 h-8 font-bold ${!isProteinValid(proteinInput) && proteinInput !== '' ? 'border-red-500' : ''}`}
                        style={{
                          backgroundColor: !isProteinValid(proteinInput) && proteinInput !== '' ? 'rgba(239, 68, 68, 0.1)' : '#F5F5F5',
                          border: `solid 1px ${!isProteinValid(proteinInput) && proteinInput !== '' ? '#EF4444' : '#CFCFCF'}`,
                          borderRadius: '12px',
                          fontSize: '14px'
                        }}
                        step="0.1"
                        min="0.1"
                        max="5.0"
                        placeholder="1.0"
                      />
                    </div>

                    {/* Error message for protein */}
                    {!isProteinValid(proteinInput) && proteinInput !== '' && (
                      <div className="text-red-600 text-xs mt-1">
                        Protein intake must be between 0.1 and 5.0 grams per pound
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      Adjust between 0.1-5.0g per pound (based on current weight)
                    </p>
                  </div>

                  {/* Maintenance Calories */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Maintenance Calories
                    </h3>
                    <div className="flex items-center space-x-6">
                      {/* Animated Pie Chart */}
                      <div className="relative w-24 h-24">
                        <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
                          <circle cx="48" cy="48" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                          <circle
                            cx="48" cy="48" r="40"
                            fill="none"
                            stroke="#F44336"
                            strokeWidth="12"
                            strokeDasharray={`${proteinPercentage * 2.51} 251`}
                            strokeDashoffset="0"
                            style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
                          />
                          <circle
                            cx="48" cy="48" r="40"
                            fill="none"
                            stroke="#0091EA"
                            strokeWidth="12"
                            strokeDasharray={`${carbPercentage * 2.51} 251`}
                            strokeDashoffset={`-${proteinPercentage * 2.51}`}
                            style={{ transition: 'stroke-dasharray 0.5s ease-in-out, stroke-dashoffset 0.5s ease-in-out' }}
                          />
                          <circle
                            cx="48" cy="48" r="40"
                            fill="none"
                            stroke="#FFC107"
                            strokeWidth="12"
                            strokeDasharray={`${fatPercentage * 2.51} 251`}
                            strokeDashoffset={`-${(proteinPercentage + carbPercentage) * 2.51}`}
                            style={{ transition: 'stroke-dasharray 0.5s ease-in-out, stroke-dashoffset 0.5s ease-in-out' }}
                          />
                          <circle
                            cx="48" cy="48" r="40"
                            fill="none"
                            stroke="#8BC34A"
                            strokeWidth="12"
                            strokeDasharray={`${fiberPercentage * 2.51} 251`}
                            strokeDashoffset={`-${(proteinPercentage + carbPercentage + fatPercentage) * 2.51}`}
                            style={{ transition: 'stroke-dasharray 0.5s ease-in-out, stroke-dashoffset 0.5s ease-in-out' }}
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-800">
                          {nutritionData.totalCalories} Calories
                        </div>
                      </div>
                    </div>
                    {/* Nutrition Breakdown */}
                    <div className="space-y-2">
                      {nutritionData.macros.map((macro, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: macro.color }}
                            />
                            <span className="text-sm font-medium" style={{ color: macro.color }}>
                              {macro.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium" style={{ color: macro.color }}>
                              {macro.amount} {macro.unit}
                            </span>
                            <span className="text-sm font-medium w-8 text-right" style={{ color: macro.color }}>
                              {macro.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(selectedGoal === 'lose-weight' || selectedGoal === 'gain-muscles') && (
                <>
                  {/* Target Weight for Lose/Gain */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Target Weight</span>
                      <div className="flex items-center space-x-3">
                        <div className="relative inline-block">
                          <Input
                            type="number"
                            value={targetWeightInput}
                            onFocus={() => setActivelyEditingTargetWeight(true)}
                            onBlur={() => {
                              setActivelyEditingTargetWeight(false);
                              // Only update if the value is valid, otherwise keep the input as-is to show error
                              if (isTargetWeightValid(targetWeightInput)) {
                                const numericValue = parseFloat(targetWeightInput);
                                const roundedValue = Math.round(numericValue * 2) / 2;
                                const roundedValueStr = roundedValue.toString();
                                setTargetWeight(roundedValueStr);
                                setTargetWeightInput(roundedValueStr);

                                // Save user-adjusted weight for this goal
                                if (selectedGoal === 'lose-weight' || selectedGoal === 'gain-muscles') {
                                  setUserAdjustedWeights(prev => ({
                                    ...prev,
                                    [selectedGoal]: roundedValueStr
                                  }));
                                }
                              }
                            }}
                            onChange={(e) => {
                              setTargetWeightInput(e.target.value);
                              const numericValue = parseFloat(e.target.value);
                              if (!isNaN(numericValue) && numericValue > 0) {
                                // Round to nearest 0.5 to match step increment
                                const roundedValue = Math.round(numericValue * 2) / 2;
                                const roundedValueStr = roundedValue.toString();
                                setTargetWeight(roundedValueStr);

                                // Save user-adjusted weight for this goal
                                if (selectedGoal === 'lose-weight' || selectedGoal === 'gain-muscles') {
                                  setUserAdjustedWeights(prev => ({
                                    ...prev,
                                    [selectedGoal]: roundedValueStr
                                  }));
                                }
                              }
                            }}
                            className={`text-center w-24 h-8 font-bold ${!isTargetWeightValid(targetWeightInput) && targetWeightInput !== '' ? 'border-red-500' : ''}`}
                            style={{
                              backgroundColor: !isTargetWeightValid(targetWeightInput) && targetWeightInput !== '' ? 'rgba(239, 68, 68, 0.1)' : '#F5F5F5',
                              border: `solid 1px ${!isTargetWeightValid(targetWeightInput) && targetWeightInput !== '' ? '#EF4444' : '#CFCFCF'}`,
                              borderRadius: '12px',
                              fontSize: '14px'
                            }}
                            placeholder={userData.unitSystem === 'metric' ? '70' : '154'}
                          />
                          <span
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium pointer-events-none select-none"
                            style={{
                              color: '#9CA3AF',
                              opacity: 0.7,
                              zIndex: 10
                            }}
                          >
                            {userData.unitSystem === 'metric' ? 'kg' : 'lbs'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Error message for target weight */}
                    {!isTargetWeightValid(targetWeightInput) && targetWeightInput !== '' && (
                      <div className="text-red-600 text-xs mt-1">
                        {(() => {
                          const numericValue = parseFloat(targetWeightInput);
                          if (isNaN(numericValue) || numericValue <= 0) {
                            return 'Please enter a valid weight';
                          }
                          const minValue = getSliderMin();
                          const maxValue = getSliderMax();
                          const currentWeight = getCurrentWeightInDisplayUnits();
                          const unit = userData.unitSystem === 'metric' ? 'kg' : 'lbs';

                          if (selectedGoal === 'lose-weight') {
                            return `For weight loss, target must be between ${minValue.toFixed(1)} and ${currentWeight.toFixed(1)} ${unit}`;
                          } else if (selectedGoal === 'gain-muscles') {
                            return `For muscle gain, target must be between ${currentWeight.toFixed(1)} and ${maxValue.toFixed(1)} ${unit}`;
                          }
                          return `Target weight must be between ${minValue.toFixed(1)} and ${maxValue.toFixed(1)} ${unit}`;
                        })()}
                      </div>
                    )}

                    {/* Target Weight Slider */}
                    <div className="relative">
                      <div className="w-full h-2 bg-gray-300 rounded-full">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.min(Math.max(((parseFloat(targetWeight || '0') - getSliderMin()) / (getSliderMax() - getSliderMin())) * 100, 0), 100)}%`,
                            backgroundColor: '#31860A'
                          }}
                        />
                        <div
                          className="absolute w-6 h-6 bg-white rounded-full shadow-lg cursor-pointer"
                          style={{
                            left: `${Math.min(Math.max(((parseFloat(targetWeight || '0') - getSliderMin()) / (getSliderMax() - getSliderMin())) * 100, 0), 100)}%`,
                            top: '-8px',
                            transform: 'translateX(-50%)',
                            border: '2px solid #31860A'
                          }}
                        />
                      </div>
                      <input
                        type="range"
                        min={getSliderMin()}
                        max={getSliderMax()}
                        value={targetWeight || getCurrentWeightInDisplayUnits()}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value);
                          const minValue = getSliderMin();
                          const maxValue = getSliderMax();

                          // Ensure the value is within the goal-specific range
                          const clampedValue = Math.min(Math.max(newValue, minValue), maxValue);
                          // Round to nearest 0.5 to match step increment
                          const roundedValue = Math.round(clampedValue * 2) / 2;
                          const clampedValueStr = roundedValue.toString();

                          setTargetWeight(clampedValueStr);
                          setTargetWeightInput(clampedValueStr);

                          // Save user-adjusted weight for this goal
                          if (selectedGoal === 'lose-weight' || selectedGoal === 'gain-muscles') {
                            setUserAdjustedWeights(prev => ({
                              ...prev,
                              [selectedGoal]: clampedValueStr
                            }));
                          }
                        }}
                        className="absolute inset-0 w-full h-6 opacity-0 cursor-pointer"
                        step="0.5"
                      />
                    </div>

                    {/* Goal Direction Validation */}
                    {selectedGoal === 'lose-weight' && parseFloat(targetWeight || '0') > getSliderMax() && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                        <p className="text-sm text-orange-700">
                          ⚠️ Your target weight is higher than your current weight. For weight loss, set a target below {getSliderMax().toFixed(1)} {userData.unitSystem === 'metric' ? 'kg' : 'lbs'}.
                        </p>
                      </div>
                    )}

                    {selectedGoal === 'gain-muscles' && parseFloat(targetWeight || '0') < getSliderMin() && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                        <p className="text-sm text-orange-700">
                          ⚠️ Your target weight is lower than your current weight. For muscle gain, set a target above {getSliderMin().toFixed(1)} {userData.unitSystem === 'metric' ? 'kg' : 'lbs'}.
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Protein Intake for Lose/Gain */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700">
                        Protein Intake (g per lb body weight):
                      </span>
                      <Input
                        type="number"
                        value={proteinInput}
                        onFocus={() => setActivelyEditingProtein(true)}
                        onBlur={() => {
                          setActivelyEditingProtein(false);
                          // Only update if valid, otherwise keep input to show error
                          if (isProteinValid(proteinInput)) {
                            const value = parseFloat(proteinInput);
                            setProteinPerKg(value);
                          }
                        }}
                        onChange={(e) => {
                          setProteinInput(e.target.value);
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0.1 && value <= 5.0) {
                            setProteinPerKg(value);
                          }
                        }}
                        className={`text-center w-20 h-8 font-bold ${!isProteinValid(proteinInput) && proteinInput !== '' ? 'border-red-500' : ''}`}
                        style={{
                          backgroundColor: !isProteinValid(proteinInput) && proteinInput !== '' ? 'rgba(239, 68, 68, 0.1)' : '#F5F5F5',
                          border: `solid 1px ${!isProteinValid(proteinInput) && proteinInput !== '' ? '#EF4444' : '#CFCFCF'}`,
                          borderRadius: '12px',
                          fontSize: '14px'
                        }}
                        step="0.1"
                        min="0.1"
                        max="5.0"
                        placeholder="1.0"
                      />
                    </div>

                    {/* Error message for protein */}
                    {!isProteinValid(proteinInput) && proteinInput !== '' && (
                      <div className="text-red-600 text-xs mt-1">
                        Protein intake must be between 0.1 and 5.0 grams per pound
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      Adjust between 0.1-5.0g per pound (0.8-1.2g typical range)
                    </p>
                  </div>

                  {/* Macro Breakdown for Lose/Gain */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-6">
                      {/* Animated Pie Chart */}
                      <div className="relative w-24 h-24">
                        <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
                          <circle cx="48" cy="48" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                          <circle
                            cx="48" cy="48" r="40"
                            fill="none"
                            stroke="#F44336"
                            strokeWidth="12"
                            strokeDasharray={`${proteinPercentage * 2.51} 251`}
                            strokeDashoffset="0"
                            style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
                          />
                          <circle
                            cx="48" cy="48" r="40"
                            fill="none"
                            stroke="#0091EA"
                            strokeWidth="12"
                            strokeDasharray={`${carbPercentage * 2.51} 251`}
                            strokeDashoffset={`-${proteinPercentage * 2.51}`}
                            style={{ transition: 'stroke-dasharray 0.5s ease-in-out, stroke-dashoffset 0.5s ease-in-out' }}
                          />
                          <circle
                            cx="48" cy="48" r="40"
                            fill="none"
                            stroke="#FFC107"
                            strokeWidth="12"
                            strokeDasharray={`${fatPercentage * 2.51} 251`}
                            strokeDashoffset={`-${(proteinPercentage + carbPercentage) * 2.51}`}
                            style={{ transition: 'stroke-dasharray 0.5s ease-in-out, stroke-dashoffset 0.5s ease-in-out' }}
                          />
                          <circle
                            cx="48" cy="48" r="40"
                            fill="none"
                            stroke="#8BC34A"
                            strokeWidth="12"
                            strokeDasharray={`${fiberPercentage * 2.51} 251`}
                            strokeDashoffset={`-${(proteinPercentage + carbPercentage + fatPercentage) * 2.51}`}
                            style={{ transition: 'stroke-dasharray 0.5s ease-in-out, stroke-dashoffset 0.5s ease-in-out' }}
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-800">
                          {nutritionData.totalCalories} Calories
                        </div>
                      </div>
                    </div>
                    {/* Nutrition Breakdown */}
                    <div className="space-y-2">
                      {nutritionData.macros.map((macro, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: macro.color }}
                            />
                            <span className="text-sm font-medium" style={{ color: macro.color }}>
                              {macro.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium" style={{ color: macro.color }}>
                              {macro.amount} {macro.unit}
                            </span>
                            <span className="text-sm font-medium w-8 text-right" style={{ color: macro.color }}>
                              {macro.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedGoal === 'lose-weight' && (
                <div className="space-y-4 pt-4 border-t border-gray-300">
                  {/* Calorie Targets for Weight Loss */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Rapid Weight Loss</h5>
                      <div className="text-2xl font-bold text-red-600">
                        {Math.round(Math.max(getCalorieTarget() - 200, calculations?.bmr || 1200))} Calories/Day
                      </div>
                      <p className="text-xs text-gray-500 mt-1">More aggressive deficit</p>
                      <p className="text-xs text-orange-600 mt-1 font-medium">⚠️ Requires careful monitoring</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Slow and Consistent Weight Loss</h5>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(getCalorieTarget())} Calories/Day
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {isTargetWeightEnabled && targetWeight ?
                          `Adjusted for ${formatWeight(Math.abs(userData.weight - getTargetWeightInKg()), userData.unitSystem)} target loss` :
                          'Sustainable deficit for weight loss'
                        }
                      </p>
                      <p className="text-xs text-green-600 mt-1 font-medium">✓ Recommended for long-term success</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedGoal === 'gain-muscles' && (
                <div className="space-y-4 pt-4 border-t border-gray-300">
                  {/* Calorie Targets for Muscle Gain */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Rapid Weight Gain</h5>
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(getCalorieTarget() + 200)} Calories/Day
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Higher surplus for faster gains</p>
                      <p className="text-xs text-orange-600 mt-1 font-medium">⚠️ May include some fat gain</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Slow and Consistent Weight Gain</h5>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(getCalorieTarget())} Calories/Day
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {isTargetWeightEnabled && targetWeight ?
                          `Adjusted for ${formatWeight(Math.abs(getTargetWeightInKg() - userData.weight), userData.unitSystem)} target gain` :
                          'Moderate surplus for lean gains'
                        }
                      </p>
                      <p className="text-xs text-blue-600 mt-1 font-medium">✓ Recommended for long-term success</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Goal-Specific Content */}
              {selectedGoal === 'stay-fit' && (
                <div className="space-y-4 pt-4 border-t border-gray-300">
                  <h3 className="text-xl font-bold text-gray-800">
                    Suggested Target Goals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Your Ideal Weight Should Be Between</h5>
                      <div className="text-lg font-bold text-gray-800">
                        {formatWeight(calculations.idealWeightRange.lower, userData.unitSystem)} - {formatWeight(calculations.idealWeightRange.upper, userData.unitSystem)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Healthy weight range for your height</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Best Estimated Target Weight</h5>
                      <div className="text-lg font-bold text-green-600">
                        {formatWeight(calculations?.goalRecommendations.bestTargetWeight || 0, userData.unitSystem)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Optimal target to aim for</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Your Ideal Waist Size</h5>
                      <div className="text-lg font-bold text-blue-600">
                        {formatLength(calculations?.goalRecommendations.idealWaistSize || 0, userData.unitSystem)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Target waist circumference</p>
                    </div>
                  </div>
                </div>
              )}

              {(selectedGoal === 'lose-weight' || selectedGoal === 'gain-muscles') && (
                <div className="space-y-4">
                  <Tabs defaultValue="expected-results" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-200 rounded-xl p-1 h-auto">
                      <TabsTrigger
                        value="expected-results"
                        className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg font-bold text-xs flex flex-col items-center gap-1 py-2 min-h-[60px]"
                      >
                        <TrendingUp className="h-4 w-4" />
                        <span>Expected Results</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="nutrition"
                        className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg font-bold text-xs flex flex-col items-center gap-1 py-2 min-h-[60px]"
                      >
                        <Apple className="h-4 w-4" />
                        <span>Nutrition</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="expected-results" className="space-y-3 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {selectedGoal === 'lose-weight' ? (
                          <>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <h5 className="text-sm font-medium text-gray-600 mb-2">Maximum Weekly Fat Loss</h5>
                              <div className="text-lg font-bold text-red-600">
                                {formatWeight(calculations?.goalRecommendations.maxWeeklyFatLoss || 0, userData.unitSystem)}/week
                              </div>
                              <p className="text-xs text-gray-500 mt-1">At rapid calorie deficit</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <h5 className="text-sm font-medium text-gray-600 mb-2">Sustainable Weekly Fat Loss</h5>
                              <div className="text-lg font-bold text-green-600">
                                {formatWeight(calculations?.goalRecommendations.sustainableWeeklyFatLoss || 0, userData.unitSystem)}/week
                              </div>
                              <p className="text-xs text-gray-500 mt-1">At sustainable deficit</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <h5 className="text-sm font-medium text-gray-600 mb-2">Daily Water Weight Fluctuation</h5>
                              <div className="text-lg font-bold text-blue-600">
                                ±{formatWeight(calculations?.waterWeightFluctuation || 0, userData.unitSystem)}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Normal daily variation</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <h5 className="text-sm font-medium text-gray-600 mb-2">Maximum Weekly Muscle Gain</h5>
                              <div className="text-lg font-bold text-red-600">
                                0.5-1.0 {userData.unitSystem === 'metric' ? 'kg' : 'lbs'}/week
                              </div>
                              <p className="text-xs text-gray-500 mt-1">With aggressive bulking approach</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <h5 className="text-sm font-medium text-gray-600 mb-2">Sustainable Weekly Muscle Gain</h5>
                              <div className="text-lg font-bold text-green-600">
                                0.25-0.5 {userData.unitSystem === 'metric' ? 'kg' : 'lbs'}/week
                              </div>
                              <p className="text-xs text-gray-500 mt-1">With moderate surplus and proper training</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <h5 className="text-sm font-medium text-gray-600 mb-2">Daily Water Weight Fluctuation</h5>
                              <div className="text-lg font-bold text-blue-600">
                                ±{formatWeight(calculations?.waterWeightFluctuation || 0, userData.unitSystem)}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Normal daily variation</p>
                            </div>
                          </>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="nutrition" className="space-y-3 mt-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Suggested Daily Protein Intake</h5>
                        <div className="text-lg font-bold text-green-600">
                          {Math.round(goalProteinIntake)}g per Day
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {proteinPerKg}g per pound of target weight ({formatWeight(targetWeightForProtein, userData.unitSystem)})
                        </p>
                      </div>

                      {/* Nutrition App Instructions */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-green-800 mb-2">📱 Set Your Calorie Counting App</h5>
                        <div className="space-y-2">
                          <p className="text-sm text-green-700">
                            <strong>Daily Calorie Target:</strong> {nutritionData.totalCalories} calories
                          </p>
                          <p className="text-sm text-green-700">
                            <strong>Macro Breakdown:</strong>
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-green-600 ml-2">
                            {nutritionData.macros.map((macro, index) => (
                              <div key={index}>
                                • {macro.name}: {macro.amount}g ({macro.percentage}%)
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-2 border-t border-green-200">
                            <p className="text-xs text-green-600 mb-2">
                              💡 <strong>Tip:</strong> Want to master calorie counting and burn fat fast? Subscribe to HowToGetInShape.org to get instant access to my free video series—just your phone, a free calorie app, a food scale, and the fat‑burning desire to finally get in shape.
                            </p>
                            <button
                              className="text-xs font-medium text-green-700 hover:text-green-800 underline transition-colors"
                              onClick={() => setIsEmailDialogOpen(true)}
                            >
                              Start the Free Fat‑Burn Video Series →
                            </button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}



            </div>

            {/* Navigation Buttons - Always at bottom */}
            <div className="pt-6 flex justify-between flex-shrink-0 md:border-t md:border-gray-200 md:mt-6 md:pt-4">
              <Button
                variant="outline"
                className="px-8"
                onClick={() => router.push('/results')}
              >
                Back
              </Button>
              <Button
                className="px-8 text-white font-medium"
                style={{ backgroundColor: '#31860A' }}
                onClick={() => {
                  // Save goal data to context or localStorage
                  const goalData = {
                    selectedGoal,
                    targetWeight: isTargetWeightEnabled ? getTargetWeightInKg() : null,
                    proteinPerKg,
                    calorieTarget,
                    macroDistribution: nutritionData.macros,
                    estimatedTimeToGoal: isTargetWeightEnabled ?
                      Math.abs(getTargetWeightInKg() - userData.weight) / 0.5 : null // weeks
                  };

                  // Store in localStorage for persistence
                  localStorage.setItem('userGoalData', JSON.stringify(goalData));

                  // Open email dialog instead of contact popup
                  setIsEmailDialogOpen(true);
                }}
              >
                Start My Fat‑Burning Video Series
              </Button>
            </div>
          </CardContent>
        </Card >
      </div >

      {/* Contact Popup */}
      < ContactPopup
        isOpen={isContactPopupOpen}
        onClose={() => setIsContactPopupOpen(false)
        }
        onSubmit={handleContactSubmit}
      />

      {/* Email Dialog */}
      {isEmailDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setIsEmailDialogOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>

            {/* Dialog content */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">
                Yes! Show Me How to Count Calories Like a Pro!
              </h2>

              <p className="text-sm text-gray-600">
                Enter your email to unlock the full Fat‑Burning Calorie‑Counting Master Class—a FREE video series every beginner and tracker needs. These lessons will give you the tools, confidence, and strategy to finally lose fat using a FREE app and a simple food scale.
              </p>

              <div className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>

                <button
                  onClick={() => {
                    // Handle email submission here
                    console.log('Email submitted:', emailAddress);
                    // You can add actual email submission logic here
                    setIsEmailDialogOpen(false);
                    setEmailAddress('');
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Start the Free Master Class →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
