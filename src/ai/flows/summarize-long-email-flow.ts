'use server';
/**
 * @fileOverview An AI agent for summarizing long emails.
 *
 * - summarizeLongEmail - A function that handles the email summarization process.
 * - SummarizeLongEmailInput - The input type for the summarizeLongEmail function.
 * - SummarizeLongEmailOutput - The return type for the summarizeLongEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLongEmailInputSchema = z.object({
  emailContent: z.string().describe('The full content of the email to be summarized.'),
});
export type SummarizeLongEmailInput = z.infer<typeof SummarizeLongEmailInputSchema>;

const SummarizeLongEmailOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the email\'s key points.'),
});
export type SummarizeLongEmailOutput = z.infer<typeof SummarizeLongEmailOutputSchema>;

export async function summarizeLongEmail(input: SummarizeLongEmailInput): Promise<SummarizeLongEmailOutput> {
  return summarizeLongEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLongEmailPrompt',
  input: {schema: SummarizeLongEmailInputSchema},
  output: {schema: SummarizeLongEmailOutputSchema},
  prompt: `You are an AI assistant specialized in summarizing emails. Your task is to extract the key points from the provided email content and present them as a concise summary.

Email Content:
---
{{{emailContent}}}
---

Provide a summary of the key points from the email above.`,
});

const summarizeLongEmailFlow = ai.defineFlow(
  {
    name: 'summarizeLongEmailFlow',
    inputSchema: SummarizeLongEmailInputSchema,
    outputSchema: SummarizeLongEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
