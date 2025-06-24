
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";
import { ClipboardList } from "lucide-react";

export default async function QuestionnairesPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const pageDict = dictionary.questionnairesPage;

  const questionnaires = [
    {
      title: pageDict.beckTitle,
      description: pageDict.beckDescription
    },
    {
      title: pageDict.gad7Title,
      description: pageDict.gad7Description
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center md:text-start">
        <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
          {pageDict.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {pageDict.description}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {questionnaires.map((q, i) => (
          <Card key={i} className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary" />
                {q.title}
              </CardTitle>
              <CardDescription>{q.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" disabled>
                {`${pageDict.startSurveyButton} (${dictionary.dashboardPage.comingSoon})`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
