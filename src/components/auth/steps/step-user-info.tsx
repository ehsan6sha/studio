
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
import { format as formatGregorian, parse as parseGregorian, isValid as isValidGregorianDate, getYear as getYearGregorian } from 'date-fns';
// For Farsi/Shamsi
import { format as formatJalali, parse as parseJalali, isValid as isValidJalaliDate, getYear as getYearJalali } from 'date-fns-jalali';
import { faIR as faIRJalali } from 'date-fns-jalali/locale'; // Jalali Farsi locale (for Shamsi calendar)
// Note: No specific English locale needed from date-fns/locale if default English is fine for Gregorian.

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
  const isValidDateCheck = isFarsi ? isValidJalaliDate : isValidGregorianDate;
  
  // For react-day-picker: use faIRJalali for Shamsi, undefined for default Gregorian (English)
  const calendarLocale = isFarsi ? faIRJalali : undefined; 
  const dateFormatString = isFarsi ? 'yyyy/MM/dd' : 'PPP';


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

  const form = useForm<z.infer<typeof UserInfoSchema>>({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: {
      name: formData.name || '',
      emailOrPhone: formData.emailOrPhone || '',
      dob: formData.dob ? parseGregorian(formData.dob, 'yyyy-MM-dd', new Date()) : undefined,
      password: formData.password || '',
      confirmPassword: '', // Always start empty
    },
    mode: 'onChange', // Validate on change to update button state
  });
  
  const [dobInputValue, setDobInputValue] = useState<string>(() => {
    if (formData.dob) {
      const gregorianDate = parseGregorian(formData.dob, 'yyyy-MM-dd', new Date());
      if (isValidGregorianDate(gregorianDate)) {
        return formatDate(gregorianDate, dateFormatString, { locale: calendarLocale });
      }
    }
    return '';
  });


  useEffect(() => {
    const initialDob = formData.dob ? parseGregorian(formData.dob, 'yyyy-MM-dd', new Date()) : undefined;
    form.reset({
      name: formData.name || '',
      emailOrPhone: formData.emailOrPhone || '',
      dob: initialDob,
      password: formData.password || '',
      confirmPassword: '', // Always reset confirmPassword
    });

    if (initialDob && isValidGregorianDate(initialDob)) {
        setDobInputValue(formatDate(initialDob, dateFormatString, { locale: calendarLocale }));
    } else {
        setDobInputValue('');
    }
    
    // Report initial validation state
    const timerId = setTimeout(() => {
        onValidation(form.formState.isValid);
    }, 0);

    return () => clearTimeout(timerId);
  // Only re-run if lang or formData parts change, not on every form instance change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, formData.name, formData.emailOrPhone, formData.dob, formData.password, onValidation]);


  useEffect(() => {
    const subscription = form.watch((currentValues, { name: fieldName, type }) => {
      updateFormData({
        name: currentValues.name,
        emailOrPhone: currentValues.emailOrPhone,
        dob: currentValues.dob ? formatGregorian(currentValues.dob, 'yyyy-MM-dd') : undefined,
        password: currentValues.password,
        // confirmPassword is not stored in formData
      });
      onValidation(form.formState.isValid);
      
      // Update dobInputValue only if the dob field itself changed through the calendar
      // or if it's being cleared, and not while user is typing.
      if (fieldName === 'dob' || (fieldName === undefined && type === undefined)) { // type === undefined for initial set
        if (currentValues.dob && isValidGregorianDate(currentValues.dob)) {
           if (document.activeElement?.id !== 'dob-input') { // Avoid race condition with manual input
             setDobInputValue(formatDate(currentValues.dob, dateFormatString, { locale: calendarLocale }));
           }
        } else if (document.activeElement?.id !== 'dob-input') {
           setDobInputValue('');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData, onValidation, formatDate, dateFormatString, calendarLocale]);


  const handleDobInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = e.target.value;
    setDobInputValue(textValue);

    let parsedInputDate: Date | null = null;
    
    // Try parsing based on current language context
    // For Farsi, expect yyyy/MM/dd. For English, more flexible (e.g. MM/dd/yyyy or common formats)
    const formatsToTry = isFarsi 
      ? ['yyyy/MM/dd', 'yyyy-MM-dd'] 
      : ['MM/dd/yyyy', 'yyyy-MM-dd', 'M/d/yy', 'P', 'PP', 'PPP'];

    for (const fmt of formatsToTry) {
        try {
            // parseDateInput is chosen based on isFarsi (Jalali or Gregorian parse)
            const d = parseDateInput(textValue, fmt, new Date(), { locale: calendarLocale });
            if (isValidDateCheck(d)) {
                parsedInputDate = d;
                break;
            }
        } catch {
            // continue trying other formats
        }
    }
    
    if (parsedInputDate && isValidDateCheck(parsedInputDate)) {
      form.setValue('dob', parsedInputDate, { shouldValidate: true });
    } else {
      // If parsing fails, set form value to null or undefined to trigger validation error if field is required
      form.setValue('dob', null, { shouldValidate: true }); 
    }
  };

  // Define Gregorian year range for the calendar's fromYear/toYear props
  const calendarMinGregorianYear = 1900;
  const calendarMaxGregorianYear = new Date().getFullYear();

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
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{dictionary.dobLabel}</FormLabel>
                    <div className="relative flex items-center gap-x-2">
                      <FormControl>
                         <Input
                          id="dob-input"
                          placeholder={dictionary.dobPlaceholder}
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
                            selected={field.value ?? undefined}
                            onSelect={(date) => {
                              form.setValue('dob', date, { shouldValidate: true });
                              if (date && isValidDateCheck(date)) {
                                setDobInputValue(formatDate(date, dateFormatString, { locale: calendarLocale }));
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
                            fromYear={calendarMinGregorianYear} // Always pass Gregorian year
                            toYear={calendarMaxGregorianYear}   // Always pass Gregorian year
                            locale={calendarLocale} // This will be faIRJalali for Shamsi
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
