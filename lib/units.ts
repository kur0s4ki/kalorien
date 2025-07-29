// Unit conversion utilities for the fitness calculator

export type UnitSystem = 'metric' | 'imperial';
export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'ft-in';
export type LengthUnit = 'cm' | 'in';

// Weight conversions
export const convertWeight = (weight: number, from: WeightUnit, to: WeightUnit): number => {
  if (from === to) return weight;
  if (from === 'kg' && to === 'lbs') return weight * 2.20462;
  if (from === 'lbs' && to === 'kg') return weight / 2.20462;
  return weight;
};

// Height conversions
export const convertHeight = (height: number, from: HeightUnit, to: HeightUnit): number => {
  if (from === to) return height;
  if (from === 'cm' && to === 'ft-in') return height / 2.54; // Returns total inches
  if (from === 'ft-in' && to === 'cm') return height * 2.54; // Expects total inches
  return height;
};

// Length conversions (for measurements)
export const convertLength = (length: number, from: LengthUnit, to: LengthUnit): number => {
  if (from === to) return length;
  if (from === 'cm' && to === 'in') return length / 2.54;
  if (from === 'in' && to === 'cm') return length * 2.54;
  return length;
};

// Format height for display
export const formatHeight = (heightInCm: number, unitSystem: UnitSystem): string => {
  if (unitSystem === 'metric') {
    return `${heightInCm.toFixed(1)} cm`;
  } else {
    const totalInches = heightInCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }
};

// Format weight for display
export const formatWeight = (weightInKg: number, unitSystem: UnitSystem): string => {
  if (unitSystem === 'metric') {
    return `${weightInKg.toFixed(1)} kg`;
  } else {
    const weightInLbs = convertWeight(weightInKg, 'kg', 'lbs');
    return `${weightInLbs.toFixed(1)} lbs`;
  }
};

// Format length for display (measurements)
export const formatLength = (lengthInCm: number, unitSystem: UnitSystem): string => {
  if (unitSystem === 'metric') {
    return `${lengthInCm.toFixed(1)} cm`;
  } else {
    const lengthInInches = convertLength(lengthInCm, 'cm', 'in');
    return `${lengthInInches.toFixed(1)} in`;
  }
};

// Parse height input from user (handles both formats)
export const parseHeightInput = (input: string, unitSystem: UnitSystem): number => {
  if (unitSystem === 'metric') {
    // Parse "170.5 cm" or "170.5"
    const numericValue = parseFloat(input.replace(/[^\d.]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  } else {
    // Parse "5'10"" or "5 10" or "70" (inches)
    const feetInchesMatch = input.match(/(\d+)'?\s*(\d+)"?/);
    if (feetInchesMatch) {
      const feet = parseInt(feetInchesMatch[1]);
      const inches = parseInt(feetInchesMatch[2]);
      return convertHeight(feet * 12 + inches, 'ft-in', 'cm');
    } else {
      // Assume total inches
      const totalInches = parseFloat(input.replace(/[^\d.]/g, ''));
      return isNaN(totalInches) ? 0 : convertHeight(totalInches, 'ft-in', 'cm');
    }
  }
};

// Parse weight input from user
export const parseWeightInput = (input: string, unitSystem: UnitSystem): number => {
  const numericValue = parseFloat(input.replace(/[^\d.]/g, ''));
  if (isNaN(numericValue)) return 0;
  
  if (unitSystem === 'metric') {
    return numericValue; // Already in kg
  } else {
    return convertWeight(numericValue, 'lbs', 'kg'); // Convert lbs to kg
  }
};

// Parse length input from user (measurements)
export const parseLengthInput = (input: string, unitSystem: UnitSystem): number => {
  const numericValue = parseFloat(input.replace(/[^\d.]/g, ''));
  if (isNaN(numericValue)) return 0;
  
  if (unitSystem === 'metric') {
    return numericValue; // Already in cm
  } else {
    return convertLength(numericValue, 'in', 'cm'); // Convert inches to cm
  }
};

// Get unit labels for display
export const getWeightUnit = (unitSystem: UnitSystem): WeightUnit => {
  return unitSystem === 'metric' ? 'kg' : 'lbs';
};

export const getHeightUnit = (unitSystem: UnitSystem): string => {
  return unitSystem === 'metric' ? 'cm' : 'ft/in';
};

export const getLengthUnit = (unitSystem: UnitSystem): LengthUnit => {
  return unitSystem === 'metric' ? 'cm' : 'in';
};

// Slider ranges based on unit system
export const getWeightRange = (unitSystem: UnitSystem) => {
  if (unitSystem === 'metric') {
    return { min: 10, max: 227, step: 0.1 }; // 10kg to 227kg (500 lbs)
  } else {
    return { min: 22, max: 500, step: 1 }; // 10kg to 227kg in lbs (22-500 lbs), 1 lb steps
  }
};

export const getHeightRange = (unitSystem: UnitSystem) => {
  if (unitSystem === 'metric') {
    return { min: 100, max: 250, step: 0.5 };
  } else {
    return { min: 39, max: 98, step: 1 }; // 100cm to 250cm in inches
  }
};

export const getLengthRange = (unitSystem: UnitSystem) => {
  if (unitSystem === 'metric') {
    return { min: 10, max: 200, step: 0.5 };
  } else {
    return { min: 4, max: 79, step: 0.25 }; // 10cm to 200cm in inches
  }
};
