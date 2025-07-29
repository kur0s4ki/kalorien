'use client';

import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SafetyDisclaimerProps {
  variant?: 'warning' | 'info' | 'critical';
  className?: string;
}

export function SafetyDisclaimer({ variant = 'warning', className = '' }: SafetyDisclaimerProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: AlertTriangle
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: Info
        };
      default:
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          icon: AlertTriangle
        };
    }
  };

  const styles = getVariantStyles();
  const Icon = styles.icon;

  return (
    <Alert className={`${styles.bgColor} ${styles.borderColor} ${className}`}>
      <Icon className={`h-4 w-4 ${styles.iconColor}`} />
      <AlertTitle className={`${styles.textColor} font-medium`}>
        ⚠️ Important Health Notice
      </AlertTitle>
      <AlertDescription className={`${styles.textColor} text-sm mt-2`}>
        <div className="space-y-2">
          <p>
            <strong>This calculator provides estimates only.</strong> Results are not medical advice and should not replace professional healthcare guidance.
          </p>
          <p>
            <strong>Consult a healthcare professional before:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Starting any diet or exercise program</li>
            <li>Making significant changes to your eating habits</li>
            <li>If you have medical conditions, take medications, or are pregnant/nursing</li>
            <li>If you have a history of eating disorders</li>
          </ul>
          <p className="text-xs mt-3 opacity-80">
            Individual results may vary. This tool is for educational purposes only.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface MedicalWarningProps {
  bmi?: number;
  age?: number;
  className?: string;
}

export function MedicalWarning({ bmi, age, className = '' }: MedicalWarningProps) {
  const getSpecificWarning = () => {
    if (bmi && bmi < 18.5) {
      return "You appear to be underweight. Weight loss is not recommended. Please consult a healthcare provider about healthy weight gain strategies.";
    }
    if (bmi && bmi > 35) {
      return "For your safety, we strongly recommend consulting with a healthcare provider before starting any weight loss program. Medical supervision may be beneficial.";
    }
    if (age && age > 65) {
      return "Older adults have different nutritional needs. Please consult your healthcare provider before making significant dietary changes.";
    }
    if (bmi && bmi > 30) {
      return "Consider consulting with a healthcare provider or registered dietitian for personalized guidance on safe weight management.";
    }
    return null;
  };

  const specificWarning = getSpecificWarning();

  if (!specificWarning) return null;

  return (
    <Alert className={`bg-orange-50 border-orange-200 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800 font-medium">
        Medical Consultation Recommended
      </AlertTitle>
      <AlertDescription className="text-orange-700 text-sm mt-2">
        {specificWarning}
      </AlertDescription>
    </Alert>
  );
}
