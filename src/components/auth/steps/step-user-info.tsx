
'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
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
  useFormField,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input'; // Keep for other inputs if any, or remove if not used elsewhere
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

import { format as formatGregorian, parse as parseGregorianOriginal, isValid as isValidGregorianDateOriginal, getYear as getYearGregorian } from 'date-fns';
import { format as formatJalaliOriginal, parse as parseJalaliOriginal, isValid as isValidJalaliDateOriginal, getYear as getYearJalali } from 'date-fns-jalali';
import { faIR as faIRJalaliLocale } from 'date-fns-jalali/locale'; 

import { CalendarIcon, Eye, EyeOff } from 'lucide-react';
import type { SignupFormData } from '../signup-stepper';
import type { Locale } from '@/i18n-config';
import type { MaskInput as MaskaMaskInputType, MaskDetail } from 'maska';


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
  const [dobInputValue, setDobInputValue] = useState<string>(''); 
  
  const isFarsi = lang === 'fa';
  const dobInputRef = useRef<HTMLInputElement>(null);
  const maskaInstanceRef = useRef<MaskaMaskInputType | null>(null);

  const { formatDate, parseDateInput, isValidDate, dateLocale, dateFormatString, getYearForCalendar, calendarMinYear, calendarMaxYear } = React.useMemo(() => {
    if (isFarsi) {
      return {
        formatDate: formatJalaliOriginal,
        parseDateInput: parseJalaliOriginal,
        isValidDate: isValidJalaliDateOriginal,
        dateLocale: faIRJalaliLocale,
        dateFormatString: 'yyyy/MM/dd', 
        getYearForCalendar: getYearJalali,
        calendarMinYear: 1279, 
        calendarMaxYear: getYearJalali(new Date()), 
      };
    }
    return {
      formatDate: formatGregorian,
      parseDateInput: parseGregorianOriginal,
      isValidDate: isValidGregorianDateOriginal,
      dateLocale: undefined, 
      dateFormatString: 'yyyy/MM/dd', 
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
    })
    .max(new Date(new Date().setHours(0, 0, 0, 0)), { message: dictionary.errors.dobInFuture || "Date of birth cannot be in the future." })
    .nullable(), 
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
  
  const defaultFormValues = React.useMemo(() => {
    let initialDobDate: Date | null = null;
    if (formData.dob) {
        try {
            initialDobDate = parseGregorianOriginal(formData.dob, 'yyyy-MM-dd', new Date());
            if(!isValidGregorianDateOriginal(initialDobDate)) initialDobDate = null;
        } catch {
            initialDobDate = null;
        }
    }
    return {
        name: formData.name || '',
        emailOrPhone: formData.emailOrPhone || '',
        dob: initialDobDate,
        password: formData.password || '',
        confirmPassword: '', 
    };
  }, [formData.name, formData.emailOrPhone, formData.dob, formData.password]);

  const form = useForm<z.infer<typeof UserInfoSchema>>({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange', 
  });
  
  useEffect(() => {
    form.reset(defaultFormValues);
    const initialDobDate = defaultFormValues.dob;
    if (initialDobDate && isValidDate(initialDobDate)) {
        const formattedForDisplay = formatDate(initialDobDate, dateFormatString, { locale: dateLocale });
        setDobInputValue(formattedForDisplay);
        if (maskaInstanceRef.current) {
            maskaInstanceRef.current.masked = formattedForDisplay;
        }
    } else {
        setDobInputValue('');
        if (maskaInstanceRef.current) {
            maskaInstanceRef.current.masked = '';
        }
    }
  }, [defaultFormValues, form, formatDate, dateFormatString, dateLocale, isValidDate]);

  const handleMaskaDetail = useCallback((detail: MaskDetail) => {
    setDobInputValue(detail.masked);
    let parsedInputDate: Date | null = null;
    if (detail.completed) {
      try {
        const tempDate = parseDateInput(detail.masked, dateFormatString, new Date(), { locale: dateLocale });
        if (isValidDate(tempDate)) {
          parsedInputDate = tempDate;
        }
      } catch {
        // Parsing failed, leave as null
      }
    }
    form.setValue('dob', parsedInputDate, { shouldValidate: true, shouldTouch: true });
  }, [form, parseDateInput, dateFormatString, dateLocale, isValidDate, setDobInputValue]);


  useEffect(() => {
    if (dobInputRef.current && !maskaInstanceRef.current) {
      const { MaskInput } = require('maska'); 
      if (MaskInput) {
        const instance = new MaskInput(dobInputRef.current, {
          mask: "####/##/##",
          onMaska: handleMaskaDetail,
          eager: true,
        });
        maskaInstanceRef.current = instance;
        
        if (dobInputValue && dobInputRef.current) {
            instance.masked = dobInputValue;
        }
      } else {
        console.error("Maska MaskInput could not be loaded.");
      }
    }
    return () => {
      maskaInstanceRef.current?.destroy();
      maskaInstanceRef.current = null;
    };
  }, [handleMaskaDetail, dobInputValue]); // Added dobInputValue dependency

  useEffect(() => {
    const subscription = form.watch((currentRHFValues) => {
      updateFormData({
        name: currentRHFValues.name,
        emailOrPhone: currentRHFValues.emailOrPhone,
        // Ensure dob is stored in yyyy-MM-dd format (Gregorian) for consistency
        dob: currentRHFValues.dob ? formatGregorian(currentRHFValues.dob, 'yyyy-MM-dd') : undefined,
        password: currentRHFValues.password,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  useEffect(() => {
    onValidation(form.formState.isValid);
  }, [form.formState.isValid, onValidation]);

  const minDateForPicker = React.useMemo(() => {
    let dateStr = '1900/01/01';
    let parseFn = parseGregorianOriginal;
    let isValidFn = isValidGregorianDateOriginal;
    let currentLocale = undefined;

    if (isFarsi) {
        dateStr = '1279/01/01'; 
        parseFn = parseJalaliOriginal;
        isValidFn = isValidJalaliDateOriginal;
        currentLocale = faIRJalaliLocale;
    }
    
    const parsed = parseFn(dateStr, 'yyyy/MM/dd', new Date(), { locale: currentLocale });
    return isValidFn(parsed) ? parsed : new Date(1900, 0, 1);
  }, [isFarsi]);

  const maxDateForPicker = React.useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return today;
  }, []);


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
                render={({ field: rhfField, fieldState }) => { 
                    const { formItemId } = useFormField();
                    return (
                  <FormItem className="flex flex-col">
                    <FormLabel htmlFor={formItemId || "dob-input"}>{dictionary.dobLabel}</FormLabel>
                    <div className="relative flex items-center gap-x-2">
                      <input
                        type="text"
                        id={formItemId || "dob-input"}
                        ref={dobInputRef} 
                        defaultValue={dobInputValue} // Use defaultValue as Maska controls the value
                        onBlur={rhfField.onBlur} 
                        placeholder={isFarsi ? dictionary.dobPlaceholderShamsi : dictionary.dobPlaceholderGregorian}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                            fieldState.error && "border-destructive"
                        )}
                        aria-invalid={!!fieldState.error}
                        aria-describedby={fieldState.error ? `${formItemId}-form-item-message` : undefined}
                      />
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon" type="button" className="shrink-0">
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            key={lang}
                            mode="single"
                            selected={rhfField.value ?? undefined} 
                            defaultMonth={rhfField.value || undefined}
                            onSelect={(date) => {
                              if (date) {
                                form.setValue('dob', date, { shouldValidate: true, shouldTouch: true });
                                const formattedDate = formatDate(date, dateFormatString, { locale: dateLocale });
                                if (maskaInstanceRef.current) {
                                  maskaInstanceRef.current.masked = formattedDate; 
                                } else {
                                    setDobInputValue(formattedDate); 
                                }
                              } else {
                                form.setValue('dob', null, { shouldValidate: true, shouldTouch: true });
                                if (maskaInstanceRef.current) {
                                  maskaInstanceRef.current.masked = '';
                                } else {
                                    setDobInputValue('');
                                }
                              }
                              setIsCalendarOpen(false);
                            }}
                            fromDate={minDateForPicker}
                            toDate={maxDateForPicker}
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={calendarMinYear} 
                            toYear={calendarMaxYear}   
                            locale={dateLocale} 
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                     {fieldState.isTouched && <FormMessage id={`${formItemId}-form-item-message`} />}
                  </FormItem>
                )}}
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
