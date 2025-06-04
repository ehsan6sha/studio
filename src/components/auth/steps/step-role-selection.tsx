
'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form'; // Removed Controller as it's not directly used here now
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button'; // No longer directly used for submit in this component
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SignupFormData } from '../signup-stepper';
import type { Locale } from '@/i18n-config';
// Icons like PlusCircle, Trash2 are moved to StepSharingPreferences

interface StepRoleSelectionProps {
  dictionary: any; // Should contain specific keys for this step e.g. dictionary.title, dictionary.descriptionAdult
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onValidation: (isValid: boolean) => void;
  lang: Locale;
}

type AdultRoleKey = 'parent' | 'therapist' | 'school_consultant' | 'supervisor';

// Schema for adult role selection only
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
      message: 'School code is required for School Consultant role.', // Will be localized by RHF via dictionary
      path: ['schoolCode'],
    });
  }
});


export function StepRoleSelection({ dictionary, formData, updateFormData, onValidation, lang }: StepRoleSelectionProps) {
  
  const adultForm = useForm<z.infer<typeof adultRoleSchema>>({
    resolver: zodResolver(adultRoleSchema),
    defaultValues: {
      adultRolesSelected: formData.adultRolesSelected || { parent: false, therapist: false, school_consultant: false, supervisor: false },
      clinicCode: formData.clinicCode || '',
      schoolCode: formData.schoolCode || '',
    },
    mode: 'onChange', // Validate on change for immediate feedback
  });
  
  // Sync form data changes to the parent stepper and manage validation status
  useEffect(() => {
    const subscription = adultForm.watch((value) => {
      const adultFormData = value as Partial<Pick<SignupFormData, 'adultRolesSelected' | 'clinicCode' | 'schoolCode'>>;
      updateFormData(adultFormData); 
      // Use a refined error message from dictionary if available for schoolCode
      const schoolCodeError = adultForm.formState.errors.schoolCode;
      if (schoolCodeError && dictionary.errors?.schoolCodeRequired) {
        // This is a bit manual; RHF usually handles this if schema messages are dynamic
        // For simplicity, we rely on RHF's default message or the schema's hardcoded one
      }
      onValidation(adultForm.formState.isValid);
    });
     // Initial validation check
    onValidation(adultForm.formState.isValid);
    return () => subscription.unsubscribe();
  }, [adultForm, updateFormData, onValidation, dictionary.errors]);


  const adultRolesDisplay = [
    { id: 'parent' as AdultRoleKey, label: dictionary.roles.parent },
    { id: 'therapist' as AdultRoleKey, label: dictionary.roles.therapist },
    { id: 'school_consultant' as AdultRoleKey, label: dictionary.roles.schoolConsultant },
    { id: 'supervisor' as AdultRoleKey, label: dictionary.roles.supervisor },
  ];

  // This component is only for adult role selection. Youth path is handled by StepSharingPreferences.
  // isYouth check should ideally be done in the parent (SignupStepper) to render the correct component.
  if (formData.isYouth === true) {
    // This component should not be rendered if user is youth.
    // Parent stepper should handle rendering StepSharingPreferences instead for youth at step 5.
    return null; 
  }
  
  if (formData.isYouth === null) {
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
            {dictionary.descriptionAdult} 
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-6">
          <Form {...adultForm}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6"> {/* No submit action here, parent handles it */}
              <FormItem className="space-y-3">
                <Label>{dictionary.selectRolesLabel}</Label>
                <div className="space-y-2">
                  {adultRolesDisplay.map((role) => (
                    <FormField
                      key={role.id}
                      control={adultForm.control}
                      name={`adultRolesSelected.${role.id}` as any} // Type assertion for dynamic name
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                              id={`role-${role.id}`}
                            />
                          </FormControl>
                          <Label htmlFor={`role-${role.id}`} className="font-normal">
                            {role.label}
                          </Label>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                {/* Display general error for roles if needed, though individual checkboxes don't typically show errors */}
                {/* <FormMessage /> */} 
              </FormItem>

              {adultForm.watch('adultRolesSelected.therapist') && (
                <FormField
                  control={adultForm.control}
                  name="clinicCode"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="clinicCode-input">{dictionary.clinicCodeLabel}</Label>
                      <FormControl>
                        <Input id="clinicCode-input" placeholder={dictionary.clinicCodePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {adultForm.watch('adultRolesSelected.school_consultant') && (
                <FormField
                  control={adultForm.control}
                  name="schoolCode"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="schoolCode-input">{dictionary.schoolCodeLabel}</Label>
                      <FormControl>
                        <Input id="schoolCode-input" placeholder={dictionary.schoolCodePlaceholder} {...field} />
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
