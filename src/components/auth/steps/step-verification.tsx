
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPVerified } from "@/components/ui/input-otp"; // Removed InputOTPSeparator as it's not used for 5-digit
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
  const [otp, setOtp] = useState(''); // Initialize with empty string, will be set by useEffect
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize OTP from formData and perform initial validation
    const initialOtp = formData.verificationCode || '';
    setOtp(initialOtp);
    const isValid = initialOtp.length === 5;
    
    // Using setTimeout to ensure onValidation is called after the current render cycle
    // and state updates have a chance to settle, particularly when pre-filling.
    const timerId = setTimeout(() => {
      onValidation(isValid);
      if (isValid) {
        setIsVerified(true);
        // Optionally, show a toast if pre-filled and valid, though usually toasts are for actions
        // toast({ title: dictionary.toast.verifiedTitle, description: dictionary.toast.verifiedDescription });
      } else {
        setIsVerified(false);
      }
    }, 0);

    return () => clearTimeout(timerId);
  }, [formData.verificationCode, onValidation, dictionary.toast.verifiedTitle, dictionary.toast.verifiedDescription]);


  const handleOtpChange = (value: string) => {
    const newOtp = value.slice(0, 5); // Ensure it doesn't exceed 5 digits
    setOtp(newOtp);
    updateFormData({ verificationCode: newOtp });
    const isValid = newOtp.length === 5;
    onValidation(isValid);
    if (isValid) {
      setIsVerified(true);
      toast({ title: dictionary.toast.verifiedTitle, description: dictionary.toast.verifiedDescription });
    } else {
      setIsVerified(false);
    }
  };


  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleanText = text.replace(/[^0-9]/g, '').slice(0, 5); // Keep only digits, max 5
      if (cleanText.length > 0) { // Only proceed if there are digits to paste
        setOtp(cleanText);
        updateFormData({ verificationCode: cleanText });
        const isValid = cleanText.length === 5;
        onValidation(isValid);
        if (isValid) {
          setIsVerified(true);
          toast({ title: dictionary.toast.pastedTitle, description: dictionary.toast.verifiedDescription });
        } else {
          setIsVerified(false);
          // Optionally inform user if pasted code is incomplete
          if (cleanText.length < 5) {
            toast({ title: dictionary.toast.pasteIncompleteTitle , description: dictionary.toast.pasteIncompleteDescription.replace('{count}', cleanText.length.toString()), variant: "default" });
          }
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
        return `https://mail.${domain}`; // Common pattern
    }
  };

  const isEmail = formData.emailOrPhone && formData.emailOrPhone.includes('@');

  return (
    <div className="h-full flex flex-col">
      <Card className="w-full shadow-none border-none flex-grow flex flex-col">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{dictionary.title}</CardTitle>
          <CardDescription>
            {isEmail && formData.emailOrPhone ? 
              dictionary.descriptionEmail.replace('{emailOrPhone}', formData.emailOrPhone) : 
              formData.emailOrPhone ? dictionary.descriptionPhone.replace('{emailOrPhone}', formData.emailOrPhone) :
              dictionary.descriptionGeneric
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {isVerified && otp.length === 5 ? ( // Show verified only if fully verified
                <InputOTPVerified valueLength={otp.length} />
            ) : (
                <InputOTP maxLength={5} value={otp} onChange={handleOtpChange}>
                  <InputOTPGroup dir={'ltr'}> {/* OTP input itself is usually LTR for numerical input */}
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
