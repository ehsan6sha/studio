
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
import { format, parse, isValid as isValidDate } from 'date-fns';
import { faIR } from 'date-fns/locale/fa-IR';
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
  
  const UserInfoSchema = z.object({
    name: z.string().min(1, { message: dictionary.errors.nameRequired }),
    emailOrPhone: z.string().min(1, { message: dictionary.errors.emailOrPhoneRequired })
      .refine(value => /^(?:\S+@\S+\.\S+)|(?:\+?[0-9\s-]{7,15})$/.test(value), {
        message: dictionary.errors.invalidEmailOrPhone,
      }),
    dob: z.date({
      // required_error: dictionary.errors.dobRequired, // Making DOB optional as per initial schema
      invalid_type_error: dictionary.errors.dobInvalid,
    }).optional().nullable(), // Allow null for when input is cleared or invalid
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
      dob: formData.dob ? parse(formData.dob, 'yyyy-MM-dd', new Date()) : undefined,
      password: formData.password || '',
      confirmPassword: '', // Always start confirmPassword empty
    },
    mode: 'onChange',
  });

  const [dobInputValue, setDobInputValue] = useState<string>(
    formData.dob ? format(parse(formData.dob, 'yyyy-MM-dd', new Date()), lang === 'fa' ? 'yyyy/MM/dd' : 'PPP', { locale: lang === 'fa' ? faIR : undefined }) : ''
  );

  useEffect(() => {
    const initialDob = formData.dob ? parse(formData.dob, 'yyyy-MM-dd', new Date()) : undefined;
    form.reset({
      name: formData.name || '',
      emailOrPhone: formData.emailOrPhone || '',
      dob: initialDob,
      password: formData.password || '',
      confirmPassword: '',
    });
    setDobInputValue(initialDob ? format(initialDob, lang === 'fa' ? 'yyyy/MM/dd' : 'PPP', { locale: lang === 'fa' ? faIR : undefined }) : '');
    
    const timerId = setTimeout(() => {
        onValidation(form.formState.isValid);
    }, 0);

    return () => clearTimeout(timerId);
  }, [formData, form, lang, onValidation]);


  useEffect(() => {
    const subscription = form.watch((currentValues) => {
      updateFormData({
        name: currentValues.name,
        emailOrPhone: currentValues.emailOrPhone,
        dob: currentValues.dob ? format(currentValues.dob, 'yyyy-MM-dd') : undefined,
        password: currentValues.password,
      });
      onValidation(form.formState.isValid);
      
      // Sync input display if RHF date changes (e.g. from calendar)
      if (currentValues.dob) {
        if (document.activeElement?.id !== 'dob-input') { // Avoid loop if user is typing
           setDobInputValue(format(currentValues.dob, lang === 'fa' ? 'yyyy/MM/dd' : 'PPP', { locale: lang === 'fa' ? faIR : undefined }));
        }
      } else if (document.activeElement?.id !== 'dob-input') {
         setDobInputValue('');
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData, onValidation, lang]);


  const handleDobInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = e.target.value;
    setDobInputValue(textValue);

    // Attempt to parse the date
    // For Farsi, user might type yyyy/MM/dd. For English, various formats.
    // `new Date(textValue)` is locale-dependent and might be unreliable.
    // For simplicity, we can try parsing common formats or expect YYYY-MM-DD
    let parsedDate: Date | null = null;
    if (lang === 'fa') {
        // Very basic parsing for yyyy/MM/dd - not robust for Jalali
        const parts = textValue.split('/');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) -1; // JS months are 0-indexed
            const day = parseInt(parts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                 // This still assumes Gregorian numbers typed in yyyy/MM/dd format
                const tempDate = new Date(year, month, day);
                if(isValidDate(tempDate) && tempDate.getFullYear() === year && tempDate.getMonth() === month && tempDate.getDate() === day){
                    parsedDate = tempDate;
                }
            }
        }
    } else {
         // Try parsing formats like YYYY-MM-DD, MM/DD/YYYY
        const tempDate = parse(textValue, 'P', new Date()); // Try 'P' (e.g. 01/15/1990)
        if (isValidDate(tempDate)) {
            parsedDate = tempDate;
        } else {
            const isoDate = parse(textValue, 'yyyy-MM-dd', new Date()); // Try YYYY-MM-DD
            if(isValidDate(isoDate)) parsedDate = isoDate;
        }
    }
    
    if (parsedDate && isValidDate(parsedDate)) {
      form.setValue('dob', parsedDate, { shouldValidate: true });
    } else {
      form.setValue('dob', null, { shouldValidate: true }); // Set to null if parsing fails
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
                          placeholder={lang === 'fa' ? 'مثال: ۱۳۷۰/۰۱/۱۵ (تاریخ میلادی)' : 'YYYY-MM-DD'}
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
                            selected={field.value ?? undefined} // Pass undefined if null
                            onSelect={(date) => {
                              form.setValue('dob', date, { shouldValidate: true });
                              if (date) {
                                setDobInputValue(format(date, lang === 'fa' ? 'yyyy/MM/dd' : 'PPP', { locale: lang === 'fa' ? faIR : undefined }));
                              } else {
                                setDobInputValue('');
                              }
                              setIsCalendarOpen(false); // Close calendar on select
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            locale={lang === 'fa' ? faIR : undefined}
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
