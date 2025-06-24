
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";
import { Laugh, Smile, Meh, Frown, Angry } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, LineChart, CartesianGrid, XAxis, YAxis, Line, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";


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


export default function DashboardPage({ params: paramsAsProp }: { params: { lang: Locale } }) {
  const { lang } = React.use(paramsAsProp as any);
  const [dictionary, setDictionary] = useState<any>(null);
  const { toast } = useToast();
  const isRTL = lang === 'fa';

  useEffect(() => {
    async function loadDictionary() {
      if (lang) {
        const dict = await getDictionary(lang);
        setDictionary(dict.dashboardPage);
      }
    }
    loadDictionary();
  }, [lang]);

  const handleMoodClick = (mood: string) => {
    toast({
        title: lang === 'fa' ? 'حالت شما ثبت شد!' : 'Mood logged!',
        description: `${lang === 'fa' ? 'حس شما به عنوان' : 'You are feeling'} ${mood} ${lang === 'fa' ? 'ثبت شد.' : '.'}`,
    });
  };

  const emojiMoods = [
      { name: 'great', icon: Laugh },
      { name: 'good', icon: Smile },
      { name: 'okay', icon: Meh },
      { name: 'bad', icon: Frown },
      { name: 'terrible', icon: Angry },
  ]

  if (!dictionary) {
    return <div>Loading...</div>; // Or a more sophisticated loading skeleton
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
          {dictionary.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {dictionary.welcome}
        </p>
      </div>

      {/* Quick Reaction */}
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
        {/* Tasks */}
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>{dictionary.tasksTitle}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{dictionary.comingSoon}</p>
            </CardContent>
        </Card>

         {/* Learn and Earn */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>{dictionary.learnAndEarnTitle}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{dictionary.comingSoon}</p>
            </CardContent>
        </Card>
      </div>


      {/* Information Section */}
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
                        <YAxis reversed={isRTL} orientation={isRTL ? 'right' : 'left'} domain={[1, 5]} />
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
                        <YAxis yAxisId="left" orientation={isRTL ? 'right' : 'left'} stroke="var(--color-sleep)" reversed={isRTL}/>
                        <YAxis yAxisId="right" orientation={isRTL ? 'left' : 'right'} stroke="var(--color-heartRate)" reversed={isRTL}/>
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
    </div>
  );
}
