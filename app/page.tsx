'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center md:min-h-screen md:bg-gray-50 md:flex-none md:items-start md:overflow-visible">
      <div className="max-w-2xl mx-auto w-full md:h-auto md:p-4 p-4">
        <Card className="shadow-lg w-full md:h-auto" style={{ backgroundColor: '#F5F5F5' }}>
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-800 mb-4">
              Health & Fitness Calculator
            </CardTitle>
            <p className="text-lg text-gray-600">
              Get personalized insights into your health metrics and fitness goals
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Shorter Safety Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-yellow-800 font-medium mb-2 flex items-center">
                ⚠️ Important Notice
              </h4>
              <div className="text-yellow-700 text-sm space-y-2">
                <p>
                  <strong>This calculator provides estimates only.</strong> Results are not medical advice.
                </p>
                <p>
                  Please consult a healthcare professional before starting any diet or exercise program, especially if you have medical conditions.
                </p>
              </div>
            </div>

            {/* What You'll Get */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">What you'll discover:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-800">Body Metrics</h4>
                    <p className="text-sm text-gray-600">BMI, WHR, and body composition analysis</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-800">Calorie Needs</h4>
                    <p className="text-sm text-gray-600">Daily calorie requirements and targets</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-800">Goal Planning</h4>
                    <p className="text-sm text-gray-600">Personalized weight and fitness goals</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-800">Nutrition Guide</h4>
                    <p className="text-sm text-gray-600">Protein intake and macro recommendations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Estimate */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">i</span>
                </div>
                <span className="text-blue-800 font-medium">Takes about 2-3 minutes to complete</span>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-6">
              <Button
                className="w-full text-white py-4 rounded-lg font-medium text-lg transition-colors duration-200 hover:opacity-95"
                style={{
                  backgroundColor: '#31860A',
                  borderRadius: '12px'
                }}
                onClick={() => {
                  sessionStorage.setItem('hasVisitedIntro', 'true');
                  router.push('/assessment');
                }}
              >
                Start Health Assessment
              </Button>
            </div>

            {/* Footer Note */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Your data is processed locally and not stored on our servers
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
