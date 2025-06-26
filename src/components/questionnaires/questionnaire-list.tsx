
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Clock, User, Calendar, ClipboardList } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { faIR as faIRJalali } from 'date-fns-jalali/locale';
import Link from "next/link";
import type { Locale } from "@/i18n-config";

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  goal: string;
  duration: string;
  sentBy: string;
  deadline: string;
}

interface QuestionnaireListProps {
  lang: Locale;
  dictionary: any;
  questionnaires: Questionnaire[];
}

export function QuestionnaireList({ lang, dictionary, questionnaires }: QuestionnaireListProps) {
  const [inProgress, setInProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkProgress = () => {
      const progressMap: Record<string, boolean> = {};
      questionnaires.forEach(q => {
        const hasProgress = localStorage.getItem(`questionnaire-answers-${q.id}`);
        if (hasProgress) {
          progressMap[q.id] = true;
        }
      });
      setInProgress(progressMap);
    };

    checkProgress();
    // Listen for storage changes to update UI if progress is saved/cleared in another tab
    window.addEventListener('storage', checkProgress);
    return () => window.removeEventListener('storage', checkProgress);
  }, [questionnaires]);

  const fnsLocale = lang === 'fa' ? faIRJalali : enUS;
  const formatDate = (dateString: string) => {
    try {
        const date = parseISO(dateString);
        return format(date, 'PPP', { locale: fnsLocale });
    } catch (e) {
        return dateString;
    }
  };

  return (
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
              <span><strong>{dictionary.goalLabel}:</strong> {q.goal}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              <span><strong>{dictionary.durationLabel}:</strong> {q.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-accent" />
              <span><strong>{dictionary.sentByLabel}:</strong> {q.sentBy}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              <span><strong>{dictionary.deadlineLabel}:</strong> {formatDate(q.deadline)}</span>
            </div>
          </CardContent>
          <CardFooter>
             <Button asChild className="w-full" disabled={q.id === 'gad-7-anxiety-test'}>
                {q.id === 'gad-7-anxiety-test' ? (
                  <span>{`${inProgress[q.id] ? dictionary.resumeSurveyButton : dictionary.startSurveyButton} (${dictionary.comingSoon})`}</span>
                ) : (
                  <Link href={`/${lang}/questionnaires/${q.id}`}>
                    {inProgress[q.id] ? dictionary.resumeSurveyButton : dictionary.startSurveyButton}
                  </Link>
                )}
              </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
