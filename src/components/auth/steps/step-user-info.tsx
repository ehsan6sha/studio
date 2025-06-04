
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
import { format as formatGregorian, parse as parseGregorianOriginal, isValid as isValidGregorianDateOriginal, getYear as getYearGregorian } from 'date-fns';
import { faIR as faIRLocaleGregorian } from 'date-fns/locale/fa-IR'; // For displaying Gregorian dates with Farsi text

// For Farsi/Shamsi (Jalali)
import { format as formatJalaliOriginal, parse as parseJalaliOriginal, isValid as isValidJalaliDateOriginal, getYear as getYearJalali } from 'date-fns-jalali';
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

  const { formatDate, parseDateInput, isValidDate, dateLocale, dateFormatString, getYearForCalendar, calendarMinYear, calendarMaxYear } = React.useMemo(() => {
    if (isFarsi) {
      return {
        formatDate: formatJalaliOriginal,
        parseDateInput: parseJalaliOriginal,
        isValidDate: isValidJalaliDateOriginal,
        dateLocale: faIRJalaliLocale,
        dateFormatString: 'yyyy/MM/dd',
        getYearForCalendar: getYearJalali,
        calendarMinYear: 1279, // Approx 1900 Gregorian in Shamsi
        calendarMaxYear: getYearJalali(new Date()), // Current Shamsi year
      };
    }
    return {
      formatDate: formatGregorian,
      parseDateInput: parseGregorianOriginal,
      isValidDate: isValidGregorianDateOriginal,
      dateLocale: undefined, // For react-day-picker with Gregorian default (English)
      dateFormatString: 'PPP', // e.g. "Jan 1st, 2023"
      getYearForCalendar: getYearGregorian,
      calendarMinYear: 1900,
      calendarMaxYear: getYearGregorian(new Date()),
    };
  }, [isFarsi]);


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
    // DOB is stored as a standard YYYY-MM-DD string in formData, parse it to Date object for form
    dob: formData.dob ? parseGregorianOriginal(formData.dob, 'yyyy-MM-dd', new Date()) : undefined,
    password: formData.password || '',
    confirmPassword: '', // Always start confirmPassword empty
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [formData.name, formData.emailOrPhone, formData.dob, formData.password]);

  const form = useForm<z.infer<typeof UserInfoSchema>>({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange', 
  });
  
  const [dobInputValue, setDobInputValue] = useState<string>('');

  // Effect for initializing/resetting form when defaultFormValues change (e.g., from parent formData or mount)
  useEffect(() => {
    form.reset(defaultFormValues);

    const initialDobDate = defaultFormValues.dob;
    if (initialDobDate && isValidDate(initialDobDate)) {
      setDobInputValue(formatDate(initialDobDate, dateFormatString, { locale: dateLocale }));
    } else {
      setDobInputValue('');
    }
    // Let mode: 'onChange' and the dedicated form.formState.isValid useEffect handle initial validation reporting
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFormValues, form.reset]); // Removed date utils as they are memoized and defaultFormValues depends on them

  // Effect for language changes
  useEffect(() => {
    form.setValue('confirmPassword', '', { shouldValidate: true }); 

    const currentDob = form.getValues('dob');
    if (currentDob && isValidDate(currentDob)) {
      setDobInputValue(formatDate(currentDob, dateFormatString, { locale: dateLocale }));
    } else {
      setDobInputValue('');
    }
    
    const timerId = setTimeout(() => {
      form.trigger(); // This will update form.formState.isValid for the new lang/locale
    }, 0);
    return () => clearTimeout(timerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, dateFormatString, dateLocale, formatDate, isValidDate, form.setValue, form.getValues, form.trigger]);


  // Effect for watching form changes to update parent formData & dobInputValue
  useEffect(() => {
    const subscription = form.watch((currentValues, { name: fieldName, type }) => {
      updateFormData({
        name: currentValues.name,
        emailOrPhone: currentValues.emailOrPhone,
        dob: currentValues.dob ? formatGregorian(currentValues.dob, 'yyyy-MM-dd') : undefined,
        password: currentValues.password,
      });
      
      if (fieldName === 'dob' || (fieldName === undefined && type === undefined)) { 
        if (currentValues.dob && isValidDate(currentValues.dob)) {
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
  }, [form.watch, updateFormData, formatDate, dateFormatString, dateLocale, isValidDate, formatGregorian]);


  // Effect for propagating form validity to the parent
  useEffect(() => {
    onValidation(form.formState.isValid);
  }, [form.formState.isValid, onValidation]);


  const handleDobInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = e.target.value;
    setDobInputValue(textValue);

    let parsedInputDate: Date | null = null;
    // For Farsi, try parsing as yyyy/MM/dd, then yyyy-MM-dd (Shamsi)
    // For Gregorian, try common formats
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
      // If parsing fails, set dob to null but keep shouldValidate true to show error if field is required
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
                render={({ fieldState }) => ( 
                  <FormItem className="flex flex-col">
                    <FormLabel>{dictionary.dobLabel}</FormLabel>
                    <div className="relative flex items-center gap-x-2">
                      <FormControl>
                         <Input
                          id="dob-input"
                          placeholder={isFarsi ? dictionary.dobPlaceholderShamsi : dictionary.dobPlaceholderGregorian}
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
                            selected={form.getValues('dob') ?? undefined} 
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
                              date > new Date() || date < (isFarsi ? parseDateInput('1279/01/01', 'yyyy/MM/dd', new Date()) : new Date("1900-01-01"))
                            }
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={calendarMinYear} 
                            toYear={calendarMaxYear}   
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
                          aria-label={showPassword ? dictionary.hidePasswordAriaLabel : dictionary.showPasswordAriaLabel}
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
                          aria-label={showConfirmPassword ? dictionary.hidePasswordAriaLabel : dictionary.showPasswordAriaLabel}
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
