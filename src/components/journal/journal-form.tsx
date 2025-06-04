'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Locale } from '@/i18n-config';
// import { summarizeJournalEntry } from '@/ai/flows/summarize-journal-entry'; // Placeholder for AI call

interface JournalFormProps {
  dictionary: {
    formTitle: string;
    moodLabel: string;
    moodOptions: Record<string, string>;
    sleepLabel: string;
    consumptionLabel: string;
    entryLabel: string;
    submitButton: string;
    journalSavedSuccess: string;
  };
  lang: Locale;
}

export function JournalForm({ dictionary, lang }: JournalFormProps) {
  const { toast } = useToast();

  const formSchema = z.object({
    mood: z.string().min(1, { message: lang === 'fa' ? "لطفا حال خود را انتخاب کنید." : "Please select your mood." }),
    sleepQuality: z.array(z.number().min(1).max(5)).length(1),
    consumptionHabits: z.string().optional(),
    journalEntry: z.string().min(10, { message: lang === 'fa' ? "یادداشت باید حداقل ۱۰ کاراکتر باشد." : "Entry must be at least 10 characters." }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: '',
      sleepQuality: [3],
      consumptionHabits: '',
      journalEntry: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Placeholder for saving data and calling AI
    // Example: const summary = await summarizeJournalEntry({ journalEntry: values.journalEntry });
    // console.log('AI Summary:', summary);
    toast({
      title: dictionary.journalSavedSuccess,
      description: lang === 'fa' ? `یادداشت شما برای ${new Date().toLocaleDateString('fa-IR')} ثبت شد.` : `Your entry for ${new Date().toLocaleDateString('en-US')} was saved.`,
    });
    form.reset();
  }

  const moodOptions = [
    { value: "excellent", label: dictionary.moodOptions.excellent },
    { value: "good", label: dictionary.moodOptions.good },
    { value: "average", label: dictionary.moodOptions.average },
    { value: "bad", label: dictionary.moodOptions.bad },
    { value: "very_bad", label: dictionary.moodOptions.very_bad },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center">{dictionary.formTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.moodLabel}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={lang === 'fa' ? 'انتخاب کنید...' : 'Select...'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {moodOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sleepQuality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.sleepLabel}</FormLabel>
                  <FormControl>
                    <Slider
                      defaultValue={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      max={5}
                      min={1}
                      step={1}
                      className="py-2"
                      dir={lang === 'fa' ? 'rtl' : 'ltr'}
                    />
                  </FormControl>
                   <FormDescription className="text-center">
                    {field.value ? field.value[0] : '3'} / 5
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="consumptionHabits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.consumptionLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={lang === 'fa' ? "مثال: قهوه، شیرینی..." : "e.g., Coffee, Sweets..."} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="journalEntry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.entryLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={lang === 'fa' ? "افکار و احساسات خود را اینجا بنویسید..." : "Write your thoughts and feelings here..."}
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">{dictionary.submitButton}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
