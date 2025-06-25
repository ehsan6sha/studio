
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import type { Locale } from '@/i18n-config';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

interface AccessLevelCardProps {
  dictionary: any;
  lang: Locale;
}

export function AccessLevelCard({ dictionary, lang }: AccessLevelCardProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { toast } = useToast();

  const accessLevelRequestSchema = z.object({
    role: z.enum(['educational_institute_admin', 'clinic_admin', 'psychologist'], {
      required_error: dictionary.form.errors.roleRequired,
    }),
    documents: z.any()
      .refine((files) => files?.length >= 1, dictionary.form.errors.documentsRequired),
    notes: z.string().max(500).optional(),
  });

  const form = useForm<z.infer<typeof accessLevelRequestSchema>>({
    resolver: zodResolver(accessLevelRequestSchema),
    defaultValues: {
      notes: '',
    },
    mode: 'onChange',
  });

  const onSubmit = (values: z.infer<typeof accessLevelRequestSchema>) => {
    console.log("Access level request submitted:", values);
    toast({
      title: dictionary.requestSuccessTitle,
      description: dictionary.requestSuccessDescription,
    });
    form.reset();
    setSelectedRole(null);
    setIsSheetOpen(false);
  };
  
  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    form.setValue('role', value as any); // Set value for react-hook-form
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{dictionary.title}</CardTitle>
          <CardDescription>
            {dictionary.currentLevelLabel}: {dictionary.normal}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => setIsSheetOpen(true)}>
            {dictionary.requestChangeButton}
          </Button>
        </CardContent>
      </Card>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-lg max-h-[90vh] flex flex-col p-0">
          <SheetHeader className="text-center p-6 border-b">
            <SheetTitle>{dictionary.sheetTitle}</SheetTitle>
            <SheetDescription>{dictionary.sheetDescription}</SheetDescription>
          </SheetHeader>
          
          <div className="flex-grow overflow-y-auto p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <Label>{dictionary.form.roleLabel}</Label>
                      <Select onValueChange={handleRoleChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={dictionary.form.rolePlaceholder} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="educational_institute_admin">{dictionary.form.roles.educational_institute_admin}</SelectItem>
                          <SelectItem value="clinic_admin">{dictionary.form.roles.clinic_admin}</SelectItem>
                          <SelectItem value="psychologist">{dictionary.form.roles.psychologist}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedRole && (
                    <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground space-y-2">
                        <p><span className="font-semibold">{dictionary.form.documentsLabel}:</span> {dictionary.requirements[selectedRole]}</p>
                        <FormField
                            control={form.control}
                            name="documents"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input
                                        type="file"
                                        className="text-foreground file:text-foreground"
                                        onChange={(e) => field.onChange(e.target.files)}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
                
                <div className="text-xs text-muted-foreground p-3 border rounded-md">
                    <p className='font-bold'>{dictionary.invitationOnly.title}</p>
                    <p>{dictionary.invitationOnly.student}</p>
                    <p>{dictionary.invitationOnly.instructor}</p>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <Label>{dictionary.form.notesLabel}</Label>
                      <FormControl>
                        <Textarea
                          placeholder={dictionary.form.notesPlaceholder}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <p className="text-xs text-center text-muted-foreground">{dictionary.responseTime}</p>

                <SheetFooter className="sm:justify-between pt-4 gap-2">
                  <SheetClose asChild>
                      <Button type="button" variant="outline">{dictionary.form.cancelButton}</Button>
                  </SheetClose>
                  <Button type="submit" disabled={!form.formState.isValid}>{dictionary.form.submitButton}</Button>
                </SheetFooter>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
