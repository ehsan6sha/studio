
'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { InputMask, type MaskEventDetail, type MaskEventHandler } from '@react-input/mask';

// Standard date-fns for English/Gregorian
import { format as formatGregorian, parse as parseGregorianOriginal, isValid as isValidGregorianDateOriginal, getYear as getYearGregorian } from 'date-fns';
import { faIR as faIRLocaleGregorian } from 'date-fns/locale/fa-IR'; 

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
        dateFormatString: 'yyyy/MM/dd', // Format used for display AND parsing from mask
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
      dateFormatString: 'yyyy/MM/dd', // Using a consistent format for display and parsing
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
    }).nullable(), // Allow null for incomplete/invalid typed input
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
    dob: formData.dob ? parseGregorianOriginal(formData.dob, 'yyyy-MM-dd', new Date()) : null,
    password: formData.password || '',
    confirmPassword: '', 
  }), [formData.name, formData.emailOrPhone, formData.dob, formData.password]);

  const form = useForm<z.infer<typeof UserInfoSchema>>({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange', 
  });
  
  const [dobInputValue, setDobInputValue] = useState<string>('');

  useEffect(() => {
    form.reset(defaultFormValues);
    const initialDobDate = defaultFormValues.dob;
    if (initialDobDate && isValidDate(initialDobDate)) {
      setDobInputValue(formatDate(initialDobDate, dateFormatString, { locale: dateLocale }));
    } else {
      setDobInputValue('');
    }
  }, [defaultFormValues, form, formatDate, dateFormatString, dateLocale, isValidDate]);

  useEffect(() => {
    const currentDob = form.getValues('dob');
    if (currentDob && isValidDate(currentDob)) {
      setDobInputValue(formatDate(currentDob, dateFormatString, { locale: dateLocale }));
    } else {
      // If not a valid date (e.g. after clearing or invalid parse), clear input string
      // only if it's not currently focused (to allow typing)
      if (document.activeElement?.id !== 'dob-input') {
         setDobInputValue('');
      }
    }
    const timerId = setTimeout(() => form.trigger(), 0);
    return () => clearTimeout(timerId);
  }, [lang, form, dateFormatString, dateLocale, formatDate, isValidDate]);


  const handleDobMaskedValueChange: MaskEventHandler = useCallback((event: CustomEvent<MaskEventDetail>) => {
    const { value, unmaskedValue, maskedValue } = event.detail;
    setDobInputValue(maskedValue); // Update the displayed input value with the mask

    let parsedInputDate: Date | null = null;
    if (unmaskedValue.length === 8) { // Assuming YYYYMMDD has 8 digits
      try {
        // Try parsing the maskedValue first as it has separators, more robust
        parsedInputDate = parseDateInput(maskedValue, dateFormatString, new Date(), { locale: dateLocale });
        if (!isValidDate(parsedInputDate)) {
            // Fallback to unmasked if masked didn't work (e.g. partial input)
            // This path is less likely to be hit if mask ensures format, but as a safeguard
            parsedInputDate = parseDateInput(unmaskedValue, 'yyyyMMdd', new Date(), {locale: dateLocale});
        }
      } catch {
        parsedInputDate = null;
      }
    }

    if (parsedInputDate && isValidDate(parsedInputDate)) {
      form.setValue('dob', parsedInputDate, { shouldValidate: true });
    } else {
      form.setValue('dob', null, { shouldValidate: true });
    }
  }, [form, parseDateInput, isValidDate, dateFormatString, dateLocale]);


  useEffect(() => {
    const subscription = form.watch((currentRHFValues, { name: changedFieldName }) => {
      updateFormData({
        name: currentRHFValues.name,
        emailOrPhone: currentRHFValues.emailOrPhone,
        dob: currentRHFValues.dob ? formatGregorian(currentRHFValues.dob, 'yyyy-MM-dd') : undefined,
        password: currentRHFValues.password,
      });
      
      // Sync from RHF (e.g. calendar selection) back to dobInputValue for display
      if (changedFieldName === 'dob') {
        const rhfDobDate = currentRHFValues.dob;
        if (rhfDobDate instanceof Date && isValidGregorianDateOriginal(rhfDobDate)) {
           const formattedDateFromRhf = formatDate(rhfDobDate, dateFormatString, { locale: dateLocale });
            if (dobInputValue !== formattedDateFromRhf) { // Prevent loop if already same
                setDobInputValue(formattedDateFromRhf); 
            }
        } else if (rhfDobDate === null && document.activeElement?.id !== 'dob-input') {
            // If RHF cleared DOB (and not currently typing), clear display input
            // setDobInputValue(''); // This might be too aggressive, let mask control display during typing
        }
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, updateFormData, formatGregorian, isValidGregorianDateOriginal, formatDate, isValidDate, dateLocale, dateFormatString /* Removed dobInputValue */]);


  useEffect(() => {
    onValidation(form.formState.isValid);
  }, [form.formState.isValid, onValidation]);


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
                      <InputMask
                        mask="____/__/__"
                        replacement={{ _: /\d/ }}
                        showMask
                        value={dobInputValue} // Controlled by local state for display
                        onMaskedValueChange={handleDobMaskedValueChange} // Use the custom handler
                      >
                        {({ ref: maskRef, ...inputPropsFromMask }) => {
                           const {children, ...safeInputProps} = inputPropsFromMask; // Exclude children
                           return (
                            <input
                                {...safeInputProps} // Spread props from mask library (value, onChange etc.)
                                ref={(el) => { // Combine refs
                                    maskRef(el);
                                    rhfField.ref(el);
                                }}
                                id={formItemId || "dob-input"}
                                onBlur={rhfField.onBlur}
                                placeholder={isFarsi ? dictionary.dobPlaceholderShamsi : dictionary.dobPlaceholderGregorian}
                                className={cn(
                                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                    fieldState.error && "border-destructive"
                                )}
                                aria-invalid={!!fieldState.error}
                                aria-describedby={fieldState.error ? `${formItemId}-form-item-message` : undefined}
                            />
                           );
                        }}
                      </InputMask>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon" type="button" className="shrink-0">
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={rhfField.value ?? undefined} 
                            onSelect={(date) => {
                              form.setValue('dob', date, { shouldValidate: true });
                              if (date && isValidDate(date)) {
                                setDobInputValue(formatDate(date, dateFormatString, { locale: dateLocale }));
                              } else {
                                setDobInputValue('');
                              }
                              setIsCalendarOpen(false);
                            }}
                            disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                        
                                const currentDateTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
                        
                                const minDateValue = isFarsi
                                ? parseDateInput('1279/01/01', 'yyyy/MM/dd', new Date()) 
                                : new Date("1900-01-01");
                                const minDateTimestamp = new Date(minDateValue.getFullYear(), minDateValue.getMonth(), minDateValue.getDate()).getTime();
                                
                                return currentDateTimestamp > today.getTime() || currentDateTimestamp < minDateTimestamp;
                            }}
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

