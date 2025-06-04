
'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
    schoolCode: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.adultRolesSelected?.school_consultant && (!data.schoolCode || data.schoolCode.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: dictionary.errors.schoolCodeRequired,
        path: ['schoolCode'],
      });
    }
  });

  const youthSchema = z.object({
    connectedParentEmail: z.string().email({ message: dictionary.errors.invalidEmail }).optional().or(z.literal('')),
    connectedTherapistEmail: z.string().email({ message: dictionary.errors.invalidEmail }).optional().or(z.literal('')),
    connectedSchoolConsultantEmail: z.string().email({ message: dictionary.errors.invalidEmail }).optional().or(z.literal('')),
    connectedSupervisorEmail: z.string().email({ message: dictionary.errors.invalidEmail }).optional().or(z.literal('')),
  });

  const currentSchema = isYouth ? youthSchema : adultRoleSchema;

  // Memoize default values based on isYouth and initial formData state
  const defaultValuesForForm = React.useMemo(() => {
    if (isYouth) {
      return {
        connectedParentEmail: formData.connectedParentEmail || '',
        connectedTherapistEmail: formData.connectedTherapistEmail || '',
        connectedSchoolConsultantEmail: formData.connectedSchoolConsultantEmail || '',
        connectedSupervisorEmail: formData.connectedSupervisorEmail || '',
      };
    } else {
      return {
        adultRolesSelected: formData.adultRolesSelected || { parent: false, therapist: false, school_consultant: false, supervisor: false },
        clinicCode: formData.clinicCode || '',
        schoolCode: formData.schoolCode || '',
      };
    }
  }, [isYouth, 
      // These dependencies ensure defaultValues change only when isYouth changes,
      // or when these specific fields are initially different in formData.
      // This makes defaultValues more stable against echoes from this form's own updates.
      formData.connectedParentEmail, formData.connectedTherapistEmail, formData.connectedSchoolConsultantEmail, formData.connectedSupervisorEmail,
      JSON.stringify(formData.adultRolesSelected), formData.clinicCode, formData.schoolCode
    ]);


  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: defaultValuesForForm,
    mode: 'onChange',
  });

  // Effect to synchronize incoming formData prop changes to the form's state
  useEffect(() => {
    if (isYouth === null || isYouth === undefined) return;

    if (isYouth) {
        if (formData.connectedParentEmail !== form.getValues('connectedParentEmail')) {
            form.setValue('connectedParentEmail', formData.connectedParentEmail || '', { shouldValidate: true });
        }
        if (formData.connectedTherapistEmail !== form.getValues('connectedTherapistEmail')) {
            form.setValue('connectedTherapistEmail', formData.connectedTherapistEmail || '', { shouldValidate: true });
        }
        if (formData.connectedSchoolConsultantEmail !== form.getValues('connectedSchoolConsultantEmail')) {
            form.setValue('connectedSchoolConsultantEmail', formData.connectedSchoolConsultantEmail || '', { shouldValidate: true });
        }
        if (formData.connectedSupervisorEmail !== form.getValues('connectedSupervisorEmail')) {
            form.setValue('connectedSupervisorEmail', formData.connectedSupervisorEmail || '', { shouldValidate: true });
        }
    } else {
        const currentFormAdultRoles = form.getValues('adultRolesSelected');
        const propAdultRoles = formData.adultRolesSelected || { parent: false, therapist: false, school_consultant: false, supervisor: false };
        if (JSON.stringify(propAdultRoles) !== JSON.stringify(currentFormAdultRoles)) {
            form.setValue('adultRolesSelected', propAdultRoles, { shouldValidate: true });
        }
        if (formData.clinicCode !== form.getValues('clinicCode')) {
            form.setValue('clinicCode', formData.clinicCode || '', { shouldValidate: true });
        }
        if (formData.schoolCode !== form.getValues('schoolCode')) {
            form.setValue('schoolCode', formData.schoolCode || '', { shouldValidate: true });
        }
    }
  }, [
      formData.adultRolesSelected, formData.clinicCode, formData.schoolCode,
      formData.connectedParentEmail, formData.connectedTherapistEmail,
      formData.connectedSchoolConsultantEmail, formData.connectedSupervisorEmail,
      isYouth, form // form object includes setValue and getValues
    ]);


  // Effect for watching form changes to update parent formData
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData(value as Partial<SignupFormData>);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  // Effect for propagating form validity to the parent
  useEffect(() => {
    onValidation(form.formState.isValid);
  }, [form.formState.isValid, onValidation]);

  // Effect to trigger validation upon form instance change (due to key prop related to isYouth)
  useEffect(() => {
    const timer = setTimeout(() => {
      form.trigger();
    }, 0);
    return () => clearTimeout(timer);
  }, [form]);


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
    <div key={isYouth ? 'youth-form' : 'adult-form'} className="h-full flex flex-col">
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
                      name={fieldInfo.name as any}
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
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.selectRolesLabel}</FormLabel>
                  <div className="space-y-2">
                    {adultRoles.map((role) => (
                      <FormField
                        key={role.id}
                        control={form.control}
                        name={`adultRolesSelected.${role.id}` as any}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                              <Checkbox
                                checked={!!field.value}
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
                   <FormMessage />
                </FormItem>
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
                  name="schoolCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.schoolCodeLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={dictionary.schoolCodePlaceholder} {...field} />
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
