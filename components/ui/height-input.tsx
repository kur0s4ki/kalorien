'use client';

import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface HeightInputProps {
  heightInCm: number;
  unitSystem: 'metric' | 'imperial';
  onChange: (heightInCm: number) => void;
  isValid?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function HeightInput({ heightInCm, unitSystem, onChange, isValid = true, onFocus, onBlur }: HeightInputProps) {
  const [metricInput, setMetricInput] = useState('');
  const [feetInput, setFeetInput] = useState('');
  const [inchesInput, setInchesInput] = useState('');

  // Update local inputs when heightInCm changes
  useEffect(() => {
    if (unitSystem === 'metric') {
      setMetricInput(heightInCm > 0 ? heightInCm.toFixed(1) : '');
    } else {
      if (heightInCm > 0) {
        const totalInches = heightInCm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        setFeetInput(feet.toString());
        setInchesInput(inches.toString());
      } else {
        setFeetInput('');
        setInchesInput('');
      }
    }
  }, [heightInCm, unitSystem]);

  const handleMetricChange = (value: string) => {
    setMetricInput(value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      onChange(numericValue);
    }
  };

  const handleImperialChange = (feet: string, inches: string) => {
    const feetNum = parseInt(feet) || 0;
    const inchesNum = parseInt(inches) || 0;

    if (feetNum > 0 || inchesNum > 0) {
      const totalInches = feetNum * 12 + inchesNum;
      const heightInCm = totalInches * 2.54;
      onChange(heightInCm);
    }
  };

  if (unitSystem === 'metric') {
    return (
      <div className="relative inline-block">
        <Input
          type="number"
          value={metricInput}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(e) => handleMetricChange(e.target.value)}
          className={`w-28 h-8 font-bold ${!isValid ? 'border-red-500' : ''}`}
          style={{
            backgroundColor: !isValid ? 'rgba(239, 68, 68, 0.1)' : '#F5F5F5',
            border: `solid 1px ${!isValid ? '#EF4444' : '#CFCFCF'}`,
            borderRadius: '12px',
            fontSize: '14px',
            textAlign: 'center',
            paddingRight: '28px',
            paddingLeft: '8px'
          }}
          step="0.1"
          min="0"
          placeholder="170"
        />
        <span
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium pointer-events-none select-none"
          style={{
            color: '#9CA3AF',
            opacity: 0.7,
            zIndex: 10
          }}
        >
          cm
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Input
          type="number"
          value={feetInput}
          onChange={(e) => {
            setFeetInput(e.target.value);
            handleImperialChange(e.target.value, inchesInput);
          }}
          className={`text-center w-16 h-8 font-bold pr-6 ${!isValid ? 'border-red-500' : ''}`}
          style={{
            backgroundColor: !isValid ? 'rgba(239, 68, 68, 0.1)' : '#F5F5F5',
            border: `solid 1px ${!isValid ? '#EF4444' : '#CFCFCF'}`,
            borderRadius: '12px',
            fontSize: '14px'
          }}
          placeholder="5"
          min="3"
          max="8"
        />
        <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs font-bold pointer-events-none">
          ft
        </span>
      </div>
      <div className="relative">
        <Input
          type="number"
          value={inchesInput}
          onChange={(e) => {
            setInchesInput(e.target.value);
            handleImperialChange(feetInput, e.target.value);
          }}
          className={`text-center w-16 h-8 font-bold pr-6 ${!isValid ? 'border-red-500' : ''}`}
          style={{
            backgroundColor: !isValid ? 'rgba(239, 68, 68, 0.1)' : '#F5F5F5',
            border: `solid 1px ${!isValid ? '#EF4444' : '#CFCFCF'}`,
            borderRadius: '12px',
            fontSize: '14px'
          }}
          placeholder="10"
          min="0"
          max="11"
        />
        <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs font-bold pointer-events-none">
          in
        </span>
      </div>
    </div>
  );
}
