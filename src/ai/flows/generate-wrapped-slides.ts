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

  IMPORTANT: For slides with lists or stats, format them clearly with line breaks and bullet points.

  Here are the required slide topics (15-20 slides total):
  1.  **Intro:** A scathingly funny welcome to their year-in-review. Reference their username and make it personal.
  
  2.  **Year at a Glance:** Hit them with the raw numbers in a list format:
      - Total Commits: [number]
      - Pull Requests: [number]  
      - Issues: [number]
      - Public Repos: [number]
      - Private Repos: [number]
      Be savage about what the numbers reveal.
  
  3.  **Commit Analysis:** Brutally analyze their commit count. Too many? Too few? Roast accordingly.
  
  4.  **Top Languages:** List their top 5 programming languages with savage commentary. Mock their choices.
      Format as a numbered list with percentages if available.
  
  5.  **Repo Reality Check:** Analyze their total repos (public vs private). Are they hiding their shame in private repos?
      Include the breakdown: X public, Y private.
  
  6.  **Top Repos Showcase:** List their top 3-5 repos by stars. Include repo names and star counts.
      Format clearly with repo name and stars. Roast whether they're impressive or pathetic.
  
  7.  **Most Committed Repo:** Highlight the repo they committed to the most this year.
      Include the repo name and commit count. Question their obsession.
  
  8.  **Star Power:** Roast their total stars received across all repos vs stars they gave.
      Include both numbers for comparison.
  
  9.  **Fork Analysis:** Comment on their forked repos vs original work. Include counts.
      Are they a creator or just a collector?
  
  10. **The Digital Graveyard:** List 3-5 abandoned repos by name. What dreams died here?
  
  11. **PR & Collaboration:** Analyze their pull request activity with the number.
      Team player or lone wolf?
  
  12. **Issue Drama:** Look at their issue creation count. Do they complain more than they contribute?
  
  13. **Social Butterfly?:** Show the comparison:
      - Followers: [number]
      - Following: [number]
      - Ratio: [calculated]
      Roast their popularity or desperation.
  
  14. **Language Breakdown:** Create a visual description of their language usage percentages.
      Top 3-5 languages with approximate percentages. Mock their stack.
  
  15. **Recent Activity:** List 2-3 recently updated repos. Actually working or just moving files around?
  
  16. **Code Patterns:** Deep dive into their activity patterns. Weekend warrior? Night owl?
  
  17. **Dev Personality:** Assign them a brutally honest developer personality archetype based on ALL the data.
      Reference specific stats that led to this conclusion.
  
  18. **Reality Check:** A savage summary comparing their different stats:
      - Commits vs PRs
      - Stars received vs given
      - Public vs private repos
      What does this REALLY say about them?
  
  19. **Final Stats Board:** A brutal final comparison of key metrics side by side.
  
  20. **Outro:** A final, devastating punchline to send them off. End with motivation... or destruction.

  CRITICAL RULES:
  - Generate 18-20 slides (include all topics that have data)
  - Each slide MUST have a title and description separated by double newline (\\n\\n)
  - For list-heavy slides, use clear formatting with line breaks (\\n) and dashes/bullets
  - Include ACTUAL NUMBERS from the GitHub data - don't make them up
  - Use emojis liberally for maximum impact  
  - Be SAVAGE but funny - this is a roast
  - Reference the new data: topRepoByCommits, topReposByStars, topReposByForks, totalForksReceived
  - Make it personal and specific to their stats
  - Don't hold back - they asked for this
  - If they have private repos, mention it and roast them about it
  
  The output must be an array of strings. Each string is one complete slide with title and description.
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
