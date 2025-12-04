'use server';

/**
 * @fileOverview Generates 'Wrapped'-style slides with key statistics and witty commentary based on GitHub data.
 *
 * - generateWrappedSlides - A function that generates the wrapped slides.
 * - GenerateWrappedSlidesInput - The input type for the generateWrappedSlides function.
 * - GenerateWrappedSlidesOutput - The return type for the generateWrappedSlides function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWrappedSlidesInputSchema = z.object({
  githubData: z.any().describe('The fetched GitHub data including commits, repos, languages, PRs, issues, and activity history.'),
  username: z.string().describe('The GitHub username of the user.'),
  year: z.number().describe('The year for which the wrapped data is generated.'),
});

export type GenerateWrappedSlidesInput = z.infer<typeof GenerateWrappedSlidesInputSchema>;

const GenerateWrappedSlidesOutputSchema = z.object({
  slides: z.array(z.string()).describe('An array of strings, where each string represents a slide with statistics and witty commentary.'),
});

export type GenerateWrappedSlidesOutput = z.infer<typeof GenerateWrappedSlidesOutputSchema>;

export async function generateWrappedSlides(input: GenerateWrappedSlidesInput): Promise<GenerateWrappedSlidesOutput> {
  return generateWrappedSlidesFlow(input);
}

const generateWrappedSlidesPrompt = ai.definePrompt({
  name: 'generateWrappedSlidesPrompt',
  input: {schema: GenerateWrappedSlidesInputSchema},
  output: {schema: GenerateWrappedSlidesOutputSchema},
  prompt: `You are a witty and humorous commentator, creating a "Wrapped" style report for a GitHub user.
  Your goal is to generate engaging and funny slides based on the user's GitHub activity for the year {{year}}.
  Avoid any personal or hateful content, keep the tone playful and light.

  Here's the GitHub data for the user {{username}}:
  {{githubData}}

  Generate slides for the following sections:
  1. Intro: A humorous introduction to the user's GitHub Wrapped.
  2. Commit Energy: Stats about the user's commits, with funny commentary.
  3. Languages: The user's most used languages, with witty remarks.
  4. Repo Graveyard: Inactive or abandoned repositories, with playful observations.
  5. PR/Issue Drama: Statistics about pull requests and issues, with light-hearted commentary.
  6. Star Summary: Repositories the user starred, with funny interpretations.
  7. Activity Analysis: Overall activity trends, with a final punchline.

  The output should be an array of strings, where each string represents a slide.
  Each slide should be concise and engaging.
  Do not be overly verbose. Use emojis and playful language to emulate a Spotify Wrapped aesthetic.
  Do not include section titles in the slides.
  `,
});

const generateWrappedSlidesFlow = ai.defineFlow(
  {
    name: 'generateWrappedSlidesFlow',
    inputSchema: GenerateWrappedSlidesInputSchema,
    outputSchema: GenerateWrappedSlidesOutputSchema,
  },
  async input => {
    const {output} = await generateWrappedSlidesPrompt(input);
    return output!;
  }
);
