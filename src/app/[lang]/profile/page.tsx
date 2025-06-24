
import { ProfileForm } from "@/components/profile/profile-form";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";

export default async function ProfilePage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const profileDict = dictionary.profilePage;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
          {profileDict.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {profileDict.description}
        </p>
      </div>
      <ProfileForm dictionary={profileDict} lang={lang} />
    </div>
  );
}
