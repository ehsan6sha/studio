
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StepInformationProps {
  dictionary: {
    title: string;
    description: string;
    mainContent: string;
  };
}

export function StepInformation({ dictionary }: StepInformationProps) {
  return (
    <div className="h-full flex flex-col">
      <Card className="w-full shadow-none border-none flex-grow flex flex-col">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{dictionary.title}</CardTitle>
          <CardDescription>{dictionary.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-center text-foreground/80 leading-relaxed">
            {dictionary.mainContent}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
