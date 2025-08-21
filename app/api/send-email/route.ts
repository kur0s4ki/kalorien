import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      userData, 
      calculations,
      targetWeightCalculations,
      selectedGoal,
      proteinPerKg,
      targetWeight,
      isTargetWeightEnabled,
      nutritionData
    } = body;

    if (!email || !userData || !calculations || !nutritionData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format the date
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Helper function to format weight based on unit system
    const formatWeight = (weightKg: number, unitSystem: string) => {
      if (unitSystem === 'imperial') {
        return `${Math.round(weightKg * 2.20462)} lbs`;
      }
      return `${Math.round(weightKg)} kg`;
    };

    // Helper function to format height based on unit system
    const formatHeight = (heightCm: number, unitSystem: string) => {
      if (unitSystem === 'imperial') {
        const totalInches = heightCm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}'${inches}"`;
      }
      return `${Math.round(heightCm)} cm`;
    };

    // Helper function to format measurements based on unit system
    const formatMeasurement = (measurementCm: number | undefined, unitSystem: string) => {
      if (!measurementCm) return 'N/A';
      if (unitSystem === 'imperial') {
        return `${Math.round(measurementCm / 2.54 * 10) / 10}"`;
      }
      return `${Math.round(measurementCm)} cm`;
    };

    // Helper function to format calories
    const formatCalories = (calories: number) => {
      return calories.toLocaleString();
    };

    // Helper function to format activity level
    const formatActivityLevel = (level: string) => {
      const activityMap: { [key: string]: string } = {
        'sedentary': 'Sedentary',
        'light-activity': 'Light Activity',
        'moderate-activity': 'Moderate Activity',
        'high-activity': 'High Activity',
        'very-high-activity': 'Very High Activity'
      };
      return activityMap[level] || level;
    };

    // Helper function to format gender
    const formatGender = (gender: string) => {
      return gender === 'male' ? 'Male' : 'Female';
    };

    // Calculate WHR risk category
    const getWHRRiskCategory = (whr: number, gender: string) => {
      if (gender === 'male') {
        if (whr >= 1.0) return 'Risky Character Type';
        if (whr >= 0.9) return 'Moderate Risk';
        return 'Low Risk';
      } else {
        if (whr >= 0.85) return 'Risky Character Type';
        if (whr >= 0.8) return 'Moderate Risk';
        return 'Low Risk';
      }
    };

    // Get WHR risk description
    const getWHRRiskDescription = (whr: number, gender: string) => {
      if (gender === 'male' && whr >= 1.0) {
        return 'You have excess fat reserves in the abdominal area. Apple-type obesity is a risk factor for cardiovascular disease, stroke, high blood pressure or type 2 diabetes.';
      } else if (gender === 'female' && whr >= 0.85) {
        return 'You have excess fat reserves in the abdominal area. Apple-type obesity is a risk factor for cardiovascular disease, stroke, high blood pressure or type 2 diabetes.';
      }
      return 'Your waist-to-hip ratio is within a healthy range.';
    };

    // Helper function to get goal title
    const getGoalTitle = (goal: string) => {
      const goals = {
        'stay-fit': 'To Maintain Weight',
        'lose-weight': 'To Lose Weight', 
        'gain-muscles': 'To Gain Weight'
      };
      return goals[goal as keyof typeof goals] || 'To Maintain Weight';
    };

    // Get the macro data from nutritionData (this is what user actually sees in UI)
    const proteins = nutritionData.macros.find((m: any) => m.name === 'Proteins') || { amount: 0, percentage: 0 };
    const carbs = nutritionData.macros.find((m: any) => m.name === 'Carbohydrate') || { amount: 0, percentage: 0 };
    const fats = nutritionData.macros.find((m: any) => m.name === 'Fats') || { amount: 0, percentage: 0 };

    // Format target weight if enabled
    const formattedTargetWeight = isTargetWeightEnabled && targetWeight 
      ? formatWeight(targetWeight, userData.unitSystem) 
      : null;

    // Create email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Fitness Assessment Results</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #31860A;
          }
          .header h1 {
            color: #31860A;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 16px;
          }
          .section {
            margin-bottom: 25px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #31860A;
          }
          .section h2 {
            color: #31860A;
            margin: 0 0 15px 0;
            font-size: 20px;
            font-weight: 600;
          }
          .data-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            margin-bottom: 15px;
          }
          .data-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .data-item:last-child {
            border-bottom: none;
          }
          .data-label {
            font-weight: 500;
            color: #495057;
          }
          .data-value {
            font-weight: 600;
            color: #212529;
          }
          .risk-warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
          }
          .risk-warning h3 {
            color: #856404;
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 600;
          }
          .risk-warning p {
            color: #856404;
            margin: 0;
            font-size: 14px;
          }
          .macro-section {
            background-color: #e8f5e8;
            border: 1px solid #c3e6c3;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
          }
          .macro-section h3 {
            color: #155724;
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 600;
          }
          .macro-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            text-align: center;
          }
          .macro-item {
            background-color: white;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #c3e6c3;
          }
          .macro-value {
            font-size: 18px;
            font-weight: 700;
            color: #155724;
          }
          .macro-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #666;
            font-size: 14px;
          }
          .app-note {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 6px;
            padding: 10px;
            margin: 10px 0;
            text-align: center;
            color: #0c5460;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏃‍♂️ Fitness Assessment Results</h1>
            <p>Your personalized health and fitness analysis</p>
          </div>

          <div class="section">
            <h2>📊 Personal Information</h2>
            <div class="data-grid">
              <div class="data-item">
                <span class="data-label">Date:</span>
                <span class="data-value">${formattedDate}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Sex:</span>
                <span class="data-value">${formatGender(userData.gender)}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Height:</span>
                <span class="data-value">${formatHeight(userData.height, userData.unitSystem)}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Weight:</span>
                <span class="data-value">${formatWeight(userData.weight, userData.unitSystem)}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Activity Level:</span>
                <span class="data-value">${formatActivityLevel(userData.activityLevel)}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Body Fat:</span>
                <span class="data-value">${userData.bodyFat ? userData.bodyFat + '%' : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>📏 Body Measurements</h2>
            <div class="data-grid">
              <div class="data-item">
                <span class="data-label">Neck:</span>
                <span class="data-value">${formatMeasurement(userData.measurements?.neck, userData.unitSystem)}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Waist:</span>
                <span class="data-value">${formatMeasurement(userData.measurements?.waist, userData.unitSystem)}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Hips:</span>
                <span class="data-value">${formatMeasurement(userData.measurements?.hips, userData.unitSystem)}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Shoulders:</span>
                <span class="data-value">${formatMeasurement(userData.measurements?.shoulders, userData.unitSystem)}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>🧮 Health Metrics</h2>
            <div class="data-grid">
              <div class="data-item">
                <span class="data-label">Basal Metabolism:</span>
                <span class="data-value">${formatCalories(calculations.bmr)} Calories</span>
              </div>
              <div class="data-item">
                <span class="data-label">BMI Index:</span>
                <span class="data-value">${calculations.bmi.value.toFixed(2)}</span>
              </div>
              <div class="data-item">
                <span class="data-label">WHR Index:</span>
                <span class="data-value">${calculations.whr ? calculations.whr.value.toFixed(2) : 'N/A'}</span>
              </div>
            </div>
            
            ${calculations.whr ? `
              <div class="risk-warning">
                <h3>${getWHRRiskCategory(calculations.whr.value, userData.gender)}</h3>
                <p>${getWHRRiskDescription(calculations.whr.value, userData.gender)}</p>
              </div>
            ` : ''}
          </div>

          <div class="section">
            <h2>⚖️ Weight Management</h2>
            <div class="data-grid">
              <div class="data-item">
                <span class="data-label">Ideal Weight Range:</span>
                <span class="data-value">${formatWeight(calculations.idealWeightRange.lower, userData.unitSystem)} to ${formatWeight(calculations.idealWeightRange.upper, userData.unitSystem)}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Optimal Target Weight:</span>
                <span class="data-value">${formatWeight(calculations.idealWeightRange.target, userData.unitSystem)}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Ideal Waist Size:</span>
                <span class="data-value">${formatMeasurement(calculations.goalRecommendations.idealWaistSize, userData.unitSystem)}</span>
              </div>
            </div>
          </div>

          <!-- Maintain Weight Section -->
          <div class="section">
            <h2>🔥 To Maintain Weight @ ${proteinPerKg}g Protein/kg of Body Weight</h2>
            <div class="data-grid">
              <div class="data-item">
                <span class="data-label">Calories/Day:</span>
                <span class="data-value">${formatCalories(Math.round(calculations.tdee))}</span>
              </div>
            </div>
            <div class="macro-section">
              <h3>Macronutrient Breakdown</h3>
              <div class="macro-grid">
                <div class="macro-item">
                  <div class="macro-value">${Math.round(userData.weight * proteinPerKg)}g</div>
                  <div class="macro-label">Proteins (${Math.round((userData.weight * proteinPerKg * 4 / calculations.tdee) * 100)}%)</div>
                </div>
                <div class="macro-item">
                  <div class="macro-value">${Math.round((calculations.tdee - (userData.weight * proteinPerKg * 4)) * 0.48 / 4)}g</div>
                  <div class="macro-label">Carbs (48%)</div>
                </div>
                <div class="macro-item">
                  <div class="macro-value">${Math.round((calculations.tdee - (userData.weight * proteinPerKg * 4)) * 0.24 / 9)}g</div>
                  <div class="macro-label">Fats (24%)</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lose Weight Section -->
          <div class="section">
            <h2>📉 To Lose Weight @ ${proteinPerKg}g Protein/kg of Body Weight</h2>
            <div class="data-grid">
              ${formattedTargetWeight ? `
                <div class="data-item">
                  <span class="data-label">Target Weight:</span>
                  <span class="data-value">${formattedTargetWeight}</span>
                </div>
              ` : ''}
              <div class="data-item">
                <span class="data-label">Calories/Day:</span>
                <span class="data-value">${selectedGoal === 'lose-weight' ? formatCalories(nutritionData.totalCalories) : formatCalories(Math.round(calculations.tdee * 0.8))}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Expected Results:</span>
                <span class="data-value">0.8 lbs/week</span>
              </div>
              <div class="data-item">
                <span class="data-label">Water Weight Fluctuation:</span>
                <span class="data-value">${calculations.waterWeightFluctuation.toFixed(1)} lbs</span>
              </div>
            </div>
            <div class="macro-section">
              <h3>📱 Set Your Calorie Counting App</h3>
              <div class="macro-grid">
                <div class="macro-item">
                  <div class="macro-value">${selectedGoal === 'lose-weight' ? proteins.amount : Math.round(userData.weight * proteinPerKg)}g</div>
                  <div class="macro-label">Proteins (${selectedGoal === 'lose-weight' ? proteins.percentage : Math.round((userData.weight * proteinPerKg * 4 / (calculations.tdee * 0.8)) * 100)}%)</div>
                </div>
                <div class="macro-item">
                  <div class="macro-value">${selectedGoal === 'lose-weight' ? carbs.amount : Math.round(((calculations.tdee * 0.8) - (userData.weight * proteinPerKg * 4)) * 0.34 / 4)}g</div>
                  <div class="macro-label">Carbs (${selectedGoal === 'lose-weight' ? carbs.percentage : 34}%)</div>
                </div>
                <div class="macro-item">
                  <div class="macro-value">${selectedGoal === 'lose-weight' ? fats.amount : Math.round(((calculations.tdee * 0.8) - (userData.weight * proteinPerKg * 4)) * 0.29 / 9)}g</div>
                  <div class="macro-label">Fats (${selectedGoal === 'lose-weight' ? fats.percentage : 29}%)</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gain Weight Section -->
          <div class="section">
            <h2>📈 To Gain Weight @ ${proteinPerKg}g Protein/kg of Body Weight</h2>
            <div class="data-grid">
              <div class="data-item">
                <span class="data-label">Target Weight:</span>
                <span class="data-value">${selectedGoal === 'gain-muscles' && formattedTargetWeight ? formattedTargetWeight : formatWeight(userData.weight * 1.1, userData.unitSystem)}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Calories/Day:</span>
                <span class="data-value">${selectedGoal === 'gain-muscles' ? formatCalories(nutritionData.totalCalories) : formatCalories(Math.round(calculations.tdee * 1.15))}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Expected Results:</span>
                <span class="data-value">0.25-0.5 lbs/week</span>
              </div>
              <div class="data-item">
                <span class="data-label">Water Weight Fluctuation:</span>
                <span class="data-value">${(calculations.waterWeightFluctuation - 0.1).toFixed(1)} lbs</span>
              </div>
            </div>
            <div class="macro-section">
              <h3>📱 Set Your Calorie Counting App</h3>
              <div class="macro-grid">
                <div class="macro-item">
                  <div class="macro-value">${selectedGoal === 'gain-muscles' ? proteins.amount : Math.round(userData.weight * proteinPerKg)}g</div>
                  <div class="macro-label">Proteins (${selectedGoal === 'gain-muscles' ? proteins.percentage : Math.round((userData.weight * proteinPerKg * 4 / (calculations.tdee * 1.15)) * 100)}%)</div>
                </div>
                <div class="macro-item">
                  <div class="macro-value">${selectedGoal === 'gain-muscles' ? carbs.amount : Math.round(((calculations.tdee * 1.15) - (userData.weight * proteinPerKg * 4)) * 0.44 / 4)}g</div>
                  <div class="macro-label">Carbs (${selectedGoal === 'gain-muscles' ? carbs.percentage : 44}%)</div>
                </div>
                <div class="macro-item">
                  <div class="macro-value">${selectedGoal === 'gain-muscles' ? fats.amount : Math.round(((calculations.tdee * 1.15) - (userData.weight * proteinPerKg * 4)) * 0.25 / 9)}g</div>
                  <div class="macro-label">Fats (${selectedGoal === 'gain-muscles' ? fats.percentage : 25}%)</div>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for using our Fitness Calculator!</p>
            <p>For questions or support, please contact our team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create welcome email HTML content
    const welcomeEmailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome! Your Calorie Targets Are Ready</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #31860A;
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            margin-bottom: 30px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #31860A;
            margin-bottom: 20px;
          }
          .paragraph {
            margin-bottom: 20px;
            font-size: 16px;
            line-height: 1.7;
          }
          .pro-tip {
            background-color: #f0f8e8;
            border-left: 4px solid #31860A;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
          }
          .pro-tip strong {
            color: #31860A;
          }
          .expectations {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .expectations h3 {
            color: #31860A;
            margin: 0 0 15px 0;
            font-size: 18px;
          }
          .expectations ul {
            margin: 0;
            padding-left: 20px;
          }
          .expectations li {
            margin-bottom: 8px;
            font-size: 15px;
          }
          .signature {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
          }
          .signature p {
            margin: 5px 0;
          }
          .signature .name {
            font-weight: 600;
            color: #31860A;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Welcome to HowToGetInShape.org</h1>
            <p style="color: #666; font-size: 16px;">Your Calorie Targets Are Ready!</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello, My Calorie Counting Friend,</div>
            
            <div class="paragraph">
              Welcome to <strong>HowToGetInShape.org</strong>—and thank you for using the free calorie calculator!
            </div>
            
            <div class="paragraph">
              Here are your personal results, keep this email so you can track how far you've come during your weight-loss journey.
            </div>
            
            <div class="pro-tip">
              <strong>Pro tip:</strong> Whenever you lose 10 pounds, just re-enter your numbers to adjust your calorie target for optimal fat-burning.
            </div>
            
            <div class="paragraph">
              Your free video tutorial series is on its way—check your inbox! These videos will teach you to master calorie counting using a free app and a food scale, starting today.
            </div>
            
            <div class="expectations">
              <h3>Here's what to expect from me:</h3>
              <ul>
                <li>Actionable video lessons in your inbox</li>
                <li>Weekly tips to stay on track</li>
                <li>Success stories that inspire</li>
                <li>Occasional reminders that keep you accountable</li>
              </ul>
            </div>
            
            <div class="paragraph">
              I'm excited to help you build the confidence, clarity, and results you've been chasing.
            </div>
          </div>
          
          <div class="signature">
            <p>To your success,</p>
            <p class="name">Calorie Counting Guy</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} HowToGetInShape.org</p>
            <p>You're receiving this because you used our free calorie calculator.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send both emails using Resend
    try {
      // Send the fitness assessment results email
      const { data: resultsData, error: resultsError } = await resend.emails.send({
        from: 'Calorie Counting Guy <contact@howtogetinshape.org>',
        to: [email],
        subject: `Your Fitness Assessment Results - ${formattedDate}`,
        html: emailHtml,
      });

      if (resultsError) {
        console.error('Results email sending error:', resultsError);
        return NextResponse.json(
          { error: 'Failed to send results email' },
          { status: 500 }
        );
      }

      // Send the welcome email
      const { data: welcomeData, error: welcomeError } = await resend.emails.send({
        from: 'Calorie Counting Guy <contact@howtogetinshape.org>',
        to: [email],
        subject: 'Welcome! Your Calorie Targets Are Ready',
        html: welcomeEmailHtml,
      });

      if (welcomeError) {
        console.error('Welcome email sending error:', welcomeError);
        // Don't fail the entire request if welcome email fails
        // The main results email was successful
      }

      return NextResponse.json({
        success: true,
        resultsMessageId: resultsData?.id,
        welcomeMessageId: welcomeData?.id,
        message: 'Emails sent successfully'
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send emails' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
