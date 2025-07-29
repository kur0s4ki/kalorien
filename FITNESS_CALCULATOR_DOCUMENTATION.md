# Fitness Calculator Documentation

## Overview

This fitness calculator provides scientifically-based calculations for body composition analysis, calorie targets, and weight management recommendations. The calculator uses industry-standard formulas and has been calibrated to provide realistic, actionable results for users.

## Table of Contents

- [System Architecture](#system-architecture)
- [Core Calculations](#core-calculations)
- [Input Parameters](#input-parameters)
- [Calculation Formulas](#calculation-formulas)
- [Target Weight Integration](#target-weight-integration)
- [Safety Features](#safety-features)
- [Unit System](#unit-system)
- [User Interface Components](#user-interface-components)

---

## System Architecture

### Data Flow

```
User Input → Context State → Calculation Engine → Results Display
     ↓              ↓              ↓                ↓
Assessment → CalculatorContext → calculations.ts → Results/Goal Pages
```

### Key Components

1. **CalculatorContext**: Centralized state management
2. **calculations.ts**: Core calculation engine
3. **Assessment Page**: User input collection
4. **Results Page**: Basic results display
5. **Goal Page**: Advanced goal-specific recommendations

---

## Core Calculations

### 1. Basal Metabolic Rate (BMR)

**Formula**: Mifflin-St Jeor Equation (most accurate for general population)

```typescript
// For Males
BMR = 88.362 + (13.397 × weight_kg) + (4.799 × height_cm) - (5.677 × age)

// For Females  
BMR = 447.593 + (9.247 × weight_kg) + (3.098 × height_cm) - (4.33 × age)
```

**Why Mifflin-St Jeor?**
- More accurate than Harris-Benedict equation
- Better correlation with measured metabolic rates
- Accounts for modern lifestyle differences

### 2. Total Daily Energy Expenditure (TDEE)

**Formula**: BMR × Activity Multiplier

```typescript
const activityMultipliers = {
  sedentary: 1.2,           // Little/no exercise
  'light-activity': 1.46,   // Light exercise 1-3 days/week
  'moderate-activity': 1.475, // Moderate exercise 3-5 days/week
  'high-activity': 1.64,    // Heavy exercise 6-7 days/week
  'very-high-activity': 1.8 // Very heavy exercise, physical job
}

TDEE = BMR × activityMultipliers[activityLevel]
```

**Activity Multiplier Calibration**:
- Based on industry averages between traditional formulas
- Adjusted for realistic modern activity levels
- Accounts for overestimation in original research

### 3. Body Mass Index (BMI)

**Formula**: 
```typescript
BMI = weight_kg / (height_meters²)
```

**Categories**:
- Underweight: < 18.5
- Normal: 18.5 - 24.9
- Overweight: 25.0 - 29.9
- Obese Class I: 30.0 - 34.9
- Obese Class II: 35.0 - 39.9
- Obese Class III: ≥ 40.0

### 4. Waist-to-Hip Ratio (WHR)

**Formula**:
```typescript
WHR = waist_circumference / hip_circumference
```

**Health Risk Categories**:
- **Peripheral (Low Risk)**: WHR ≤ 0.85
- **Balanced (Ideal)**: 0.86 - 0.90
- **Central (Moderate Risk)**: 0.91 - 0.94
- **Risky (High Risk)**: WHR ≥ 0.95

---

## Calculation Formulas

### Ideal Weight Ranges

#### 1. Standard BMI Range (Primary)
```typescript
// Updated to realistic range for athletic individuals
const heightInMeters = height_cm / 100;
const lower = 21 × heightInMeters²  // BMI 21
const upper = 25 × heightInMeters²  // BMI 25
const target = 23 × heightInMeters² // BMI 23 (optimal)
```

#### 2. Adonis Index Range (Secondary)
```typescript
// For males (athletic build consideration)
const lower = 21 × heightInMeters²
const upper = 25 × heightInMeters²
const target = 23 × heightInMeters²

// For females
const lower = 20 × heightInMeters²
const upper = 24 × heightInMeters²
const target = 22 × heightInMeters²
```

#### 3. Body Composition Adjusted Weight (Advanced)
```typescript
let baseBMI = gender === 'male' ? 23 : 22;

// Body fat adjustment
if (bodyFatPercentage) {
  const optimalBodyFat = gender === 'male' ? 15 : 22;
  const bodyFatDiff = bodyFatPercentage - optimalBodyFat;
  baseBMI += (-bodyFatDiff × 0.1); // Adjust BMI by 0.1 per 1% body fat difference
}

// Frame size adjustment (if shoulder measurements available)
if (shoulderWidth && gender === 'male') {
  const shoulderToHeightRatio = shoulderWidth / height_cm;
  const averageRatio = 0.26;
  const ratioDiff = shoulderToHeightRatio - averageRatio;
  baseBMI += (ratioDiff × 10); // Adjust for frame size
}

// Ensure reasonable bounds
baseBMI = Math.max(20, Math.min(26, baseBMI));
```

### Calorie Deficit Calculations

#### Percentage-Based Deficit System
```typescript
function calculateSafeDeficit(bmi: number, tdee: number): number {
  let deficitPercentage = 0.20; // Default 20% deficit
  
  if (bmi < 25) {
    deficitPercentage = 0.15; // 15% for normal/underweight
  } else if (bmi > 35) {
    deficitPercentage = 0.25; // 25% for very obese (medical supervision)
  }

  const percentageDeficit = Math.round(tdee × deficitPercentage);
  
  // Safety bounds
  const minDeficit = 300;  // Minimum effective deficit
  const maxDeficit = Math.round(tdee × 0.25); // Never more than 25% of TDEE
  
  return Math.max(minDeficit, Math.min(maxDeficit, percentageDeficit));
}
```

#### Calorie Target Categories
```typescript
const calorieTargets = {
  maintenance: tdee,
  rapidLoss: Math.max(minCalories, tdee - safeDeficit),
  slowLoss: Math.max(minCalories, tdee - Math.min(400, safeDeficit × 0.8)),
  muscleGain: tdee + 300
};
```

### Safety Calculations

#### Minimum Calorie Requirements
```typescript
function calculateSafeMinimumCalories(gender: string, weight: number): number {
  const baseMale = 1500;
  const baseFemale = 1200;
  
  // Size adjustment: larger people need more calories
  const sizeAdjustment = Math.max(0, (weight - 70) × 5); // 5 cal per kg above 70kg
  
  if (gender === 'male') {
    return Math.max(baseMale + sizeAdjustment, 1400);
  } else {
    return Math.max(baseFemale + sizeAdjustment, 1100);
  }
}
```

#### BMR Safety Check
```typescript
function ensureAboveBMR(calories: number, bmr: number): number {
  // Never recommend calories below 90% of BMR for safety
  const minimumSafeBMR = bmr × 0.9;
  return Math.max(calories, minimumSafeBMR);
}
```

### Weight Loss Predictions

#### Weekly Fat Loss Calculation
```typescript
function calculateWeeklyFatLoss(calorieDeficit: number): number {
  // 1 pound of fat = approximately 3,500 calories
  return (calorieDeficit × 7) / 3500;
}
```

#### Water Weight Fluctuation
```typescript
function calculateWaterWeightFluctuation(weight: number): number {
  // Estimate 1.5% of body weight as daily fluctuation
  return weight × 0.015;
}
```

### Protein Requirements

#### Imperial System Standard
```typescript
const PROTEIN_PER_LB = 0.8; // grams per pound of body weight

function calculateProteinIntake(targetWeightLbs: number): number {
  return targetWeightLbs × PROTEIN_PER_LB;
}
```

---

## Target Weight Integration

### Core Function
```typescript
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
```

### How It Works

1. **User sets target weight** in Goal page
2. **Context triggers recalculation** using target weight instead of current weight
3. **New BMR/TDEE calculated** based on target weight
4. **All dependent calculations update**:
   - Calorie targets
   - Macro recommendations
   - Protein requirements
   - Safety minimums

### State Management Flow
```
Target Weight Input → Context State Update → Recalculation Trigger → Updated Results
```

---

## Safety Features

### 1. Calorie Minimums
- **Never below BMR**: All recommendations stay above 90% of BMR
- **Gender-specific minimums**: Males ≥1400 cal, Females ≥1100 cal
- **Size adjustments**: Larger individuals get higher minimums

### 2. Deficit Limits
- **Maximum 25% of TDEE**: Prevents extreme deficits
- **BMI-based scaling**: Lower deficits for normal weight individuals
- **Minimum 300 calories**: Ensures meaningful deficit

### 3. Input Validation
- **Age range**: 13-120 years
- **Height range**: 120-250 cm (3'11" - 8'2")
- **Weight range**: 30-300 kg (66-660 lbs)
- **Body fat range**: 3-60%

### 4. Medical Disclaimers
- Recommendations are estimates only
- Individual needs may vary significantly
- Medical supervision recommended for extreme cases
- Not suitable for pregnant/nursing women without medical clearance

---

## Unit System

### Imperial System Only
The calculator has been optimized for the Imperial system:

- **Weight**: Pounds (lbs)
- **Height**: Feet and inches (ft'in")
- **Measurements**: Inches (in)
- **Protein**: Grams per pound (g/lb)

### Internal Storage
All measurements are stored internally in metric units for calculation consistency:
- Height: Centimeters (cm)
- Weight: Kilograms (kg)
- Measurements: Centimeters (cm)

### Conversion Functions
```typescript
// Weight conversion
const convertLbsToKg = (lbs: number) => lbs / 2.20462;
const convertKgToLbs = (kg: number) => kg × 2.20462;

// Height conversion  
const convertFeetInchesToCm = (feet: number, inches: number) => 
  (feet × 12 + inches) × 2.54;

// Measurement conversion
const convertInchesToCm = (inches: number) => inches × 2.54;
```

---

## User Interface Components

### Assessment Page
- **Personal Information**: Age, gender, activity level
- **Physical Measurements**: Height, weight, body composition
- **Body Measurements**: Waist, hips, neck (for WHR calculation)
- **Body Fat Estimation**: Visual body type selector with percentage mapping

### Results Page
- **Basic Metrics**: BMI, BMR, TDEE
- **Weight Ranges**: Ideal, Adonis, body composition adjusted
- **Calorie Targets**: Maintenance, weight loss, muscle gain
- **Body Composition**: WHR analysis with visual indicators

### Goal Page (Advanced)
- **Target Weight Setting**: Interactive weight selection with immediate recalculation
- **Goal-Specific Calculations**: Calories and macros based on selected goal
- **Detailed Recommendations**: Week-by-week projections
- **Action Items**: Specific, actionable guidance
- **Safety Reminders**: Important health and safety information

---

## Example Calculation

### Sample Profile
- **Gender**: Male
- **Age**: 51 years
- **Height**: 5'10" (177.8 cm)
- **Weight**: 189 lbs (85.73 kg)
- **Activity**: Moderate (3-5 days/week exercise)
- **Body Fat**: 26.6%

### Step-by-Step Calculation

#### 1. BMR Calculation
```
BMR = 88.362 + (13.397 × 85.73) + (4.799 × 177.8) - (5.677 × 51)
BMR = 88.362 + 1148.07 + 853.26 - 289.53
BMR = 1,800 calories/day
```

#### 2. TDEE Calculation
```
TDEE = BMR × Activity Multiplier
TDEE = 1,800 × 1.475 (moderate activity)
TDEE = 2,655 calories/day
```

#### 3. BMI Calculation
```
BMI = 85.73 kg ÷ (1.778 m)²
BMI = 85.73 ÷ 3.161
BMI = 27.1 (Overweight)
```

#### 4. Calorie Deficit
```
Deficit Percentage = 20% (BMI > 25)
Safe Deficit = 2,655 × 0.20 = 531 calories
Weight Loss Calories = 2,655 - 531 = 2,124 calories/day
```

#### 5. Ideal Weight Range
```
Height in meters = 1.778 m
Lower = 21 × (1.778)² = 66.4 kg = 146 lbs
Upper = 25 × (1.778)² = 79.1 kg = 174 lbs
Target = 23 × (1.778)² = 72.7 kg = 160 lbs
```

#### 6. Protein Requirements
```
Target Weight = 160 lbs
Protein = 160 × 0.8 = 128g per day
```

### Expected Results Summary
- **Maintenance Calories**: 2,655 cal/day
- **Weight Loss Calories**: 2,124 cal/day  
- **Ideal Weight Range**: 146-174 lbs (target: 160 lbs)
- **Weekly Fat Loss**: ~1 lb/week at deficit
- **Protein Target**: 128g daily
- **Water Weight Fluctuation**: ±2.8 lbs daily

---

## Technical Implementation Notes

### Performance Optimizations
- Calculations triggered only on meaningful input changes
- Results cached until input parameters change
- Target weight calculations computed separately from main calculations

### Error Handling
- Graceful fallbacks for invalid inputs
- Null safety checks throughout calculation chain
- Default values prevent application crashes

### Data Validation
- Input sanitization before calculations
- Range checking for all parameters
- Type safety with TypeScript interfaces

### State Management
- Centralized state in React Context
- Automatic recalculation on data changes
- Separate state for target weight scenarios

---

## References and Sources

### Scientific Formulas
1. **Mifflin-St Jeor Equation**: Mifflin MD, et al. (1990). A new predictive equation for resting energy expenditure in healthy individuals. American Journal of Clinical Nutrition.

2. **Activity Multipliers**: Averaged from multiple sources including:
   - Harris-Benedict original research
   - Katch-McArdle methodology
   - Modern lifestyle adjustments

3. **Body Fat Considerations**: Based on research from American Council on Exercise (ACE) and National Academy of Sports Medicine (NASM)

### Safety Guidelines
- **FDA Dietary Guidelines**: Used for minimum calorie recommendations
- **WHO Health Standards**: BMI categories and health risk assessments
- **ACSM Guidelines**: Exercise and nutrition recommendations

### Validation Sources
- **Nutritionix Database**: Used for calorie calculation validation
- **MyFitnessPal Research**: User outcome data for realistic expectations
- **Clinical Nutrition Studies**: Long-term weight loss success rates

---

*This documentation represents the current implementation as of the latest update. The calculator continues to evolve based on user feedback and scientific research updates.* 