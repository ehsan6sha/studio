
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";
import { QuestionnaireList } from "@/components/questionnaires/questionnaire-list";

export default async function QuestionnairesPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(lang);
  const pageDict = dictionary.questionnairesPage;
  
  const questionnaires = [
    {
      id: 'beck-depression-inventory',
      title: pageDict.beckTitle,
      description: pageDict.beckDescription,
      goal: pageDict.beckGoal,
      duration: pageDict.beckDuration,
      sentBy: pageDict.beckSentBy,
      deadline: '2024-08-15',
    },
    {
      id: 'gad-7-anxiety-test',
      title: pageDict.gad7Title,
      description: pageDict.gad7Description,
      goal: pageDict.gad7Goal,
      duration: pageDict.gad7Duration,
      sentBy: pageDict.gad7SentBy,
      deadline: '2024-08-20',
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center md:text-start">
        <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
          {pageDict.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {pageDict.description}
        </p>
      </div>
      <QuestionnaireList 
        lang={lang}
        dictionary={{...pageDict, comingSoon: dictionary.dashboardPage.comingSoon }} 
        questionnaires={questionnaires}
      />
    </div>
  );
}
