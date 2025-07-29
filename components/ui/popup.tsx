'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Popup({ isOpen, onClose, title, children }: PopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Popup Content */}
      <div className="relative w-full max-w-md mx-4 md:mx-auto">
        <div 
          className="bg-white rounded-lg shadow-lg p-6 max-h-[80vh] overflow-y-auto"
          style={{ backgroundColor: '#F5F5F5' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              style={{ color: '#31860A' }}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div className="text-gray-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
