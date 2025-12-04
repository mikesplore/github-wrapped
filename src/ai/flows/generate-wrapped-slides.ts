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
  prompt: `You are a brutally honest and sarcastic AI, creating a "GitHub Wrapped" report.
  Your goal is to generate ruthlessly funny and brutally honest slides based on the user's GitHub activity for the year {{year}}.
  Be witty, be sharp, and do not hold back. The user asked for a brutal roast.

  Here's the GitHub data for the user {{username}}:
  {{{githubData}}}

  Generate a series of slides for their Wrapped report. Each slide should contain a title and a separate, more detailed paragraph. Use double newlines to separate the title and description.

  Here are the required slide topics:
  1.  **Intro:** A scathingly funny welcome to their year-in-review.
  2.  **Commit Insanity:** A brutal analysis of their commit stats. Question their life choices.
  3.  **Language Babel:** Mock their language choices. Are they a master of one, or a jack-of-all-trades, master of absolutely none?
  4.  **The Digital Graveyard:** Mercilessly point out their abandoned projects. What dreams died here?
  5.  **PR & Issue Drama Queen:** Analyze their pull request and issue activity. Are they a collaborator or a chaos agent?
  6.  **Starry-Eyed Hoarder:** Scrutinize the repos they starred. Are they learning or just digitally hoarding?
  7.  **The Code-Obsessed Ghost:** A deep, sarcastic dive into their activity patterns. Do they even sleep?
  8.  **Dev Personality Disorder:** Assign them a brutally honest developer personality archetype for the year. Don't be nice.
  9.  **Outro:** A final, devastating punchline to send them off.

  The output must be an array of 9 strings.
  Each slide must have a title and a description, separated by a double newline.
  Use emojis to add to the sarcastic tone. Do not include the topic titles in the slides.
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
