'use server';

/**
 * @fileOverview Determines the user's 'Dev Personality of the Year' based on their GitHub activity and generates a final punchline roast.
 *
 * - determineDevPersonality - A function that determines the dev personality.
 * - DetermineDevPersonalityInput - The input type for the determineDevPersonality function.
 * - DetermineDevPersonalityOutput - The return type for the determineDevPersonality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetermineDevPersonalityInputSchema = z.object({
  commitCount: z.number().describe('The total number of commits made by the user.'),
  repoCount: z.number().describe('The total number of repositories the user has.'),
  pullRequestCount: z.number().describe('The total number of pull requests created by the user.'),
  issueCount: z.number().describe('The total number of issues created by the user.'),
  dominantLanguage: z.string().describe('The user most used programming language.'),
});
export type DetermineDevPersonalityInput = z.infer<typeof DetermineDevPersonalityInputSchema>;

const DetermineDevPersonalityOutputSchema = z.object({
  devPersonality: z.string().describe('The determined developer personality archetype.'),
  roastPunchline: z.string().describe('A humorous punchline roast based on the dev personality.'),
});
export type DetermineDevPersonalityOutput = z.infer<typeof DetermineDevPersonalityOutputSchema>;

export async function determineDevPersonality(input: DetermineDevPersonalityInput): Promise<DetermineDevPersonalityOutput> {
  return determineDevPersonalityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'determineDevPersonalityPrompt',
  input: {schema: DetermineDevPersonalityInputSchema},
  output: {schema: DetermineDevPersonalityOutputSchema},
  prompt: `You are a comedic AI that determines a developer's personality archetype based on their GitHub activity and provides a final punchline roast.

  Here are the user's stats:
  - Total Commits: {{{commitCount}}}
  - Total Repositories: {{{repoCount}}}
  - Total Pull Requests: {{{pullRequestCount}}}
  - Total Issues: {{{issueCount}}}
  - Dominant Language: {{{dominantLanguage}}}

  Based on these stats, determine the user's 'Dev Personality of the Year'. Some examples include:
  - The Overconfident Beginner
  - The Silent Contributor
  - The Prolific Procrastinator
  - The Deprecation Master

  After determining the personality, create a short, humorous roast punchline related to that personality.  Ensure the roast is relevant to the user's stats and avoids personal or hateful content.

  Output the devPersonality and roastPunchline in the JSON format. Make the roast funny!
  `,
});

const determineDevPersonalityFlow = ai.defineFlow(
  {
    name: 'determineDevPersonalityFlow',
    inputSchema: DetermineDevPersonalityInputSchema,
    outputSchema: DetermineDevPersonalityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
