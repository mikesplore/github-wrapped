'use server';

/**
 * @fileOverview Compares a user's current year GitHub statistics with previous years for comedic analysis.
 *
 * - compareYearStats - A function that handles the comparison of GitHub stats between years.
 * - CompareYearStatsInput - The input type for the compareYearStats function.
 * - CompareYearStatsOutput - The return type for the compareYearStats function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompareYearStatsInputSchema = z.object({
  currentYearStats: z.record(z.any()).describe('The current year statistics of the GitHub user.'),
  previousYearStats: z.record(z.any()).optional().describe('The previous year statistics of the GitHub user, if available.'),
  username: z.string().describe('The GitHub username of the user.'),
});
export type CompareYearStatsInput = z.infer<typeof CompareYearStatsInputSchema>;

const CompareYearStatsOutputSchema = z.object({
  comparisonSummary: z.string().describe('A humorous summary comparing the current year stats with previous years.'),
});
export type CompareYearStatsOutput = z.infer<typeof CompareYearStatsOutputSchema>;

export async function compareYearStats(input: CompareYearStatsInput): Promise<CompareYearStatsOutput> {
  return compareYearStatsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'compareYearStatsPrompt',
  input: {schema: CompareYearStatsInputSchema},
  output: {schema: CompareYearStatsOutputSchema},
  prompt: `You are a comedic writer tasked with comparing a GitHub user's current year statistics with their previous year's statistics.

  Your goal is to generate a humorous and insightful summary of the user's GitHub evolution, highlighting key changes and trends.
  Avoid personal or hateful content, focusing on playful and relevant commentary.

  Current Year Statistics:
  {{#each currentYearStats}}
  {{@key}}: {{this}}
  {{/each}}

  {{#if previousYearStats}}
  Previous Year Statistics:
  {{#each previousYearStats}}
  {{@key}}: {{this}}
  {{/each}}
  {{else}}
  No previous year statistics available.
  {{/if}}

  Username: {{username}}

  Generate a short, witty paragraph summarizing the GitHub user's yearly evolution based on the provided stats. Make it funny!
  `,
});

const compareYearStatsFlow = ai.defineFlow(
  {
    name: 'compareYearStatsFlow',
    inputSchema: CompareYearStatsInputSchema,
    outputSchema: CompareYearStatsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
