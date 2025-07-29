'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Mail, User, CheckCircle } from 'lucide-react';

interface ContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string }) => void;
}

export function ContactPopup({ isOpen, onClose, onSubmit }: ContactPopupProps) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '' });

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = { name: '', email: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      setIsSubmitted(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setFormData({ name: '', email: '' });
      }, 3000);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-xl" style={{ backgroundColor: '#F5F5F5' }}>
        <CardHeader className="text-center pb-4 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          {!isSubmitted ? (
            <>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                Get Your Results
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Enter your details to receive your personalized health report via email
              </p>
            </>
          ) : (
            <>
              <CardTitle className="text-xl font-bold text-green-700 flex items-center justify-center gap-2">
                <CheckCircle className="h-6 w-6" />
                Email On Its Way!
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Your personalized health report will be sent to {formData.email}
              </p>
            </>
          )}
        </CardHeader>

        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: errors.name ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: errors.email ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 text-white rounded-lg font-medium transition-colors duration-200 hover:opacity-95"
                  style={{ backgroundColor: '#31860A' }}
                >
                  Send Results
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="text-green-600 mb-4">
                <CheckCircle className="h-16 w-16 mx-auto" />
              </div>
              <p className="text-gray-600 text-sm">
                Redirecting you back to the start...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
