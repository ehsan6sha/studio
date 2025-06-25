
import { QuestionnaireClient } from "@/components/questionnaires/questionnaire-client";
import { getDictionary } from "@/lib/dictionaries";
import { getQuestionnaireById } from "@/lib/questionnaire-data";
import type { Locale } from "@/i18n-config";
import { notFound } from 'next/navigation';

export default async function QuestionnaireRunnerPage({ 
    params: { lang, questionnaireId } 
}: { 
    params: { lang: Locale, questionnaireId: string } 
}) {
  const dictionary = await getDictionary(lang);
  const questionnaireData = getQuestionnaireById(questionnaireId);

  if (!questionnaireData) {
    notFound();
  }
  
  const runnerDictionary = dictionary.questionnaireRunnerPage;
  const generalDictionary = dictionary.questionnairesPage;
  
  // Pre-resolve titles from dictionary for easier use in client
  const fullQuestionnaireData = {
      ...questionnaireData,
      title: generalDictionary[questionnaireData.titleKey] || questionnaireData.titleKey,
      description: generalDictionary[questionnaireData.descriptionKey] || questionnaireData.descriptionKey,
  }

  return (
    <QuestionnaireClient 
        lang={lang} 
        dictionary={runnerDictionary} 
        questionnaire={fullQuestionnaireData} 
    />
  );
}
