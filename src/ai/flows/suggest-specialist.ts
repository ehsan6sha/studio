'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant therapists and specialists
 * based on user data, including journal entries, biometric data, and mood entries.
 *
 * @remarks
 * The flow analyzes user data to identify trends and topics, then suggests specialists
 * who can address the user's needs.
 *
 * @exports suggestSpecialist - The main function to trigger the specialist suggestion flow.
 * @exports SuggestSpecialistInput - The input type for the suggestSpecialist function.
 * @exports SuggestSpecialistOutput - The output type for the suggestSpecialist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema for the suggestSpecialist flow
const SuggestSpecialistInputSchema = z.object({
  journalEntries: z.string().describe('The user journal entries.'),
  biometricData: z.string().describe('The user biometric data.'),
  moodEntries: z.string().describe('The user mood entries.'),
});
export type SuggestSpecialistInput = z.infer<typeof SuggestSpecialistInputSchema>;

// Output schema for the suggestSpecialist flow
const SuggestSpecialistOutputSchema = z.object({
  suggestedSpecialists: z
    .string()
    .describe('A list of suggested specialists based on the user data.'),
});
export type SuggestSpecialistOutput = z.infer<typeof SuggestSpecialistOutputSchema>;

/**
 * Analyzes user data and suggests relevant therapists and specialists.
 *
 * @param input - The input data containing journal entries, biometric data, and mood entries.
 * @returns A list of suggested specialists.
 */
export async function suggestSpecialist(input: SuggestSpecialistInput): Promise<SuggestSpecialistOutput> {
  return suggestSpecialistFlow(input);
}

// Define the prompt for suggesting specialists
const suggestSpecialistPrompt = ai.definePrompt({
  name: 'suggestSpecialistPrompt',
  input: {schema: SuggestSpecialistInputSchema},
  output: {schema: SuggestSpecialistOutputSchema},
  prompt: `Based on the following journal entries, biometric data, and mood entries, suggest relevant therapists and specialists:

Journal Entries: {{{journalEntries}}}
Biometric Data: {{{biometricData}}}
Mood Entries: {{{moodEntries}}}

Suggest specialists who can address the identified trends and topics.`,
});

// Define the Genkit flow for suggesting specialists
const suggestSpecialistFlow = ai.defineFlow(
  {
    name: 'suggestSpecialistFlow',
    inputSchema: SuggestSpecialistInputSchema,
    outputSchema: SuggestSpecialistOutputSchema,
  },
  async input => {
    const {output} = await suggestSpecialistPrompt(input);
    return output!;
  }
);
