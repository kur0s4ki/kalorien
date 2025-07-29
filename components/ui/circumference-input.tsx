'use client';

import { Input } from '@/components/ui/input';
import { getLengthUnit } from '@/lib/units';

interface CircumferenceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  unitSystem: 'metric' | 'imperial';
  isValid?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function CircumferenceInput({
  value,
  onChange,
  placeholder,
  unitSystem,
  isValid = true,
  onFocus,
  onBlur
}: CircumferenceInputProps) {
  const unit = getLengthUnit(unitSystem);

  return (
    <div className="relative w-full">
      <Input
        type="number"
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-8 font-bold ${!isValid ? 'border-red-500' : ''}`}
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
      />
      <span
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium pointer-events-none select-none"
        style={{
          color: '#9CA3AF',
          opacity: 0.7,
          zIndex: 10
        }}
      >
        {unit}
      </span>
    </div>
  );
}
