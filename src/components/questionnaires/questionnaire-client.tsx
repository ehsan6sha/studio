
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import type { Locale } from '@/i18n-config';
import type { Questionnaire } from '@/lib/questionnaire-data';
import { useToast } from '@/hooks/use-toast';

interface QuestionnaireClientProps {
  lang: Locale;
  dictionary: any;
  questionnaire: Questionnaire & { title: string; description: string };
}

type Answers = Record<string, number>;

export function QuestionnaireClient({ lang, dictionary, questionnaire }: QuestionnaireClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const storageKey = useMemo(() => `questionnaire-answers-${questionnaire.id}`, [questionnaire.id]);
  const isRTL = lang === 'fa';

  useEffect(() => {
    const savedAnswers = localStorage.getItem(storageKey);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    const savedIndex = localStorage.getItem(`${storageKey}-index`);
    if (savedIndex) {
      setCurrentQuestionIndex(parseInt(savedIndex, 10));
    }
    setIsLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    }
  }, [answers, storageKey, isLoaded]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: parseInt(value, 10) }));
  };
  
  const handleNavigation = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next' ? currentQuestionIndex + 1 : currentQuestionIndex - 1;
    setCurrentQuestionIndex(newIndex);
    localStorage.setItem(`${storageKey}-index`, newIndex.toString());
  };

  const handleFinish = () => {
      // Mark as completed to update task list on dashboard
      localStorage.setItem('hami-questionnaire-completed', 'true');
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}-index`);
      toast({
          title: dictionary.questionnaireCompletedTitle,
          description: dictionary.questionnaireCompletedDescription,
      });
      router.push(`/${lang}/dashboard`);
  };

  const handleSaveAndExit = () => {
    localStorage.setItem(`${storageKey}-index`, currentQuestionIndex.toString());
    toast({ description: dictionary.progressSaved });
    router.push(`/${lang}/questionnaires`);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questionnaire.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questionnaire.questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-headline font-bold">{questionnaire.title}</h1>
        <Progress value={progressPercentage} />
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
             <CardTitle className="text-xl">
                {dictionary.questionLabel.replace('{current}', currentQuestionIndex + 1).replace('{total}', questionnaire.questions.length)}
             </CardTitle>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Info className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{dictionary.bdi[currentQuestion.id]?.hint || 'No hint available'}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription className="text-lg pt-4">
             {dictionary.bdi[currentQuestion.id]?.text || 'Question text not found.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id]?.toString()}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options.map(option => (
              <div key={option.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value={option.value.toString()} id={`${currentQuestion.id}-${option.value}`} />
                <Label htmlFor={`${currentQuestion.id}-${option.value}`} className="font-normal cursor-pointer">
                  {dictionary.bdi[currentQuestion.id]?.[`opt${option.value}`] || 'Option text not found.'}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <Button variant="outline" onClick={handleSaveAndExit}>
                <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2"/>
                {dictionary.saveAndExitButton}
            </Button>
            <div className="flex gap-2">
                <Button onClick={() => handleNavigation('prev')} disabled={currentQuestionIndex === 0}>
                    {!isRTL && <ChevronLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2" />}
                    {dictionary.previousButton}
                    {isRTL && <ChevronRight className="h-4 w-4 ltr:mr-2 rtl:ml-2" />}
                </Button>
                {isLastQuestion ? (
                     <Button onClick={handleFinish} disabled={answers[currentQuestion.id] === undefined}>
                        {dictionary.finishButton}
                    </Button>
                ) : (
                    <Button onClick={() => handleNavigation('next')} disabled={answers[currentQuestion.id] === undefined}>
                        {dictionary.nextButton}
                        {isRTL ? <ChevronLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> : <ChevronRight className="h-4 w-4 ltr:mr-2 rtl:ml-2" />}
                    </Button>
                )}
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
