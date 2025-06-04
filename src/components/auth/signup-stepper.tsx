
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Locale } from '@/i18n-config';
import { StepInformation } from './steps/step-information';
import { StepTerms } from './steps/step-terms';
import { StepUserInfo } from './steps/step-user-info';
import { StepVerification } from './steps/step-verification';
import { StepAgeInfo } from './steps/step-age-info';
import { StepRoleSelection } from './steps/step-role-selection';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "@/components/ui/progress";

const TOTAL_STEPS = 6; // Increased from 4 to 6

export interface SignupFormData {
  acceptedMandatoryTerms?: boolean;
  acceptedOptionalCommunications?: boolean;
  acceptedOptionalMarketing?: boolean;
  emailOrPhone?: string;
  password?: string;
  name?: string;
  dob?: string; // Store as ISO string 'YYYY-MM-DD'
  verificationCode?: string;
  isYouth?: boolean | null; // New: null initially, then true or false
  selectedRole?: string; // New: 'parent', 'therapist', 'school_consultant', 'supervisor', 'youth_self'
  clinicCode?: string; // New for therapist
  schoolName?: string; // New for school consultant
  // For Youth connections - simplified for now to one email per category
  connectedParentEmail?: string;
  connectedTherapistEmail?: string;
  connectedSchoolConsultantEmail?: string;
  connectedSupervisorEmail?: string;
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
  const [formData, setFormData] = useState<SignupFormData>({isYouth: null}); // Initialize isYouth
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
  
  const calculateAge = (dobString?: string): number | null => {
    if (!dobString) return null;
    try {
      const birthDate = new Date(dobString);
      if (isNaN(birthDate.getTime())) return null;

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (currentStep === 1) {
      setIsStepValid(true); 
    } else if (currentStep === 2) {
      setIsStepValid(!!formData.acceptedMandatoryTerms);
    } else if (currentStep === 3) {
      // Validation handled by StepUserInfo via onValidation
    } else if (currentStep === 4) {
      setIsStepValid(!!formData.verificationCode && formData.verificationCode.length === 5);
    } else if (currentStep === 5) {
      // Step 5 (Age Info) is informational, always valid to proceed.
      // Age calculation and setting formData.isYouth happens here or on proceed.
      setIsStepValid(true); 
    } else if (currentStep === 6) {
      // Validation handled by StepRoleSelection via onValidation
    }
  }, [currentStep, formData, isLoaded]);


  const handleNext = useCallback(async () => {
    if (!isStepValid) {
      if (currentStep === 2 && !formData.acceptedMandatoryTerms) {
         alert(dictionary.errorMandatoryTerms);
      }
      return;
    }

    if (currentStep === 5) { // Before proceeding from Step 5
      const age = calculateAge(formData.dob);
      const isUserYouth = age !== null && age < 18;
      updateFormDataAndValidate({ isYouth: isUserYouth });
    }


    setDirection(1);
    if (currentStep < TOTAL_STEPS) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateUrl(nextStep);
      setIsStepValid(false); 
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
      
      <div className="flex-grow overflow-hidden flex flex-col"> {/* Ensure this div takes up space */}
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
            className="w-full flex-1 overflow-y-auto p-1 sm:p-2 md:p-4" // flex-1 will allow it to grow
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
            {currentStep === 5 && (
              <StepAgeInfo
                dictionary={dictionary.stepAgeInfo}
                formData={formData}
                updateFormData={updateFormDataAndValidate}
                onValidation={handleStepValidation} // Step 5 might always be valid
                lang={lang}
              />
            )}
            {currentStep === 6 && (
              <StepRoleSelection
                dictionary={dictionary.stepRoleSelection}
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
