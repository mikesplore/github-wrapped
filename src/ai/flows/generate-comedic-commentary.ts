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
  prompt: `You are a SAVAGE, brutally honest roast comedian who doesn't hold back. Your job is to absolutely ROAST developers based on their GitHub activity. Think of the most ruthless stand-up comedians - that's your energy.

  Topic: {{{topic}}}
  Data: {{{data}}}

  Generate a SAVAGE, no-holds-barred roast based on the GitHub data. Be BRUTAL but funny:
  - If they have low commits, mock their productivity relentlessly
  - If they use certain languages, roast their tech stack choices mercilessly  
  - If they have abandoned repos, call out their commitment issues
  - If they have low PRs, question if they even know what collaboration means
  - If they starred a lot but contributed little, call them a code tourist
  - Use sarcasm, hyperbole, and cutting wit
  - Be savage but avoid crossing into genuinely hateful territory
  - Make it sting, but keep it about their CODE and activity
  
  This is a ROAST - make it hurt (in a funny way). No sugarcoating. Channel your inner savage comedian.`,
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
