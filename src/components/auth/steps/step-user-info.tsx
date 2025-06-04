
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Standard date-fns for English/Gregorian
import { format as formatGregorian, parse as parseGregorian, isValid as isValidGregorianDateOriginal, getYear as getYearGregorian } from 'date-fns';
import { faIR as faIRLocale } from 'date-fns/locale/fa-IR'; // Gregorian Farsi locale (for display text)

// For Farsi/Shamsi (Jalali)
import { format as formatJalali, parse as parseJalali, isValid as isValidJalaliDateOriginal, getYear as getYearJalali } from 'date-fns-jalali';
import { faIR as faIRJalaliLocale } from 'date-fns-jalali/locale'; 


import { CalendarIcon, Eye, EyeOff } from 'lucide-react';
import type { SignupFormData } from '../signup-stepper';
import type { Locale } from '@/i18n-config';

interface StepUserInfoProps {
  dictionary: any;
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onValidation: (isValid: boolean) => void;
  lang: Locale;
}

export function StepUserInfo({ dictionary, formData, updateFormData, onValidation, lang }: StepUserInfoProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const isFarsi = lang === 'fa';

  const formatDate = isFarsi ? formatJalali : formatGregorian;
  const parseDateInput = isFarsi ? parseJalali : parseGregorian;
  const isValidDate = isFarsi ? isValidJalaliDateOriginal : isValidGregorianDateOriginal;
  const dateLocale = isFarsi ? faIRJalaliLocale : undefined; // For react-day-picker with Shamsi
  const dateFormatString = isFarsi ? 'yyyy/MM/dd' : 'PPP'; // Shamsi format vs. English readable
  
  // Gregorian year range for calendar dropdowns
  const calendarMinGregorianYear = 1900; 
  const calendarMaxGregorianYear = getYearGregorian(new Date());


  const UserInfoSchema = z.object({
    name: z.string().min(1, { message: dictionary.errors.nameRequired }),
    emailOrPhone: z.string().min(1, { message: dictionary.errors.emailOrPhoneRequired })
      .refine(value => /^(?:\S+@\S+\.\S+)|(?:\+?[0-9\s-]{7,15})$/.test(value), {
        message: dictionary.errors.invalidEmailOrPhone,
      }),
    dob: z.date({
      invalid_type_error: dictionary.errors.dobInvalid,
      required_error: dictionary.errors.dobRequired,
    }).optional().nullable(),
    password: z.string().min(6, { message: dictionary.errors.passwordMinLength }),
    confirmPassword: z.string().min(6, { message: dictionary.errors.confirmPasswordMinLength }),
  }).superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: dictionary.errors.passwordsDontMatch,
        path: ['confirmPassword']
      });
    }
  });
  
  const defaultFormValues = React.useMemo(() => ({
    name: formData.name || '',
    emailOrPhone: formData.emailOrPhone || '',
    dob: formData.dob ? parseGregorian(formData.dob, 'yyyy-MM-dd', new Date()) : undefined, // Store as Gregorian Date object
    password: formData.password || '',
    confirmPassword: '', // Always start confirmPassword empty
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [formData.name, formData.emailOrPhone, formData.dob, formData.password]); // parseGregorian is stable

  const form = useForm<z.infer<typeof UserInfoSchema>>({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange', 
  });
  
  const [dobInputValue, setDobInputValue] = useState<string>('');

  // Effect for initial setup (on mount)
  useEffect(() => {
    const initialDobDate = defaultFormValues.dob;
    if (initialDobDate && isValidDate(initialDobDate)) {
      setDobInputValue(formatDate(initialDobDate, dateFormatString, { locale: dateLocale }));
    } else {
      setDobInputValue('');
    }

    const timerId = setTimeout(() => {
      form.trigger().then(() => {
        onValidation(form.formState.isValid);
      });
    }, 0);
    return () => clearTimeout(timerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFormValues]); // Runs when defaultFormValues change (e.g. initial formData from props)

  // Effect for language changes
  useEffect(() => {
    form.setValue('confirmPassword', '', { shouldValidate: true }); // Clear confirm password on lang change

    const currentDob = form.getValues('dob');
    if (currentDob && isValidDate(currentDob)) {
      setDobInputValue(formatDate(currentDob, dateFormatString, { locale: dateLocale }));
    } else {
      setDobInputValue('');
    }
    
    const timerId = setTimeout(() => {
      form.trigger().then(() => onValidation(form.formState.isValid));
    }, 0);
    return () => clearTimeout(timerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, dateFormatString, dateLocale]); // form, formatDate, isValidDate, onValidation are stable


  // Effect for watching form changes and updating parent state / validation
  useEffect(() => {
    const subscription = form.watch((currentValues, { name: fieldName, type }) => {
      updateFormData({
        name: currentValues.name,
        emailOrPhone: currentValues.emailOrPhone,
        // Store DOB as a consistent Gregorian 'yyyy-MM-dd' string in formData
        dob: currentValues.dob ? formatGregorian(currentValues.dob, 'yyyy-MM-dd') : undefined,
        password: currentValues.password,
        // confirmPassword is not stored in formData
      });
      
      onValidation(form.formState.isValid);
      
      // Update dobInputValue for display, only if 'dob' field itself changed through the calendar
      // or if it's being cleared, and not while user is typing.
      if (fieldName === 'dob' || (fieldName === undefined && type === undefined)) { 
        if (currentValues.dob && isValidDate(currentValues.dob)) {
           // Avoid race condition with manual input if DOB input is focused
           if (document.activeElement?.id !== 'dob-input') { 
             setDobInputValue(formatDate(currentValues.dob, dateFormatString, { locale: dateLocale }));
           }
        } else if (document.activeElement?.id !== 'dob-input') {
           setDobInputValue('');
        }
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, updateFormData, onValidation]); // formatDate, dateFormatString, dateLocale, isValidDate, formatGregorian are stable


  const handleDobInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = e.target.value;
    setDobInputValue(textValue);

    let parsedInputDate: Date | null = null;
    const formatsToTry = isFarsi 
      ? ['yyyy/MM/dd', 'yyyy-MM-dd'] 
      : ['MM/dd/yyyy', 'yyyy-MM-dd', 'M/d/yy', 'P', 'PP', 'PPP'];

    for (const fmt of formatsToTry) {
        try {
            const d = parseDateInput(textValue, fmt, new Date(), { locale: isFarsi ? faIRJalaliLocale : undefined });
            if (isValidDate(d)) {
                parsedInputDate = d;
                break;
            }
        } catch { /* continue */ }
    }
    
    if (parsedInputDate && isValidDate(parsedInputDate)) {
      form.setValue('dob', parsedInputDate, { shouldValidate: true });
    } else {
      form.setValue('dob', null, { shouldValidate: true }); 
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="w-full shadow-none border-none flex-grow flex flex-col">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{dictionary.title}</CardTitle>
          <CardDescription>{dictionary.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4 md:space-y-6">
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{dictionary.nameLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={dictionary.namePlaceholder} {...field} />
                    </FormControl>
                    {fieldState.isTouched && <FormMessage />}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailOrPhone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{dictionary.emailOrPhoneLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={dictionary.emailOrPhonePlaceholder} {...field} />
                    </FormControl>
                    {fieldState.isTouched && <FormMessage />}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ fieldState }) => ( // field is not directly used here for input value
                  <FormItem className="flex flex-col">
                    <FormLabel>{dictionary.dobLabel}</FormLabel>
                    <div className="relative flex items-center gap-x-2">
                      <FormControl>
                         <Input
                          id="dob-input"
                          placeholder={isFarsi ? dictionary.dobPlaceholderFarsi : dictionary.dobPlaceholderGregorian}
                          value={dobInputValue}
                          onChange={handleDobInputChange}
                          className="w-full"
                        />
                      </FormControl>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon" type="button" className="shrink-0">
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.getValues('dob') ?? undefined} // Use form.getValues('dob')
                            onSelect={(date) => {
                              form.setValue('dob', date, { shouldValidate: true });
                              if (date && isValidDate(date)) {
                                setDobInputValue(formatDate(date, dateFormatString, { locale: dateLocale }));
                              } else {
                                setDobInputValue('');
                              }
                              setIsCalendarOpen(false);
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={calendarMinGregorianYear} 
                            toYear={calendarMaxGregorianYear}   
                            locale={dateLocale} 
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {fieldState.isTouched && <FormMessage />}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{dictionary.passwordLabel}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute rtl:left-1 ltr:right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? dictionary.hidePassword : dictionary.showPassword}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    {fieldState.isTouched && <FormMessage />}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{dictionary.confirmPasswordLabel}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                           className="absolute rtl:left-1 ltr:right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? dictionary.hidePassword : dictionary.showPassword}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    {fieldState.isTouched && <FormMessage />}
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

