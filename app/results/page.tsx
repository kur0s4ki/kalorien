'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popup } from '@/components/ui/popup';
import { useCalculator } from '@/contexts/CalculatorContext';

export default function ResultsPage() {
  const router = useRouter();
  const { userData, calculations } = useCalculator();
  const [activePopup, setActivePopup] = useState<'basal' | 'bmi' | 'whr' | 'print' | null>(null);

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

  const openPopup = (type: 'basal' | 'bmi' | 'whr' | 'print') => {
    setActivePopup(type);
  };

  const closePopup = () => {
    setActivePopup(null);
  };

  const getPopupContent = (type: 'basal' | 'bmi' | 'whr' | 'print') => {
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
      case 'whr':
        return {
          title: 'WHR Index',
          content: (
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                WHR (Waist-to-Hip Ratio) helps assess body fat distribution and health risks associated with abdominal obesity. A higher WHR indicates more fat stored around the waist, which is associated with increased risk of cardiovascular disease and diabetes.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-orange-800 font-medium text-xs">
                  <strong>Health Note:</strong> Waist circumference and WHR are better predictors of health risks than BMI alone, especially for cardiovascular disease risk.
                </p>
              </div>
              <p className="text-xs">
                Target waist-to-hip ratios: Men &lt; 0.90, Women &lt; 0.85 for lower health risks.
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
    <div className="h-screen bg-gray-50 flex items-center justify-center overflow-hidden md:min-h-screen md:bg-gray-50 md:flex-none md:items-start md:overflow-visible">
      <div className="max-w-2xl mx-auto w-full h-full md:h-auto md:p-4">
        <Card className="shadow-lg w-full h-full flex flex-col md:h-auto" style={{ backgroundColor: '#F5F5F5' }}>
          <CardHeader className="text-center pb-6 flex-shrink-0">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Your results
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-y-auto md:overflow-y-visible md:space-y-4">
            <div className="space-y-6 flex-1 md:flex-none md:space-y-4">
              {/* Basal Metabolism */}
              <div className="space-y-3 md:space-y-2">
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
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800">
                    {Math.round(calculations.bmr)} Calories
                  </div>
                </div>

              </div>

              {/* Separator */}
              <hr className="border-gray-300" />

              {/* BMI Index */}
              <div className="space-y-3 md:space-y-2">
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
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800">
                    {calculations.bmi.value.toFixed(2)}
                  </div>
                </div>

                {/* BMI Categories */}
                <div className="flex justify-center space-x-1 my-4">
                  {bmiCategories.map((category, index) => (
                    <div
                      key={index}
                      className={`h-6 rounded-full flex-1 max-w-12 transition-all duration-300 ${index === calculations.bmi.categoryIndex
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

                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-800">
                    {calculations.bmi.category}
                  </div>
                </div>

              </div>

              {/* Separator */}
              <hr className="border-gray-300" />

              {/* WHR Index */}
              <div className="space-y-3 md:space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">WHR Index</h3>
                  <button
                    onClick={() => openPopup('whr')}
                    className="text-sm font-medium"
                    style={{ color: '#31860A' }}
                  >
                    Explanation
                  </button>
                </div>

                {!calculations.whr ? (
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 relative">
                      {/* Main body silhouette */}
                      <img
                        src={`/images/${userData.gender === 'male' ? 'muz-gray-1' : 'zena-gray-0'}.svg`}
                        alt="Body silhouette"
                        className="w-24 h-48 object-contain"
                        style={{
                          transform: 'translateY(22px)', // Adjust this value to move image up/down
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-left mb-4">
                        <div className="text-4xl font-bold text-gray-800">?</div>
                      </div>
                      <div className="text-left mb-4">
                        <div className="text-lg font-semibold text-gray-800">
                          Missing Data
                        </div>
                      </div>
                      <div className="text-left text-sm text-gray-600 leading-relaxed">
                        First, fill in the circumferences of the neck, waist and hips.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 relative">
                      {/* Main body silhouette */}
                      <img
                        src={`/images/${userData.gender === 'male' ? 'muz-gray-1' : 'zena-gray-0'}.svg`}
                        alt="Body silhouette"
                        className="w-24 h-48 object-contain"
                        style={{
                          transform: 'translateY(22px)', // Adjust this value to move image up/down
                          transition: 'transform 0.2s ease'
                        }}
                      />
                      {/* Overlapping WHR indicator image */}
                      <img
                        src={`/images/whr-${calculations.whr?.imageIndex}.svg`}
                        alt="WHR indicator"
                        className="absolute w-16 h-16 object-contain"
                        style={{
                          top: '45%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 10
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-left mb-4">
                        <div className="text-4xl font-bold text-gray-800">
                          {calculations.whr?.value.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-left mb-4">
                        <div className="text-lg font-semibold text-gray-800">
                          {calculations.whr?.category}
                        </div>
                      </div>
                      <div className="text-left text-sm text-gray-600 leading-relaxed">
                        {calculations.whr?.description}
                      </div>
                    </div>
                  </div>
                )}

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
