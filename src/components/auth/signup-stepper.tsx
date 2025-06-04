
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Locale } from '@/i18n-config';
import { StepInformation } from './steps/step-information';
import { StepTerms } from './steps/step-terms';
import { StepUserInfo } from './steps/step-user-info';
import { StepVerification } from './steps/step-verification';
import { StepRoleSelection } from './steps/step-role-selection';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { parse as parseGregorianOriginal } from 'date-fns';

const TOTAL_STEPS = 5;

export interface YouthConnectionPermission {
  id: string; // e.g., 'basicInformation', 'dailyQuizResults'
  label: string; // Localized label
  value: boolean;
}
export interface YouthConnection {
  id: string; // Unique ID for the connection, e.g., timestamp or uuid
  contact: string; // Email or phone
  permissions: {
    basicInformation: boolean;
    dailyQuizResults: boolean;
    biometricReports: boolean;
    testResults: boolean;
    syncedInformation: boolean;
  };
}

export interface SignupFormData {
  acceptedMandatoryTerms?: boolean;
  acceptedOptionalCommunications?: boolean;
  acceptedOptionalMarketing?: boolean;
  emailOrPhone?: string;
  password?: string;
  name?: string;
  dob?: string;
  verificationCode?: string;
  isYouth?: boolean | null;
  adultRolesSelected?: {
    parent?: boolean;
    therapist?: boolean;
    school_consultant?: boolean;
    supervisor?: boolean;
  };
  clinicCode?: string;
  schoolCode?: string;
  // Deprecating these in favor of youthConnections
  connectedParentEmails?: string[];
  connectedTherapistEmails?: string[];
  connectedSchoolConsultantEmails?: string[];
  connectedSupervisorEmails?: string[];
  // New structure for youth connections
  youthConnections?: YouthConnection[];
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
  const auth = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(initialStep < 1 || initialStep > TOTAL_STEPS ? 1 : initialStep);
  const [formData, setFormData] = useState<SignupFormData>({
    isYouth: null,
    adultRolesSelected: {},
    connectedParentEmails: [], // Keep for potential data migration, but new UI won't use
    connectedTherapistEmails: [],
    connectedSchoolConsultantEmails: [],
    connectedSupervisorEmails: [],
    youthConnections: [], // Initialize new field
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [direction, setDirection] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);

  const calculateAge = useCallback((dobString?: string): number | null => {
    if (!dobString) return null;
    try {
      // Assuming dobString is 'yyyy-MM-dd' from StepUserInfo
      const birthDate = parseGregorianOriginal(dobString, 'yyyy-MM-dd', new Date());
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
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem('signupFormData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (!parsedData.adultRolesSelected) {
        parsedData.adultRolesSelected = {};
      }
      // Ensure new youthConnections field is initialized if not present
      parsedData.youthConnections = parsedData.youthConnections || [];
      // Ensure old email arrays are initialized if not present in stored data
      parsedData.connectedParentEmails = parsedData.connectedParentEmails || [];
      parsedData.connectedTherapistEmails = parsedData.connectedTherapistEmails || [];
      parsedData.connectedSchoolConsultantEmails = parsedData.connectedSchoolConsultantEmails || [];
      parsedData.connectedSupervisorEmails = parsedData.connectedSupervisorEmails || [];
      setFormData(parsedData);
    }
    const stepFromQuery = searchParams.get('step');
    const validatedInitialStep = stepFromQuery ? parseInt(stepFromQuery, 10) : 1;
    const saneInitialStep = Math.max(1, Math.min(validatedInitialStep, TOTAL_STEPS));
    setCurrentStep(saneInitialStep);
    setIsLoaded(true);
  }, [searchParams]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('signupFormData', JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  const updateUrl = useCallback((step: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('step', step.toString());
    router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

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
      // Validation for step 5 is now managed by StepRoleSelection,
      // and for youth path, it's generally optional to add connections.
      // The step itself is valid to proceed by default.
       if (formData.isYouth) {
        setIsStepValid(true); // Youth can proceed without adding connections
      } else {
        // Adult validation is handled by StepRoleSelection via onValidation
      }
    }
  }, [currentStep, formData, isLoaded]);


  const handleNext = useCallback(async () => {
    if (!isStepValid) {
      if (currentStep === 2 && !formData.acceptedMandatoryTerms) {
         toast({ title: dictionary.errorMandatoryTerms, variant: "destructive" });
      }
      // Other specific error toasts for other steps could be added here if needed
      return;
    }

    let nextStepNumber = currentStep + 1;
    let newFormData = { ...formData };

    if (currentStep === 4) { // After verification, before role selection
      const age = calculateAge(formData.dob);
      const isUserYouth = age !== null && age < 18;
      newFormData = { ...newFormData, isYouth: isUserYouth };
      setFormData(newFormData); // Set formData with isYouth status before going to step 5
    }

    setDirection(1);
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(nextStepNumber);
      updateUrl(nextStepNumber);
      setIsStepValid(false); // Reset step validity for the new step
    } else {
      // Finalize registration
      console.log('Finalizing registration:', newFormData);
      toast({ title: dictionary.registrationCompleteTitle, description: dictionary.registrationCompleteMessage });
      localStorage.removeItem('signupFormData'); // Clear form data on completion
      auth.signup({ name: newFormData.name, emailOrPhone: newFormData.emailOrPhone }, lang);
    }
  }, [currentStep, formData, dictionary, lang, isStepValid, toast, auth, updateUrl, calculateAge, TOTAL_STEPS]);

  const handlePrevious = () => {
    setDirection(-1);
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateUrl(prevStep);
      setIsStepValid(true); // Generally, previous steps are assumed to be valid if reached
    }
  };

  const updateFormDataAndValidate = useCallback((data: Partial<SignupFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Re-validation will be triggered by the useEffect watching formData and currentStep
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
            {currentStep === 5 && (
              <StepRoleSelection
                dictionary={dictionary.stepRoleSelection}
                formData={formData}
                updateFormData={updateFormDataAndValidate}
                onValidation={handleStepValidation} // onValidation will be set to true for youth path by default in StepRoleSelection
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
