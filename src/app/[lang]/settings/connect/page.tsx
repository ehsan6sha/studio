
import { ConnectForm } from "@/components/settings/connect-form";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";

export default async function ConnectPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const connectDict = dictionary.connectPage;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
          {connectDict.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {connectDict.description}
        </p>
      </div>
      <ConnectForm dictionary={connectDict.sharingConnections} lang={lang} />
    </div>
  );
}
