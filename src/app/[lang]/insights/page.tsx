import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";
import { Lightbulb } from "lucide-react";
import Image from "next/image";

export default async function InsightsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);

  return (
    <div className="space-y-6">
      <div className="text-center md:text-start">
        <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
          {dictionary.insightsPage.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {dictionary.insightsPage.description}
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <Lightbulb className="w-8 h-8 text-primary" />
          <div>
            <CardTitle>{lang === 'fa' ? 'بینش شما برای امروز' : 'Your Insight for Today'}</CardTitle>
            <CardDescription>{lang === 'fa' ? 'بر اساس آخرین داده‌های شما' : 'Based on your latest data'}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
           <Image src="https://placehold.co/600x300.png" alt={lang === 'fa' ? 'بینش هوش مصنوعی' : 'AI Insight'} width={600} height={300} className="rounded-md aspect-video object-cover" data-ai-hint="data abstract"/>
          <p className="text-foreground/90">
            {lang === 'fa' ? 'به نظر می‌رسد که در روزهایی که خواب با کیفیت‌تری دارید، خلق و خوی بهتری نیز تجربه می‌کنید. سعی کنید بهداشت خواب خود را بهبود ببخشید.' : 'It appears that on days you report better sleep quality, your mood is also generally better. Consider improving your sleep hygiene.'}
          </p>
          <p className="text-sm text-muted-foreground">
            {lang === 'fa' ? '(این یک بینش نمونه است. بینش‌های واقعی بر اساس داده‌های شما تولید خواهند شد.)' : '(This is a sample insight. Actual insights will be generated based on your data.)'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
