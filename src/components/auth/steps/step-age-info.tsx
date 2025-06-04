
'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SignupFormData } from '../signup-stepper';
import type { Locale } from '@/i18n-config';

interface StepAgeInfoProps {
  dictionary: {
    title: string;
    description: string;
    mainContent: string;
  };
  formData: SignupFormData; // To potentially access DOB if needed for pre-calculation display
  updateFormData: (data: Partial<SignupFormData>) => void;
  onValidation: (isValid: boolean) => void;
  lang: Locale;
}

export function StepAgeInfo({ dictionary, onValidation }: StepAgeInfoProps) {
  useEffect(() => {
    // This step is purely informational before proceeding.
    // The actual age calculation and setting of `isYouth` will happen in SignupStepper `handleNext`
    // or at the beginning of the next step (RoleSelection).
    onValidation(true); // This step doesn't have input fields to validate
  }, [onValidation]);

  return (
    <div className="h-full flex flex-col">
      <Card className="w-full shadow-none border-none flex-grow flex flex-col">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{dictionary.title}</CardTitle>
          {dictionary.description && <CardDescription>{dictionary.description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-center text-foreground/80 leading-relaxed">
            {dictionary.mainContent}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
