'use server';
/**
 * @fileOverview A conversational AI companion flow.
 *
 * - chatWithCompanion - A function to chat with the AI companion.
 * - ChatCompanionInput - The input type for the chat function.
 * - ChatCompanionOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input from the client
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export const ChatCompanionInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The conversation history.'),
  message: z.string().describe("The user's latest message."),
});
export type ChatCompanionInput = z.infer<typeof ChatCompanionInputSchema>;

// Internal schema for the prompt
const PromptInputSchema = z.object({
  formattedHistory: z.string(),
  message: z.string(),
});

const ChatCompanionOutputSchema = z.object({
  response: z.string().describe("The AI companion's response."),
});
export type ChatCompanionOutput = z.infer<typeof ChatCompanionOutputSchema>;

export async function chatWithCompanion(
  input: ChatCompanionInput
): Promise<ChatCompanionOutput> {
  return chatWithCompanionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatCompanionPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: ChatCompanionOutputSchema},
  prompt: `You are Hami, a warm, empathetic, and supportive AI companion. Your purpose is to listen to the user, validate their feelings, and offer gentle, supportive conversation. Engage in a natural, caring dialogue.

IMPORTANT:
- NEVER give medical advice or diagnosis.
- If the user seems to be in crisis, gently suggest they talk to a trusted person or a professional.
- Keep your responses concise and encouraging.

Conversation History:
{{{formattedHistory}}}

New Message from User: {{{message}}}

Hami's Response:`,
});

const chatWithCompanionFlow = ai.defineFlow(
  {
    name: 'chatWithCompanionFlow',
    inputSchema: ChatCompanionInputSchema,
    outputSchema: ChatCompanionOutputSchema,
  },
  async input => {
    const formattedHistory = input.history
      .map(msg => `${msg.role === 'user' ? 'User' : 'Hami'}: ${msg.content}`)
      .join('\n');

    const {output} = await prompt({
      formattedHistory,
      message: input.message,
    });
    return output!;
  }
);
