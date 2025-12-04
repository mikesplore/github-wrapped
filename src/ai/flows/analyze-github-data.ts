'use server';

/**
 * @fileOverview Analyzes GitHub data and provides key statistics, trends, and humorous insights.
 *
 * - analyzeGithubData - A function that analyzes GitHub data.
 * - AnalyzeGithubDataInput - The input type for the analyzeGithubData function.
 * - AnalyzeGithubDataOutput - The return type for the analyzeGithubData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeGithubDataInputSchema = z.object({
  githubData: z.string().describe('JSON string containing the fetched GitHub data including commits, repos, languages, PRs, issues, and activity history.'),
  username: z.string().describe('The GitHub username of the user.'),
  year: z.number().describe('The year for which the GitHub data is being analyzed.'),
});
export type AnalyzeGithubDataInput = z.infer<typeof AnalyzeGithubDataInputSchema>;

const AnalyzeGithubDataOutputSchema = z.object({
  intro: z.string().describe('A witty introductory slide.'),
  commitEnergy: z.string().describe('Analysis of commit activity with humorous commentary.'),
  languages: z.string().describe('Overview of languages used with humorous insights.'),
  repoGraveyard: z.string().describe('Analysis of inactive repositories with playful commentary.'),
  prIssueDrama: z.string().describe('Summary of pull requests and issues with humorous anecdotes.'),
  starSummary: z.string().describe('Overview of repository stars with witty commentary.'),
  activityAnalysis: z.string().describe('Analysis of overall GitHub activity with humorous observations.'),
  devPersonality: z.string().describe('The user development personality archetype of the year.'),
  comparisonWithPreviousYear: z.string().optional().describe('Comparison with previous year if available.'),
});
export type AnalyzeGithubDataOutput = z.infer<typeof AnalyzeGithubDataOutputSchema>;

export async function analyzeGithubData(input: AnalyzeGithubDataInput): Promise<AnalyzeGithubDataOutput> {
  return analyzeGithubDataFlow(input);
}

const analyzeGithubDataPrompt = ai.definePrompt({
  name: 'analyzeGithubDataPrompt',
  input: {schema: AnalyzeGithubDataInputSchema},
  output: {schema: AnalyzeGithubDataOutputSchema},
  prompt: `You are a comedic AI specializing in roasting GitHub users based on their yearly activity.

  Analyze the following GitHub data for user {{username}} for the year {{year}}, and create a 'Wrapped'-style report with humorous commentary.
  Ensure the roast is relevant, avoids personal or hateful content, and is generally lighthearted and playful.

  GitHub Data: {{{githubData}}}

  Structure the report into the following sections:

  1.  Intro: A witty introductory slide.
  2.  Commit Energy: Analyze commit activity with humorous commentary.
  3.  Languages: Overview of languages used with humorous insights.
  4.  Repo Graveyard: Analyze inactive repositories with playful commentary.
  5.  PR/Issue Drama: Summary of pull requests and issues with humorous anecdotes.
  6.  Star Summary: Overview of repository stars with witty commentary.
  7.  Activity Analysis: Analysis of overall GitHub activity with humorous observations.
  8. Dev Personality: Determine the user development personality archetype of the year.
  {{#if comparisonWithPreviousYear}}
  9. Comparison with Previous Year: Compare this year\'s stats with previous years (if available) to provide a more insightful and comedic analysis of the user\'s GitHub evolution.
  {{/if}}

  Return the result as a JSON object.
  `,
});

const analyzeGithubDataFlow = ai.defineFlow(
  {
    name: 'analyzeGithubDataFlow',
    inputSchema: AnalyzeGithubDataInputSchema,
    outputSchema: AnalyzeGithubDataOutputSchema,
  },
  async input => {
    const {output} = await analyzeGithubDataPrompt(input);
    return output!;
  }
);
