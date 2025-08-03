'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCalculator } from '@/contexts/CalculatorContext';

import { CircumferenceInput } from '@/components/ui/circumference-input';
import { HeightInput } from '@/components/ui/height-input';

const bodyTypes = [
    { id: 1, fat: '5%' },
    { id: 2, fat: '10%' },
    { id: 3, fat: '15%' },
    { id: 4, fat: '20%' },
    { id: 5, fat: '25%' },
    { id: 6, fat: '30%' },
    { id: 7, fat: '35%' },
];

export default function HealthDataForm() {
    const router = useRouter();
    const { userData, updateUserData, validationErrors, fieldErrors, isDataValid, calculations, forceCalculation, measurementsOptional, setMeasurementsOptional } = useCalculator();

    // Helper function to get activity level display name
    const getActivityLevelDisplayName = (value: string) => {
        switch (value) {
            case 'sedentary': return 'Sedentary';
            case 'light-activity': return 'Light Activity';
            case 'moderate-activity': return 'Moderate Activity';
            case 'high-activity': return 'High Activity';
            case 'very-high-activity': return 'Very High Activity';
            default: return 'Select activity level';
        }
    };

    // Helper function to get full activity level description
    const getActivityLevelDescription = (value: string) => {
        switch (value) {
            case 'sedentary': return '1.2 (desk job, no exercise)';
            case 'light-activity': return '1.375 (light exercise 1-3 days/week)';
            case 'moderate-activity': return '1.55 (moderate exercise 3-5 days/week)';
            case 'high-activity': return '1.725 (heavy exercise 6-7 days/week)';
            case 'very-high-activity': return '1.9 (very heavy exercise + physical job)';
            default: return '';
        }
    };

    // Body type to body fat mapping
    const bodyTypeToFat = [5, 10, 15, 20, 25, 30, 35]; // 7 discrete values

    // Helper functions for body fat slider
    const getBodyTypeFromFat = (fatPercentage: number): number => {
        // Find the closest body type based on fat percentage
        let closestType = 1;
        let minDiff = Math.abs(fatPercentage - bodyTypeToFat[0]);

        for (let i = 1; i < bodyTypeToFat.length; i++) {
            const diff = Math.abs(fatPercentage - bodyTypeToFat[i]);
            if (diff < minDiff) {
                minDiff = diff;
                closestType = i + 1;
            }
        }
        return closestType;
    };

    const getFatFromBodyType = (bodyType: number): number => {
        return bodyTypeToFat[bodyType - 1] || 15;
    };



    // Redirect to intro page on first load
    useEffect(() => {
        const hasVisitedIntro = sessionStorage.getItem('hasVisitedIntro');
        if (!hasVisitedIntro) {
            router.push('/intro');
        }
    }, [router]);

    // Local state for input fields (for display purposes)
    const [ageInput, setAgeInput] = useState('');
    const [heightInput, setHeightInput] = useState('');
    const [weightInput, setWeightInput] = useState('');
    const [waistInput, setWaistInput] = useState('');
    const [hipsInput, setHipsInput] = useState('');
    const [neckInput, setNeckInput] = useState('');
    const [shouldersInput, setShouldersInput] = useState('');
    const [bodyFatInput, setBodyFatInput] = useState('');
    const [selectedBodyType, setSelectedBodyType] = useState(() => {
        // Initialize based on current body fat or default to middle type
        return userData.bodyFat ? getBodyTypeFromFat(userData.bodyFat) : 3;
    });

    // Track which fields are being actively edited to prevent formatting interference
    const [activelyEditing, setActivelyEditing] = useState<{ [key: string]: boolean }>({});

    // Update local input fields when userData changes, but only if not actively editing
    useEffect(() => {
        if (!activelyEditing.age) {
            setAgeInput(userData.age > 0 ? userData.age.toString() : '');
        }
        if (!activelyEditing.height) {
            setHeightInput(userData.height > 0 ? userData.height.toString() : '');
        }
        if (!activelyEditing.weight) {
            if (userData.weight > 0) {
                // Convert from kg to display unit with proper rounding
                const displayValue = userData.unitSystem === 'imperial'
                    ? Math.round(userData.weight * 2.20462).toString()
                    : Math.round(userData.weight * 10) / 10; // Round to 1 decimal for metric
                setWeightInput(displayValue.toString());
            } else {
                setWeightInput('');
            }
        }
        if (!activelyEditing.waist) {
            if (userData.measurements?.waist) {
                // Convert from cm to display unit
                const displayValue = userData.unitSystem === 'imperial'
                    ? (userData.measurements.waist / 2.54).toFixed(1)
                    : userData.measurements.waist.toString();
                setWaistInput(displayValue);
            } else {
                setWaistInput('');
            }
        }
        if (!activelyEditing.hips) {
            if (userData.measurements?.hips) {
                // Convert from cm to display unit
                const displayValue = userData.unitSystem === 'imperial'
                    ? (userData.measurements.hips / 2.54).toFixed(1)
                    : userData.measurements.hips.toString();
                setHipsInput(displayValue);
            } else {
                setHipsInput('');
            }
        }
        if (!activelyEditing.neck) {
            if (userData.measurements?.neck) {
                // Convert from cm to display unit
                const displayValue = userData.unitSystem === 'imperial'
                    ? (userData.measurements.neck / 2.54).toFixed(1)
                    : userData.measurements.neck.toString();
                setNeckInput(displayValue);
            } else {
                setNeckInput('');
            }
        }
        if (!activelyEditing.shoulders) {
            if (userData.measurements?.shoulders) {
                // Convert from cm to display unit
                const displayValue = userData.unitSystem === 'imperial'
                    ? (userData.measurements.shoulders / 2.54).toFixed(1)
                    : userData.measurements.shoulders.toString();
                setShouldersInput(displayValue);
            } else {
                setShouldersInput('');
            }
        }
        if (!activelyEditing.bodyFat) {
            setBodyFatInput(userData.bodyFat ? userData.bodyFat.toString() : '');
        }
    }, [userData.age, userData.height, userData.weight, userData.measurements, userData.bodyFat, userData.unitSystem, activelyEditing]);

    // Helper function to constrain values to valid slider ranges
    const constrainToSliderRange = (value: number, min: number, max: number) => {
        return Math.min(Math.max(value, min), max);
    };

    const BodyTypeIcon = ({ type, isSelected, onClick, gender }: { type: number; isSelected: boolean; onClick: () => void; gender: string }) => (
        <div
            className={`relative cursor-pointer transition-all duration-200 ${isSelected ? 'scale-105' : 'hover:scale-102'
                }`}
            onClick={onClick}
        >
            <div className="flex flex-col items-center space-y-1">
                <div
                    className="flex items-end justify-center transition-all duration-200"
                    style={{ width: '45px', height: '80px' }}
                >
                    <img
                        src={`/images/${gender === 'male' ? 'muz' : 'zena'}${type - 1}.svg`}
                        alt={`Body type ${bodyTypes[type - 1].fat}`}
                        className="h-full w-auto object-contain transition-opacity duration-200"
                        style={{ opacity: isSelected ? 1 : 0.35 }}
                    />
                </div>

            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 ">
            <div className="max-w-2xl mx-auto md:p-4">
                <Card className="shadow-lg" style={{ backgroundColor: '#F5F5F5' }}>
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-bold text-gray-800">
                            Health Assessment
                        </CardTitle>
                        <p className="text-gray-600 mt-2">
                            Please fill in your information to get personalized health insights
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Gender Selection */}
                        <Tabs value={userData.gender} onValueChange={(value) => {
                            updateUserData({ gender: value as 'male' | 'female' });
                        }} className="w-full">
                            <TabsList className="grid w-full grid-cols-2" style={{ backgroundColor: '#D9D9D9', borderRadius: '12px' }}>
                                <TabsTrigger
                                    value="female"
                                    className="data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200"
                                    style={{
                                        backgroundColor: userData.gender === 'female' ? '#FFFFFF' : '#D9D9D9',
                                        color: userData.gender === 'female' ? '#31860A' : '#515151',
                                        borderRadius: '12px 0 0 12px',
                                        fontWeight: 'bold',
                                        boxShadow: userData.gender === 'female' ? '0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)' : 'inset 0 2px 4px rgba(0,0,0,0.1)',
                                        transform: userData.gender === 'female' ? 'translateY(-1px)' : 'none',
                                        border: userData.gender === 'female' ? '1px solid #e0e0e0' : 'none'
                                    }}
                                >
                                    Female
                                </TabsTrigger>
                                <TabsTrigger
                                    value="male"
                                    className="data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200"
                                    style={{
                                        backgroundColor: userData.gender === 'male' ? '#FFFFFF' : '#D9D9D9',
                                        color: userData.gender === 'male' ? '#31860A' : '#515151',
                                        borderRadius: '0 12px 12px 0',
                                        fontWeight: 'bold',
                                        boxShadow: userData.gender === 'male' ? '0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)' : 'inset 0 2px 4px rgba(0,0,0,0.1)',
                                        transform: userData.gender === 'male' ? 'translateY(-1px)' : 'none',
                                        border: userData.gender === 'male' ? '1px solid #e0e0e0' : 'none'
                                    }}
                                >
                                    Male
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* Unit System Toggle */}


                        {/* Age */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                                    Age
                                </Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={ageInput}
                                    onFocus={() => setActivelyEditing(prev => ({ ...prev, age: true }))}
                                    onBlur={() => {
                                        setActivelyEditing(prev => ({ ...prev, age: false }));
                                    }}
                                    onChange={(e) => {
                                        setAgeInput(e.target.value);
                                        const numericValue = parseInt(e.target.value);
                                        if (!isNaN(numericValue) && numericValue > 0) {
                                            updateUserData({ age: numericValue });
                                        }
                                    }}
                                    className={`text-center w-20 h-8 font-bold ${fieldErrors.age ? 'border-red-500' : ''}`}
                                    style={{
                                        backgroundColor: fieldErrors.age ? 'rgba(239, 68, 68, 0.1)' : '#F5F5F5',
                                        border: `solid 1px ${fieldErrors.age ? '#EF4444' : '#CFCFCF'}`,
                                        borderRadius: '12px',
                                        fontSize: '14px'
                                    }}
                                    placeholder="25"
                                    min="10"
                                    max="120"
                                />
                            </div>

                            {/* Age Slider */}
                            <div className="relative">
                                <div className="w-full h-2 bg-gray-300 rounded-full">
                                    {/* Filled track */}
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${Math.min(Math.max(((constrainToSliderRange(userData.age, 10, 120) - 10) / (120 - 10)) * 100, 0), 100)}%`,
                                            backgroundColor: '#31860A'
                                        }}
                                    />
                                    <div
                                        className="absolute w-6 h-6 bg-white rounded-full shadow-lg cursor-pointer"
                                        style={{
                                            left: `${Math.min(Math.max(((constrainToSliderRange(userData.age, 10, 120) - 10) / (120 - 10)) * 100, 0), 100)}%`,
                                            top: '-8px',
                                            transform: 'translateX(-50%)',
                                            border: '2px solid #31860A'
                                        }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="120"
                                    value={constrainToSliderRange(userData.age, 10, 120)}
                                    onChange={(e) => {
                                        const ageValue = parseInt(e.target.value);
                                        updateUserData({ age: ageValue });
                                        setAgeInput(ageValue.toString());
                                    }}
                                    className="absolute inset-0 w-full h-6 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Height */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="height" className="text-sm font-medium text-gray-700">
                                    Height
                                </Label>
                                <HeightInput
                                    heightInCm={userData.height}
                                    unitSystem={userData.unitSystem}
                                    onChange={(height) => updateUserData({ height })}
                                    isValid={!fieldErrors.height}
                                    onFocus={() => setActivelyEditing(prev => ({ ...prev, height: true }))}
                                    onBlur={() => setActivelyEditing(prev => ({ ...prev, height: false }))}
                                />
                            </div>
                            <div className="relative">
                                <div className="w-full h-2 bg-gray-300 rounded-full">
                                    {/* Filled track */}
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${Math.min(Math.max(((userData.height - 140) / (220 - 140)) * 100, 0), 100)}%`,
                                            backgroundColor: '#31860A'
                                        }}
                                    />
                                    <div
                                        className="absolute w-6 h-6 bg-white rounded-full shadow-lg cursor-pointer"
                                        style={{
                                            left: `${Math.min(Math.max(((userData.height - 140) / (220 - 140)) * 100, 0), 100)}%`,
                                            top: '-8px',
                                            transform: 'translateX(-50%)',
                                            border: '2px solid #31860A'
                                        }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="140"
                                    max="220"
                                    value={userData.height}
                                    onChange={(e) => updateUserData({ height: parseFloat(e.target.value) })}
                                    className="absolute inset-0 w-full h-6 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Weight */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                                    Weight
                                </Label>
                                <div className="relative inline-block">
                                    <Input
                                        id="weight"
                                        type="number"
                                        value={weightInput}
                                        onFocus={() => setActivelyEditing(prev => ({ ...prev, weight: true }))}
                                        onBlur={() => {
                                            setActivelyEditing(prev => ({ ...prev, weight: false }));
                                        }}
                                        onChange={(e) => {
                                            setWeightInput(e.target.value);
                                            const numericValue = parseFloat(e.target.value);
                                            if (!isNaN(numericValue) && numericValue > 0) {
                                                // Convert to kg if imperial
                                                const weightInKg = userData.unitSystem === 'imperial'
                                                    ? numericValue / 2.20462
                                                    : numericValue;
                                                updateUserData({ weight: weightInKg });
                                            }
                                        }}
                                        className={`w-28 h-8 font-bold ${fieldErrors.weight ? 'border-red-500' : ''}`}
                                        style={{
                                            backgroundColor: fieldErrors.weight ? 'rgba(239, 68, 68, 0.1)' : '#F5F5F5',
                                            border: `solid 1px ${fieldErrors.weight ? '#EF4444' : '#CFCFCF'}`,
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            textAlign: 'center',
                                            paddingRight: '28px',
                                            paddingLeft: '8px'
                                        }}
                                        step="0.1"
                                        min="0"
                                        placeholder={userData.unitSystem === 'metric' ? '70' : '154'}
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
                            </div>
                            <div className="relative">
                                <div className="w-full h-2 bg-gray-300 rounded-full">
                                    {/* Filled track */}
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            width: userData.unitSystem === 'imperial'
                                                ? `${Math.min(Math.max(((userData.weight * 2.20462 - 22) / (500 - 22)) * 100, 0), 100)}%`
                                                : `${Math.min(Math.max(((userData.weight - 10) / (227 - 10)) * 100, 0), 100)}%`,
                                            backgroundColor: '#31860A'
                                        }}
                                    />
                                    <div
                                        className="absolute w-6 h-6 bg-white rounded-full shadow-lg cursor-pointer"
                                        style={{
                                            left: userData.unitSystem === 'imperial'
                                                ? `${Math.min(Math.max(((userData.weight * 2.20462 - 22) / (500 - 22)) * 100, 0), 100)}%`
                                                : `${Math.min(Math.max(((userData.weight - 10) / (227 - 10)) * 100, 0), 100)}%`,
                                            top: '-8px',
                                            transform: 'translateX(-50%)',
                                            border: '2px solid #31860A'
                                        }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min={userData.unitSystem === 'imperial' ? '22' : '10'}
                                    max={userData.unitSystem === 'imperial' ? '500' : '227'}
                                    step={userData.unitSystem === 'imperial' ? '1' : '0.1'}
                                    value={userData.unitSystem === 'imperial'
                                        ? Math.round(Math.min(Math.max(userData.weight * 2.20462, 22), 500))
                                        : Math.min(Math.max(userData.weight, 10), 227)
                                    }
                                    onChange={(e) => {
                                        const sliderValue = parseFloat(e.target.value);
                                        const weightInKg = userData.unitSystem === 'imperial'
                                            ? sliderValue / 2.20462
                                            : sliderValue;
                                        updateUserData({ weight: weightInKg });
                                    }}
                                    className="absolute inset-0 w-full h-6 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Activity Level */}
                        <div className="space-y-3">
                            <Label htmlFor="activity" className="text-sm font-medium text-gray-700">
                                Activity
                            </Label>
                            <Select value={userData.activityLevel} onValueChange={(value) => updateUserData({ activityLevel: value as any })}>
                                <SelectTrigger
                                    className="h-10 text-sm w-full font-bold"
                                    style={{
                                        backgroundColor: '#F5F5F5',
                                        border: 'solid 1px #CFCFCF',
                                        borderRadius: '12px'
                                    }}
                                >
                                    <SelectValue placeholder="Select activity level">
                                        {getActivityLevelDisplayName(userData.activityLevel)}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sedentary">
                                        <div className="flex flex-col py-1">
                                            <span className="font-medium">Sedentary</span>
                                            <span className="text-xs text-gray-500 mt-0.5">1.2 (desk job, no exercise)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="light-activity">
                                        <div className="flex flex-col py-1">
                                            <span className="font-medium">Light Activity</span>
                                            <span className="text-xs text-gray-500 mt-0.5">1.375 (light exercise 1-3 days/week)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="moderate-activity">
                                        <div className="flex flex-col py-1">
                                            <span className="font-medium">Moderate Activity</span>
                                            <span className="text-xs text-gray-500 mt-0.5">1.55 (moderate exercise 3-5 days/week)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="high-activity">
                                        <div className="flex flex-col py-1">
                                            <span className="font-medium">High Activity</span>
                                            <span className="text-xs text-gray-500 mt-0.5">1.725 (heavy exercise 6-7 days/week)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="very-high-activity">
                                        <div className="flex flex-col py-1">
                                            <span className="font-medium">Very High Activity</span>
                                            <span className="text-xs text-gray-500 mt-0.5">1.9 (very heavy exercise + physical job)</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Activity Level Description */}
                        {userData.activityLevel && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">{getActivityLevelDisplayName(userData.activityLevel)}:</span>
                                    <br />
                                    {getActivityLevelDescription(userData.activityLevel)}
                                </p>
                            </div>
                        )}

                        {/* Body Fat */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="body-fat" className="text-sm font-medium text-gray-700">
                                    Body fat
                                    <span className="text-gray-400 ml-1">ⓘ</span>
                                </Label>
                                <div className="relative inline-block">
                                    <Input
                                        id="body-fat"
                                        type="number"
                                        value={bodyFatInput || (userData.bodyFat ? userData.bodyFat.toString() : '')}
                                        onFocus={() => setActivelyEditing(prev => ({ ...prev, bodyFat: true }))}
                                        onBlur={() => {
                                            setActivelyEditing(prev => ({ ...prev, bodyFat: false }));
                                        }}
                                        onChange={(e) => {
                                            setBodyFatInput(e.target.value);
                                            const fatValue = parseFloat(e.target.value);
                                            if (!isNaN(fatValue)) {
                                                updateUserData({ bodyFat: fatValue });
                                                // Update selected body type based on body fat percentage
                                                const newBodyType = getBodyTypeFromFat(fatValue);
                                                setSelectedBodyType(newBodyType);
                                            } else if (e.target.value === '') {
                                                // Allow empty value
                                                updateUserData({ bodyFat: undefined });
                                                setSelectedBodyType(3); // Default to middle type
                                            }
                                        }}
                                        placeholder="Optional"
                                        className={`w-28 h-8 font-bold ${fieldErrors.bodyFat ? 'border-red-500' : ''}`}
                                        style={{
                                            backgroundColor: fieldErrors.bodyFat ? 'rgba(239, 68, 68, 0.1)' : '#F5F5F5',
                                            border: `solid 1px ${fieldErrors.bodyFat ? '#EF4444' : '#CFCFCF'}`,
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            textAlign: 'center',
                                            paddingRight: '24px',
                                            paddingLeft: '8px'
                                        }}
                                        step="0.1"
                                        min="0"
                                        max="50"
                                    />
                                    <span
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium pointer-events-none select-none"
                                        style={{
                                            color: '#9CA3AF',
                                            opacity: 0.7,
                                            zIndex: 10
                                        }}
                                    >
                                        %
                                    </span>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="w-full h-2 bg-gray-300 rounded-full">
                                    {/* Filled track */}
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${Math.min(
                                                Math.max(((userData.bodyFat || 15) - 5) / (45 - 5) * 100, 0),
                                                100
                                            )}%`,
                                            backgroundColor: '#31860A'
                                        }}
                                    />
                                    <div
                                        className="absolute w-6 h-6 bg-white rounded-full shadow-lg cursor-pointer"
                                        style={{
                                            left: `${Math.min(
                                                Math.max(((userData.bodyFat || 15) - 5) / (45 - 5) * 100, 0),
                                                100
                                            )}%`,
                                            top: '-8px',
                                            transform: 'translateX(-50%)',
                                            border: '2px solid #31860A'
                                        }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="45"
                                    step="1"
                                    value={userData.bodyFat || 15}
                                    onChange={(e) => {
                                        const fatValue = parseFloat(e.target.value);
                                        updateUserData({ bodyFat: fatValue });
                                        setBodyFatInput(fatValue.toString());

                                        // Update selected body type based on body fat percentage
                                        const newBodyType = getBodyTypeFromFat(fatValue);
                                        setSelectedBodyType(newBodyType);
                                    }}
                                    className="absolute inset-0 w-full h-6 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Body Type Selector */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end py-2">
                                {bodyTypes.map((type) => (
                                    <BodyTypeIcon
                                        key={type.id}
                                        type={type.id}
                                        isSelected={selectedBodyType === type.id}
                                        onClick={() => {
                                            setSelectedBodyType(type.id);
                                            const newFatValue = getFatFromBodyType(type.id);
                                            updateUserData({ bodyFat: newFatValue });
                                            setBodyFatInput(newFatValue.toString());
                                        }}
                                        gender={userData.gender}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Measures Section */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Label className="text-sm font-medium text-gray-700">Measures</Label>
                                    <Badge variant="outline" className="text-xs">
                                        Optional
                                    </Badge>
                                </div>
                                <Switch
                                    checked={measurementsOptional}
                                    onCheckedChange={setMeasurementsOptional}
                                    style={{
                                        backgroundColor: measurementsOptional ? '#31860A' : '#D1D5DB'
                                    }}
                                />
                            </div>

                            {measurementsOptional && (
                                <div className="space-y-4 pt-2">
                                    <p className="text-sm text-gray-600">
                                        Waist to hip ratio helps determine body type, fat distribution and potential risks.
                                    </p>

                                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                                        <div className="flex flex-col space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Neck circumference
                                            </Label>
                                            <CircumferenceInput
                                                value={neckInput}
                                                onChange={(value) => {
                                                    setNeckInput(value);
                                                    const numericValue = parseFloat(value);
                                                    if (!isNaN(numericValue) && numericValue > 0) {
                                                        // Convert to cm if imperial
                                                        const valueInCm = userData.unitSystem === 'imperial'
                                                            ? numericValue * 2.54
                                                            : numericValue;
                                                        updateUserData({
                                                            measurements: {
                                                                ...userData.measurements,
                                                                neck: valueInCm
                                                            }
                                                        });
                                                    }
                                                }}
                                                placeholder={userData.unitSystem === 'metric' ? '' : ''}
                                                unitSystem={userData.unitSystem}
                                                isValid={!fieldErrors.neck}
                                                onFocus={() => setActivelyEditing(prev => ({ ...prev, neck: true }))}
                                                onBlur={() => {
                                                    setActivelyEditing(prev => ({ ...prev, neck: false }));
                                                }}
                                            />
                                            {fieldErrors.neck && (
                                                <p className="text-red-600 text-xs mt-1">
                                                    {userData.unitSystem === 'metric'
                                                        ? 'Must be between 20-60 cm'
                                                        : 'Must be between 7.9-23.6 inches'}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Waist circumference
                                            </Label>
                                            <CircumferenceInput
                                                value={waistInput}
                                                onChange={(value) => {
                                                    setWaistInput(value);
                                                    const numericValue = parseFloat(value);
                                                    if (!isNaN(numericValue) && numericValue > 0) {
                                                        // Convert to cm if imperial
                                                        const valueInCm = userData.unitSystem === 'imperial'
                                                            ? numericValue * 2.54
                                                            : numericValue;
                                                        updateUserData({
                                                            measurements: {
                                                                ...userData.measurements,
                                                                waist: valueInCm
                                                            }
                                                        });
                                                    }
                                                }}
                                                placeholder={userData.unitSystem === 'metric' ? '' : ''}
                                                unitSystem={userData.unitSystem}
                                                isValid={!fieldErrors.waist}
                                                onFocus={() => setActivelyEditing(prev => ({ ...prev, waist: true }))}
                                                onBlur={() => {
                                                    setActivelyEditing(prev => ({ ...prev, waist: false }));
                                                }}
                                            />
                                            {fieldErrors.waist && (
                                                <p className="text-red-600 text-xs mt-1">
                                                    {userData.unitSystem === 'metric'
                                                        ? 'Must be between 30-200 cm'
                                                        : 'Must be between 11.8-78.7 inches'}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Hips circumference
                                            </Label>
                                            <CircumferenceInput
                                                value={hipsInput}
                                                onChange={(value) => {
                                                    setHipsInput(value);
                                                    const numericValue = parseFloat(value);
                                                    if (!isNaN(numericValue) && numericValue > 0) {
                                                        // Convert to cm if imperial
                                                        const valueInCm = userData.unitSystem === 'imperial'
                                                            ? numericValue * 2.54
                                                            : numericValue;
                                                        updateUserData({
                                                            measurements: {
                                                                ...userData.measurements,
                                                                hips: valueInCm
                                                            }
                                                        });
                                                    }
                                                }}
                                                placeholder={userData.unitSystem === 'metric' ? '' : ''}
                                                unitSystem={userData.unitSystem}
                                                isValid={!fieldErrors.hips}
                                                onFocus={() => setActivelyEditing(prev => ({ ...prev, hips: true }))}
                                                onBlur={() => {
                                                    setActivelyEditing(prev => ({ ...prev, hips: false }));
                                                }}
                                            />
                                            {fieldErrors.hips && (
                                                <p className="text-red-600 text-xs mt-1">
                                                    {userData.unitSystem === 'metric'
                                                        ? 'Must be between 40-220 cm'
                                                        : 'Must be between 15.7-86.6 inches'}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Shoulder circumference
                                            </Label>
                                            <CircumferenceInput
                                                value={shouldersInput}
                                                onChange={(value) => {
                                                    setShouldersInput(value);
                                                    const numericValue = parseFloat(value);
                                                    if (!isNaN(numericValue) && numericValue > 0) {
                                                        // Convert to cm if imperial
                                                        const valueInCm = userData.unitSystem === 'imperial'
                                                            ? numericValue * 2.54
                                                            : numericValue;
                                                        updateUserData({
                                                            measurements: {
                                                                ...userData.measurements,
                                                                shoulders: valueInCm
                                                            }
                                                        });
                                                    }
                                                }}
                                                placeholder={userData.unitSystem === 'metric' ? '' : ''}
                                                unitSystem={userData.unitSystem}
                                                isValid={!fieldErrors.shoulders}
                                                onFocus={() => setActivelyEditing(prev => ({ ...prev, shoulders: true }))}
                                                onBlur={() => {
                                                    setActivelyEditing(prev => ({ ...prev, shoulders: false }));
                                                }}
                                            />
                                            {fieldErrors.shoulders && (
                                                <p className="text-red-600 text-xs mt-1">
                                                    {userData.unitSystem === 'metric'
                                                        ? 'Must be between 30-300 cm'
                                                        : 'Must be between 11.8-118.1 inches'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <h4 className="text-red-800 font-medium text-sm mb-2">Please fix the following errors:</h4>
                                <ul className="text-red-700 text-sm space-y-1">
                                    {validationErrors.map((error, index) => (
                                        <li key={index}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="pt-6 flex justify-between flex-shrink-0 md:border-t md:border-gray-200 md:mt-4 md:pt-4">
                            <Button
                                variant="outline"
                                className="px-8"
                                onClick={() => router.push('/')}
                            >
                                Back
                            </Button>
                            <Button
                                className="px-8 text-white font-medium"
                                style={{ backgroundColor: '#31860A' }}
                                onClick={() => {
                                    if (isDataValid) {
                                        // Force calculation to ensure it's ready
                                        forceCalculation();
                                        // Navigate to results page using Next.js router
                                        router.push('/results');
                                    }
                                }}
                                disabled={!isDataValid || !calculations}
                            >
                                Calculate Results
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}