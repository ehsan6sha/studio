
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n-config";
import { Laugh, Smile, Meh, Frown, Angry } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, LineChart, CartesianGrid, XAxis, YAxis, Line, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { StoryViewer } from '../stories/story-viewer';

const moodData = [
  { date: "2024-07-01", mood: 3, day: "دوشنبه" },
  { date: "2024-07-02", mood: 4, day: "سه‌شنبه" },
  { date: "2024-07-03", mood: 2, day: "چهارشنبه" },
  { date: "2024-07-04", mood: 5, day: "پنج‌شنبه" },
  { date: "2024-07-05", mood: 3, day: "جمعه" },
  { date: "2024-07-06", mood: 4, day: "شنبه" },
  { date: "2024-07-07", mood: 5, day: "یکشنبه" },
];

const biometricData = [
  { date: "2024-07-01", sleep: 7, heartRate: 65 },
  { date: "2024-07-02", sleep: 6, heartRate: 70 },
  { date: "2024-07-03", sleep: 8, heartRate: 60 },
  { date: "2024-07-04", sleep: 5, heartRate: 75 },
  { date: "2024-07-05", sleep: 7, heartRate: 68 },
  { date: "2024-07-06", sleep: 7.5, heartRate: 62 },
  { date: "2024-07-07", sleep: 6.5, heartRate: 72 },
];

const chartConfigMood = {
  mood: {
    label: "Mood",
    color: "hsl(var(--primary))",
  },
};

const chartConfigBiometric = {
  sleep: {
    label: "Sleep (hrs)",
    color: "hsl(var(--accent))",
  },
  heartRate: {
    label: "Heart Rate (bpm)",
    color: "hsl(var(--secondary))",
  },
};

interface DashboardClientProps {
    dictionary: any;
    lang: Locale;
}

const JOURNAL_HISTORY_KEY = 'hami-journal-history';

export function DashboardClient({ dictionary, lang }: DashboardClientProps) {
  const [isSubMoodSheetOpen, setIsSubMoodSheetOpen] = useState(false);
  const [selectedPrimaryMood, setSelectedPrimaryMood] = useState<string | null>(null);
  const [selectedSubMoods, setSelectedSubMoods] = useState<string[]>([]);
  const isRTL = lang === 'fa';
  const wasOpenRef = useRef(false);
  const [noteContent, setNoteContent] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [taskCompletion, setTaskCompletion] = useState({
    profile: false,
    questionnaire: false,
    share: false,
  });

  const checkTasks = useCallback(() => {
    const profileComplete = !!(user?.name && user?.emailOrPhone && user?.dob);
    const questionnaireComplete = !!localStorage.getItem('hami-questionnaire-completed');
    const storedConnections = localStorage.getItem('hami-connections');
    let shareComplete = false;
    if (storedConnections) {
      try {
        const connections = JSON.parse(storedConnections);
        shareComplete = Array.isArray(connections) && connections.length > 0;
      } catch (e) {
        console.error("Failed to parse connections from localStorage", e);
      }
    }
    setTaskCompletion({
      profile: profileComplete,
      questionnaire: questionnaireComplete,
      share: shareComplete,
    });
  }, [user]);

  useEffect(() => {
    checkTasks();
    window.addEventListener('focus', checkTasks);
    window.addEventListener('storage', checkTasks);
    return () => {
      window.removeEventListener('focus', checkTasks);
      window.removeEventListener('storage', checkTasks);
    };
  }, [checkTasks]);
  
  const addJournalEntry = useCallback((entry: { type: 'mood' | 'note', data: any }) => {
    const newEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...entry,
    };

    const rawHistory = localStorage.getItem(JOURNAL_HISTORY_KEY);
    let history = [];
    try {
        history = rawHistory ? JSON.parse(rawHistory) : [];
    } catch {
        history = [];
    }

    history.unshift(newEntry);

    localStorage.setItem(JOURNAL_HISTORY_KEY, JSON.stringify(history));
    window.dispatchEvent(new Event('storage'));
  }, []);


  useEffect(() => {
    if (wasOpenRef.current && !isSubMoodSheetOpen) {
      if (selectedPrimaryMood) {
        const subMoodLabels = selectedSubMoods.map(id => dictionary.subMoodSheet.subMoods[id] || id);
        
        const moodData = {
          primary: selectedPrimaryMood,
          subMoods: subMoodLabels,
        };
        addJournalEntry({ type: 'mood', data: moodData });
      }
    }
    wasOpenRef.current = isSubMoodSheetOpen;
  }, [isSubMoodSheetOpen, selectedPrimaryMood, selectedSubMoods, dictionary, addJournalEntry]);


  const handleMoodClick = (mood: string) => {
    setSelectedPrimaryMood(mood);
    setSelectedSubMoods([]);
    setIsSubMoodSheetOpen(true);
  };
  
  const handleSubMoodChange = (moodId: string, checked: boolean) => {
    setSelectedSubMoods(prev =>
      checked ? [...prev, moodId] : prev.filter(id => id !== moodId)
    );
  };

  const handleSaveNote = () => {
    if (!noteContent.trim()) return;
    addJournalEntry({ type: 'note', data: { text: noteContent } });
    setNoteContent('');
    toast({ title: dictionary.noteSavedSuccess });
  };

  const emojiMoods = [
      { name: 'great', icon: Laugh },
      { name: 'good', icon: Smile },
      { name: 'okay', icon: Meh },
      { name: 'bad', icon: Frown },
      { name: 'terrible', icon: Angry },
  ];
  
  const subMoods = (dictionary?.subMoodSheet?.subMoods)
    ? Object.entries(dictionary.subMoodSheet.subMoods).map(([id, label]) => ({ id, label: label as string }))
    : [];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
            {dictionary.title}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {dictionary.welcome}
          </p>
        </div>

        <Card>
          <CardHeader>
              <CardTitle>{dictionary.quickReactionTitle}</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="flex justify-around p-2">
                  {emojiMoods.map((mood) => (
                       <Button key={mood.name} variant="ghost" size="icon" className="h-14 w-14 rounded-full transition-transform hover:scale-125" onClick={() => handleMoodClick(dictionary.moodEmojis[mood.name])} aria-label={dictionary.moodEmojis[mood.name]}>
                          <mood.icon className="h-8 w-8" />
                      </Button>
                  ))}
              </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{dictionary.tasksTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id="task-profile"
                    checked={taskCompletion.profile}
                    disabled
                  />
                  <Label htmlFor="task-profile" className="flex-grow font-normal cursor-pointer data-[disabled]:cursor-not-allowed">
                    <Link href={`/${lang}/profile`} className="hover:underline">
                      {dictionary.tasks.completeProfile}
                    </Link>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id="task-questionnaire"
                    checked={taskCompletion.questionnaire}
                    disabled
                  />
                  <Label htmlFor="task-questionnaire" className="flex-grow font-normal cursor-pointer data-[disabled]:cursor-not-allowed">
                    <Link href={`/${lang}/questionnaires`} className="hover:underline">
                      {dictionary.tasks.answerQuestionnaire}
                    </Link>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id="task-share"
                    checked={taskCompletion.share}
                    disabled
                  />
                  <Label htmlFor="task-share" className="flex-grow font-normal cursor-pointer data-[disabled]:cursor-not-allowed">
                    <Link href={`/${lang}/settings/connect`} className="hover:underline">
                      {dictionary.tasks.shareInformation}
                    </Link>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <StoryViewer dictionary={dictionary.stories} lang={lang} />
          </div>
        </div>

         <Tabs defaultValue="moods" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="moods">{dictionary.moodsTab}</TabsTrigger>
              <TabsTrigger value="biometrics">{dictionary.biometricsTab}</TabsTrigger>
              <TabsTrigger value="testResults">{dictionary.testResultsTab}</TabsTrigger>
            </TabsList>

            <TabsContent value="moods" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{dictionary.moodChartTitle}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] p-0">
                    <ChartContainer config={chartConfigMood} className="w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={moodData} margin={{ top: 20, right: isRTL ? 10 : 30, left: isRTL ? 30 : 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={isRTL ? "day" : "date"} reversed={isRTL} />
                          <YAxis orientation={isRTL ? 'right' : 'left'} domain={[1, 5]} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="biometrics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{dictionary.biometricChartTitle}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] p-0">
                    <ChartContainer config={chartConfigBiometric} className="w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={biometricData} margin={{ top: 20, right: isRTL ? 10 : 30, left: isRTL ? 30 : 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" reversed={isRTL} />
                          <YAxis yAxisId="left" orientation={isRTL ? 'right' : 'left'} stroke="var(--color-sleep)" />
                          <YAxis yAxisId="right" orientation={isRTL ? 'left' : 'right'} stroke="var(--color-heartRate)" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Bar yAxisId="left" dataKey="sleep" fill="var(--color-sleep)" radius={4} />
                          <Bar yAxisId="right" dataKey="heartRate" fill="var(--color-heartRate)" radius={4} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testResults" className="mt-4">
               <Card>
                  <CardHeader>
                      <CardTitle>{dictionary.testResultsTab}</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-muted-foreground">{dictionary.comingSoon}</p>
                  </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>{dictionary.freeNotesTitle}</CardTitle>
              <CardDescription>{dictionary.freeNotesDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={dictionary.freeNotesPlaceholder}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="min-h-[150px] w-full resize-y"
                aria-label={dictionary.freeNotesTitle}
              />
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveNote} disabled={!noteContent.trim()}>
                    {dictionary.saveNoteButton}
                </Button>
            </CardFooter>
          </Card>
      </div>
      <Sheet open={isSubMoodSheetOpen} onOpenChange={setIsSubMoodSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-lg max-h-[90vh] flex flex-col">
              <SheetHeader className="text-center">
                  <SheetTitle>{dictionary.subMoodSheet.title}</SheetTitle>
                  <SheetDescription>
                    {selectedPrimaryMood && dictionary.subMoodSheet.description.replace('{mood}', selectedPrimaryMood)}
                  </SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 overflow-y-auto px-2">
                  {subMoods.map((mood) => (
                      <div key={mood.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Checkbox
                              id={`submood-${mood.id}`}
                              checked={selectedSubMoods.includes(mood.id)}
                              onCheckedChange={(checked) => handleSubMoodChange(mood.id, !!checked)}
                          />
                          <Label htmlFor={`submood-${mood.id}`} className="text-sm font-medium leading-none cursor-pointer">
                              {mood.label}
                          </Label>
                      </div>
                  ))}
              </div>
              <SheetFooter className="mt-auto">
                  <SheetClose asChild>
                      <Button variant="outline">{dictionary.subMoodSheet.skipButton}</Button>
                  </SheetClose>
                  <SheetClose asChild>
                      <Button>{dictionary.subMoodSheet.saveButton}</Button>
                  </SheetClose>
              </SheetFooter>
          </SheetContent>
      </Sheet>
    </>
  );
}
