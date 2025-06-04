// 'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized insights from user data (mood entries and biometric data).
 *
 * - generateInsightFromData - A function that triggers the insight generation flow.
 * - GenerateInsightInput - The input type for the generateInsightFromData function.
 * - GenerateInsightOutput - The return type for the generateInsightFromData function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInsightInputSchema = z.object({
  moodEntries: z.string().describe('A string containing the user mood entries.'),
  biometricData: z.string().describe('A string containing the user biometric data.'),
});
export type GenerateInsightInput = z.infer<typeof GenerateInsightInputSchema>;

const GenerateInsightOutputSchema = z.object({
  insight: z.string().describe('A personalized insight about the user mental and physical well-being.'),
});
export type GenerateInsightOutput = z.infer<typeof GenerateInsightOutputSchema>;

export async function generateInsightFromData(input: GenerateInsightInput): Promise<GenerateInsightOutput> {
  return generateInsightFromDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInsightPrompt',
  input: {schema: GenerateInsightInputSchema},
  output: {schema: GenerateInsightOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized insights about a user's mental and physical well-being based on their mood entries and biometric data.

  Mood Entries: {{{moodEntries}}}
  Biometric Data: {{{biometricData}}}

  Based on this information, generate a concise and helpful insight. Focus on identifying patterns, potential issues, and actionable recommendations for the user to improve their well-being.`,
});

const generateInsightFromDataFlow = ai.defineFlow(
  {
    name: 'generateInsightFromDataFlow',
    inputSchema: GenerateInsightInputSchema,
    outputSchema: GenerateInsightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
