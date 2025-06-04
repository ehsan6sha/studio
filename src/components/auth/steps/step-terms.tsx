
'use client';

import type { Locale } from '@/i18n-config';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SignupFormData } from '../signup-stepper';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

interface StepTermsProps {
  dictionary: {
    title: string;
    description: string;
    mandatoryTermsLabel: string;
    optionalCommunicationsLabel: string;
    optionalMarketingLabel: string;
    viewTermsLink: string;
    dataProcessingConsentLink: string;
    marketingConsentLink: string;
    infoNoteLine1: string;
    infoNoteLine2: string;
    infoNoteLine3: string;
    dialogClose: string;
  };
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  lang: Locale;
  termsDictionary: any; // Full terms page content
  appTermsContent: any;
  dataProcessingConsentContent: any;
  marketingConsentContent: any;
}

const TermDialogContent = ({ title, content, dictionary }: { title: string, content: any, dictionary: any }) => (
    <>
        <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
                {dictionary.termsPage?.lastUpdated || "Last Updated: July 26, 2024"}
            </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] p-4 border rounded-md">
            {/* This is a simplified rendering. A real app might parse HTML or markdown */}
            <div className="space-y-4 text-sm">
                <h3 className="font-semibold text-lg">{content.introduction.title}</h3>
                <p>{content.introduction.content1}</p>
                <p>{content.introduction.content2}</p>
                
                <h3 className="font-semibold text-lg">{content.services.title}</h3>
                <p>{content.services.content1}</p>
                <ul className="list-disc list-inside pl-4">
                    <li>{content.services.item1}</li>
                    <li>{content.services.item2}</li>
                    <li>{content.services.item3}</li>
                </ul>
                <p className="font-semibold bg-muted p-2 rounded">{content.services.disclaimer}</p>

                {/* Add more sections as needed based on your termsDictionary structure */}
            </div>
        </ScrollArea>
        <DialogClose asChild>
            <Button variant="outline" className="mt-4">{dictionary.dialogClose || "Close"}</Button>
        </DialogClose>
    </>
);


export function StepTerms({
  dictionary,
  formData,
  updateFormData,
  lang,
  termsDictionary,
  appTermsContent,
  dataProcessingConsentContent,
  marketingConsentContent
}: StepTermsProps) {
  const handleCheckboxChange = (field: keyof SignupFormData, checked: boolean) => {
    updateFormData({ [field]: checked });
  };

  return (
    <Card className="w-full shadow-none border-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">{dictionary.title}</CardTitle>
        <CardDescription>{dictionary.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mandatory Terms */}
        <div className="items-top flex space-x-2 rtl:space-x-reverse">
          <Checkbox
            id="mandatoryTerms"
            checked={!!formData.acceptedMandatoryTerms}
            onCheckedChange={(checked) => handleCheckboxChange('acceptedMandatoryTerms', !!checked)}
            aria-label={dictionary.mandatoryTermsLabel}
          />
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="mandatoryTerms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {dictionary.mandatoryTermsLabel}
            </label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto text-primary text-sm justify-start">
                  {dictionary.viewTermsLink}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] max-h-[90vh] flex flex-col">
                 <TermDialogContent title={termsDictionary.mainTitle} content={termsDictionary} dictionary={dictionary} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Optional Communications */}
        <div className="items-top flex space-x-2 rtl:space-x-reverse">
          <Checkbox
            id="optionalCommunications"
            checked={!!formData.acceptedOptionalCommunications}
            onCheckedChange={(checked) => handleCheckboxChange('acceptedOptionalCommunications', !!checked)}
            aria-label={dictionary.optionalCommunicationsLabel}
          />
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="optionalCommunications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {dictionary.optionalCommunicationsLabel}
            </label>
             <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto text-primary text-sm justify-start">
                   {dictionary.dataProcessingConsentLink}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] max-h-[90vh] flex flex-col">
                 <TermDialogContent title={dataProcessingConsentContent.title} content={dataProcessingConsentContent.content} dictionary={dictionary} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Optional Marketing */}
        <div className="items-top flex space-x-2 rtl:space-x-reverse">
          <Checkbox
            id="optionalMarketing"
            checked={!!formData.acceptedOptionalMarketing}
            onCheckedChange={(checked) => handleCheckboxChange('acceptedOptionalMarketing', !!checked)}
            aria-label={dictionary.optionalMarketingLabel}
          />
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="optionalMarketing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {dictionary.optionalMarketingLabel}
            </label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto text-primary text-sm justify-start">
                  {dictionary.marketingConsentLink}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] max-h-[90vh] flex flex-col">
                <TermDialogContent title={marketingConsentContent.title} content={marketingConsentContent.content} dictionary={dictionary} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="mt-6 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground space-y-1">
            <p>{dictionary.infoNoteLine1}</p>
            <p>{dictionary.infoNoteLine2}</p>
            <p>{dictionary.infoNoteLine3}</p>
        </div>
      </CardContent>
    </Card>
  );
}
