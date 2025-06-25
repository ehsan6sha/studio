
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";
import { LanguageSwitcher } from "@/components/layout/language-switcher"; // Re-using for display
import { AccessLevelCard } from "@/components/settings/access-level-card";

export default async function SettingsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const settingsDict = dictionary.settingsPage;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center md:text-start">
        <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
          {settingsDict.title}
        </h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{settingsDict.language}</CardTitle>
          <CardDescription>{lang === 'fa' ? 'زبان نمایش برنامه را انتخاب کنید.' : 'Select the display language for the application.'}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="language-switcher-label" className="text-lg">
            {lang === 'fa' ? `زبان فعلی: ${dictionary.appName === 'حامی' ? 'فارسی' : 'English'}` : `Current Language: ${lang === 'fa' ? 'فارسی' : 'English'}`}
          </Label>
          <LanguageSwitcher currentLocale={lang} />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{settingsDict.theme}</CardTitle>
           <CardDescription>{lang === 'fa' ? 'پوسته روشن یا تیره را انتخاب کنید.' : 'Choose between light or dark theme.'}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="theme-switch" className="text-lg">
            {lang === 'fa' ? 'حالت تیره' : 'Dark Mode'}
          </Label>
          {/* Theme switching functionality would require client-side state management (e.g., next-themes) */}
          <Switch id="theme-switch" aria-label="Toggle dark mode" disabled /> 
           <span className="text-xs text-muted-foreground">{lang === 'fa' ? '(به زودی)' : '(Coming soon)'}</span>
        </CardContent>
      </Card>
      
      <AccessLevelCard dictionary={settingsDict.accessLevel} lang={lang} />
    </div>
  );
}
