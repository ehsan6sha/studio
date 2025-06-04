
'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label'; // Use plain Label
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import type { SignupFormData, YouthConnection } from '../signup-stepper';
import type { Locale } from '@/i18n-config';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StepSharingPreferencesProps {
  dictionary: any; // e.g., dictionary.title, dictionary.description, dictionary.sharingConnections.*
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onValidation: (isValid: boolean) => void;
  lang: Locale;
}

const youthConnectionDialogSchemaBase = z.object({
  contact: z.string(), 
  permissions: z.object({
    basicInformation: z.boolean().optional(),
    dailyQuizResults: z.boolean().optional(),
    biometricReports: z.boolean().optional(),
    testResults: z.boolean().optional(),
    syncedInformation: z.boolean().optional(),
    othersNotes: z.boolean().optional(),
  })
});
type YouthConnectionDialogData = z.infer<typeof youthConnectionDialogSchemaBase>;


export function StepSharingPreferences({ dictionary, formData, updateFormData, onValidation, lang }: StepSharingPreferencesProps) {
  const [isShareDialogVisible, setIsShareDialogVisible] = useState(false);

  // Validation is always true for this step as sharing is optional
  useEffect(() => {
    onValidation(true);
  }, [onValidation]);
  
  const currentYouthConnectionDialogSchema = React.useMemo(() => {
    return youthConnectionDialogSchemaBase.extend({
        contact: z.string()
            .min(1, { message: dictionary.sharingConnections.errorContactRequired || "Contact is required." })
            .refine(value => /^(?:\S+@\S+\.\S+)|(?:\+?[0-9\s-]{7,15})$/.test(value), {
                message: dictionary.sharingConnections.errorInvalidContact || "Invalid email or phone format.",
            }),
        permissions: z.object({
            basicInformation: z.boolean().optional(),
            dailyQuizResults: z.boolean().optional(),
            biometricReports: z.boolean().optional(),
            testResults: z.boolean().optional(),
            syncedInformation: z.boolean().optional(),
            othersNotes: z.boolean().optional(),
        }).refine(data => Object.values(data).some(value => value === true), {
            message: dictionary.sharingConnections.errorNoPermissionsSelected || "Select at least one permission.",
            path: ['basicInformation'], 
        }),
    });
  }, [dictionary.sharingConnections]);


  const dialogForm = useForm<YouthConnectionDialogData>({
    resolver: zodResolver(currentYouthConnectionDialogSchema),
    defaultValues: {
      contact: '',
      permissions: {
        basicInformation: false,
        dailyQuizResults: false,
        biometricReports: false,
        testResults: false,
        syncedInformation: false,
        othersNotes: false,
      },
    },
    mode: 'onChange',
  });

  const permissionItems = React.useMemo(() => [
    { id: 'basicInformation' as keyof YouthConnection['permissions'], label: dictionary.sharingConnections.permissionBasicInformation },
    { id: 'dailyQuizResults' as keyof YouthConnection['permissions'], label: dictionary.sharingConnections.permissionDailyQuizResults },
    { id: 'biometricReports' as keyof YouthConnection['permissions'], label: dictionary.sharingConnections.permissionBiometricReports },
    { id: 'testResults' as keyof YouthConnection['permissions'], label: dictionary.sharingConnections.permissionTestResults },
    { id: 'syncedInformation' as keyof YouthConnection['permissions'], label: dictionary.sharingConnections.permissionSyncedInformation },
    { id: 'othersNotes' as keyof YouthConnection['permissions'], label: dictionary.sharingConnections.permissionOthersNotes },
  ], [dictionary.sharingConnections]);

  const handleAddConnection = (data: YouthConnectionDialogData) => {
    const newConnection: YouthConnection = {
      id: Date.now().toString(), 
      contact: data.contact,
      permissions: { 
        basicInformation: data.permissions.basicInformation || false,
        dailyQuizResults: data.permissions.dailyQuizResults || false,
        biometricReports: data.permissions.biometricReports || false,
        testResults: data.permissions.testResults || false,
        syncedInformation: data.permissions.syncedInformation || false,
        othersNotes: data.permissions.othersNotes || false,
      },
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

  return (
    <div className="h-full flex flex-col">
      <Card className="w-full shadow-none border-none flex-grow flex flex-col">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{dictionary.title}</CardTitle>
          <CardDescription>{dictionary.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{dictionary.sharingConnections.shareWithLabel}</Label>
              <Button variant="outline" size="icon" onClick={() => setIsShareDialogVisible(true)} aria-label={dictionary.sharingConnections.addConnectionButton}>
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>

            {formData.youthConnections && formData.youthConnections.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-md font-semibold">{dictionary.sharingConnections.sharedWithTitle}</h3>
                <ScrollArea className="h-[200px] pr-3"> {/* Adjust height as needed */}
                  <div className="space-y-2">
                  {formData.youthConnections.map((conn) => (
                    <Card key={conn.id} className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{conn.contact}</p>
                          <p className="text-xs text-muted-foreground">
                              {dictionary.sharingConnections.permissionsSummaryPrefix} {getPermissionsSummary(conn.permissions)}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveConnection(conn.id)} aria-label={dictionary.sharingConnections.removeConnectionButtonLabel}>
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
               <p className="text-sm text-muted-foreground text-center py-4">{dictionary.sharingConnections.noConnectionsYet}</p>
            )}
          </div>

          <Dialog open={isShareDialogVisible} onOpenChange={setIsShareDialogVisible}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{dictionary.sharingConnections.dialogTitle}</DialogTitle>
              </DialogHeader>
              <Form {...dialogForm}>
                <form onSubmit={dialogForm.handleSubmit(handleAddConnection)} className="space-y-4 py-4">
                  <FormField
                    control={dialogForm.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="dialog-contact-input">{dictionary.sharingConnections.contactLabel}</Label>
                        <FormControl>
                          <Input id="dialog-contact-input" placeholder={dictionary.sharingConnections.contactPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <Label>{dictionary.sharingConnections.permissionsLabel}</Label>
                    <ScrollArea className="h-[210px] pr-3 border rounded-md p-2 mt-1">
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
                                  checked={!!field.value} // Ensure boolean
                                  onCheckedChange={field.onChange}
                                  id={`perm-${item.id}`}
                                />
                              </FormControl>
                              <Label htmlFor={`perm-${item.id}`} className="font-normal text-sm">
                                {item.label}
                              </Label>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    </ScrollArea>
                     {dialogForm.formState.errors.permissions && (
                        <p className="text-sm font-medium text-destructive pt-1">
                            {dialogForm.formState.errors.permissions.message || (dialogForm.formState.errors.permissions as any)?.basicInformation?.message}
                        </p>
                    )}
                  </FormItem>
                   <DialogFooter className="pt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">{dictionary.sharingConnections.dialogCancelButton}</Button>
                    </DialogClose>
                    <Button type="submit">{dictionary.sharingConnections.dialogAddButton}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
