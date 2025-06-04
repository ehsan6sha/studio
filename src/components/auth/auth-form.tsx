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

interface AuthFormProps {
  type: 'login' | 'signup';
  dictionary: any; // specific dictionary slice for login/signup
  lang: Locale;
}

export function AuthForm({ type, dictionary, lang }: AuthFormProps) {
  const baseSchema = {
    emailOrPhone: z.string().min(1, { message: lang === 'fa' ? 'ایمیل یا شماره تلفن الزامی است' : 'Email or phone is required' }),
    password: z.string().min(6, { message: lang === 'fa' ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 characters' }),
  };

  const signupSchema = z.object({
    ...baseSchema,
    confirmPassword: z.string().min(6),
  }).refine((data) => data.password === data.confirmPassword, {
    message: lang === 'fa' ? 'رمزهای عبور یکسان نیستند' : "Passwords don't match",
    path: ['confirmPassword'],
  });

  const loginSchema = z.object(baseSchema);
  
  const formSchema = type === 'signup' ? signupSchema : loginSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
      ...(type === 'signup' && { confirmPassword: '' }),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Placeholder for actual authentication logic
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{dictionary.title}</CardTitle>
          <CardDescription>
            {type === 'login' ? (lang === 'fa' ? 'برای ادامه وارد شوید.' : 'Log in to continue.') 
                             : (lang === 'fa' ? 'برای شروع یک حساب کاربری ایجاد کنید.' : 'Create an account to get started.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="emailOrPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{type === 'login' ? dictionary.emailLabel : dictionary.emailLabel}</FormLabel> {/* Assuming emailLabel is generic */}
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
              {type === 'signup' && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.confirmPasswordLabel}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" className="w-full">
                {type === 'login' ? dictionary.loginButton : dictionary.signupButton}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          {type === 'login' ? (
            <>
              <span>{dictionary.noAccount}</span>
              <Button variant="link" asChild className="text-primary">
                <Link href={`/${lang}/signup`}>{dictionary.signupLink}</Link>
              </Button>
            </>
          ) : (
            <>
              <span>{dictionary.hasAccount}</span>
              <Button variant="link" asChild className="text-primary">
                <Link href={`/${lang}/login`}>{dictionary.loginLink}</Link>
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
