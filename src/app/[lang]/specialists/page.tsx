import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";
import { Users, Stethoscope } from "lucide-react";
import Image from "next/image";

export default async function SpecialistsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);

  const specialists = [
    { name: lang === 'fa' ? "دکتر سارا احمدی" : "Dr. Sarah Ahmadi", specialty: lang === 'fa' ? "روانشناس بالینی" : "Clinical Psychologist", image: "https://placehold.co/100x100.png?text=SA", aiHint: "professional portrait" },
    { name: lang === 'fa' ? "دکتر رضا محمدی" : "Dr. Reza Mohammadi", specialty: lang === 'fa' ? "مشاور خانواده" : "Family Counselor", image: "https://placehold.co/100x100.png?text=RM", aiHint: "professional portrait" },
    { name: lang === 'fa' ? "دکتر لیلا کریمی" : "Dr. Leila Karimi", specialty: lang === 'fa' ? "متخصص تغذیه" : "Nutritionist", image: "https://placehold.co/100x100.png?text=LK", aiHint: "professional portrait" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center md:text-start">
        <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
          {dictionary.specialistsPage.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {dictionary.specialistsPage.description}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {specialists.map((specialist, index) => (
          <Card key={index} className="shadow-lg overflow-hidden">
            <CardHeader className="flex flex-row items-start bg-muted/50 gap-4 p-4">
               <Image src={specialist.image} alt={specialist.name} width={64} height={64} className="rounded-full border-2 border-primary" data-ai-hint={specialist.aiHint} />
              <div className="grid gap-0.5">
                <CardTitle className="group flex items-center gap-2 text-lg">
                  {specialist.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Stethoscope className="h-4 w-4 text-accent" />
                  {specialist.specialty}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 text-sm text-muted-foreground">
              <p>{lang === 'fa' ? 'متخصص با تجربه در زمینه...' : 'Experienced specialist in...'}</p>
              <Button variant="outline" className="w-full mt-4">
                {lang === 'fa' ? 'مشاهده پروفایل' : 'View Profile'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
       <p className="text-sm text-muted-foreground text-center mt-4">
            {lang === 'fa' ? '(این یک لیست نمونه است. متخصصین واقعی بر اساس داده‌های شما پیشنهاد داده خواهند شد.)' : '(This is a sample list. Actual specialists will be suggested based on your data.)'}
        </p>
    </div>
  );
}
