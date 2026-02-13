'use server';
/**
 * @fileOverview A Genkit flow for refining the tone of an email.
 *
 * - refineEmailTone - A function that refines the tone of an email using AI suggestions.
 * - RefineEmailToneInput - The input type for the refineEmailTone function.
 * - RefineEmailToneOutput - The return type for the refineEmailTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineEmailToneInputSchema = z.object({
  emailContent: z.string().describe('The original drafted email content.'),
  desiredTone: z.string().describe('The desired tone for the email (e.g., formal, concise, empathetic, professional).'),
});
export type RefineEmailToneInput = z.infer<typeof RefineEmailToneInputSchema>;

const RefineEmailToneOutputSchema = z.object({
  refinedContent: z.string().describe('The AI-suggested refined email content.'),
});
export type RefineEmailToneOutput = z.infer<typeof RefineEmailToneOutputSchema>;

export async function refineEmailTone(input: RefineEmailToneInput): Promise<RefineEmailToneOutput> {
  return refineEmailToneFlow(input);
}

const refineEmailTonePrompt = ai.definePrompt({
  name: 'refineEmailTonePrompt',
  input: {schema: RefineEmailToneInputSchema},
  output: {schema: RefineEmailToneOutputSchema},
  prompt: `You are an AI assistant specialized in refining communication. Your task is to rephrase the provided email content to match the specified tone.

Desired Tone: {{{desiredTone}}}

Original Email Content:
{{{emailContent}}}

Please provide the refined email content that perfectly matches the desired tone. Ensure the output is only the refined content, without any conversational filler or additional explanations.`,
});

const refineEmailToneFlow = ai.defineFlow(
  {
    name: 'refineEmailToneFlow',
    inputSchema: RefineEmailToneInputSchema,
    outputSchema: RefineEmailToneOutputSchema,
  },
  async input => {
    const {output} = await refineEmailTonePrompt(input);
    return output!;
  }
);
