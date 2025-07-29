'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useCalculator } from '@/contexts/CalculatorContext';
import { formatWeight, formatLength } from '@/lib/units';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Utensils, TrendingUp, Apple } from 'lucide-react';
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
  const [selectedGoal, setSelectedGoal] = useState('stay-fit');
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);

  // Local state for target weight input (for display purposes)
  const [targetWeightInput, setTargetWeightInput] = useState('');
  const [activelyEditingTargetWeight, setActivelyEditingTargetWeight] = useState(false);
  // Local state for protein input (for display purposes)
  const [proteinInput, setProteinInput] = useState('');
  const [activelyEditingProtein, setActivelyEditingProtein] = useState(false);
  const isInitialized = useRef(false);
  const logCount = useRef(0);

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

  // Auto-disable target weight for "Maintain" goal (logical consistency)
  useEffect(() => {
    if (selectedGoal === 'stay-fit' && isTargetWeightEnabled) {
      setIsTargetWeightEnabled(false);
    }
  }, [selectedGoal, isTargetWeightEnabled, setIsTargetWeightEnabled]);

  // Calculations should always be available when navigating here
  if (!calculations) {
    return null; // This should never be visible with proper navigation
  }

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
        return currentCalculations.calorieTargets.slowLoss;
      case 'gain-muscles':
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

  // Helper function to get current weight in display units
  const getCurrentWeightInDisplayUnits = () => {
    if (userData.unitSystem === 'imperial') {
      return Math.round(userData.weight * 2.20462);
    }
    return Math.round(userData.weight * 10) / 10;
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
    { id: 'gain-muscles', label: 'Gain', active: selectedGoal === 'gain-muscles' },
    { id: 'stay-fit', label: 'Maintain', active: selectedGoal === 'stay-fit' }
  ];

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
                  <span className="text-lg font-semibold text-gray-800">I want</span>
                </div>

                <div className="flex gap-2">
                  {goals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.id)}
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

              {/* Target Weight */}
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
                        }}
                        onChange={(e) => {
                          setTargetWeightInput(e.target.value);
                          const numericValue = parseFloat(e.target.value);
                          if (!isNaN(numericValue) && numericValue > 0) {
                            setTargetWeight(e.target.value);
                          }
                        }}
                        className={`text-center w-24 h-8 font-bold ${selectedGoal === 'stay-fit' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{
                          backgroundColor: selectedGoal === 'stay-fit' ? '#E5E7EB' : '#F5F5F5',
                          border: 'solid 1px #CFCFCF',
                          borderRadius: '12px',
                          fontSize: '14px'
                        }}
                        placeholder={userData.unitSystem === 'metric' ? '70' : '154'}
                        disabled={selectedGoal === 'stay-fit'}
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
                    <Switch
                      checked={isTargetWeightEnabled && selectedGoal !== 'stay-fit'}
                      onCheckedChange={(checked) => {
                        if (selectedGoal !== 'stay-fit') {
                          setIsTargetWeightEnabled(checked);
                        }
                      }}
                      disabled={selectedGoal === 'stay-fit'}
                      style={{
                        backgroundColor: (isTargetWeightEnabled && selectedGoal !== 'stay-fit') ? '#31860A' : '#D1D5DB',
                        opacity: selectedGoal === 'stay-fit' ? 0.5 : 1
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {selectedGoal === 'stay-fit'
                    ? 'Maintain goal uses your current weight - target weight disabled'
                    : isTargetWeightEnabled
                      ? 'Using target weight for protein calculations and goal tracking'
                      : 'Using current weight for all calculations'
                  }
                </p>

                {/* Target Weight Slider */}
                <div className={`relative ${!isTargetWeightEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="w-full h-2 bg-gray-300 rounded-full">
                    {/* Filled track */}
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(Math.max(((parseFloat(targetWeight || '0') - (getCurrentWeightInDisplayUnits() - 20)) / 40) * 100, 0), 100)}%`,
                        backgroundColor: isTargetWeightEnabled ? '#31860A' : '#9CA3AF'
                      }}
                    />
                    <div
                      className={`absolute w-6 h-6 bg-white rounded-full shadow-lg ${isTargetWeightEnabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      style={{
                        left: `${Math.min(Math.max(((parseFloat(targetWeight || '0') - (getCurrentWeightInDisplayUnits() - 20)) / 40) * 100, 0), 100)}%`,
                        top: '-8px',
                        transform: 'translateX(-50%)',
                        border: `2px solid ${isTargetWeightEnabled ? '#31860A' : '#9CA3AF'}`
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={getCurrentWeightInDisplayUnits() - 20}
                    max={getCurrentWeightInDisplayUnits() + 20}
                    value={targetWeight || getCurrentWeightInDisplayUnits()}
                    onChange={(e) => {
                      setTargetWeight(e.target.value);
                      setTargetWeightInput(e.target.value);
                    }}
                    className={`absolute inset-0 w-full h-6 opacity-0 ${isTargetWeightEnabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    step="0.5"
                    disabled={!isTargetWeightEnabled}
                  />
                </div>
              </div>

              {/* Protein Intake Customization */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Protein Intake (g per lb body weight)
                  </span>
                  <Input
                    type="number"
                    value={proteinInput}
                    onFocus={() => setActivelyEditingProtein(true)}
                    onBlur={() => {
                      setActivelyEditingProtein(false);
                      const value = parseFloat(proteinInput);
                      if (!isNaN(value) && value >= 0.1 && value <= 5.0) {
                        setProteinPerKg(value);
                      } else {
                        // Reset to current value if invalid
                        setProteinInput(proteinPerKg.toString());
                      }
                    }}
                    onChange={(e) => {
                      setProteinInput(e.target.value);
                      // Allow real-time updates for valid values, but don't restrict typing
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0.1 && value <= 5.0) {
                        setProteinPerKg(value);
                      }
                    }}
                    className="text-center w-20 h-8 font-bold"
                    style={{
                      backgroundColor: '#F5F5F5',
                      border: 'solid 1px #CFCFCF',
                      borderRadius: '12px',
                      fontSize: '14px'
                    }}
                    step="0.1"
                    min="0.1"
                    max="5.0"
                    placeholder="1.0"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {selectedGoal === 'stay-fit'
                    ? 'Adjust between 0.1-5.0g per pound (based on current weight)'
                    : 'Adjust between 0.1-5.0g per pound (0.8-1.2g typical range)'
                  }
                </p>
              </div>

              {/* Recommended Daily Calorie Intake */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recommended Daily Calorie Intake
                </h3>

                <div className="flex items-center space-x-6">
                  {/* Animated Pie Chart */}
                  <div className="relative w-24 h-24">
                    <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
                      {/* Background circle */}
                      <circle cx="48" cy="48" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />

                      {/* Proteins - Light Gray */}
                      <circle
                        cx="48" cy="48" r="40"
                        fill="none"
                        stroke="#F44336"
                        strokeWidth="12"
                        strokeDasharray={`${proteinPercentage * 2.51} 251`}
                        strokeDashoffset="0"
                        style={{
                          transition: 'stroke-dasharray 0.5s ease-in-out'
                        }}
                      />

                      {/* Carbs - Blue */}
                      <circle
                        cx="48" cy="48" r="40"
                        fill="none"
                        stroke="#0091EA"
                        strokeWidth="12"
                        strokeDasharray={`${carbPercentage * 2.51} 251`}
                        strokeDashoffset={`-${proteinPercentage * 2.51}`}
                        style={{
                          transition: 'stroke-dasharray 0.5s ease-in-out, stroke-dashoffset 0.5s ease-in-out'
                        }}
                      />

                      {/* Fats - Yellow */}
                      <circle
                        cx="48" cy="48" r="40"
                        fill="none"
                        stroke="#FFC107"
                        strokeWidth="12"
                        strokeDasharray={`${fatPercentage * 2.51} 251`}
                        strokeDashoffset={`-${(proteinPercentage + carbPercentage) * 2.51}`}
                        style={{
                          transition: 'stroke-dasharray 0.5s ease-in-out, stroke-dashoffset 0.5s ease-in-out'
                        }}
                      />

                      {/* Fiber - Green */}
                      <circle
                        cx="48" cy="48" r="40"
                        fill="none"
                        stroke="#8BC34A"
                        strokeWidth="12"
                        strokeDasharray={`${fiberPercentage * 2.51} 251`}
                        strokeDashoffset={`-${(proteinPercentage + carbPercentage + fatPercentage) * 2.51}`}
                        style={{
                          transition: 'stroke-dasharray 0.5s ease-in-out, stroke-dashoffset 0.5s ease-in-out'
                        }}
                      />
                    </svg>
                  </div>

                  {/* Calorie Info */}
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

              {/* Goal Recommendations Section with Tabs */}
              <div className="space-y-4 pt-4 border-t border-gray-300">
                <h3 className="text-xl font-bold text-gray-800">
                  Suggested Target Goals
                </h3>

                <Tabs defaultValue="weight-goals" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-200 rounded-xl p-1 h-auto">
                    <TabsTrigger
                      value="weight-goals"
                      className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg font-bold text-xs flex flex-col items-center gap-1 py-2 min-h-[60px]"
                    >
                      <Target className="h-4 w-4" />
                      <span className="hidden sm:inline">Weight & Body</span>
                      <span className="sm:hidden">Weight</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="calorie-goals"
                      className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg font-bold text-xs flex flex-col items-center gap-1 py-2 min-h-[60px]"
                    >
                      <Utensils className="h-4 w-4" />
                      <span className="hidden sm:inline">Daily Calories</span>
                      <span className="sm:hidden">Calories</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="fat-loss"
                      className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg font-bold text-xs flex flex-col items-center gap-1 py-2 min-h-[60px]"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span className="hidden sm:inline">Expected Results</span>
                      <span className="sm:hidden">Results</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="nutrition"
                      className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg font-bold text-xs flex flex-col items-center gap-1 py-2 min-h-[60px]"
                    >
                      <Apple className="h-4 w-4" />
                      <span className="hidden sm:inline">Nutrition</span>
                      <span className="sm:hidden">Nutrition</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Weight & Body Goals Tab */}
                  <TabsContent value="weight-goals" className="space-y-3 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Ideal Weight Range */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Your Ideal Weight Should Be Between</h5>
                        <div className="text-lg font-bold text-gray-800">
                          {formatWeight(calculations.idealWeightRange.lower, userData.unitSystem)} - {formatWeight(calculations.idealWeightRange.upper, userData.unitSystem)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Healthy weight range for your height</p>
                      </div>

                      {/* Best Target Weight */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Best Estimated Target Weight</h5>
                        <div className="text-lg font-bold text-green-600">
                          {formatWeight(targetWeightCalculations?.goalRecommendations.bestTargetWeight || calculations?.goalRecommendations.bestTargetWeight || 0, userData.unitSystem)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Optimal target to aim for</p>
                      </div>

                      {/* Ideal Waist Size */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Your Ideal Waist Size</h5>
                        <div className="text-lg font-bold text-blue-600">
                          {formatLength(targetWeightCalculations?.goalRecommendations.idealWaistSize || calculations?.goalRecommendations.idealWaistSize || 0, userData.unitSystem)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Target waist circumference</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Daily Calories Tab */}
                  <TabsContent value="calorie-goals" className="space-y-3 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Maintenance Calories */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Maintenance Calories</h5>
                        <div className="text-lg font-bold text-gray-800">
                          {Math.round(targetWeightCalculations?.tdee || calculations?.tdee || 0)} Calories/day
                        </div>
                        <p className="text-xs text-gray-500 mt-1">To maintain current weight</p>
                      </div>

                      {/* Rapid Weight Loss */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Rapid Weight Loss</h5>
                        <div className="text-lg font-bold text-red-600">
                          {Math.round(targetWeightCalculations?.goalRecommendations.rapidWeightLossCalories || calculations?.goalRecommendations.rapidWeightLossCalories || 0)} Calories/day
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Safe deficit based on your profile</p>
                        <p className="text-xs text-orange-600 mt-1 font-medium">⚠️ Requires careful monitoring</p>
                      </div>

                      {/* Sustainable Weight Loss */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Slow & Consistent Weight Loss (Recommended)</h5>
                        <div className="text-lg font-bold text-green-600">
                          {Math.round(targetWeightCalculations?.goalRecommendations.sustainableWeightLossCalories || calculations?.goalRecommendations.sustainableWeightLossCalories || 0)} Calories/day
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Conservative, sustainable approach</p>
                        <p className="text-xs text-green-600 mt-1 font-medium">✓ Recommended for long-term success</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Expected Results Tab */}
                  <TabsContent value="fat-loss" className="space-y-3 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Maximum Weekly Fat Loss */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Maximum Weekly Fat Loss</h5>
                        <div className="text-lg font-bold text-red-600">
                          {formatWeight(targetWeightCalculations?.goalRecommendations.maxWeeklyFatLoss || calculations?.goalRecommendations.maxWeeklyFatLoss || 0, userData.unitSystem)}/week
                        </div>
                        <p className="text-xs text-gray-500 mt-1">At {Math.round(targetWeightCalculations?.goalRecommendations.rapidWeightLossCalories || calculations?.goalRecommendations.rapidWeightLossCalories || 0)} Calories/day</p>
                      </div>

                      {/* Sustainable Weekly Fat Loss */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Sustainable Weekly Fat Loss</h5>
                        <div className="text-lg font-bold text-orange-600">
                          {formatWeight(targetWeightCalculations?.goalRecommendations.sustainableWeeklyFatLoss || calculations?.goalRecommendations.sustainableWeeklyFatLoss || 0, userData.unitSystem)}/week
                        </div>
                        <p className="text-xs text-gray-500 mt-1">At {Math.round(targetWeightCalculations?.goalRecommendations.sustainableWeightLossCalories || calculations?.goalRecommendations.sustainableWeightLossCalories || 0)} Calories/day</p>
                      </div>

                      {/* Water Weight Fluctuation */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Daily Water Weight Fluctuation</h5>
                        <div className="text-lg font-bold text-blue-600">
                          ±{formatWeight(targetWeightCalculations?.waterWeightFluctuation || calculations?.waterWeightFluctuation || 0, userData.unitSystem)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Normal daily variation</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Nutrition Tab */}
                  <TabsContent value="nutrition" className="space-y-3 mt-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Suggested Daily Protein Intake</h5>
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(goalProteinIntake)}g per day
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {proteinPerKg}g per pound of {selectedGoal === 'stay-fit' ? 'current' : (isTargetWeightEnabled ? 'target' : 'current')} weight ({formatWeight(
                          targetWeightForProtein,
                          userData.unitSystem
                        )})
                      </p>
                    </div>

                    {/* Action Items */}
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-gray-700">Action Items</h4>

                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <ul className="space-y-1.5 text-sm text-gray-700">
                          <li className="flex items-start space-x-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>Set your calorie tracking app to <strong>{Math.round(calculations?.goalRecommendations.sustainableWeightLossCalories || 0)} Calories/day</strong> for sustainable weight loss</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>Weigh yourself weekly, not daily - expect ±{formatWeight(calculations?.waterWeightFluctuation || 0, userData.unitSystem)} daily fluctuation</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>Recalculate your goals every 5 pounds lost to update your maintenance calories</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>Aim for <strong>{Math.round(goalProteinIntake)}g protein daily</strong> to preserve muscle mass</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span><strong>Monitor your health:</strong> Stop and consult a doctor if you experience fatigue, dizziness, hair loss, or mood changes</span>
                          </li>
                        </ul>
                      </div>

                      {/* Safety Reminders */}
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <h5 className="text-yellow-800 font-medium mb-1.5">⚠️ Safety Reminders</h5>
                        <ul className="space-y-0.5 text-xs text-yellow-700">
                          <li>• Never eat below {Math.round(calculations?.bmr || 0)} calories (your BMR) without medical supervision</li>
                          <li>• Weight loss should not exceed 1-2 pounds per week for most people</li>
                          <li>• These calculations are estimates - individual needs may vary significantly</li>
                          <li>• Consult healthcare professionals before making major dietary changes</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
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

                  // Open contact popup instead of showing alert
                  setIsContactPopupOpen(true);
                }}
              >
                Get My Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Popup */}
      <ContactPopup
        isOpen={isContactPopupOpen}
        onClose={() => setIsContactPopupOpen(false)}
        onSubmit={handleContactSubmit}
      />
    </div>
  );
}
