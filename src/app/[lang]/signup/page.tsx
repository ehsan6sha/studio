
'use client';

import { SignupStepper } from '@/components/auth/signup-stepper';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n-config';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

// Using Suspense for useSearchParams as per Next.js recommendation for Client Components
function SignupPageContent({ params: { lang } }: { params: { lang: Locale } }) {
  const [dictionary, setDictionary] = useState<any>(null);
  const searchParams = useSearchParams();
  const initialStepQuery = searchParams.get('step');
  const initialStep = initialStepQuery ? parseInt(initialStepQuery, 10) : 1;

  useEffect(() => {
    getDictionary(lang).then(setDictionary);
  }, [lang]);

  if (!dictionary) {
    return <div className="flex flex-col items-center justify-center flex-grow py-6 md:py-12 px-4">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center flex-grow py-2 sm:py-4 md:py-6 px-4">
      <SignupStepper
        lang={lang}
        dictionary={dictionary.signupStepper}
        initialStep={initialStep}
        termsDictionary={dictionary.termsPage} 
        appTermsContent={dictionary.signupStepper.appTermsContent}
        dataProcessingConsentContent={dictionary.signupStepper.dataProcessingConsentContent}
        marketingConsentContent={dictionary.signupStepper.marketingConsentContent}
      />
    </div>
  );
}

export default function SignupPageHost({ params }: { params: { lang: Locale } }) {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center flex-grow py-6 md:py-12 px-4">Loading step...</div>}>
      <SignupPageContent params={params} />
    </Suspense>
  );
}
