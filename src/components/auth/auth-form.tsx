
'use client';

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import type { Locale } from '@/i18n-config';
// import { useRouter } from 'next/navigation'; // No longer needed directly
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context'; // Added useAuth

interface AuthFormProps {
  dictionary: any; 
  lang: Locale;
}

export function AuthForm({ dictionary, lang }: AuthFormProps) {
  // const router = useRouter(); // Replaced by auth context redirect
  const { toast } = useToast();
  const auth = useAuth(); // Use auth context

  const loginSchema = z.object({
    emailOrPhone: z.string().min(1, { message: lang === 'fa' ? 'ایمیل یا شماره تلفن الزامی است' : 'Email or phone is required' }),
    password: z.string().min(6, { message: lang === 'fa' ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 characters' }),
  });
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    console.log('Login Form submitted with values:', values);
    
    toast({ 
        title: dictionary.loginSuccessTitle || 'Login Successful!', 
        description: dictionary.loginSuccessDescription || 'Redirecting to dashboard...' 
    });

    // Call auth.login to set state and handle redirect
    auth.login({ emailOrPhone: values.emailOrPhone, name: values.emailOrPhone }, lang); // Using emailOrPhone as name placeholder
  }

  return (
    <div className="flex flex-col items-center justify-center flex-grow py-6 md:py-12 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl md:text-2xl font-headline">{dictionary.title}</CardTitle>
          <CardDescription>
            {lang === 'fa' ? 'برای ادامه وارد شوید.' : 'Log in to continue.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
              <FormField
                control={form.control}
                name="emailOrPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.emailLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={lang === 'fa' ? 'ایمیل یا شماره تلفن' : 'Email or Phone Number'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.passwordLabel}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {dictionary.loginButton}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
            <>
              <span>{dictionary.noAccount}</span>
              <Button variant="link" asChild className="text-primary">
                <Link href={`/${lang}/signup`}>{dictionary.signupLink}</Link>
              </Button>
            </>
        </CardFooter>
      </Card>
    </div>
  );
}
