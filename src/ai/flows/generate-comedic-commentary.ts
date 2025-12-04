'use server';

/**
 * @fileOverview Generates humorous commentary based on GitHub data.
 *
 * - generateComedicCommentary - A function that generates the comedic commentary.
 * - GenerateComedicCommentaryInput - The input type for the generateComedicCommentary function.
 * - GenerateComedicCommentaryOutput - The return type for the generateComedicCommentary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateComedicCommentaryInputSchema = z.object({
  topic: z.string().describe('The topic of the commentary (e.g., commit history, pull requests).'),
  data: z.string().describe('The GitHub data to generate commentary for.'),
});
export type GenerateComedicCommentaryInput = z.infer<typeof GenerateComedicCommentaryInputSchema>;

const GenerateComedicCommentaryOutputSchema = z.object({
  commentary: z.string().describe('The generated humorous commentary.'),
});
export type GenerateComedicCommentaryOutput = z.infer<typeof GenerateComedicCommentaryOutputSchema>;

export async function generateComedicCommentary(
  input: GenerateComedicCommentaryInput
): Promise<GenerateComedicCommentaryOutput> {
  return generateComedicCommentaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComedicCommentaryPrompt',
  input: {schema: GenerateComedicCommentaryInputSchema},
  output: {schema: GenerateComedicCommentaryOutputSchema},
  prompt: `You are a comedic writer specializing in generating humorous commentary for GitHub data.

  Topic: {{{topic}}}
  Data: {{{data}}}

  Generate a witty and playful roast based on the provided GitHub data. Ensure the commentary is relevant, avoids personal or hateful content, and focuses on humorous insights related to the user's coding activity.`,
});

const generateComedicCommentaryFlow = ai.defineFlow(
  {
    name: 'generateComedicCommentaryFlow',
    inputSchema: GenerateComedicCommentaryInputSchema,
    outputSchema: GenerateComedicCommentaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
