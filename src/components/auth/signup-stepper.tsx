
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
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [direction, setDirection] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
  const finishButtonRef = useRef<HTMLButtonElement>(null); // Ref for the finish button

  const calculateAge = useCallback((dobString?: string): number | null => {
    if (!dobString) return null;
    try {
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
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (!parsedData.adultRolesSelected) parsedData.adultRolesSelected = {};
      parsedData.youthConnections = parsedData.youthConnections || [];
      setFormData(parsedData);
    }
    
    const stepFromQuery = searchParams.get('step');
    const validatedInitialStep = stepFromQuery ? parseInt(stepFromQuery, 10) : initialStep;
    const saneInitialStep = Math.max(1, Math.min(validatedInitialStep, getCurrentTotalSteps()));
    setCurrentStep(saneInitialStep);
    setIsLoaded(true);
  }, [searchParams, initialStep, getCurrentTotalSteps]);


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
    const totalStepsForValidation = getCurrentTotalSteps();

    if (currentStep === 1) setIsStepValid(true); // Information
    else if (currentStep === 2) setIsStepValid(!!formData.acceptedMandatoryTerms); // Terms
    else if (currentStep === 3) {} // User Info (validation via onValidation prop passed to child)
    else if (currentStep === 4) setIsStepValid(!!formData.verificationCode && formData.verificationCode.length === 5); // Verification
    else if (currentStep === 5) { // Role Selection (Adult) OR Sharing (Youth)
      if (formData.isYouth === true) setIsStepValid(true); // Sharing is optional for youth
      // For adults, StepRoleSelection will call its onValidation prop (which is handleStepValidation here)
    } else if (currentStep === 6) { // Sharing (Adult)
      setIsStepValid(true); // Sharing is optional for adults
    }
    else if (currentStep > totalStepsForValidation) setIsStepValid(false);

  }, [currentStep, formData, isLoaded, getCurrentTotalSteps]);


  const handleNext = useCallback(async () => {
    if (!isStepValid) {
      if (currentStep === 2 && !formData.acceptedMandatoryTerms) {
         toast({ title: dictionary.errorMandatoryTerms, variant: "destructive" });
      }
      return;
    }

    let nextStepNumber = currentStep + 1;
    let newFormData = { ...formData };
    const actualTotalSteps = getCurrentTotalSteps();

    if (currentStep === 4) { // After Verification
      const age = calculateAge(formData.dob);
      const isUserYouth = age !== null && age < 18;
      newFormData = { ...newFormData, isYouth: isUserYouth };
      setFormData(newFormData); 
      // Next step is 5 for both youth (sharing) and adults (role selection)
    }
    
    setDirection(1);

    if (currentStep < actualTotalSteps) {
      // This logic ensures correct step transition based on youth status
      // If adult finishes role selection (step 5), they go to sharing (step 6)
      // If youth finishes verification (step 4), they go to sharing (step 5)
      setCurrentStep(nextStepNumber);
      updateUrl(nextStepNumber);
      setIsStepValid(false); 
    } else { // currentStep === actualTotalSteps (finish registration)
      console.log('Finalizing registration:', newFormData);

      if (finishButtonRef.current) {
        const rect = finishButtonRef.current.getBoundingClientRect();
        confetti({
          particleCount: 150,
          spread: 100,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          },
          angle: 270, // Shoots upwards
          startVelocity: 45, // Speed of particles
          gravity: 0.9,      // How fast they fall
          drift: Math.random() * 0.2 - 0.1, // Slight random horizontal movement
          ticks: 300, // How long particles last
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
      setIsStepValid(true); 
    }
  };

  const updateFormDataAndValidate = useCallback((data: Partial<SignupFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
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

  if (!isLoaded || (formData.isYouth === null && currentStep > 4)) {
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
        onValidation={handleStepValidation} // Sharing is optional, so this will typically call onValidation(true)
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
    }
  } else if (currentStep === 6) { 
    if (formData.isYouth === false) { // Only adults reach step 6
      currentStepComponent = <StepSharingPreferences
        dictionary={dictionary.stepSharingPreferences}
        formData={formData}
        updateFormData={updateFormDataAndValidate}
        onValidation={handleStepValidation} // Sharing is optional
        lang={lang}
      />;
    }
  }


  return (
    <div className="w-full max-w-xl mx-auto flex flex-col flex-grow" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <Progress value={progressValue} className="w-full mb-4 md:mb-6" />

      <div className="flex-grow overflow-hidden flex flex-col">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={`${currentStep}-${formData.isYouth}`} 
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
