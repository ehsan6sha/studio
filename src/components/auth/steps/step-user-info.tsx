
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
import { format as formatGregorian, parse as parseGregorian, isValid as isValidGregorianDate } from 'date-fns';
import { faIR as faIRGregorian } from 'date-fns/locale';

// date-fns-jalali for Farsi/Shamsi
import { format as formatJalali, parse as parseJalali, isValid as isValidJalaliDate } from 'date-fns-jalali';
import { faIR as faIRJalali } from 'date-fns-jalali/locale';

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
  
  // Determine which date functions and locale to use
  const isFarsi = lang === 'fa';
  const formatDate = isFarsi ? formatJalali : formatGregorian;
  const parseDate = isFarsi ? parseJalali : parseGregorian;
  const isValidDate = isFarsi ? isValidJalaliDate : isValidGregorianDate;
  const dateLocale = isFarsi ? faIRJalali : faIRGregorian; // faIRGregorian for English month names if needed, or undefined for default English
  const dateFormatString = isFarsi ? 'yyyy/MM/dd' : 'PPP'; // PPP for "Jan 1st, 2024"

  const UserInfoSchema = z.object({
    name: z.string().min(1, { message: dictionary.errors.nameRequired }),
    emailOrPhone: z.string().min(1, { message: dictionary.errors.emailOrPhoneRequired })
      .refine(value => /^(?:\S+@\S+\.\S+)|(?:\+?[0-9\s-]{7,15})$/.test(value), {
        message: dictionary.errors.invalidEmailOrPhone,
      }),
    dob: z.date({
      invalid_type_error: dictionary.errors.dobInvalid,
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
      dob: formData.dob ? parseGregorian(formData.dob, 'yyyy-MM-dd', new Date()) : undefined, // Stored as Gregorian
      password: formData.password || '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });
  
  const [dobInputValue, setDobInputValue] = useState<string>(
    formData.dob ? formatDate(parseGregorian(formData.dob, 'yyyy-MM-dd', new Date()), dateFormatString, { locale: dateLocale }) : ''
  );


  useEffect(() => {
    const initialDob = formData.dob ? parseGregorian(formData.dob, 'yyyy-MM-dd', new Date()) : undefined;
    form.reset({
      name: formData.name || '',
      emailOrPhone: formData.emailOrPhone || '',
      dob: initialDob,
      password: formData.password || '',
      confirmPassword: '', // Always reset confirmPassword
    });
    setDobInputValue(initialDob ? formatDate(initialDob, dateFormatString, { locale: dateLocale }) : '');
    
    const timerId = setTimeout(() => {
        onValidation(form.formState.isValid);
    }, 0);

    return () => clearTimeout(timerId);
  }, [formData.name, formData.emailOrPhone, formData.dob, formData.password, form, lang, onValidation, formatDate, dateFormatString, dateLocale]);


  useEffect(() => {
    const subscription = form.watch((currentValues) => {
      updateFormData({
        name: currentValues.name,
        emailOrPhone: currentValues.emailOrPhone,
        // Store DOB as Gregorian ISO string 'yyyy-MM-dd'
        dob: currentValues.dob ? formatGregorian(currentValues.dob, 'yyyy-MM-dd') : undefined,
        password: currentValues.password,
      });
      onValidation(form.formState.isValid);
      
      if (currentValues.dob) {
        if (document.activeElement?.id !== 'dob-input') {
           setDobInputValue(formatDate(currentValues.dob, dateFormatString, { locale: dateLocale }));
        }
      } else if (document.activeElement?.id !== 'dob-input') {
         setDobInputValue('');
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData, onValidation, lang, formatDate, dateFormatString, dateLocale]);


  const handleDobInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = e.target.value;
    setDobInputValue(textValue);

    let parsedDate: Date | null = null;
    const tryParse = (value: string, fmt: string) => {
        try {
            return parseDate(value, fmt, new Date(), { locale: dateLocale });
        } catch {
            return null;
        }
    };
    
    if (isFarsi) {
      // Try parsing Jalali yyyy/MM/dd
      parsedDate = tryParse(textValue, 'yyyy/MM/dd');
    } else {
      // Try parsing Gregorian (e.g., MM/dd/yyyy or yyyy-MM-dd)
      parsedDate = tryParse(textValue, 'P'); // 'P' is a flexible locale-specific short date format
      if (!parsedDate || !isValidDate(parsedDate)) {
        parsedDate = tryParse(textValue, 'yyyy-MM-dd');
      }
    }
    
    if (parsedDate && isValidDate(parsedDate)) {
      form.setValue('dob', parsedDate, { shouldValidate: true });
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
                              if (date) {
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
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            locale={dateLocale} // Use the determined locale
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
