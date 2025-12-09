'use server';

/**
 * @fileOverview HARDENED version - AI cannot escape these constraints
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
  slides: z.array(z.string()).describe('Array of 18-20 slide strings. Each slide: Title on first line, then content. Use Markdown formatting.'),
});

export type GenerateWrappedSlidesOutput = z.infer<typeof GenerateWrappedSlidesOutputSchema>;

export async function generateWrappedSlides(input: GenerateWrappedSlidesInput): Promise<GenerateWrappedSlidesOutput> {
  return generateWrappedSlidesFlow(input);
}

const generateWrappedSlidesPrompt = ai.definePrompt({
  name: 'generateWrappedSlidesPrompt',
  input: {schema: GenerateWrappedSlidesInputSchema},
  output: {schema: GenerateWrappedSlidesOutputSchema},
  prompt: `You are a brutal but hilarious roast comedian analyzing GitHub activity for {{username}}'s {{year}}.

CRITICAL REQUIREMENTS:
- Generate EXACTLY 18-20 slides (NO MORE, NO LESS)
- Each slide format: Title line, blank line, then content
- Use Markdown: **bold** for numbers, *italic* for sarcasm, bullets, emojis
- NO @ before username (just use "{{username}}")
- Be SAVAGE and CREATIVE - mock every stat relentlessly

GitHub Data: {{{githubData}}}

REQUIRED SLIDES (in order):

1. Intro - Creative brutal welcome
2. Year at a Glance - Dynamic subtitle based on stats, show all key numbers
3. Commit Analysis - Mock their commit count brutally
4. Language Breakdown - List top languages with percentages and savage commentary
5. Repo Reality - Public vs Private with mockery
6. Top Repos - List starred repos with brutal roasts
7. Most Committed Repo - Mock their obsession
8. Stars - Mock stars received vs given
9. Forks - "Curator not creator" mockery
10. Graveyard - List abandoned repos with last update dates
11. Pull Requests - Collaboration mockery
12. Issues - Problem creator vs solver
13. Social - Followers/following ratio destruction
14. Language Deep Dive - Technical mockery of main language
15. Recent Activity - Mock recent updates
16. Commit Streak - Longest vs current streak mockery
17. Coding Patterns - When/how they code (brutal analysis)
18. Developer Personality - Assign cruel archetype
19. Reality Check - Stats vs industry averages (devastating)
20. Outro - Final rating and summary execution

Make each slide UNIQUE and BRUTAL. Reference actual numbers. Be specific and cutting.`,
});

const generateWrappedSlidesFlow = ai.defineFlow(
  {
    name: 'generateWrappedSlidesFlow',
    inputSchema: GenerateWrappedSlidesInputSchema,
    outputSchema: GenerateWrappedSlidesOutputSchema,
  },
  async input => {
    const {output} = await generateWrappedSlidesPrompt(input);
    
    // Post-generation validation: ensure 18-20 slides
    if (!output || !output.slides || output.slides.length < 18 || output.slides.length > 20) {
      throw new Error(`AI must generate 18-20 slides. Generated ${output?.slides?.length || 0} slides.`);
    }
    
    return output;
  }
);