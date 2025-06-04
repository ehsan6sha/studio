
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
import React from 'react';


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
  onValidation: (isValid: boolean) => void;
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
                {/* Ensure terms page has this structure or provide a default */}
                {content?.lastUpdated || dictionary.termsPage?.lastUpdated || "Last Updated: July 26, 2024"}
            </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] p-4 border rounded-md">
            <div className="space-y-4 text-sm">
                 {/* Check if content and its properties exist before accessing */}
                {content?.introduction?.title && <h3 className="font-semibold text-lg">{content.introduction.title}</h3>}
                {content?.introduction?.content1 && <p>{content.introduction.content1}</p>}
                {content?.introduction?.content2 && <p>{content.introduction.content2}</p>}
                
                {content?.services?.title && <h3 className="font-semibold text-lg">{content.services.title}</h3>}
                {content?.services?.content1 && <p>{content.services.content1}</p>}
                {content?.services?.item1 && content?.services?.item2 && content?.services?.item3 && (
                    <ul className="list-disc list-inside pl-4">
                        <li>{content.services.item1}</li>
                        <li>{content.services.item2}</li>
                        <li>{content.services.item3}</li>
                    </ul>
                )}
                {content?.services?.disclaimer && <p className="font-semibold bg-muted p-2 rounded">{content.services.disclaimer}</p>}
                 {/* Render all sections dynamically if termsDictionary has a consistent structure */}
                 {content && typeof content === 'object' && Object.keys(content)
                    .filter(key => typeof content[key] === 'object' && content[key]?.title && key !== 'introduction' && key !== 'services')
                    .map(sectionKey => {
                        const section = content[sectionKey];
                        return (
                            <React.Fragment key={sectionKey}>
                                <h3 className="font-semibold text-lg">{section.title}</h3>
                                {section.content1 && <p>{section.content1}</p>}
                                {section.content2 && <p>{section.content2}</p>}
                                {section.linkText && section.privacyPolicyLink && ( // Example for privacy policy link
                                     <p>
                                        {section.content1}
                                        <a href={section.privacyPolicyLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{section.linkText}</a>.
                                    </p>
                                )}
                            </React.Fragment>
                        );
                 })}
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
  onValidation,
  lang,
  termsDictionary,
  appTermsContent,
  dataProcessingConsentContent,
  marketingConsentContent
}: StepTermsProps) {

  const handleCheckboxChange = (field: keyof SignupFormData, checked: boolean) => {
    const newFormData = { ...formData, [field]: checked };
    updateFormData({ [field]: checked });
    if (field === 'acceptedMandatoryTerms') {
      onValidation(checked);
    }
  };

  React.useEffect(() => {
    onValidation(!!formData.acceptedMandatoryTerms);
  }, [formData.acceptedMandatoryTerms, onValidation]);

  return (
    <div className="h-full flex flex-col">
      <Card className="w-full shadow-none border-none flex-grow flex flex-col">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{dictionary.title}</CardTitle>
          <CardDescription>{dictionary.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 flex-grow">
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
                {dictionary.mandatoryTermsLabel} <span className="text-destructive">*</span>
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
    </div>
  );
}
