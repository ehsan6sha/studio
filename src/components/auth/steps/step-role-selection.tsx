
'use client';

import * as React from 'react';
import { useEffect } from 'react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SignupFormData } from '../signup-stepper';
import type { Locale } from '@/i18n-config';
import { PlusCircle, Trash2 } from 'lucide-react';

interface StepRoleSelectionProps {
  dictionary: any; // Contains translations for roles, labels, placeholders
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onValidation: (isValid: boolean) => void;
  lang: Locale;
}

export function StepRoleSelection({ dictionary, formData, updateFormData, onValidation, lang }: StepRoleSelectionProps) {
  const { isYouth } = formData;

  // Define Zod schemas based on whether the user is a youth or not
  const adultRoleSchema = z.object({
    selectedRole: z.string().min(1, { message: dictionary.errors.roleRequired }),
    clinicCode: z.string().optional(), // Optional for now, make required if role is therapist
    schoolName: z.string().optional(), // Optional, make required if role is school_consultant
  }).superRefine((data, ctx) => {
    if (data.selectedRole === 'therapist' && !data.clinicCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: dictionary.errors.clinicCodeRequired,
        path: ['clinicCode'],
      });
    }
    if (data.selectedRole === 'school_consultant' && !data.schoolName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: dictionary.errors.schoolNameRequired,
        path: ['schoolName'],
      });
    }
  });

  // Simplified schema for youth for now. Can be expanded.
  const youthSchema = z.object({
    selectedRole: z.literal('youth_self', { errorMap: () => ({ message: "Role must be youth" }) }),
    connectedParentEmail: z.string().email({ message: dictionary.errors.invalidEmail }).optional().or(z.literal('')),
    connectedTherapistEmail: z.string().email({ message: dictionary.errors.invalidEmail }).optional().or(z.literal('')),
    connectedSchoolConsultantEmail: z.string().email({ message: dictionary.errors.invalidEmail }).optional().or(z.literal('')),
    connectedSupervisorEmail: z.string().email({ message: dictionary.errors.invalidEmail }).optional().or(z.literal('')),
  });

  const currentSchema = isYouth ? youthSchema : adultRoleSchema;

  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      selectedRole: formData.selectedRole || (isYouth ? 'youth_self' : ''),
      clinicCode: formData.clinicCode || '',
      schoolName: formData.schoolName || '',
      connectedParentEmail: formData.connectedParentEmail || '',
      connectedTherapistEmail: formData.connectedTherapistEmail || '',
      connectedSchoolConsultantEmail: formData.connectedSchoolConsultantEmail || '',
      connectedSupervisorEmail: formData.connectedSupervisorEmail || '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    // Reset form with potentially new defaultValues if formData or isYouth changes
    // This also handles the initial load
    form.reset({
      selectedRole: formData.selectedRole || (isYouth ? 'youth_self' : ''),
      clinicCode: formData.clinicCode || '',
      schoolName: formData.schoolName || '',
      connectedParentEmail: formData.connectedParentEmail || '',
      connectedTherapistEmail: formData.connectedTherapistEmail || '',
      connectedSchoolConsultantEmail: formData.connectedSchoolConsultantEmail || '',
      connectedSupervisorEmail: formData.connectedSupervisorEmail || '',
    });
  }, [formData, isYouth, form.reset]);


  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData(value as Partial<SignupFormData>);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateFormData]);

  useEffect(() => {
    onValidation(form.formState.isValid);
  }, [form.formState.isValid, onValidation]);
  
  // Trigger validation on mount and when schema might change (due to isYouth)
  useEffect(() => {
    const timer = setTimeout(() => form.trigger(), 0);
    return () => clearTimeout(timer);
  }, [form.trigger, isYouth]);


  const adultRoles = [
    { value: 'parent', label: dictionary.roles.parent },
    { value: 'therapist', label: dictionary.roles.therapist },
    { value: 'school_consultant', label: dictionary.roles.schoolConsultant },
    { value: 'supervisor', label: dictionary.roles.supervisor },
  ];

  const youthConnectionFields = [
    { name: 'connectedParentEmail', label: dictionary.youthConnections.parentEmailLabel, placeholder: dictionary.youthConnections.emailPlaceholder },
    { name: 'connectedTherapistEmail', label: dictionary.youthConnections.therapistEmailLabel, placeholder: dictionary.youthConnections.emailPlaceholder },
    { name: 'connectedSchoolConsultantEmail', label: dictionary.youthConnections.schoolConsultantEmailLabel, placeholder: dictionary.youthConnections.emailPlaceholder },
    { name: 'connectedSupervisorEmail', label: dictionary.youthConnections.supervisorEmailLabel, placeholder: dictionary.youthConnections.emailPlaceholder },
  ] as const;


  if (isYouth === null || isYouth === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>{dictionary.loadingRoleInfo || "Loading role information..."}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="w-full shadow-none border-none flex-grow flex flex-col">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{dictionary.title}</CardTitle>
          <CardDescription>
            {isYouth ? dictionary.descriptionYouth : dictionary.descriptionAdult}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4 md:space-y-6">
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {isYouth ? (
                <>
                  <p className="text-center font-semibold">{dictionary.youthRoleDisplayLabel}: {dictionary.roles.youth}</p>
                  {/* Hidden field for youth_self role for schema validation */}
                  <input type="hidden" {...form.register("selectedRole")} value="youth_self" />

                  {youthConnectionFields.map(fieldInfo => (
                    <FormField
                      key={fieldInfo.name}
                      control={form.control}
                      name={fieldInfo.name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{fieldInfo.label}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={fieldInfo.placeholder} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </>
              ) : (
                // Adult Role Selection
                <FormField
                  control={form.control}
                  name="selectedRole"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>{dictionary.selectRoleLabel}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          {adultRoles.map((role) => (
                            <FormItem key={role.value} className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                              <FormControl>
                                <RadioGroupItem value={role.value} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {role.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Conditional fields for Adults */}
              {!isYouth && form.watch('selectedRole') === 'therapist' && (
                <FormField
                  control={form.control}
                  name="clinicCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.clinicCodeLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={dictionary.clinicCodePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {!isYouth && form.watch('selectedRole') === 'school_consultant' && (
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.schoolNameLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={dictionary.schoolNamePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
