
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";
import Link from "next/link";
import Image from "next/image";

export default async function LangRootPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <Image 
        src="https://placehold.co/300x200.png" 
        alt={dictionary.appName} 
        width={300} 
        height={200} 
        className="mb-8 rounded-lg shadow-lg"
        data-ai-hint="mental wellness abstract" 
      />
      <h1 className="text-4xl font-headline font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
        {dictionary.landingPage.welcomeTitle}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/80">
        {dictionary.landingPage.welcomeMessage}
      </p>
      <div className="mt-10 flex flex-col items-center space-y-4 w-full max-w-xs">
        <Button asChild size="lg" className="w-full">
          <Link href={`/${lang}/signup`}>{dictionary.landingPage.registerButton}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full">
          <Link href={`/${lang}/login`}>{dictionary.landingPage.loginButton}</Link>
        </Button>
      </div>
      <div className="mt-12">
        <Link href={`/${lang}/terms`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {dictionary.landingPage.termsPolicyLink}
        </Link>
      </div>
    </div>
  );
}
