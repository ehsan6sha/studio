
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, InputOTPVerified } from "@/components/ui/input-otp";
import { Mail, Copy } from 'lucide-react';
import type { SignupFormData } from '../signup-stepper';
import { useToast } from '@/hooks/use-toast';
import type { Locale } from '@/i18n-config';


interface StepVerificationProps {
  dictionary: any;
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onValidation: (isValid: boolean) => void;
  lang: Locale;
}

export function StepVerification({ dictionary, formData, updateFormData, onValidation, lang }: StepVerificationProps) {
  const [otp, setOtp] = useState(formData.verificationCode || '');
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();

  const handleOtpChange = (value: string) => {
    setOtp(value);
    updateFormData({ verificationCode: value });
    const isValid = value.length === 5;
    onValidation(isValid);
    if (isValid) {
      // Simulate verification
      setIsVerified(true);
      toast({ title: dictionary.toast.verifiedTitle, description: dictionary.toast.verifiedDescription });
    } else {
      setIsVerified(false);
    }
  };

  useEffect(() => {
    // Initial validation check based on pre-filled OTP
    const initialOtp = formData.verificationCode || '';
    setOtp(initialOtp);
    const isValid = initialOtp.length === 5;
    onValidation(isValid);
    if (isValid) setIsVerified(true); else setIsVerified(false);
  }, [formData.verificationCode, onValidation]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleanText = text.replace(/\s-/g, '').slice(0, 5);
      if (/^\d{0,5}$/.test(cleanText)) {
        setOtp(cleanText);
        updateFormData({ verificationCode: cleanText });
        if (cleanText.length === 5) {
          onValidation(true);
          setIsVerified(true);
          toast({ title: dictionary.toast.pastedTitle, description: dictionary.toast.verifiedDescription });
        } else {
          onValidation(false);
          setIsVerified(false);
        }
      } else {
         toast({ title: dictionary.toast.pasteErrorTitle, description: dictionary.toast.pasteErrorInvalid, variant: "destructive" });
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      toast({ title: dictionary.toast.pasteErrorTitle, description: dictionary.toast.pasteErrorFailed, variant: "destructive" });
    }
  };

  const getEmailProviderLink = (email: string) => {
    const domain = email.substring(email.lastIndexOf("@") + 1);
    switch (domain.toLowerCase()) {
      case 'gmail.com':
        return 'https://mail.google.com/';
      case 'outlook.com':
      case 'hotmail.com':
      case 'live.com':
        return 'https://outlook.live.com/';
      case 'yahoo.com':
        return 'https://mail.yahoo.com/';
      default:
        return `https://${domain}`; // Best guess
    }
  };

  const isEmail = formData.emailOrPhone && formData.emailOrPhone.includes('@');

  return (
    <div className="h-full flex flex-col">
      <Card className="w-full shadow-none border-none flex-grow flex flex-col">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{dictionary.title}</CardTitle>
          <CardDescription>
            {isEmail ? 
              dictionary.descriptionEmail.replace('{emailOrPhone}', formData.emailOrPhone || '') : 
              dictionary.descriptionPhone.replace('{emailOrPhone}', formData.emailOrPhone || '')
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {isVerified ? (
                <InputOTPVerified valueLength={otp.length} />
            ) : (
                <InputOTP maxLength={5} value={otp} onChange={handleOtpChange}>
                  <InputOTPGroup dir={lang === 'fa' ? 'ltr': 'ltr'}> {/* OTP input itself is usually LTR */}
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                  </InputOTPGroup>
                </InputOTP>
            )}
            <Button variant="outline" onClick={handlePaste} className="w-full max-w-xs">
              <Copy className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              {dictionary.pasteButton}
            </Button>
          </div>

          {isEmail && formData.emailOrPhone && (
            <Button variant="secondary" asChild className="w-full max-w-xs">
              <a href={getEmailProviderLink(formData.emailOrPhone)} target="_blank" rel="noopener noreferrer">
                <Mail className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                {dictionary.openEmailButton.replace('{domain}', formData.emailOrPhone.substring(formData.emailOrPhone.lastIndexOf("@") + 1))}
              </a>
            </Button>
          )}
          <p className="text-xs text-muted-foreground text-center">
            {dictionary.didNotReceiveCode} <Button variant="link" size="sm" className="p-0 h-auto">{dictionary.resendCodeLink}</Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
