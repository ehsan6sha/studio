
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";
import { Target, Clock, User, Calendar, ClipboardList } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { faIR as faIRJalali } from 'date-fns-jalali/locale';
import Link from "next/link";

export default async function QuestionnairesPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const pageDict = dictionary.questionnairesPage;
  
  const fnsLocale = lang === 'fa' ? faIRJalali : enUS;
  const formatDate = (dateString: string) => {
    try {
        const date = parseISO(dateString);
        return format(date, 'PPP', { locale: fnsLocale });
    } catch (e) {
        return dateString;
    }
  };

  const questionnaires = [
    {
      id: 'beck-depression-inventory',
      title: pageDict.beckTitle,
      description: pageDict.beckDescription,
      goal: pageDict.beckGoal,
      duration: pageDict.beckDuration,
      sentBy: pageDict.beckSentBy,
      deadline: '2024-08-15',
    },
    {
      id: 'gad-7-anxiety-test',
      title: pageDict.gad7Title,
      description: pageDict.gad7Description,
      goal: pageDict.gad7Goal,
      duration: pageDict.gad7Duration,
      sentBy: pageDict.gad7SentBy,
      deadline: '2024-08-20',
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
        {questionnaires.map((q) => (
          <Card key={q.id} className="shadow-lg flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary" />
                {q.title}
              </CardTitle>
              <CardDescription>{q.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground flex-grow">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                <span><strong>{pageDict.goalLabel}:</strong> {q.goal}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                <span><strong>{pageDict.durationLabel}:</strong> {q.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                <span><strong>{pageDict.sentByLabel}:</strong> {q.sentBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                <span><strong>{pageDict.deadlineLabel}:</strong> {formatDate(q.deadline)}</span>
              </div>
            </CardContent>
            <CardFooter>
               <Button asChild className="w-full" disabled={q.id === 'gad-7-anxiety-test'}>
                {q.id === 'gad-7-anxiety-test' ? (
                  <span>{`${pageDict.startSurveyButton} (${dictionary.dashboardPage.comingSoon})`}</span>
                ) : (
                  <Link href={`/${lang}/questionnaires/${q.id}`}>
                    {pageDict.startSurveyButton}
                  </Link>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
