
'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import type { SignupFormData, YouthConnection } from '../signup-stepper';
import type { Locale } from '@/i18n-config';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StepRoleSelectionProps {
  dictionary: any;
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onValidation: (isValid: boolean) => void;
  lang: Locale;
}

type AdultRoleKey = 'parent' | 'therapist' | 'school_consultant' | 'supervisor';

// Schema for the adult role selection part
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
      message: 'School code is required for School Consultant role.', // Placeholder, will be localized
      path: ['schoolCode'],
    });
  }
});

// Schema for the youth connection dialog form
const youthConnectionDialogSchema = z.object({
  contact: z.string().min(1, { message: "Contact is required." }) // Placeholder
    .refine(value => /^(?:\S+@\S+\.\S+)|(?:\+?[0-9\s-]{7,15})$/.test(value), {
      message: "Invalid email or phone format.", // Placeholder
    }),
  permissions: z.object({
    basicInformation: z.boolean().optional(),
    dailyQuizResults: z.boolean().optional(),
    biometricReports: z.boolean().optional(),
    testResults: z.boolean().optional(),
    syncedInformation: z.boolean().optional(),
  }).refine(data => Object.values(data).some(value => value === true), {
    message: "Select at least one permission.", // Placeholder
    path: ['basicInformation'], // Assign error to a specific field or a general one
  }),
});
type YouthConnectionDialogData = z.infer<typeof youthConnectionDialogSchema>;


export function StepRoleSelection({ dictionary, formData, updateFormData, onValidation, lang }: StepRoleSelectionProps) {
  const { isYouth } = formData;
  const [isShareDialogVisible, setIsShareDialogVisible] = useState(false);

  const adultForm = useForm<z.infer<typeof adultRoleSchema>>({
    resolver: zodResolver(adultRoleSchema),
    defaultValues: {
      adultRolesSelected: formData.adultRolesSelected || { parent: false, therapist: false, school_consultant: false, supervisor: false },
      clinicCode: formData.clinicCode || '',
      schoolCode: formData.schoolCode || '',
    },
    mode: 'onChange',
  });

  const dialogForm = useForm<YouthConnectionDialogData>({
    resolver: zodResolver(youthConnectionDialogSchema.extend({
      contact: z.string()
        .min(1, { message: dictionary.youthConnections.errorContactRequired || "Contact is required." })
        .refine(value => /^(?:\S+@\S+\.\S+)|(?:\+?[0-9\s-]{7,15})$/.test(value), {
          message: dictionary.youthConnections.errorInvalidContact || "Invalid email or phone format.",
        }),
      permissions: z.object({
        basicInformation: z.boolean().optional(),
        dailyQuizResults: z.boolean().optional(),
        biometricReports: z.boolean().optional(),
        testResults: z.boolean().optional(),
        syncedInformation: z.boolean().optional(),
      }).refine(data => Object.values(data).some(value => value === true), {
        message: dictionary.youthConnections.errorNoPermissionsSelected || "Select at least one permission.",
         path: ['basicInformation'],
      }),
    })),
    defaultValues: {
      contact: '',
      permissions: {
        basicInformation: false,
        dailyQuizResults: false,
        biometricReports: false,
        testResults: false,
        syncedInformation: false,
      },
    },
    mode: 'onChange',
  });


  useEffect(() => {
    if (isYouth) {
      onValidation(true); // Youth path is valid by default, sharing is optional
    } else {
      // For adults, validation depends on the adultForm
      const subscription = adultForm.watch((value, { name, type }) => {
        updateFormData(value as Partial<SignupFormData>);
        onValidation(adultForm.formState.isValid);
      });
      // Initial validation check for adult form
      onValidation(adultForm.formState.isValid);
      return () => subscription.unsubscribe();
    }
  }, [isYouth, adultForm, updateFormData, onValidation]);


  const adultRolesDisplay = [
    { id: 'parent' as AdultRoleKey, label: dictionary.roles.parent },
    { id: 'therapist' as AdultRoleKey, label: dictionary.roles.therapist },
    { id: 'school_consultant' as AdultRoleKey, label: dictionary.roles.schoolConsultant },
    { id: 'supervisor' as AdultRoleKey, label: dictionary.roles.supervisor },
  ];

  const permissionItems = [
    { id: 'basicInformation' as keyof YouthConnection['permissions'], label: dictionary.youthConnections.permissionBasicInformation },
    { id: 'dailyQuizResults' as keyof YouthConnection['permissions'], label: dictionary.youthConnections.permissionDailyQuizResults },
    { id: 'biometricReports' as keyof YouthConnection['permissions'], label: dictionary.youthConnections.permissionBiometricReports },
    { id: 'testResults' as keyof YouthConnection['permissions'], label: dictionary.youthConnections.permissionTestResults },
    { id: 'syncedInformation' as keyof YouthConnection['permissions'], label: dictionary.youthConnections.permissionSyncedInformation },
  ];

  const handleAddConnection = (data: YouthConnectionDialogData) => {
    const newConnection: YouthConnection = {
      id: Date.now().toString(), // Simple unique ID
      contact: data.contact,
      permissions: data.permissions,
    };
    const updatedConnections = [...(formData.youthConnections || []), newConnection];
    updateFormData({ youthConnections: updatedConnections });
    setIsShareDialogVisible(false);
    dialogForm.reset();
  };

  const handleRemoveConnection = (connectionId: string) => {
    const updatedConnections = (formData.youthConnections || []).filter(conn => conn.id !== connectionId);
    updateFormData({ youthConnections: updatedConnections });
  };

  const getPermissionsSummary = (permissions: YouthConnection['permissions']) => {
    const enabledPermissions = permissionItems
      .filter(item => permissions[item.id])
      .map(item => item.label);
    if (enabledPermissions.length === 0) return lang === 'fa' ? 'هیچ اجازه‌ای داده نشده' : 'No permissions granted';
    if (enabledPermissions.length === permissionItems.length) return lang === 'fa' ? 'همه موارد' : 'All items';
    return enabledPermissions.join(lang === 'fa' ? '، ' : ', ');
  };


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
          {isYouth ? (
            // Youth Path UI
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>{dictionary.youthConnections.shareWithLabel}</FormLabel>
                <Button variant="outline" size="icon" onClick={() => setIsShareDialogVisible(true)} aria-label={dictionary.youthConnections.addConnectionButton}>
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>

              {formData.youthConnections && formData.youthConnections.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-md font-semibold">{dictionary.youthConnections.sharedWithTitle}</h3>
                  <ScrollArea className="h-[200px] pr-3">
                    <div className="space-y-2">
                    {formData.youthConnections.map((conn) => (
                      <Card key={conn.id} className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{conn.contact}</p>
                            <p className="text-xs text-muted-foreground">
                                {dictionary.youthConnections.permissionsSummaryPrefix} {getPermissionsSummary(conn.permissions)}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveConnection(conn.id)} aria-label={dictionary.youthConnections.removeConnectionButtonLabel}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              {(!formData.youthConnections || formData.youthConnections.length === 0) && (
                 <p className="text-sm text-muted-foreground text-center py-4">{dictionary.youthConnections.noConnectionsYet}</p>
              )}

              <Dialog open={isShareDialogVisible} onOpenChange={setIsShareDialogVisible}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{dictionary.youthConnections.dialogTitle}</DialogTitle>
                  </DialogHeader>
                  <Form {...dialogForm}>
                    <form onSubmit={dialogForm.handleSubmit(handleAddConnection)} className="space-y-4 py-4">
                      <FormField
                        control={dialogForm.control}
                        name="contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dictionary.youthConnections.contactLabel}</FormLabel>
                            <FormControl>
                              <Input placeholder={dictionary.youthConnections.contactPlaceholder} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormItem>
                        <FormLabel>{dictionary.youthConnections.permissionsLabel}</FormLabel>
                        <ScrollArea className="h-[180px] pr-3 border rounded-md p-2 mt-1">
                        <div className="space-y-2">
                          {permissionItems.map(item => (
                            <FormField
                              key={item.id}
                              control={dialogForm.control}
                              name={`permissions.${item.id}` as any}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rtl:space-x-reverse">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-sm">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        </ScrollArea>
                         {dialogForm.formState.errors.permissions && (
                            <p className="text-sm font-medium text-destructive">
                                {dialogForm.formState.errors.permissions.message || (dialogForm.formState.errors.permissions as any)?.basicInformation?.message}
                            </p>
                        )}
                      </FormItem>
                       <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">{dictionary.youthConnections.dialogCancelButton}</Button>
                        </DialogClose>
                        <Button type="submit">{dictionary.youthConnections.dialogAddButton}</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

            </div>
          ) : (
            // Adult Path UI (using adultForm)
            <Form {...adultForm}>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.selectRolesLabel}</FormLabel>
                  <div className="space-y-2">
                    {adultRolesDisplay.map((role) => (
                      <FormField
                        key={role.id}
                        control={adultForm.control}
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

                {adultForm.watch('adultRolesSelected.therapist') && (
                  <FormField
                    control={adultForm.control}
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

                {adultForm.watch('adultRolesSelected.school_consultant') && (
                  <FormField
                    control={adultForm.control}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
