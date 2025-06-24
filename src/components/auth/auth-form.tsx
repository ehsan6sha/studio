
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context'; 

interface AuthFormProps {
  dictionary: any; 
  lang: Locale;
}

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.45H18.02C17.72 15.93 16.94 17.15 15.79 17.93V20.35H19.2C21.28 18.45 22.56 15.65 22.56 12.25Z" fill="#4285F4"/>
    <path d="M12 23C14.97 23 17.45 22.04 19.2 20.35L15.79 17.93C14.79 18.63 13.5 19.04 12 19.04C9.12 19.04 6.69 17.14 5.76 14.6H2.25V17.02C4.01 20.59 7.74 23 12 23Z" fill="#34A853"/>
    <path d="M5.76 14.6C5.56 14 5.46 13.37 5.46 12.7C5.46 12.03 5.56 11.4 5.76 10.8L2.25 8.38C1.45 9.98 1 11.28 1 12.7C1 14.12 1.45 15.42 2.25 17.02L5.76 14.6Z" fill="#FBBC05"/>
    <path d="M12 6.46C13.68 6.46 15.08 7.06 16.03 7.95L19.27 4.72C17.45 3.09 14.97 2 12 2C7.74 2 4.01 4.41 2.25 8.38L5.76 10.8C6.69 8.26 9.12 6.46 12 6.46Z" fill="#EA4335"/>
  </svg>
);


export function AuthForm({ dictionary, lang }: AuthFormProps) {
  const { toast } = useToast();
  const auth = useAuth(); 

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

    auth.login({ emailOrPhone: values.emailOrPhone, name: values.emailOrPhone }, lang); 
  }
  
  const handleGoogleSignIn = () => {
    auth.loginWithGoogle(lang);
  };

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
          <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
              <GoogleIcon />
              {dictionary.googleButton || 'Continue with Google'}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {dictionary.orSeparator || 'OR'}
                </span>
              </div>
            </div>
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
          </div>
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
