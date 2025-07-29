'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserData, CalculationResults, calculateAllResults, validateUserData, ValidationResult, recalculateWithTargetWeight, convertTargetWeightToKg } from '@/lib/calculations';

interface CalculatorContextType {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  calculations: CalculationResults | null;
  proteinPerKg: number;
  setProteinPerKg: (value: number) => void;
  validationErrors: string[];
  fieldErrors: ValidationResult['fieldErrors'];
  isDataValid: boolean;
  measurementsOptional: boolean;
  setMeasurementsOptional: (optional: boolean) => void;
  resetData: () => void;
  forceCalculation: () => void;
  // Target weight functionality
  targetWeight: string;
  setTargetWeight: (weight: string) => void;
  isTargetWeightEnabled: boolean;
  setIsTargetWeightEnabled: (enabled: boolean) => void;
  targetWeightCalculations: CalculationResults | null;
  calculateWithTargetWeight: () => void;
}

const defaultUserData: UserData = {
  gender: 'female',
  unitSystem: 'imperial',
  age: 25,
  height: 170, // cm (will be converted for display)
  weight: 70, // kg (will be converted for display)
  activityLevel: 'moderate-activity',
  bodyFat: undefined, // Optional - no default value
  measurements: {
    waist: undefined,
    hips: undefined,
    neck: undefined
  }
};

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};

interface CalculatorProviderProps {
  children: ReactNode;
}

export const CalculatorProvider: React.FC<CalculatorProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [calculations, setCalculations] = useState<CalculationResults | null>(null);
  const [proteinPerKg, setProteinPerKg] = useState<number>(1.0); // Default protein intake (1g per lb)
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<ValidationResult['fieldErrors']>({});
  const [isDataValid, setIsDataValid] = useState<boolean>(true);
  const [measurementsOptional, setMeasurementsOptional] = useState<boolean>(true);

  // Target weight state management
  const [targetWeight, setTargetWeight] = useState<string>(() => {
    // Initialize with properly formatted weight based on unit system
    if (defaultUserData.unitSystem === 'imperial') {
      return Math.round(defaultUserData.weight * 2.20462).toString();
    } else {
      return (Math.round(defaultUserData.weight * 10) / 10).toString();
    }
  });
  const [isTargetWeightEnabled, setIsTargetWeightEnabled] = useState<boolean>(true);
  const [targetWeightCalculations, setTargetWeightCalculations] = useState<CalculationResults | null>(null);

  // Recalculate results whenever userData or proteinPerKg changes
  useEffect(() => {
    try {
      // Validate data first
      const validation = validateUserData(userData, measurementsOptional);
      setValidationErrors(validation.errors);
      setFieldErrors(validation.fieldErrors);
      setIsDataValid(validation.isValid);

      // Always calculate if basic required data is present, even if validation has minor issues
      if (userData.age && userData.height && userData.weight) {
        const results = calculateAllResults(userData, proteinPerKg);
        setCalculations(results);
      } else {
        setCalculations(null);
      }
    } catch (error) {
      console.error('Error calculating results:', error);
      setCalculations(null);
    }
  }, [userData, proteinPerKg, measurementsOptional]);

  // Also calculate immediately when component mounts with valid data
  useEffect(() => {
    if (userData.age && userData.height && userData.weight && !calculations) {
      try {
        const results = calculateAllResults(userData, proteinPerKg);
        setCalculations(results);
      } catch (error) {
        console.error('Error calculating initial results:', error);
      }
    }
  }, []);

  const updateUserData = (data: Partial<UserData>) => {
    setUserData(prevData => ({
      ...prevData,
      ...data,
      // Ensure measurements object exists
      measurements: {
        ...prevData.measurements,
        ...data.measurements
      }
    }));
  };

  const forceCalculation = () => {
    try {
      if (userData.age && userData.height && userData.weight) {
        const results = calculateAllResults(userData, proteinPerKg);
        setCalculations(results);
      }
    } catch (error) {
      console.error('Error forcing calculation:', error);
    }
  };

  const calculateWithTargetWeight = () => {
    try {
      if (userData.age && userData.height && userData.weight && targetWeight && isTargetWeightEnabled) {
        const targetWeightKg = convertTargetWeightToKg(targetWeight, userData.unitSystem);
        const results = recalculateWithTargetWeight(userData, targetWeightKg, proteinPerKg);
        setTargetWeightCalculations(results);
      } else {
        setTargetWeightCalculations(null);
      }
    } catch (error) {
      console.error('Error calculating with target weight:', error);
      setTargetWeightCalculations(null);
    }
  };

  // Recalculate target weight calculations when relevant data changes
  useEffect(() => {
    if (isTargetWeightEnabled && targetWeight) {
      calculateWithTargetWeight();
    } else {
      setTargetWeightCalculations(null);
    }
  }, [userData, proteinPerKg, targetWeight, isTargetWeightEnabled]);

  const resetData = () => {
    setUserData(defaultUserData);
    setProteinPerKg(1.0);
    setCalculations(null);
    setValidationErrors([]);
    setFieldErrors({});
    setIsDataValid(true);
    setMeasurementsOptional(true);
    // Reset target weight state
    const initialWeight = defaultUserData.unitSystem === 'imperial'
      ? Math.round(defaultUserData.weight * 2.20462).toString()
      : (Math.round(defaultUserData.weight * 10) / 10).toString();
    setTargetWeight(initialWeight);
    setIsTargetWeightEnabled(true);
    setTargetWeightCalculations(null);
  };

  const contextValue: CalculatorContextType = {
    userData,
    updateUserData,
    calculations,
    proteinPerKg,
    setProteinPerKg,
    validationErrors,
    fieldErrors,
    isDataValid,
    measurementsOptional,
    setMeasurementsOptional,
    resetData,
    forceCalculation,
    // Target weight functionality
    targetWeight,
    setTargetWeight,
    isTargetWeightEnabled,
    setIsTargetWeightEnabled,
    targetWeightCalculations,
    calculateWithTargetWeight
  };

  return (
    <CalculatorContext.Provider value={contextValue}>
      {children}
    </CalculatorContext.Provider>
  );
};

export default CalculatorContext;
