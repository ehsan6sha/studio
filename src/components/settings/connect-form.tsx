
'use client';

import * as React from 'react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import type { Locale } from '@/i18n-config';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Connection {
  id: string;
  contact: string;
  permissions: {
    basicInformation: boolean;
    dailyQuizResults: boolean;
    biometricReports: boolean;
    testResults: boolean;
    syncedInformation: boolean;
    othersNotes: boolean;
  };
}

type ConnectionDialogData = Omit<Connection, 'id'>;

interface ConnectFormProps {
  dictionary: any;
  lang: Locale;
}

const CONNECTION_STORAGE_KEY = 'hami-connections';

export function ConnectForm({ dictionary, lang }: ConnectFormProps) {
  const [connections, setConnections] = React.useState<Connection[]>([]);
  const [isShareDialogVisible, setIsShareDialogVisible] = React.useState(false);

  React.useEffect(() => {
    const storedConnections = localStorage.getItem(CONNECTION_STORAGE_KEY);
    if (storedConnections) {
      setConnections(JSON.parse(storedConnections));
    }
  }, []);

  const updateConnections = (newConnections: Connection[]) => {
    setConnections(newConnections);
    localStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(newConnections));
  };
  
  const currentYouthConnectionDialogSchema = React.useMemo(() => {
    return z.object({
        contact: z.string()
            .min(1, { message: dictionary.errorContactRequired || "Contact is required." })
            .refine(value => /^(?:\S+@\S+\.\S+)|(?:\+?[0-9\s-]{7,15})$/.test(value), {
                message: dictionary.errorInvalidContact || "Invalid email or phone format.",
            }),
        permissions: z.object({
            basicInformation: z.boolean().optional(),
            dailyQuizResults: z.boolean().optional(),
            biometricReports: z.boolean().optional(),
            testResults: z.boolean().optional(),
            syncedInformation: z.boolean().optional(),
            othersNotes: z.boolean().optional(),
        }).refine(data => Object.values(data).some(value => value === true), {
            message: dictionary.errorNoPermissionsSelected || "Select at least one permission.",
            path: ['basicInformation'], 
        }),
    });
  }, [dictionary]);

  const dialogForm = useForm<ConnectionDialogData>({
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
    { id: 'basicInformation' as keyof Connection['permissions'], label: dictionary.permissionBasicInformation },
    { id: 'dailyQuizResults' as keyof Connection['permissions'], label: dictionary.permissionDailyQuizResults },
    { id: 'biometricReports' as keyof Connection['permissions'], label: dictionary.permissionBiometricReports },
    { id: 'testResults' as keyof Connection['permissions'], label: dictionary.permissionTestResults },
    { id: 'syncedInformation' as keyof Connection['permissions'], label: dictionary.permissionSyncedInformation },
    { id: 'othersNotes' as keyof Connection['permissions'], label: dictionary.permissionOthersNotes },
  ], [dictionary]);

  const handleAddConnection = (data: ConnectionDialogData) => {
    const newConnection: Connection = {
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
    const updatedConnections = [...connections, newConnection];
    updateConnections(updatedConnections);
    setIsShareDialogVisible(false);
    dialogForm.reset();
  };

  const handleRemoveConnection = (connectionId: string) => {
    const updatedConnections = connections.filter(conn => conn.id !== connectionId);
    updateConnections(updatedConnections);
  };

  const getPermissionsSummary = (permissions: Connection['permissions']) => {
    const enabledPermissions = permissionItems
      .filter(item => permissions[item.id])
      .map(item => item.label);
    if (enabledPermissions.length === 0) return lang === 'fa' ? 'هیچ اجازه‌ای داده نشده' : 'No permissions granted';
    if (enabledPermissions.length === permissionItems.length) return lang === 'fa' ? 'همه موارد' : 'All items';
    return enabledPermissions.join(lang === 'fa' ? '، ' : ', ');
  };

  return (
    <Card className="shadow-lg">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{dictionary.shareWithLabel}</Label>
          <Button variant="outline" size="sm" onClick={() => setIsShareDialogVisible(true)}>
            <PlusCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {dictionary.addConnectionButton}
          </Button>
        </div>

        {connections && connections.length > 0 ? (
          <div className="space-y-3 pt-4">
            <h3 className="text-md font-semibold">{dictionary.sharedWithTitle}</h3>
            <ScrollArea className="h-[250px] pr-3">
              <div className="space-y-2">
              {connections.map((conn) => (
                <Card key={conn.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{conn.contact}</p>
                      <p className="text-xs text-muted-foreground">
                          {dictionary.permissionsSummaryPrefix} {getPermissionsSummary(conn.permissions)}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveConnection(conn.id)} aria-label={dictionary.removeConnectionButtonLabel}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
           <p className="text-sm text-muted-foreground text-center py-4">{dictionary.noConnectionsYet}</p>
        )}
      </div>

      <Dialog open={isShareDialogVisible} onOpenChange={setIsShareDialogVisible}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dictionary.dialogTitle}</DialogTitle>
          </DialogHeader>
          <Form {...dialogForm}>
            <form onSubmit={dialogForm.handleSubmit(handleAddConnection)} className="space-y-4 py-4">
              <FormField
                control={dialogForm.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="dialog-contact-input">{dictionary.contactLabel}</Label>
                    <FormControl>
                      <Input id="dialog-contact-input" placeholder={dictionary.contactPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <Label>{dictionary.permissionsLabel}</Label>
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
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                              id={`perm-${item.id}`}
                            />
                          </FormControl>
                          <Label htmlFor={`perm-${item.id}`} className="font-normal text-sm cursor-pointer">
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
                        {(dialogForm.formState.errors.permissions as any)?.message || (dialogForm.formState.errors.permissions as any)?.basicInformation?.message}
                    </p>
                )}
              </FormItem>
               <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline">{dictionary.dialogCancelButton}</Button>
                </DialogClose>
                <Button type="submit">{dictionary.dialogAddButton}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </CardContent>
    </Card>
  );
}
