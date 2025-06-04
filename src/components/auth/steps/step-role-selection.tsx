
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SignupFormData } from '../signup-stepper';
import type { Locale } from '@/i18n-config';
import { PlusCircle, Trash2 } from 'lucide-react';

interface StepRoleSelectionProps {
  dictionary: any; 
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onValidation: (isValid: boolean) => void;
  lang: Locale;
}

export function StepRoleSelection({ dictionary, formData, updateFormData, onValidation, lang }: StepRoleSelectionProps) {
  const { isYouth } = formData;

  const adultRoleSchema = z.object({
    adultRolesSelected: z.object({
      parent: z.boolean().optional(),
      therapist: z.boolean().optional(),
      school_consultant: z.boolean().optional(),
      supervisor: z.boolean().optional(),
    }).optional(),
    clinicCode: z.string().optional(),
    schoolName: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.adultRolesSelected?.therapist && (!data.clinicCode || data.clinicCode.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: dictionary.errors.clinicCodeRequired,
        path: ['clinicCode'],
      });
    }
    if (data.adultRolesSelected?.school_consultant && (!data.schoolName || data.schoolName.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: dictionary.errors.schoolNameRequired,
        path: ['schoolName'],
      });
    }
  });
  
  const youthSchema = z.object({
    // For youth, adultRolesSelected is not relevant for their own role.
    // selectedRole might be implicitly 'youth_self' or not needed if isYouth flag is the primary determinant.
    connectedParentEmail: z.string().email({ message: dictionary.errors.invalidEmail }).optional().or(z.literal('')),
    connectedTherapistEmail: z.string().email({ message: dictionary.errors.invalidEmail }).optional().or(z.literal('')),
    connectedSchoolConsultantEmail: z.string().email({ message: dictionary.errors.invalidEmail }).optional().or(z.literal('')),
    connectedSupervisorEmail: z.string().email({ message: dictionary.errors.invalidEmail }).optional().or(z.literal('')),
  });

  const currentSchema = isYouth ? youthSchema : adultRoleSchema;

  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      adultRolesSelected: formData.adultRolesSelected || { parent: false, therapist: false, school_consultant: false, supervisor: false },
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
    form.reset({
      adultRolesSelected: formData.adultRolesSelected || { parent: false, therapist: false, school_consultant: false, supervisor: false },
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
  
  useEffect(() => {
    const timer = setTimeout(() => form.trigger(), 0);
    return () => clearTimeout(timer);
  }, [form.trigger, isYouth]);


  const adultRoles = [
    { id: 'parent', label: dictionary.roles.parent },
    { id: 'therapist', label: dictionary.roles.therapist },
    { id: 'school_consultant', label: dictionary.roles.schoolConsultant },
    { id: 'supervisor', label: dictionary.roles.supervisor },
  ] as const;

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
                // Adult Role Selection with Checkboxes
                <FormField
                  control={form.control}
                  name="adultRolesSelected" // This name might need adjustment depending on how RHF handles object of booleans for checkboxes
                  render={() => ( // Render prop might not be needed directly on FormField for group
                    <FormItem className="space-y-3">
                      <FormLabel>{dictionary.selectRolesLabel}</FormLabel> {/* Updated label */}
                      <div className="space-y-2">
                        {adultRoles.map((role) => (
                          <FormField
                            key={role.id}
                            control={form.control}
                            name={`adultRolesSelected.${role.id}`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {role.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage /> {/* For errors related to the group, if any */}
                    </FormItem>
                  )}
                />
              )}

              {!isYouth && form.watch('adultRolesSelected.therapist') && (
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

              {!isYouth && form.watch('adultRolesSelected.school_consultant') && (
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
