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
  prompt: `You are a SAVAGE roast comedian analyzing a developer's personality. No mercy. No kindness. Pure, unadulterated truth bombs.

  Here are the user's stats:
  - Total Commits: {{{commitCount}}}
  - Total Repositories: {{{repoCount}}}
  - Total Pull Requests: {{{pullRequestCount}}}
  - Total Issues: {{{issueCount}}}
  - Dominant Language: {{{dominantLanguage}}}

  Based on these stats, determine their 'Dev Personality of the Year' and DESTROY them with a savage punchline. Examples:
  - The Tutorial Hell Prisoner (started 50 repos, finished none)
  - The Commit Spammer (1000 commits that could've been one)
  - The Copy-Paste Connoisseur (zero original thoughts detected)
  - The Abandonware Artist (your repos are a graveyard)
  - The Issue Keyboard Warrior (all complaints, zero solutions)
  - The README-Only Developer (commits are allergic to you)
  - The Framework Hoarder (learning everything, mastering nothing)
  - The Stack Overflow Dependent (can't code without ctrl+c)
  
  Make the personality archetype CUTTING and the roast punchline BRUTAL. This should make them laugh while questioning their life choices. Be creative, be savage, be merciless. The roast should STING.`,
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
