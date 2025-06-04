
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n-config';

export default async function TermsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const termsContent = dictionary.termsPage;

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center pb-6 border-b border-border">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-primary">
          {termsContent.mainTitle}
        </h1>
        <p className="mt-2 text-md sm:text-lg text-muted-foreground">
          {termsContent.lastUpdated}
        </p>
      </div>

      <section aria-labelledby="introduction-title">
        <h2 id="introduction-title" className="text-xl sm:text-2xl font-semibold text-foreground mt-6 mb-3">
          {termsContent.introduction.title}
        </h2>
        <p className="text-foreground/90 leading-relaxed">{termsContent.introduction.content1}</p>
        <p className="mt-2 text-foreground/90 leading-relaxed">{termsContent.introduction.content2}</p>
      </section>

      <section aria-labelledby="services-title">
        <h2 id="services-title" className="text-xl sm:text-2xl font-semibold text-foreground mt-6 mb-3">
          {termsContent.services.title}
        </h2>
        <p className="text-foreground/90 leading-relaxed">{termsContent.services.content1}</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-foreground/90 leading-relaxed">
          <li>{termsContent.services.item1}</li>
          <li>{termsContent.services.item2}</li>
          <li>{termsContent.services.item3}</li>
        </ul>
        <p className="mt-3 text-foreground/90 font-semibold leading-relaxed bg-muted p-3 rounded-md">{termsContent.services.disclaimer}</p>
      </section>

      <section aria-labelledby="accounts-title">
        <h2 id="accounts-title" className="text-xl sm:text-2xl font-semibold text-foreground mt-6 mb-3">
          {termsContent.userAccounts.title}
        </h2>
        <p className="text-foreground/90 leading-relaxed">{termsContent.userAccounts.content1}</p>
        <p className="mt-2 text-foreground/90 leading-relaxed">{termsContent.userAccounts.content2}</p>
      </section>

      <section aria-labelledby="content-title">
        <h2 id="content-title" className="text-xl sm:text-2xl font-semibold text-foreground mt-6 mb-3">
          {termsContent.userContent.title}
        </h2>
        <p className="text-foreground/90 leading-relaxed">{termsContent.userContent.content1}</p>
      </section>

      <section aria-labelledby="privacy-title">
        <h2 id="privacy-title" className="text-xl sm:text-2xl font-semibold text-foreground mt-6 mb-3">
          {termsContent.privacyPolicy.title}
        </h2>
        <p className="text-foreground/90 leading-relaxed">
          {termsContent.privacyPolicy.content1}
          {/* In a real app, this would be a link: <Link href={`/${lang}/privacy`}>{termsContent.privacyPolicy.linkText}</Link> */}
          <span className="text-primary hover:underline cursor-pointer">{termsContent.privacyPolicy.linkText}</span>.
        </p>
      </section>

      <section aria-labelledby="termination-title">
        <h2 id="termination-title" className="text-xl sm:text-2xl font-semibold text-foreground mt-6 mb-3">
          {termsContent.termination.title}
        </h2>
        <p className="text-foreground/90 leading-relaxed">{termsContent.termination.content1}</p>
      </section>

      <section aria-labelledby="disclaimer-title">
        <h2 id="disclaimer-title" className="text-xl sm:text-2xl font-semibold text-foreground mt-6 mb-3">
          {termsContent.disclaimerOfWarranties.title}
        </h2>
        <p className="text-foreground/90 leading-relaxed">{termsContent.disclaimerOfWarranties.content1}</p>
      </section>

      <section aria-labelledby="liability-title">
        <h2 id="liability-title" className="text-xl sm:text-2xl font-semibold text-foreground mt-6 mb-3">
          {termsContent.limitationOfLiability.title}
        </h2>
        <p className="text-foreground/90 leading-relaxed">{termsContent.limitationOfLiability.content1}</p>
      </section>

      <section aria-labelledby="changes-title">
        <h2 id="changes-title" className="text-xl sm:text-2xl font-semibold text-foreground mt-6 mb-3">
          {termsContent.changesToTerms.title}
        </h2>
        <p className="text-foreground/90 leading-relaxed">{termsContent.changesToTerms.content1}</p>
      </section>

      <section aria-labelledby="contact-title">
        <h2 id="contact-title" className="text-xl sm:text-2xl font-semibold text-foreground mt-6 mb-3">
          {termsContent.contactInformation.title}
        </h2>
        <p className="text-foreground/90 leading-relaxed">{termsContent.contactInformation.content1}</p>
      </section>
    </div>
  );
}
