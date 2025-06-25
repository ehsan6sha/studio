
import { JournalHistory } from "@/components/journal/journal-history";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";

export default async function JournalPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);

  return (
    <div className="space-y-6">
      <div className="text-center md:text-start">
        <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
          {dictionary.journalPage.title}
        </h1>
         <p className="mt-2 text-lg text-muted-foreground">
          {dictionary.journalPage.description}
        </p>
      </div>
      <JournalHistory dictionary={dictionary.journalPage} lang={lang} />
    </div>
  );
}
