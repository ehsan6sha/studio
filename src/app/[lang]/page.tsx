
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";
import Link from "next/link";
import Image from "next/image";

export default async function LangRootPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-4 sm:py-6 md:py-8 flex-grow">
      <Image
        src="https://placehold.co/200x133.png"
        alt={dictionary.appName}
        width={200}
        height={133}
        className="mb-4 sm:mb-6 rounded-lg shadow-lg max-w-[150px] h-auto sm:max-w-[180px] md:max-w-[200px]"
        data-ai-hint="mental wellness abstract"
        priority // Added priority as it's likely LCP
      />
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-headline font-bold tracking-tight text-primary">
        {dictionary.landingPage.welcomeTitle}
      </h1>
      <p className="mt-2 sm:mt-3 md:mt-4 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-foreground/80">
        {dictionary.landingPage.welcomeMessage}
      </p>
      <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col items-center space-y-2 sm:space-y-3 w-full max-w-[280px] sm:max-w-xs">
        <Button asChild size="default" className="w-full h-10 text-sm sm:text-base">
          <Link href={`/${lang}/signup`}>{dictionary.landingPage.registerButton}</Link>
        </Button>
        <Button asChild size="default" variant="outline" className="w-full h-10 text-sm sm:text-base">
          <Link href={`/${lang}/login`}>{dictionary.landingPage.loginButton}</Link>
        </Button>
      </div>
      <div className="mt-6 sm:mt-8 md:mt-10">
        <Link href={`/${lang}/terms`} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
          {dictionary.landingPage.termsPolicyLink}
        </Link>
      </div>
    </div>
  );
}
