
'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import { Button } from '@/components/ui/button';
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

type AdultRoleKey = 'parent' | 'therapist' | 'school_consultant' | 'supervisor';
const adultRoleTypes: AdultRoleKey[] = ['parent', 'therapist', 'school_consultant', 'supervisor'];

type YouthConnectionRoleKey = 'parent' | 'therapist' | 'school_consultant' | 'supervisor';
const youthConnectionRoleTypes: YouthConnectionRoleKey[] = ['parent', 'therapist', 'school_consultant', 'supervisor'];


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
    connectedParentEmails: z.array(z.string().email({ message: dictionary.errors.invalidEmail })).optional(),
    connectedTherapistEmails: z.array(z.string().email({ message: dictionary.errors.invalidEmail })).optional(),
    connectedSchoolConsultantEmails: z.array(z.string().email({ message: dictionary.errors.invalidEmail })).optional(),
    connectedSupervisorEmails: z.array(z.string().email({ message: dictionary.errors.invalidEmail })).optional(),
  });

  const currentSchema = isYouth ? youthSchema : adultRoleSchema;

  const defaultValuesForForm = React.useMemo(() => {
    if (isYouth) {
      return {
        connectedParentEmails: formData.connectedParentEmails || [],
        connectedTherapistEmails: formData.connectedTherapistEmails || [],
        connectedSchoolConsultantEmails: formData.connectedSchoolConsultantEmails || [],
        connectedSupervisorEmails: formData.connectedSupervisorEmails || [],
      };
    } else {
      return {
        adultRolesSelected: formData.adultRolesSelected || { parent: false, therapist: false, school_consultant: false, supervisor: false },
        clinicCode: formData.clinicCode || '',
        schoolCode: formData.schoolCode || '',
      };
    }
  }, [isYouth, 
      formData.connectedParentEmails, formData.connectedTherapistEmails, formData.connectedSchoolConsultantEmails, formData.connectedSupervisorEmails,
      JSON.stringify(formData.adultRolesSelected), formData.clinicCode, formData.schoolCode
    ]);


  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: defaultValuesForForm as any, // Cast as any to handle schema switch
    mode: 'onChange',
  });
  
  // Setup field arrays for youth connections
  const parentEmailsFieldArray = useFieldArray({ control: form.control, name: "connectedParentEmails" as any });
  const therapistEmailsFieldArray = useFieldArray({ control: form.control, name: "connectedTherapistEmails" as any });
  const schoolConsultantEmailsFieldArray = useFieldArray({ control: form.control, name: "connectedSchoolConsultantEmails" as any });
  const supervisorEmailsFieldArray = useFieldArray({ control: form.control, name: "connectedSupervisorEmails" as any });

  const youthConnectionFieldArrays = {
    parent: parentEmailsFieldArray,
    therapist: therapistEmailsFieldArray,
    school_consultant: schoolConsultantEmailsFieldArray,
    supervisor: supervisorEmailsFieldArray,
  };


  useEffect(() => {
    if (isYouth === null || isYouth === undefined) return;
    form.reset(defaultValuesForForm as any, { keepValues: false }); // Reset form with new defaults when isYouth changes
    const timer = setTimeout(() => form.trigger(), 0); // Re-validate after reset
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYouth, form.reset, form.trigger]); // defaultValuesForForm will be stable due to its own useMemo


  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData(value as Partial<SignupFormData>);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  useEffect(() => {
    onValidation(form.formState.isValid);
  }, [form.formState.isValid, onValidation]);


  const adultRolesDisplay = [
    { id: 'parent' as AdultRoleKey, label: dictionary.roles.parent },
    { id: 'therapist' as AdultRoleKey, label: dictionary.roles.therapist },
    { id: 'school_consultant' as AdultRoleKey, label: dictionary.roles.schoolConsultant },
    { id: 'supervisor' as AdultRoleKey, label: dictionary.roles.supervisor },
  ];

  const youthConnectionRoleDetails: { key: YouthConnectionRoleKey; label: string; fieldArrayHelper: typeof parentEmailsFieldArray }[] = [
    { key: 'parent', label: dictionary.roles.parent, fieldArrayHelper: youthConnectionFieldArrays.parent },
    { key: 'therapist', label: dictionary.roles.therapist, fieldArrayHelper: youthConnectionFieldArrays.therapist },
    { key: 'school_consultant', label: dictionary.roles.schoolConsultant, fieldArrayHelper: youthConnectionFieldArrays.school_consultant },
    { key: 'supervisor', label: dictionary.roles.supervisor, fieldArrayHelper: youthConnectionFieldArrays.supervisor },
  ];


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
                  <p className="text-sm text-muted-foreground text-center">{dictionary.youthConnections.description}</p>
                  
                  {youthConnectionRoleDetails.map(({ key, label, fieldArrayHelper }) => (
                    <div key={key} className="space-y-3 p-3 border rounded-md">
                      <div className="flex justify-between items-center">
                        <h3 className="text-md font-semibold">
                          {dictionary.youthConnections.connectWithRoleLabel.replace('{roleName}', label)}
                        </h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => fieldArrayHelper.append('')}
                          aria-label={dictionary.youthConnections.addConnectionButtonLabel.replace('{roleName}', label)}
                        >
                          <PlusCircle className="h-5 w-5 text-primary" />
                        </Button>
                      </div>
                      {fieldArrayHelper.fields.map((field, index) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`connected${key.charAt(0).toUpperCase() + key.slice(1).replace('_c','C')}Emails.${index}` as any}
                          render={({ field: formField }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <Input 
                                    type="email" 
                                    placeholder={dictionary.youthConnections.emailPlaceholder} 
                                    {...formField} 
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => fieldArrayHelper.remove(index)}
                                  aria-label={dictionary.youthConnections.removeConnectionButtonLabel}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                      {fieldArrayHelper.fields.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">{lang === 'fa' ? 'ایمیلی اضافه نشده است.' : 'No emails added yet.'}</p>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.selectRolesLabel}</FormLabel>
                  <div className="space-y-2">
                    {adultRolesDisplay.map((role) => (
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
