
'use client';

import * as React from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Locale } from '@/i18n-config';
import { DatePicker } from '@/components/ui/date-picker';

interface ProfileFormProps {
  dictionary: any;
  lang: Locale;
}

const ProfileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  dob: z.string().refine((val) => val === '' || !isNaN(Date.parse(val)), { // Allow empty string or valid date
    message: "Invalid date format."
  }).optional(),
});

export function ProfileForm({ dictionary, lang }: ProfileFormProps) {
  const { user, login } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ProfileFormSchema>>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      name: user?.name || '',
      dob: user?.dob || '',
    },
  });
  
  React.useEffect(() => {
    // Reset form with user data when it becomes available
    if (user) {
        form.reset({
            name: user.name || '',
            dob: user.dob || '',
        });
    }
  }, [user, form]);

  function onSubmit(values: z.infer<typeof ProfileFormSchema>) {
    // In a real app, you'd send this to your backend to update the user's profile.
    // For this prototype, we'll update the auth context state.
    const updatedUser = {
        name: values.name,
        dob: values.dob,
    };
    login(updatedUser, lang); // Using login to update the user state in the context
    
    toast({
      title: dictionary.saveSuccess,
    });
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>{dictionary.formTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.nameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.namePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormItem>
                <FormLabel>{dictionary.emailLabel}</FormLabel>
                <FormControl>
                    <Input readOnly disabled value={user?.emailOrPhone || ''} />
                </FormControl>
            </FormItem>
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{dictionary.dobLabel}</FormLabel>
                   <FormControl>
                     <DatePicker
                        lang={lang}
                        value={field.value}
                        onChange={field.onChange}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {dictionary.saveButton}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
