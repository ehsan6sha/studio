
export interface QuestionOption {
  value: number;
  labelKey: string;
}

export interface Question {
  id: string;
  textKey: string;
  hintKey: string;
  options: QuestionOption[];
}

export interface Questionnaire {
  id: string;
  titleKey: string;
  descriptionKey: string;
  questions: Question[];
}

export const questionnairesData: Questionnaire[] = [
  {
    id: 'beck-depression-inventory',
    titleKey: 'beckTitle',
    descriptionKey: 'beckDescription',
    questions: [
      {
        id: 'q1',
        textKey: 'bdi.q1.text',
        hintKey: 'bdi.q1.hint',
        options: [
          { value: 0, labelKey: 'bdi.q1.opt0' },
          { value: 1, labelKey: 'bdi.q1.opt1' },
          { value: 2, labelKey: 'bdi.q1.opt2' },
          { value: 3, labelKey: 'bdi.q1.opt3' },
        ],
      },
      {
        id: 'q2',
        textKey: 'bdi.q2.text',
        hintKey: 'bdi.q2.hint',
        options: [
          { value: 0, labelKey: 'bdi.q2.opt0' },
          { value: 1, labelKey: 'bdi.q2.opt1' },
          { value: 2, labelKey: 'bdi.q2.opt2' },
          { value: 3, labelKey: 'bdi.q2.opt3' },
        ],
      },
      {
        id: 'q3',
        textKey: 'bdi.q3.text',
        hintKey: 'bdi.q3.hint',
        options: [
          { value: 0, labelKey: 'bdi.q3.opt0' },
          { value: 1, labelKey: 'bdi.q3.opt1' },
          { value: 2, labelKey: 'bdi.q3.opt2' },
          { value: 3, labelKey: 'bdi.q3.opt3' },
        ],
      },
      {
        id: 'q4',
        textKey: 'bdi.q4.text',
        hintKey: 'bdi.q4.hint',
        options: [
          { value: 0, labelKey: 'bdi.q4.opt0' },
          { value: 1, labelKey: 'bdi.q4.opt1' },
          { value: 2, labelKey: 'bdi.q4.opt2' },
          { value: 3, labelKey: 'bdi.q4.opt3' },
        ],
      },
      {
        id: 'q5',
        textKey: 'bdi.q5.text',
        hintKey: 'bdi.q5.hint',
        options: [
          { value: 0, labelKey: 'bdi.q5.opt0' },
          { value: 1, labelKey: 'bdi.q5.opt1' },
          { value: 2, labelKey: 'bdi.q5.opt2' },
          { value: 3, labelKey: 'bdi.q5.opt3' },
        ],
      },
    ],
  },
];

export const getQuestionnaireById = (id: string): Questionnaire | undefined => {
  return questionnairesData.find((q) => q.id === id);
};
