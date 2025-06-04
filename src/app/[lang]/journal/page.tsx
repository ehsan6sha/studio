import { JournalForm } from "@/components/journal/journal-form";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";

export default async function JournalPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground text-center md:text-start">
          {dictionary.journalPage.title}
        </h1>
      </div>
      <JournalForm dictionary={dictionary.journalPage} lang={lang} />
    </div>
  );
}
