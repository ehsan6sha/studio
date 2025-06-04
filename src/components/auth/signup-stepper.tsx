
'use client';

import { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Locale } from '@/i18n-config';
import { StepInformation } from './steps/step-information';
import { StepTerms } from './steps/step-terms';
import { StepUserInfo } from './steps/step-user-info';
import { StepVerification } from './steps/step-verification';
import { StepRoleSelection } from './steps/step-role-selection';
import { StepSharingPreferences } from './steps/step-sharing-preferences';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { parse as parseGregorianOriginal } from 'date-fns';
import confetti from 'canvas-confetti'; // Added confetti import

const BASE_TOTAL_STEPS_YOUTH = 5;
const BASE_TOTAL_STEPS_ADULT = 6;

export interface YouthConnectionPermission {
  id: string; 
  label: string; 
  value: boolean;
}
export interface YouthConnection {
  id: string; 
  contact: string; 
  permissions: {
    basicInformation: boolean;
    dailyQuizResults: boolean;
    biometricReports: boolean;
    testResults: boolean;
    syncedInformation: boolean;
    othersNotes: boolean;
  };
}

export interface SignupFormData {
  acceptedMandatoryTerms?: boolean;
  acceptedOptionalCommunications?: boolean;
  acceptedOptionalMarketing?: boolean;
  emailOrPhone?: string;
  password?: string;
  name?: string;
  dob?: string; // Stored as 'yyyy-MM-dd'
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
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>({
    isYouth: null,
    adultRolesSelected: {},
    youthConnections: [],
    // Initialize other fields to prevent undefined issues if localStorage is empty or old
    acceptedMandatoryTerms: false,
    acceptedOptionalCommunications: false,
    acceptedOptionalMarketing: false,
    emailOrPhone: '',
    password: '',
    name: '',
    dob: undefined,
    verificationCode: '',
    clinicCode: '',
    schoolCode: '',
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [direction, setDirection] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
  const finishButtonRef = useRef<HTMLButtonElement>(null); // Ref for the finish button

  const calculateAge = useCallback((dobString?: string): number | null => {
    if (!dobString) return null;
    try {
      // dobString is expected to be 'yyyy-MM-dd' from formData
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
  
  const getCurrentTotalSteps = useCallback(() => {
    if (formData.isYouth === true) return BASE_TOTAL_STEPS_YOUTH;
    if (formData.isYouth === false) return BASE_TOTAL_STEPS_ADULT;
    return BASE_TOTAL_STEPS_ADULT; // Default to max if isYouth is undetermined
  }, [formData.isYouth]);


  useEffect(() => {
    const storedData = localStorage.getItem('signupFormData');
    let effectiveFormData = { // Start with a default, complete structure
      isYouth: null,
      adultRolesSelected: {},
      youthConnections: [],
      acceptedMandatoryTerms: false,
      acceptedOptionalCommunications: false,
      acceptedOptionalMarketing: false,
      emailOrPhone: '',
      password: '',
      name: '',
      dob: undefined,
      verificationCode: '',
      clinicCode: '',
      schoolCode: '',
    };

    if (storedData) {
      const parsedData = JSON.parse(storedData);
      effectiveFormData = {
        ...effectiveFormData, // Ensure all keys are present
        ...parsedData,        // Override with parsed data
        adultRolesSelected: parsedData.adultRolesSelected || {},
        youthConnections: parsedData.youthConnections || [],
      };
    }
    setFormData(effectiveFormData);

    const stepFromQuery = searchParams.get('step');
    const validatedInitialStep = stepFromQuery ? parseInt(stepFromQuery, 10) : initialStep;
    
    let currentTotalStepsCalc;
    if (effectiveFormData.isYouth === true) currentTotalStepsCalc = BASE_TOTAL_STEPS_YOUTH;
    else if (effectiveFormData.isYouth === false) currentTotalStepsCalc = BASE_TOTAL_STEPS_ADULT;
    else currentTotalStepsCalc = BASE_TOTAL_STEPS_ADULT;

    const saneInitialStep = Math.max(1, Math.min(validatedInitialStep, currentTotalStepsCalc));
    
    setCurrentStep(saneInitialStep);
    setIsLoaded(true);
  }, [searchParams, initialStep]);


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

  const handleStepValidation = useCallback((isValid: boolean) => {
    setIsStepValid(isValid);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (currentStep === 1) { // StepInformation doesn't call onValidation
      setIsStepValid(true);
    }
    // For Step 2 (Terms), StepUserInfo (3), StepVerification (4),
    // StepRoleSelection (5 Adult), StepSharingPreferences (5 Youth / 6 Adult),
    // `isStepValid` is set by `handleStepValidation` which is called by child components.
    // `setIsStepValid(false)` is called in `handleNext` and `handlePrevious` to reset
    // validity when navigating, allowing the new step's component to assert its validity.
  }, [currentStep, isLoaded]);


  const handleNext = useCallback(async () => {
    if (!isStepValid) {
      if (currentStep === 2 && !formData.acceptedMandatoryTerms) {
         toast({ title: dictionary.errorMandatoryTerms, variant: "destructive" });
      }
      return;
    }

    let nextStepNumber = currentStep + 1;
    let newFormData = { ...formData }; // Use a mutable copy for this scope
    const age = calculateAge(formData.dob); // Calculate age based on current formData.dob

    if (currentStep === 4) { // After Verification, determine if user is youth
      const isUserYouth = age !== null && age < 18;
      newFormData = { ...newFormData, isYouth: isUserYouth };
      setFormData(newFormData); // Update the main formData state
      // Next step is 5 for both youth (sharing) and adults (role selection)
    }
    
    setDirection(1);
    const actualTotalSteps = getCurrentTotalSteps(); // Get total steps based on potentially updated formData

    if (currentStep < actualTotalSteps) {
      setCurrentStep(nextStepNumber);
      updateUrl(nextStepNumber);
      setIsStepValid(false); 
    } else { // currentStep === actualTotalSteps (finish registration)
      console.log('Finalizing registration:', newFormData); // Use newFormData which has the latest isYouth status

      if (finishButtonRef.current) {
        const rect = finishButtonRef.current.getBoundingClientRect();
        confetti({
          particleCount: 150,
          spread: 100,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          },
          angle: 315, // Shoots upwards and to the right (45 deg from vertical up)
          startVelocity: 45, 
          gravity: 0.9,      
          drift: Math.random() * 0.2 - 0.1, 
          ticks: 300, 
        });
      }

      toast({ title: dictionary.registrationCompleteTitle, description: dictionary.registrationCompleteMessage });
      localStorage.removeItem('signupFormData'); 
      auth.signup({ name: newFormData.name, emailOrPhone: newFormData.emailOrPhone }, lang);
    }
  }, [currentStep, formData, dictionary, lang, isStepValid, toast, auth, updateUrl, calculateAge, getCurrentTotalSteps]);

  const handlePrevious = () => {
    setDirection(-1);
    if (currentStep > 1) {
      let prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateUrl(prevStep);
      setIsStepValid(true); // Assume previous step was valid; new step will re-validate if needed
    }
  };

  const updateFormDataAndValidate = useCallback((data: Partial<SignupFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Validation for the current step will be triggered by child component's onValidation or the stepper's own useEffect
  }, []);


  const actualTotalSteps = getCurrentTotalSteps();
  const progressValue = (currentStep / actualTotalSteps) * 100;

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

  if (!isLoaded || (formData.isYouth === null && currentStep > 4 && currentStep <= actualTotalSteps)) {
     // Show loading if isYouth is not determined yet and we are past step 4 but not beyond total steps.
    return <div className="flex-grow flex items-center justify-center">{dictionary.loading || "Loading..."}</div>;
  }

  const isNextButtonDisabled = !isStepValid;

  let currentStepComponent = null;
  if (currentStep === 1) {
    currentStepComponent = <StepInformation dictionary={dictionary.stepInformation} />;
  } else if (currentStep === 2) {
    currentStepComponent = <StepTerms
        dictionary={dictionary.stepTerms}
        formData={formData}
        updateFormData={updateFormDataAndValidate}
        onValidation={handleStepValidation}
        lang={lang}
        termsDictionary={termsDictionary}
        appTermsContent={appTermsContent}
        dataProcessingConsentContent={dataProcessingConsentContent}
        marketingConsentContent={marketingConsentContent}
      />;
  } else if (currentStep === 3) {
    currentStepComponent = <StepUserInfo
        dictionary={dictionary.stepUserInfo}
        formData={formData}
        updateFormData={updateFormDataAndValidate}
        onValidation={handleStepValidation}
        lang={lang}
      />;
  } else if (currentStep === 4) {
    currentStepComponent = <StepVerification
        dictionary={dictionary.stepVerification}
        formData={formData}
        updateFormData={updateFormDataAndValidate}
        onValidation={handleStepValidation}
        lang={lang}
      />;
  } else if (currentStep === 5) {
    if (formData.isYouth === true) { 
      currentStepComponent = <StepSharingPreferences
        dictionary={dictionary.stepSharingPreferences}
        formData={formData}
        updateFormData={updateFormDataAndValidate}
        onValidation={handleStepValidation} 
        lang={lang}
       />;
    } else if (formData.isYouth === false) { 
      currentStepComponent = <StepRoleSelection
        dictionary={dictionary.stepRoleSelection}
        formData={formData}
        updateFormData={updateFormDataAndValidate}
        onValidation={handleStepValidation}
        lang={lang}
      />;
    } else {
      // Fallback if isYouth is null at step 5 (should be caught by loading state earlier)
      currentStepComponent = <div className="flex-grow flex items-center justify-center">{dictionary.loadingRoleInfo || "Determining your pathway..."}</div>;
    }
  } else if (currentStep === 6) { 
    if (formData.isYouth === false) { // Only adults reach step 6 for sharing
      currentStepComponent = <StepSharingPreferences
        dictionary={dictionary.stepSharingPreferences}
        formData={formData}
        updateFormData={updateFormDataAndValidate}
        onValidation={handleStepValidation} 
        lang={lang}
      />;
    } else {
      // Youth should not reach step 6. Redirect or show error?
      // This case implies an issue with step logic if reached by youth.
      // For now, effectively treat as end for youth.
       console.error("Youth user reached step 6, which should not happen.");
       // Potentially redirect or show a generic "completed" view if this state is somehow reached.
    }
  }


  return (
    <div className="w-full max-w-xl mx-auto flex flex-col flex-grow" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <Progress value={progressValue} className="w-full mb-4 md:mb-6" />

      <div className="flex-grow overflow-hidden flex flex-col">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={`${currentStep}-${formData.isYouth}`} // Key change helps reset animation state if isYouth changes step 5 component
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
            {currentStepComponent}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-4 md:pt-6 flex justify-between items-center border-t">
        <Button onClick={handlePrevious} disabled={currentStep === 1} variant="outline">
          {dictionary.previousButton || 'Previous'}
        </Button>
        <div className="text-sm text-muted-foreground">
          {lang === 'fa' ? `مرحله ${currentStep} از ${actualTotalSteps}` : `Step ${currentStep} of ${actualTotalSteps}`}
        </div>
        <Button 
          onClick={handleNext} 
          disabled={isNextButtonDisabled}
          ref={currentStep === actualTotalSteps ? finishButtonRef : null} 
        >
          {currentStep === actualTotalSteps ? (dictionary.finishButton || 'Finish') : (dictionary.nextButton || 'Save & Next')}
        </Button>
      </div>
    </div>
  );
}
