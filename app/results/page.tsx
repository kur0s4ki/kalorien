'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popup } from '@/components/ui/popup';
import { useCalculator } from '@/contexts/CalculatorContext';
import { useConfig } from '@/contexts/ConfigContext';

export default function ResultsPage() {
  const router = useRouter();
  const { userData, calculations } = useCalculator();
  const { config } = useConfig();
  const [activePopup, setActivePopup] = useState<'basal' | 'bmi' | 'print' | null>(null);

  // Redirect to home if calculations are missing (direct navigation or refresh)
  useEffect(() => {
    if (!calculations || !userData.weight || !userData.height) {
      router.push('/');
    }
  }, [calculations, userData, router]);

  // Show loading while redirecting
  if (!calculations || !userData.weight || !userData.height) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  const bmiCategories = [
    { label: 'Underweight', color: '#87CEEB' },
    { label: 'Normal', color: '#90EE90' },
    { label: 'Overweight', color: '#FFD700' },
    { label: 'Obese I', color: '#FFA500' },
    { label: 'Obese II', color: '#FF6347' },
    { label: 'Obese III', color: '#DC143C' }
  ];

  const openPopup = (type: 'basal' | 'bmi' | 'print') => {
    setActivePopup(type);
  };

  const closePopup = () => {
    setActivePopup(null);
  };

  const getPopupContent = (type: 'basal' | 'bmi' | 'print') => {
    switch (type) {
      case 'basal':
        return {
          title: 'Basal Metabolism',
          content: (
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                Basal Metabolic Rate (BMR) is the number of calories your body needs to maintain basic physiological functions like breathing, circulation, and cell production while at rest. This represents the minimum energy required to keep your body functioning.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 font-medium text-xs">
                  ⚠️ <strong>Important:</strong> Never eat below your BMR for extended periods without medical supervision. This can slow metabolism and cause health issues.
                </p>
              </div>
            </div>
          )
        };
      case 'bmi':
        return {
          title: 'BMI Index',
          content: (
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                BMI (Body Mass Index) is a measure of body fat based on height and weight. It helps categorize weight status and assess potential health risks.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 font-medium text-xs">
                  <strong>Important Limitations:</strong> BMI doesn't account for muscle mass, bone density, age, or body composition. Athletes and muscular individuals may have high BMI but low body fat.
                </p>
              </div>
              <p className="text-xs">
                Always consider BMI alongside other health indicators and consult healthcare professionals for personalized assessment.
              </p>
            </div>
          )
        };
      case 'print':
        return {
          title: 'Print Results',
          content: (
            <p className="text-sm text-gray-600">
              Feature under development
            </p>
          )
        };
      default:
        return { title: '', content: null };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center overflow-hidden p-0 md:min-h-screen md:bg-gray-50 md:flex-none md:items-start md:overflow-visible md:p-4">
      <div className="w-full h-full md:max-w-2xl md:mx-auto md:h-auto">
        <Card className="shadow-none md:shadow-lg w-full h-full min-h-screen md:min-h-0 flex flex-col md:h-auto rounded-none md:rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
          <CardHeader className="text-center pb-6 flex-shrink-0">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {config.results_title || 'Your Results'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-y-auto md:overflow-y-visible">
            <div className="space-y-8 flex-1 md:flex-none px-4">
              {/* Basal Metabolism */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Basal Metabolism</h3>
                  <button
                    onClick={() => openPopup('basal')}
                    className="text-sm font-medium"
                    style={{ color: '#31860A' }}
                  >
                    Explanation
                  </button>
                </div>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-gray-800">
                    {Math.round(calculations.bmr)} Calories
                  </div>
                </div>
              </div>

              {/* Separator */}
              <hr className="border-gray-300" />

              {/* BMI Index */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">BMI Index</h3>
                  <button
                    onClick={() => openPopup('bmi')}
                    className="text-sm font-medium"
                    style={{ color: '#31860A' }}
                  >
                    Explanation
                  </button>
                </div>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-gray-800">
                    {calculations.bmi.value.toFixed(2)}
                  </div>
                </div>

                {/* BMI Categories */}
                <div className="flex justify-center space-x-2 my-4">
                  {bmiCategories.map((category, index) => (
                    <div
                      key={index}
                      className={`h-6 w-10 rounded-full transition-all duration-300 ${index === calculations.bmi.categoryIndex
                        ? 'ring-4 ring-gray-600 ring-opacity-60 scale-110 shadow-lg'
                        : 'opacity-40'
                        }`}
                      style={{
                        backgroundColor: category.color,
                        filter: index === calculations.bmi.categoryIndex ? 'brightness(1.1) saturate(1.2)' : 'brightness(0.8) saturate(0.7)'
                      }}
                    />
                  ))}
                </div>

                <div className="text-center py-2">
                  <div className="text-xl font-semibold text-gray-800">
                    {calculations.bmi.category}
                  </div>
                </div>
              </div>

            </div>



            {/* Navigation Buttons - Always at bottom */}
            <div className="pt-6 flex justify-between flex-shrink-0 md:border-t md:border-gray-200 md:mt-4 md:pt-4">
              <Button
                variant="outline"
                className="px-8"
                onClick={() => router.push('/assessment')}
              >
                Back
              </Button>
              <Button
                className="px-8 text-white font-medium"
                style={{ backgroundColor: '#31860A' }}
                onClick={() => router.push('/goal')}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popup Components */}
      {activePopup && (
        <Popup
          isOpen={true}
          onClose={closePopup}
          title={getPopupContent(activePopup).title}
        >
          {getPopupContent(activePopup).content}
        </Popup>
      )}
    </div>
  );
}
