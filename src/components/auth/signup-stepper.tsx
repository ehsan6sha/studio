
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Locale } from '@/i18n-config';
import { StepInformation } from './steps/step-information';
import { StepTerms } from './steps/step-terms';
import { StepUserInfo } from './steps/step-user-info';
import { StepVerification } from './steps/step-verification';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

const TOTAL_STEPS = 4;

export interface SignupFormData {
  acceptedMandatoryTerms?: boolean;
  acceptedOptionalCommunications?: boolean;
  acceptedOptionalMarketing?: boolean;
  emailOrPhone?: string;
  password?: string;
  name?: string;
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
  const auth = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>({
    acceptedMandatoryTerms: false,
    acceptedOptionalCommunications: false,
    acceptedOptionalMarketing: false,
    emailOrPhone: '',
    password: '',
    name: '',
    verificationCode: '',
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [direction, setDirection] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
  const finishButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('signupFormData');
    let effectiveFormData: SignupFormData = {
      acceptedMandatoryTerms: false,
      acceptedOptionalCommunications: false,
      acceptedOptionalMarketing: false,
      emailOrPhone: '',
      password: '',
      name: '',
      verificationCode: '',
    };

    if (storedData) {
      const parsedData = JSON.parse(storedData);
      effectiveFormData = {
        ...effectiveFormData,
        ...parsedData,
      };
    }
    setFormData(effectiveFormData);

    const stepFromQuery = searchParams.get('step');
    const validatedInitialStep = stepFromQuery ? parseInt(stepFromQuery, 10) : initialStep;
    const saneInitialStep = Math.max(1, Math.min(validatedInitialStep, TOTAL_STEPS));

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
    if (currentStep === 1) {
      setIsStepValid(true);
    }
  }, [currentStep, isLoaded]);


  const handleNext = useCallback(async () => {
    if (!isStepValid) {
      if (currentStep === 2 && !formData.acceptedMandatoryTerms) {
        toast({ title: dictionary.errorMandatoryTerms, variant: "destructive" });
      }
      return;
    }

    setDirection(1);
    
    if (currentStep < TOTAL_STEPS) {
      const nextStepNumber = currentStep + 1;
      setCurrentStep(nextStepNumber);
      updateUrl(nextStepNumber);
      setIsStepValid(false);
    } else {
      console.log('Finalizing registration:', formData);

      if (finishButtonRef.current) {
        const rect = finishButtonRef.current.getBoundingClientRect();
        const originX = (rect.left + rect.width / 2) / window.innerWidth;
        const originY = rect.top / window.innerHeight;

        confetti({
          particleCount: 150,
          spread: 70,
          origin: { x: originX, y: originY },
          angle: 90,
          startVelocity: 55,
          gravity: 1,
          drift: 0,
          ticks: 400,
        });
      }

      toast({ title: dictionary.registrationCompleteTitle, description: dictionary.registrationCompleteMessage });
      localStorage.removeItem('signupFormData');
      auth.signup({ name: formData.name, emailOrPhone: formData.emailOrPhone }, lang);
    }
  }, [currentStep, formData, dictionary, lang, isStepValid, toast, auth, updateUrl]);

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
  }


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
            {currentStepComponent}
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
        <Button
          onClick={handleNext}
          disabled={isNextButtonDisabled}
          ref={currentStep === TOTAL_STEPS ? finishButtonRef : null}
        >
          {currentStep === TOTAL_STEPS ? (dictionary.finishButton || 'Finish') : (dictionary.nextButton || 'Save & Next')}
        </Button>
      </div>
    </div>
  );
}
