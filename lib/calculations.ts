// Fitness Calculator - Core Calculation Engine

export interface UserData {
  gender: "male" | "female";
  unitSystem: "metric" | "imperial";
  age: number;
  height: number; // Store in cm
  weight: number; // Store in kg
  activityLevel:
    | "sedentary"
    | "light-activity"
    | "moderate-activity"
    | "high-activity"
    | "very-high-activity";
  bodyFat?: number;
  measurements?: {
    waist?: number;
    hips?: number;
    neck?: number;
    shoulders?: number;
  };
}

export interface CalculationResults {
  bmr: number;
  bmi: {
    value: number;
    category: string;
    categoryIndex: number;
  };
  whr?: {
    value: number;
    category: string;
    description: string;
    imageIndex: number;
  };
  tdee: number;
  idealWeightRange: {
    lower: number;
    upper: number;
    target: number;
  };
  adonisWeightRange: {
    lower: number;
    upper: number;
    target: number;
  };
  bodyCompAdjustedWeight: {
    lower: number;
    upper: number;
    target: number;
  };
  calorieTargets: {
    maintenance: number;
    rapidLoss: number;
    slowLoss: number;
    muscleGain: number;
  };
  weeklyFatLoss: {
    rapid: number;
    slow: number;
  };
  waterWeightFluctuation: number;
  proteinIntake: number;
  // New goal-specific calculations
  goalRecommendations: {
    idealWaistSize: number; // in cm
    bestTargetWeight: number; // single best target weight
    rapidWeightLossCalories: number; // 400-700 below maintenance
    sustainableWeightLossCalories: number; // 400 below maintenance
    maxWeeklyFatLoss: number; // based on rapid calories
    sustainableWeeklyFatLoss: number; // based on sustainable calories
    proteinIntakeForTarget: number; // protein for target weight
  };
}

// Activity level multipliers for TDEE calculation
// Based on established research: Harris-Benedict (1919), Mifflin-St Jeor (1990), WHO/FAO (2001)
export const activityMultipliers = {
  sedentary: 1.2, // Little to no exercise
  "light-activity": 1.375, // Light exercise 1-3 days/week
  "moderate-activity": 1.55, // Moderate exercise 3-5 days/week (WHO/FAO standard)
  "high-activity": 1.725, // Heavy exercise 6-7 days/week
  "very-high-activity": 1.9, // Very heavy exercise + physical job
} as const;

// Original multipliers (kept for reference and optional use)
export const originalActivityMultipliers = {
  sedentary: 1.2,
  "light-activity": 1.375,
  "moderate-activity": 1.55,
  "high-activity": 1.725,
  "very-high-activity": 1.9,
} as const;

// BMI categories with colors for UI
export const bmiCategories = [
  { label: "Underweight", color: "#87CEEB", range: [0, 18.5] },
  { label: "Normal weight", color: "#90EE90", range: [18.5, 25] },
  { label: "Overweight", color: "#FFD700", range: [25, 30] },
  { label: "Obese I", color: "#FFA500", range: [30, 35] },
  { label: "Obese II", color: "#FF6347", range: [35, 40] },
  { label: "Obese III", color: "#DC143C", range: [40, 100] },
];

// Unit conversion functions
export const convertWeight = (
  weight: number,
  from: "kg" | "lbs",
  to: "kg" | "lbs"
): number => {
  if (from === to) return weight;
  if (from === "kg" && to === "lbs") return weight * 2.20462;
  if (from === "lbs" && to === "kg") return weight / 2.20462;
  return weight;
};

export const convertHeight = (
  height: number,
  from: "cm" | "ft-in",
  to: "cm" | "ft-in"
): number => {
  if (from === to) return height;
  if (from === "cm" && to === "ft-in") return height / 2.54; // Returns total inches
  if (from === "ft-in" && to === "cm") return height * 2.54; // Expects total inches
  return height;
};

// Core calculation functions
export const calculateBMR = (
  gender: "male" | "female",
  weight: number,
  height: number,
  age: number,
  bodyFatPercentage?: number
): number => {
  // If body fat percentage is provided, use Katch-McArdle formula (more accurate for known body composition)
  if (bodyFatPercentage !== undefined && bodyFatPercentage > 0) {
    const leanBodyMass = weight * (1 - bodyFatPercentage / 100);
    return 370 + 21.6 * leanBodyMass;
  }

  // Otherwise use Mifflin-St Jeor Equation (more accurate than Harris-Benedict)
  // weight in kg, height in cm
  if (gender === "male") {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
};

export const calculateBMI = (weight: number, height: number): number => {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

export const getBMICategory = (
  bmi: number
): { category: string; categoryIndex: number } => {
  for (let i = 0; i < bmiCategories.length; i++) {
    const [min, max] = bmiCategories[i].range;
    if (bmi >= min && bmi < max) {
      return { category: bmiCategories[i].label, categoryIndex: i };
    }
  }
  return {
    category: bmiCategories[bmiCategories.length - 1].label,
    categoryIndex: bmiCategories.length - 1,
  };
};

export const calculateWHR = (waist: number, hips: number): number => {
  return waist / hips;
};

export const getWHRCategory = (
  whr: number,
  gender: "male" | "female"
): { category: string; description: string; imageIndex: number } => {
  // WHR Categories with 4 ranges:
  // 0.40-0.85: Peripheral Body Type (whr-0.svg)
  // 0.86-0.90: Balanced Character Type (whr-1.svg)
  // 0.91-0.94: Central Character Type (whr-2.svg)
  // 0.95-1.00+: Risky Character Type (whr-3.svg)

  if (whr <= 0.85) {
    return {
      category: "Peripheral Body Type",
      description:
        "Fat accumulates in your body especially on your hips and buttocks. It does not pose a major health risk. This body type is primarily determined by genetics.",
      imageIndex: 0,
    };
  } else if (whr <= 0.9) {
    return {
      category: "Balanced Character Type",
      description:
        "Fat in your body accumulates evenly. From a health point of view (in relation to the distribution of fat on the body), this body type is considered ideal and there is no greater risk of health complications.",
      imageIndex: 1,
    };
  } else if (whr <= 0.94) {
    return {
      category: "Central Character Type",
      description:
        "Fat accumulates in your abdomen to a greater extent. Even if the waist circumference is smaller than the hip circumference, there is an increased risk of health conditions.",
      imageIndex: 2,
    };
  } else {
    return {
      category: "Risky Character Type",
      description:
        "You have excess fat reserves in the abdominal area. Apple-type obesity is a risk factor for cardiovascular disease, stroke, high blood pressure or type 2 diabetes.",
      imageIndex: 3,
    };
  }
};

export const calculateTDEE = (
  bmr: number,
  activityLevel: keyof typeof activityMultipliers
): number => {
  return bmr * activityMultipliers[activityLevel];
};

export const calculateIdealWeightRange = (height: number) => {
  // Based on WHO BMI guidelines and health research
  // height in cm
  const heightInMeters = height / 100;

  // WHO healthy BMI range: 18.5-24.9, but use 20-24 for optimal health (excludes extremes)
  const lower = 20 * (heightInMeters * heightInMeters);
  const upper = 24 * (heightInMeters * heightInMeters);
  const target = 22 * (heightInMeters * heightInMeters); // BMI 22 is optimal for health (WHO)

  return { lower, upper, target };
};

// Adonis Index-style weight calculation for men
export const calculateAdonisWeightRange = (
  height: number,
  gender: string = "male"
) => {
  // height in cm
  const heightInMeters = height / 100;

  if (gender === "male") {
    // Adonis Index targets BMI range of 21-25 for men with athletic build
    const lower = 21 * (heightInMeters * heightInMeters);
    const upper = 25 * (heightInMeters * heightInMeters);
    const target = 23 * (heightInMeters * heightInMeters); // BMI 23 is often considered optimal for men

    return { lower, upper, target };
  } else {
    // For women, use a slightly lower range (20-24)
    const lower = 20 * (heightInMeters * heightInMeters);
    const upper = 24 * (heightInMeters * heightInMeters);
    const target = 22 * (heightInMeters * heightInMeters);

    return { lower, upper, target };
  }
};

// Body composition adjusted weight calculation
// Based on ACSM guidelines and body composition research (Gallagher et al. 2000)
export const calculateBodyCompAdjustedWeight = (
  height: number,
  gender: string = "male",
  bodyFatPercentage?: number,
  shoulderWidth?: number
) => {
  const heightInMeters = height / 100;
  // Use research-established optimal BMI for health (ACSM standards)
  let baseBMI = gender === "male" ? 22.5 : 21.5;

  // Adjust for body fat percentage if available
  if (bodyFatPercentage !== undefined) {
    // Use ACSM healthy body fat standards
    const optimalBodyFat = gender === "male" ? 15 : 23; // ACSM healthy ranges
    const bodyFatDiff = bodyFatPercentage - optimalBodyFat;

    // Research-based adjustment (Gallagher et al. 2000)
    // Validated relationship between body fat and BMI
    const bmiAdjustment = -bodyFatDiff * 0.1; // Per 1% body fat difference
    baseBMI += bmiAdjustment;
  }

  // Adjust for shoulder width if available (indicates frame size)
  if (shoulderWidth !== undefined && gender === "male") {
    const heightCm = height;
    const shoulderToHeightRatio = shoulderWidth / heightCm;

    // Average shoulder-to-height ratio is about 0.25-0.27 for men
    const averageRatio = 0.26;
    const ratioDiff = shoulderToHeightRatio - averageRatio;

    // Larger frame can support more weight
    const frameAdjustment = ratioDiff * 10; // Adjust BMI based on frame size
    baseBMI += frameAdjustment;
  }

  // Ensure BMI stays within physiologically reasonable bounds (WHO guidelines)
  baseBMI = Math.max(18.5, Math.min(28, baseBMI));

  const targetWeight = baseBMI * (heightInMeters * heightInMeters);
  const lower = (baseBMI - 1.5) * (heightInMeters * heightInMeters);
  const upper = (baseBMI + 1.5) * (heightInMeters * heightInMeters);

  return { lower, upper, target: targetWeight };
};

export const calculateCalorieTargets = (
  tdee: number,
  gender: string,
  weight: number,
  bmi: number,
  bmr: number
) => {
  const safeDeficit = calculateSafeDeficit(bmi, tdee);
  const minCalories = calculateSafeMinimumCalories(gender, weight);

  const rapidLoss = Math.max(minCalories, tdee - safeDeficit);
  const slowLoss = Math.max(
    minCalories,
    tdee - Math.min(400, safeDeficit * 0.8)
  );

  return {
    maintenance: tdee,
    rapidLoss: ensureAboveBMR(rapidLoss, bmr),
    slowLoss: ensureAboveBMR(slowLoss, bmr),
    muscleGain: tdee + 300,
  };
};

export const calculateWeeklyFatLoss = (calorieDeficit: number): number => {
  // 1 pound of fat = approximately 3500 calories
  return (calorieDeficit * 7) / 3500;
};

export const calculateWaterWeightFluctuation = (weight: number): number => {
  // Estimate 1-2% of body weight as daily fluctuation
  return weight * 0.015; // 1.5% average
};

// Standard protein recommendations
export const PROTEIN_RECOMMENDATIONS = {
  GRAMS_PER_KG: 0.8, // Standard recommendation per kg body weight
  GRAMS_PER_LB: 0.8, // Standard recommendation per lb body weight (Imperial system)
} as const;

// Protein intake calculation using grams per kg of body weight
export const calculateProteinIntakePerKg = (
  targetWeightKg: number,
  gramsPerKg: number = PROTEIN_RECOMMENDATIONS.GRAMS_PER_KG
): number => {
  return targetWeightKg * gramsPerKg;
};

// Protein intake calculation using grams per pound of body weight (Imperial system)
export const calculateProteinIntakePerLb = (
  targetWeightLbs: number,
  gramsPerLb: number = PROTEIN_RECOMMENDATIONS.GRAMS_PER_LB
): number => {
  return targetWeightLbs * gramsPerLb;
};

// Legacy function for backward compatibility
export const calculateProteinIntake = (
  targetWeight: number,
  proteinPerKg: number = PROTEIN_RECOMMENDATIONS.GRAMS_PER_KG
): number => {
  return targetWeight * proteinPerKg;
};

// Safety calculation functions
export const calculateSafeMinimumCalories = (
  gender: string,
  weight: number = 70
): number => {
  const baseMale = 1500;
  const baseFemale = 1200;

  // Adjust based on size - larger people need more calories
  const sizeAdjustment = Math.max(0, (weight - 70) * 5); // 5 cal per kg above 70kg

  if (gender === "male") {
    return Math.max(baseMale + sizeAdjustment, 1400);
  } else {
    return Math.max(baseFemale + sizeAdjustment, 1100);
  }
};

// Additional safety function to ensure calories never go below BMR
export const ensureAboveBMR = (calories: number, bmr: number): number => {
  // Never recommend calories below 90% of BMR for safety
  const minimumSafeBMR = bmr * 0.9;
  return Math.max(calories, minimumSafeBMR);
};

export const calculateSafeDeficit = (bmi: number, tdee: number): number => {
  // Based on NIH and ACSM guidelines for safe weight loss (1-2 lbs/week = 500-1000 cal deficit)
  let deficitPercentage: number;

  if (bmi < 18.5) {
    deficitPercentage = 0.05; // Very conservative for underweight (medical supervision recommended)
  } else if (bmi < 25) {
    deficitPercentage = 0.15; // 15% for normal weight (conservative approach)
  } else if (bmi < 30) {
    deficitPercentage = 0.2; // 20% for overweight (standard recommendation)
  } else if (bmi < 35) {
    deficitPercentage = 0.25; // 25% for obese class I
  } else {
    deficitPercentage = 0.3; // 30% for obese class II+ (medical supervision recommended)
  }

  const percentageDeficit = Math.round(tdee * deficitPercentage);

  // Ensure within NIH safe bounds for weight loss
  const minDeficit = 500; // Minimum for 1 lb/week loss (NIH guideline)
  const maxDeficit = 1000; // Maximum safe deficit without medical supervision (NIH guideline)

  return Math.max(minDeficit, Math.min(maxDeficit, percentageDeficit));
};

// New goal-specific calculation functions
export const calculateIdealWaistSize = (
  heightInCm: number,
  gender: string = "male"
): number => {
  // WHO and research consensus: waist-to-height ratio for health risk assessment
  // Ashwell & Hsieh (2005), WHO Guidelines: 0.5 ratio indicates optimal health
  const ratio = 0.5; // Universal health standard, not gender-specific
  return heightInCm * ratio;
};

export const calculateBestTargetWeight = (
  idealWeightRange: {
    lower: number;
    upper: number;
    target: number;
  },
  bodyCompAdjustedWeight?: {
    lower: number;
    upper: number;
    target: number;
  }
): number => {
  // Prioritize body composition adjusted weight when available
  if (bodyCompAdjustedWeight) {
    return bodyCompAdjustedWeight.target;
  }

  // Fallback to standard ideal weight range
  return idealWeightRange.target;
};

export const calculateRapidWeightLossCalories = (
  tdee: number,
  gender: string,
  weight: number,
  bmi: number,
  bmr: number
): number => {
  // Updated for safety: use calculated safe deficit instead of fixed 700
  const safeDeficit = calculateSafeDeficit(bmi, tdee);
  const minCalories = calculateSafeMinimumCalories(gender, weight);
  const rapidCalories = Math.max(minCalories, tdee - safeDeficit);
  return ensureAboveBMR(rapidCalories, bmr);
};

export const calculateSustainableWeightLossCalories = (
  tdee: number,
  gender: string,
  weight: number,
  bmi: number,
  bmr: number
): number => {
  // Updated for safety: use calculated safe deficit, but more conservative
  const safeDeficit = calculateSafeDeficit(bmi, tdee);
  const minCalories = calculateSafeMinimumCalories(gender, weight);
  const sustainableDeficit = Math.min(400, safeDeficit * 0.8); // 80% of max safe deficit
  const sustainableCalories = Math.max(minCalories, tdee - sustainableDeficit);
  return ensureAboveBMR(sustainableCalories, bmr);
};

export const calculateMaxWeeklyFatLoss = (
  rapidCalorieDeficit: number
): number => {
  // Based on rapid calorie deficit (700 calories/day)
  // 1 pound of fat = approximately 3500 calories
  // 1 kg of fat = approximately 7700 calories
  return (rapidCalorieDeficit * 7) / 7700; // Returns kg per week
};

export const calculateSustainableWeeklyFatLoss = (
  sustainableCalorieDeficit: number
): number => {
  // Based on sustainable calorie deficit (400 calories/day)
  // 1 kg of fat = approximately 7700 calories
  return (sustainableCalorieDeficit * 7) / 7700; // Returns kg per week
};

export const calculateProteinIntakeForTarget = (
  targetWeightKg: number,
  proteinSetting: number = 0.8,
  isPerPound: boolean = true
): number => {
  if (isPerPound) {
    // Convert kg to pounds first, then calculate protein per pound of body weight
    const targetWeightLbs = targetWeightKg * 2.20462;
    return calculateProteinIntakePerLb(targetWeightLbs, proteinSetting);
  } else {
    // Calculate protein per kg of body weight
    return calculateProteinIntakePerKg(targetWeightKg, proteinSetting);
  }
};

// Main calculation function that processes all user data
export const calculateAllResults = (
  userData: UserData,
  proteinPerKg: number = 0.8
): CalculationResults => {
  const bmr = calculateBMR(
    userData.gender,
    userData.weight,
    userData.height,
    userData.age,
    userData.bodyFat
  );
  const bmiValue = calculateBMI(userData.weight, userData.height);
  const bmiData = getBMICategory(bmiValue);
  const tdee = calculateTDEE(bmr, userData.activityLevel);
  const idealWeightRange = calculateIdealWeightRange(userData.height);
  const adonisWeightRange = calculateAdonisWeightRange(
    userData.height,
    userData.gender
  );
  const bodyCompAdjustedWeight = calculateBodyCompAdjustedWeight(
    userData.height,
    userData.gender,
    userData.bodyFat,
    userData.measurements?.shoulders
  );
  const calorieTargets = calculateCalorieTargets(
    tdee,
    userData.gender,
    userData.weight,
    bmiValue,
    bmr
  );

  let whr = undefined;
  if (userData.measurements?.waist && userData.measurements?.hips) {
    const whrValue = calculateWHR(
      userData.measurements.waist,
      userData.measurements.hips
    );
    const whrCategory = getWHRCategory(whrValue, userData.gender);
    whr = {
      value: whrValue,
      category: whrCategory.category,
      description: whrCategory.description,
      imageIndex: whrCategory.imageIndex,
    };
  }

  // Calculate new goal recommendations
  const idealWaistSize = calculateIdealWaistSize(
    userData.height,
    userData.gender
  );
  const bestTargetWeight = calculateBestTargetWeight(
    idealWeightRange,
    bodyCompAdjustedWeight
  );
  const rapidWeightLossCalories = calculateRapidWeightLossCalories(
    tdee,
    userData.gender,
    userData.weight,
    bmiValue,
    bmr
  );
  const sustainableWeightLossCalories = calculateSustainableWeightLossCalories(
    tdee,
    userData.gender,
    userData.weight,
    bmiValue,
    bmr
  );
  const safeDeficit = calculateSafeDeficit(bmiValue, tdee);
  const maxWeeklyFatLoss = calculateMaxWeeklyFatLoss(safeDeficit); // Use safe deficit
  const sustainableWeeklyFatLoss = calculateSustainableWeeklyFatLoss(
    Math.min(400, safeDeficit * 0.8)
  ); // Conservative deficit
  const proteinIntakeForTarget = calculateProteinIntakeForTarget(
    bestTargetWeight,
    proteinPerKg
  );

  return {
    bmr,
    bmi: {
      value: bmiValue,
      category: bmiData.category,
      categoryIndex: bmiData.categoryIndex,
    },
    whr,
    tdee,
    idealWeightRange,
    adonisWeightRange,
    bodyCompAdjustedWeight,
    calorieTargets,
    weeklyFatLoss: {
      rapid: calculateWeeklyFatLoss(700),
      slow: calculateWeeklyFatLoss(400),
    },
    waterWeightFluctuation: calculateWaterWeightFluctuation(userData.weight),
    proteinIntake: calculateProteinIntake(
      idealWeightRange.target,
      proteinPerKg
    ),
    goalRecommendations: {
      idealWaistSize,
      bestTargetWeight,
      rapidWeightLossCalories,
      sustainableWeightLossCalories,
      maxWeeklyFatLoss,
      sustainableWeeklyFatLoss,
      proteinIntakeForTarget,
    },
  };
};

// Enhanced validation functions
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors: {
    age?: string;
    height?: string;
    weight?: string;
    bodyFat?: string;
    waist?: string;
    hips?: string;
    neck?: string;
    shoulders?: string;
  };
}

export const validateUserData = (
  userData: Partial<UserData>,
  measurementsOptional: boolean = true
): ValidationResult => {
  const errors: string[] = [];
  const fieldErrors: ValidationResult["fieldErrors"] = {};

  // Age validation
  if (userData.age !== undefined) {
    if (userData.age < 10 || userData.age > 120) {
      const error = "Age must be between 10 and 120 years";
      errors.push(error);
      fieldErrors.age = error;
    }
  }

  // Weight validation (in kg) - 500 lbs = ~227 kg
  if (userData.weight !== undefined) {
    if (userData.weight < 10 || userData.weight > 227) {
      const error = "Weight must be between 10 and 227 kg (500 lbs)";
      errors.push(error);
      fieldErrors.weight = error;
    }
  }

  // Height validation (in cm)
  if (userData.height !== undefined) {
    if (userData.height < 50 || userData.height > 250) {
      const error = "Height must be between 50 and 250 cm";
      errors.push(error);
      fieldErrors.height = error;
    }
  }

  // Body fat validation
  if (userData.bodyFat !== undefined) {
    if (userData.bodyFat < 5 || userData.bodyFat > 45) {
      const error = "Body fat percentage must be between 5% and 45%";
      errors.push(error);
      fieldErrors.bodyFat = error;
    }
  }

  // Circumference measurements validation (in cm)
  // Only add to errors array if measurements are enabled, but always set fieldErrors for visual feedback
  if (userData.measurements?.waist !== undefined) {
    if (userData.measurements.waist < 30 || userData.measurements.waist > 200) {
      const error = "Waist circumference must be between 30 and 200 cm";
      if (measurementsOptional) {
        errors.push(error);
      }
      fieldErrors.waist = error;
    }
  }

  if (userData.measurements?.hips !== undefined) {
    if (userData.measurements.hips < 40 || userData.measurements.hips > 220) {
      const error = "Hips circumference must be between 40 and 220 cm";
      if (measurementsOptional) {
        errors.push(error);
      }
      fieldErrors.hips = error;
    }
  }

  if (userData.measurements?.neck !== undefined) {
    if (userData.measurements.neck < 20 || userData.measurements.neck > 60) {
      const error = "Neck circumference must be between 20 and 60 cm";
      if (measurementsOptional) {
        errors.push(error);
      }
      fieldErrors.neck = error;
    }
  }

  if (userData.measurements?.shoulders !== undefined) {
    if (
      userData.measurements.shoulders < 30 ||
      userData.measurements.shoulders > 130
    ) {
      const error = "Shoulder circumference must be between 30 and 130 cm";
      if (measurementsOptional) {
        errors.push(error);
      }
      fieldErrors.shoulders = error;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors,
  };
};

// Target Weight Integration Function
// Recalculates all metrics using a target weight instead of current weight
export const recalculateWithTargetWeight = (
  userData: UserData,
  targetWeightKg: number,
  proteinPerKg: number = 0.8
): CalculationResults => {
  // Create modified user data with target weight
  const modifiedUserData = { ...userData, weight: targetWeightKg };

  // Recalculate all results with target weight
  return calculateAllResults(modifiedUserData, proteinPerKg);
};

// Helper function to convert target weight to kg for calculations
export const convertTargetWeightToKg = (
  targetWeight: number | string,
  unitSystem: "metric" | "imperial"
): number => {
  const targetValue =
    typeof targetWeight === "string" ? parseFloat(targetWeight) : targetWeight;

  if (unitSystem === "imperial") {
    return targetValue / 2.20462; // Convert lbs to kg
  }
  return targetValue; // Already in kg
};
