
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Locale } from '@/i18n-config';
import { StepInformation } from './steps/step-information';
import { StepTerms } from './steps/step-terms';
import { StepUserInfo } from './steps/step-user-info';
import { StepVerification } from './steps/step-verification';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "@/components/ui/progress";

const TOTAL_STEPS = 4;

export interface SignupFormData {
  acceptedMandatoryTerms?: boolean;
  acceptedOptionalCommunications?: boolean;
  acceptedOptionalMarketing?: boolean;
  emailOrPhone?: string;
  password?: string;
  name?: string;
  dob?: string; // Store as ISO string 'YYYY-MM-DD'
  verificationCode?: string;
}

interface SignupStepperProps {
  lang: Locale;
  dictionary: any; 
  initialStep: number;
  termsDictionary: any; 
  appTermsContent: any;
  dataProcessingConsentContent: any;
  marketingConsentContent: any;
}

export function SignupStepper({
  lang,
  dictionary,
  initialStep,
  termsDictionary,
  appTermsContent,
  dataProcessingConsentContent,
  marketingConsentContent,
}: SignupStepperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(initialStep < 1 || initialStep > TOTAL_STEPS ? 1 : initialStep);
  const [formData, setFormData] = useState<SignupFormData>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [direction, setDirection] = useState(1); 
  const [isStepValid, setIsStepValid] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('signupFormData');
    if (storedData) {
      setFormData(JSON.parse(storedData));
    }
    const stepFromQuery = searchParams.get('step');
    const validatedInitialStep = stepFromQuery ? parseInt(stepFromQuery, 10) : 1;
    const saneInitialStep = Math.max(1, Math.min(validatedInitialStep, TOTAL_STEPS));
    setCurrentStep(saneInitialStep);
    setIsLoaded(true);
    // Set initial validation state based on current step and loaded data
    // This is tricky because validation depends on the step's content
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('signupFormData', JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  const updateUrl = (step: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('step', step.toString());
    router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
  };
  
  // Effect to set initial validation state when step or formData changes
  useEffect(() => {
    if (!isLoaded) return;

    if (currentStep === 1) {
      setIsStepValid(true); // Step 1 is always valid
    } else if (currentStep === 2) {
      setIsStepValid(!!formData.acceptedMandatoryTerms);
    } else if (currentStep === 3) {
      // For Step 3 (UserInfo), validation is handled by its internal form
      // The StepUserInfo component calls onValidation prop
      // For now, let's assume it's invalid until its internal form says otherwise
      // This will be updated by the StepUserInfo component via onValidation
    } else if (currentStep === 4) {
      // For Step 4 (Verification)
      setIsStepValid(!!formData.verificationCode && formData.verificationCode.length === 5);
    }
  }, [currentStep, formData, isLoaded]);


  const handleNext = useCallback(async () => {
    if (!isStepValid) {
      if (currentStep === 2 && !formData.acceptedMandatoryTerms) {
         alert(dictionary.errorMandatoryTerms);
      }
      // Potentially show other alerts or rely on form field errors for step 3
      return;
    }

    setDirection(1);
    if (currentStep < TOTAL_STEPS) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateUrl(nextStep);
      setIsStepValid(false); // Reset validation state for the new step
    } else {
      console.log('Finalizing registration:', formData);
      // toast({ title: dictionary.registrationCompleteTitle, description: dictionary.registrationCompleteMessage });
      localStorage.removeItem('signupFormData');
      router.push(`/${lang}/dashboard`); 
    }
  }, [currentStep, formData, dictionary, lang, router, pathname, isStepValid]);

  const handlePrevious = () => {
    setDirection(-1);
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateUrl(prevStep);
      // When going back, the previous step should generally be considered valid
      // if it was completed, or re-validate based on its criteria.
      // For simplicity, let's set to true, can be refined.
      setIsStepValid(true); 
    }
  };

  const updateFormDataAndValidate = useCallback((data: Partial<SignupFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleStepValidation = useCallback((isValid: boolean) => {
    setIsStepValid(isValid);
  }, []);


  const progressValue = (currentStep / TOTAL_STEPS) * 100;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? (lang === 'fa' ? -300 : 300) : (lang === 'fa' ? 300 : -300),
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? (lang === 'fa' ? -300 : 300) : (lang === 'fa' ? 300 : -300),
      opacity: 0,
    }),
  };

  if (!isLoaded) {
    return <div className="flex-grow flex items-center justify-center">{dictionary.loading || "Loading..."}</div>;
  }
  
  const isNextButtonDisabled = !isStepValid;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col flex-grow" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <Progress value={progressValue} className="w-full mb-4 md:mb-6" />
      
      <div className="flex-grow overflow-hidden flex flex-col">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full flex-1 overflow-y-auto p-1 sm:p-2 md:p-4" 
          >
            {currentStep === 1 && (
              <StepInformation dictionary={dictionary.stepInformation} />
            )}
            {currentStep === 2 && (
              <StepTerms
                dictionary={dictionary.stepTerms}
                formData={formData}
                updateFormData={updateFormDataAndValidate}
                onValidation={handleStepValidation}
                lang={lang}
                termsDictionary={termsDictionary}
                appTermsContent={appTermsContent}
                dataProcessingConsentContent={dataProcessingConsentContent}
                marketingConsentContent={marketingConsentContent}
              />
            )}
             {currentStep === 3 && (
                <StepUserInfo
                    dictionary={dictionary.stepUserInfo}
                    formData={formData}
                    updateFormData={updateFormDataAndValidate}
                    onValidation={handleStepValidation}
                    lang={lang}
                />
            )}
             {currentStep === 4 && (
                <StepVerification
                    dictionary={dictionary.stepVerification}
                    formData={formData}
                    updateFormData={updateFormDataAndValidate}
                    onValidation={handleStepValidation}
                    lang={lang}
                />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-4 md:pt-6 flex justify-between items-center border-t">
        <Button onClick={handlePrevious} disabled={currentStep === 1} variant="outline">
          {dictionary.previousButton || 'Previous'}
        </Button>
        <div className="text-sm text-muted-foreground">
          {lang === 'fa' ? `مرحله ${currentStep} از ${TOTAL_STEPS}` : `Step ${currentStep} of ${TOTAL_STEPS}`}
        </div>
        <Button onClick={handleNext} disabled={isNextButtonDisabled}>
          {currentStep === TOTAL_STEPS ? (dictionary.finishButton || 'Finish') : (dictionary.nextButton || 'Save & Next')}
        </Button>
      </div>
    </div>
  );
}
