
'use client';

import { SignupStepper } from '@/components/auth/signup-stepper';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n-config';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.45H18.02C17.72 15.93 16.94 17.15 15.79 17.93V20.35H19.2C21.28 18.45 22.56 15.65 22.56 12.25Z" fill="#4285F4"/>
    <path d="M12 23C14.97 23 17.45 22.04 19.2 20.35L15.79 17.93C14.79 18.63 13.5 19.04 12 19.04C9.12 19.04 6.69 17.14 5.76 14.6H2.25V17.02C4.01 20.59 7.74 23 12 23Z" fill="#34A853"/>
    <path d="M5.76 14.6C5.56 14 5.46 13.37 5.46 12.7C5.46 12.03 5.56 11.4 5.76 10.8L2.25 8.38C1.45 9.98 1 11.28 1 12.7C1 14.12 1.45 15.42 2.25 17.02L5.76 14.6Z" fill="#FBBC05"/>
    <path d="M12 6.46C13.68 6.46 15.08 7.06 16.03 7.95L19.27 4.72C17.45 3.09 14.97 2 12 2C7.74 2 4.01 4.41 2.25 8.38L5.76 10.8C6.69 8.26 9.12 6.46 12 6.46Z" fill="#EA4335"/>
  </svg>
);

function SignupPageContent({ params: paramsAsProp }: { params: { lang: Locale } }) {
  const { lang } = React.use(paramsAsProp as any); 
  const auth = useAuth();
  const [dictionary, setDictionary] = useState<any>(null);
  const searchParams = useSearchParams();
  const initialStepQuery = searchParams.get('step');
  const initialStep = initialStepQuery ? parseInt(initialStepQuery, 10) : 1;

  useEffect(() => {
    if (lang) { 
      getDictionary(lang).then(setDictionary);
    }
  }, [lang]);
  
  const handleGoogleSignIn = () => {
    auth.loginWithGoogle(lang);
  };


  if (!dictionary) {
    return <div className="flex flex-col items-center justify-center flex-grow py-6 md:py-12 px-4">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center flex-grow p-4">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl md:text-2xl font-headline">{dictionary.signupPage.title}</CardTitle>
          <CardDescription>
            {lang === 'fa' ? 'برای ساخت حساب جدید مراحل زیر را دنبال کنید.' : 'Follow the steps below to create your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <GoogleIcon />
                {dictionary.signupPage.googleButton || 'Continue with Google'}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {dictionary.signupPage.orSeparator || 'OR'}
                  </span>
                </div>
              </div>
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
        </CardContent>
      </Card>
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
