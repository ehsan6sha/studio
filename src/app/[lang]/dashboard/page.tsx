import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n-config';

export default async function DashboardPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  
  return <DashboardClient dictionary={dictionary.dashboardPage} lang={lang} />;
}
