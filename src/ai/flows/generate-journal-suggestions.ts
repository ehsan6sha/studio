'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating journaling prompts based on user mood entries and biometric data.
 *
 * - generateJournalSuggestions - A function that generates journaling prompts for the user.
 * - GenerateJournalSuggestionsInput - The input type for the generateJournalSuggestions function.
 * - GenerateJournalSuggestionsOutput - The return type for the generateJournalSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJournalSuggestionsInputSchema = z.object({
  moodEntry: z.string().describe('The user mood entry for the day.'),
  biometricData: z.string().describe('The user biometric data for the day.'),
});
export type GenerateJournalSuggestionsInput = z.infer<
  typeof GenerateJournalSuggestionsInputSchema
>;

const GenerateJournalSuggestionsOutputSchema = z.object({
  promptSuggestions: z
    .array(z.string())
    .describe('An array of suggested journaling prompts.'),
});
export type GenerateJournalSuggestionsOutput = z.infer<
  typeof GenerateJournalSuggestionsOutputSchema
>;

export async function generateJournalSuggestions(
  input: GenerateJournalSuggestionsInput
): Promise<GenerateJournalSuggestionsOutput> {
  return generateJournalSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJournalSuggestionsPrompt',
  input: {schema: GenerateJournalSuggestionsInputSchema},
  output: {schema: GenerateJournalSuggestionsOutputSchema},
  prompt: `You are an AI journaling assistant that provides personalized and insightful journaling prompts.

  Based on the user's mood entry and biometric data for the day, suggest 3 distinct journaling prompts that will encourage reflection and self-discovery.

  Mood Entry: {{{moodEntry}}}
  Biometric Data: {{{biometricData}}}

  Here are three journaling prompts:
  1. 
  2.
  3.`, // Ensure the prompt includes numbered suggestions.
});

const generateJournalSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateJournalSuggestionsFlow',
    inputSchema: GenerateJournalSuggestionsInputSchema,
    outputSchema: GenerateJournalSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
