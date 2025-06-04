
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";
import { TrendingUp, Activity } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, LineChart, CartesianGrid, XAxis, YAxis, Line, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import Image from "next/image";

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
    color: "hsl(var(--secondary))", // Assuming you might have a secondary color for charts
  },
};


export default function DashboardPage({ params: paramsAsProp }: { params: { lang: Locale } }) {
  const { lang } = React.use(paramsAsProp as any); // Use React.use() to unwrap params

  const [dictionary, setDictionary] = useState<any>(null);
  const isRTL = lang === 'fa';

  useEffect(() => {
    async function loadDictionary() {
      if (lang) { // Check if lang is defined
        const dict = await getDictionary(lang);
        setDictionary(dict);
      }
    }
    loadDictionary();
  }, [lang]);

  if (!dictionary) {
    return <div>Loading...</div>; // Or a more sophisticated loading skeleton
  }


  return (
    <div className="space-y-8">
      <div className="text-center md:text-start">
        <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
          {dictionary.dashboardPage.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {dictionary.dashboardPage.welcome}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.dashboardPage.moodChartTitle}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">4.2 {lang === 'fa' ? ' (متوسط)' : '(Avg)'}</div>
            <p className="text-xs text-muted-foreground">
              {lang === 'fa' ? '+۱.۵ از هفته گذشته' : '+1.5 from last week'}
            </p>
            <div className="h-[200px] mt-4">
              <ChartContainer config={chartConfigMood} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodData} margin={{ top: 5, right: isRTL ? 5 : 20, left: isRTL ? 20 : 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={isRTL ? "day" : "date"} reversed={isRTL} />
                    <YAxis reversed={isRTL} orientation={isRTL ? 'right' : 'left'} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="mood" stroke="var(--color-mood)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.dashboardPage.biometricChartTitle}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-accent">6.8 {lang === 'fa' ? 'ساعت خواب' : 'hrs sleep'}</div>
            <p className="text-xs text-muted-foreground">
               {lang === 'fa' ? 'میانگین ۷ روز گذشته' : 'Avg last 7 days'}
            </p>
            <div className="h-[200px] mt-4">
              <ChartContainer config={chartConfigBiometric} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={biometricData} margin={{ top: 5, right: isRTL ? 5 : 20, left: isRTL ? 20 : 5, bottom: 5 }}>
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
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{lang === 'fa' ? 'نکات سلامتی' : 'Wellness Tip'}</CardTitle>
             <CardDescription>{lang === 'fa' ? 'یک نکته روزانه برای بهبود حال شما' : 'A daily tip to improve your well-being.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Image src="https://placehold.co/600x400.png" alt={lang === 'fa' ? 'نکته سلامتی' : 'Wellness Tip'} width={600} height={400} className="rounded-md" data-ai-hint="wellness yoga"/>
            <p className="text-sm text-foreground/90">
              {lang === 'fa' ? 'امروز ۵ دقیقه مدیتیشن کنید تا استرس خود را کاهش دهید.' : 'Try 5 minutes of meditation today to reduce stress.'}
            </p>
             <Button variant="link" className="p-0 h-auto text-primary">
              {lang === 'fa' ? 'بیشتر بدانید' : 'Learn More'}
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
