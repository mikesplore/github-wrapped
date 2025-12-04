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

  Generate a series of slides for their Wrapped report. Each slide should contain a title and a detailed description.
  
  **CRITICAL OUTPUT FORMAT:**
  - Output MARKDOWN for all slides
  - Use **bold** and *italic* for emphasis
  - Use bullet lists (- item) for stats and lists
  - Use numbered lists (1. item) when showing rankings
  - Use ## for section headers within descriptions
  - Use > for blockquotes/callouts
  - Separate title from description with double newline (\\n\\n)
  
  Example slide format:
  **Year at a Glance** 🎯

  Let's see what you've been up to:
  - **Total Commits:** 1,234 (busy bee or commit spammer?)
  - **Pull Requests:** 56 (actually collaborative!)
  - **Issues:** 23 (complainer or contributor?)
  - **Public Repos:** 15 (showing off)
  - **Private Repos:** 8 (hiding your shame)

  Not bad for someone who probably Googles "how to exit vim" weekly.

  Here are the required slide topics (18-20 slides total):
  1.  **Intro:** A scathingly funny welcome to their year-in-review. Reference their username and make it personal.
  
  2.  **Year at a Glance:** Hit them with the raw numbers in a **markdown list**:
      - **Total Commits:** [number]
      - **Pull Requests:** [number]  
      - **Issues:** [number]
      - **Public Repos:** [number]
      - **Private Repos:** [number]
      Be savage about what the numbers reveal.
  
  3.  **Commit Analysis:** Brutally analyze their commit count. Use **bold** for numbers and *emphasis* for jokes.
  
  4.  **Top Languages:** Create a **numbered list** of their top 5 programming languages:
      1. **Language Name** - X% (savage comment)
      2. **Language Name** - Y% (mock their choice)
      ...
  
  5.  **Repo Reality Check:** Analyze their total repos. Use bullet points:
      - **Public:** X repos (commentary)
      - **Private:** Y repos (roast them)
  
  6.  **Top Repos Showcase:** **Numbered list** of their top 3-5 repos by stars:
      1. **repo-name** ⭐ XXX stars - (commentary)
      2. **another-repo** ⭐ YY stars - (roast)
  
  7.  **Most Committed Repo:** Highlight with **bold** repo name and commit count.
  
  8.  **Star Power:** Compare using bullet points:
      - **Stars Received:** XXX
      - **Stars Given:** YYY
      > Roast the ratio
  
  9.  **Fork Analysis:** 
      - **Original Repos:** X
      - **Forked Repos:** Y
      Mock whether they create or just collect.
  
  10. **The Digital Graveyard:** **Numbered list** of 3-5 abandoned repos with last push dates.
  
  11. **PR & Collaboration:** Use **bold** for numbers, *italic* for sarcasm.
  
  12. **Issue Drama:** Bold the count, roast in *italics*.
  
  13. **Social Butterfly?:** Comparison list:
      - **Followers:** X
      - **Following:** Y  
      - **Ratio:** Z
      > Savage blockquote about their popularity
  
  14. **Language Breakdown:** Percentages with **bold** language names.
  
  15. **Recent Activity:** List 2-3 recently updated repos with commentary.
  
  16. **Commit Streak:** If available, show their **longest commit streak** in days. Mock or praise accordingly.
  
  17. **Code Patterns:** Analyze their activity patterns with markdown formatting.
  
  18. **Dev Personality:** Assign a **bold personality type** with supporting evidence in bullets.
  
  19. **Reality Check:** Comparison table or bullets:
      - Commits vs PRs
      - Stars received vs given
      - Public vs private repos
  
  20. **Outro:** Final devastating punchline with **bold** emphasis and emojis.

  CRITICAL RULES:
  - Generate 18-20 slides (include all topics that have data)
  - **USE MARKDOWN FORMATTING** - bold, italic, lists, blockquotes
  - Each slide: title (with emoji) then \\n\\n then markdown description
  - Include ACTUAL NUMBERS from the data
  - Use emojis liberally 🎯🔥💀😭
  - Be SAVAGE but funny
  - Reference longestStreak if available
  - Make it personal and specific
  - Private repos? Roast them about hiding code
  
  The output must be an array of markdown-formatted strings. Each string is one complete slide.
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
