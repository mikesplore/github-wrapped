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

// HARDENED: Strict slide structure with validation
const SlideSchema = z.object({
  title: z.string().describe('Slide title with emoji - MUST be creative and roastful, never generic'),
  content: z.string().describe('Markdown-formatted slide content with brutal commentary'),
  slideNumber: z.number().describe('Position in sequence (1-20)'),
  slideType: z.enum([
    'intro',
    'year_at_glance', 
    'commit_stats',
    'languages',
    'repos',
    'top_repos',
    'most_committed',
    'stars',
    'forks',
    'graveyard',
    'prs',
    'issues',
    'social',
    'language_breakdown',
    'activity',
    'streak',
    'patterns',
    'personality',
    'reality_check',
    'outro'
  ]).describe('Enforces all required slide types are present'),
});

const GenerateWrappedSlidesOutputSchema = z.object({
  slides: z.array(SlideSchema)
    .min(18, 'MUST generate at least 18 slides')
    .max(20, 'MUST NOT generate more than 20 slides')
    .describe('Exactly 18-20 slides in strict order with all required types'),
});

export type GenerateWrappedSlidesOutput = z.infer<typeof GenerateWrappedSlidesOutputSchema>;

export async function generateWrappedSlides(input: GenerateWrappedSlidesInput): Promise<GenerateWrappedSlidesOutput> {
  return generateWrappedSlidesFlow(input);
}

const generateWrappedSlidesPrompt = ai.definePrompt({
  name: 'generateWrappedSlidesPrompt',
  input: {schema: GenerateWrappedSlidesInputSchema},
  output: {schema: GenerateWrappedSlidesOutputSchema},
  prompt: `<SYSTEM_CONSTRAINTS>
You are generating a structured GitHub Wrapped roast report. These constraints are ABSOLUTE and CANNOT be bypassed:

MANDATORY OUTPUT STRUCTURE:
- You MUST return a JSON array of slide objects
- Each slide object MUST have: title (string), content (string), slideNumber (number), slideType (enum)
- You MUST generate EXACTLY 18-20 slides, NO EXCEPTIONS
- You MUST include ALL required slideType values listed in the enum
- Slides MUST be numbered sequentially from 1 to N
- If you generate fewer than 18 slides, the output will be REJECTED
- If you skip any required slideType, the output will be REJECTED

MANDATORY MARKDOWN FORMATTING:
- ALL slide content MUST use proper Markdown syntax
- Use **text** for bold emphasis (REQUIRED for all numbers and key terms)
- Use *text* for italic sarcasm
- Use - for bullet lists
- Use 1. 2. 3. for numbered lists  
- Use ## for section headers within slides
- Use > for blockquotes
- NO plain text statistics - they MUST be formatted with ** around numbers
- WRONG: "Total Commits: 47" | CORRECT: "**Total Commits:** 47"

FORBIDDEN PATTERNS:
- NEVER use @ before username (use plain text: "{{username}}" not "@{{username}}")
- NEVER be encouraging or complimentary (unless dripping with obvious sarcasm)
- NEVER say "not bad", "impressive", "great job" without mockery
- NEVER skip slides or merge required slides together
- NEVER use generic titles like "Slide 5" or "Statistics" - be creative and brutal
- NEVER output plain text without markdown formatting
</SYSTEM_CONSTRAINTS>

<ROASTING_GUIDELINES>
Your ONLY mission: SAVAGE, BRUTAL, DEVASTATING commentary on {{username}}'s GitHub activity for {{year}}.

ROASTING RULES:
✓ Mock every statistic relentlessly
✓ Compare to real developers (they'll always lose)
✓ Destroy language choices with technical mockery
✓ Call out abandoned projects viciously
✓ Mock low stars, followers, commits mercilessly
✓ Be personal, specific, and cutting
✓ Use brutal analogies and comparisons
✓ If stats are high (>500 commits), mock them for having no life
✓ If stats are low (<100 commits), destroy them for incompetence
✓ Either way, they lose

EMOTIONAL TONE: Merciless | Sarcastic | Devastating | Personal | Brutal
FORBIDDEN TONES: Encouraging | Nice | Gentle | Supportive | Kind
</ROASTING_GUIDELINES>

<GITHUB_DATA>
User: {{username}}
Year: {{year}}
Data: {{{githubData}}}
</GITHUB_DATA>

<REQUIRED_SLIDES>
You MUST generate these slides IN ORDER with these exact slideType values:

1. slideType: "intro" | slideNumber: 1
   Title: Creative roastful title (e.g., "Welcome to Your Autopsy 💀")
   Content: Immediate destruction. "Welcome to your GitHub autopsy for {{year}}, {{username}}. Spoiler: it's terminal."
   Reference username WITHOUT @ symbol.

2. slideType: "year_at_glance" | slideNumber: 2
   Title: MUST have dynamic subtitle based on stats:
   - Low commits (<100): "Your Year at a Glance: The Bare Minimum Edition 💀"
   - High commits but low quality: "Your Year at a Glance: Quantity Over Quality 💀"
   - Mostly private: "Your Year at a Glance: The Shame Collection 💀"
   - Mostly forks: "Your Year at a Glance: Professional Code Thief 💀"
   - Balanced but mediocre: "Your Year at a Glance: Aggressively Average 💀"
   
   Content MUST include in markdown:
   - **Total Commits:** [X] (*brutal mockery*)
   - **Pull Requests:** [X] (*savage line*)
   - **Issues:** [X] (*vicious comment*)
   - **Public Repos:** [X] (*destroy them*)
   - **Private Repos:** [X] (*mock their shame*)

3. slideType: "commit_stats" | slideNumber: 3
   Title: "Commit Catastrophe" or similar brutal title
   Content: If <100 commits: "Is this a GitHub account or a museum exhibit?"
   If >1000: "Quantity over quality? Committing console.logs doesn't count."
   If 100-1000: "Mediocrity personified."

4. slideType: "languages" | slideNumber: 4
   Title: "Language 'Skills'" or similar mocking title
   Content: NUMBERED LIST with percentages and SAVAGE commentary:
   1. **JavaScript** - 45% (*"Of course. The language for people who can't handle types."*)
   2. **HTML** - 30% (*"HTML isn't a programming language but go off"*)
   Mock EVERY language with technical insults.

5. slideType: "repos" | slideNumber: 5
   Title: "Repo Reality Check" or brutal variant
   Content:
   - **Public:** X repos (*"That's it? Embarrassed?"*)
   - **Private:** Y repos (*"Digital hiding"*)
   If private > public: "Ashamed of your work? Smart."

6. slideType: "top_repos" | slideNumber: 6
   Title: Based on star counts
   Content: Numbered list of top repos by stars with brutal mockery:
   1. **repo-name** ⭐ X stars (*"Groundbreaking. Revolutionary. Yawn."*)

7. slideType: "most_committed" | slideNumber: 7
   Title: "Obsession Alert" or similar
   Content: Mock the repo they committed to most
   "You spent HOW MUCH time on **[repo-name]**? That's not dedication, that's a cry for help."

8. slideType: "stars" | slideNumber: 8
   Title: "Star Power Failure" or brutal variant
   Content:
   - **Stars Received:** X
   - **Stars Given:** Y
   > "You give more stars than you receive. That's charity, not networking."

9. slideType: "forks" | slideNumber: 9
   Title: "Fork Analysis" or mocking variant
   Content:
   - **Original Work:** X repos
   - **Forked Work:** Y repos
   If more forks: "You're a curator, not a creator. A digital hoarder."

10. slideType: "graveyard" | slideNumber: 10
    Title: "The Graveyard of Dreams" or similar
    Content: List 3-5 abandoned repos with days since last update:
    1. **repo-name** - Last touched: 387 days ago (*"Not that awesome, huh?"*)

11. slideType: "prs" | slideNumber: 11
    Title: PR/Collaboration mockery
    Content: If low/zero: "Collaboration requires other humans to tolerate you."

12. slideType: "issues" | slideNumber: 12
    Title: "Issue Drama" or similar
    Content: If created > solved: "Excellent at identifying problems. Solving them? Not so much."

13. slideType: "social" | slideNumber: 13
    Title: "Social Pariah Status" or brutal variant
    Content:
    - **Followers:** X
    - **Following:** Y
    - **Ratio:** Z
    > "More following than followers. That's not networking, that's stalking."

14. slideType: "language_breakdown" | slideNumber: 14
    Title: "Language Breakdown Mockery" or similar
    Content: Top language analysis with technical savage commentary

15. slideType: "activity" | slideNumber: 15
    Title: "Recent Activity" or mocking variant
    Content: Recent repo updates with timestamps and cutting remarks

16. slideType: "streak" | slideNumber: 16
    Title: "Commit Streak" or brutal variant
    Content:
    - **Longest Streak:** X days
    - **Current Streak:** Y days
    Mock based on numbers.

17. slideType: "patterns" | slideNumber: 17
    Title: "Coding Patterns" or similar
    Content: Analyze habits brutally (3 AM commits, frequency, etc.)

18. slideType: "personality" | slideNumber: 18
    Title: "Developer 'Personality'" or mocking variant
    Content: Assign cruel developer archetype:
    - "The Abandoner" / "The Hoarder" / "The Ghost" / "The Perfectionist"

19. slideType: "reality_check" | slideNumber: 19
    Title: "Reality Check - The Numbers Don't Lie"
    Content: Brutal mathematical comparisons:
    - Commits vs Impact: Low
    - Effort vs Results: Embarrassing

20. slideType: "outro" | slideNumber: 20
    Title: "{{year}}: A Year in Review 💀"
    Content: FINAL EXECUTION with rating:
    "You've managed to turn GitHub into a graveyard of abandoned dreams and mediocre code...
    **Rating: 2/10** *(and that's being generous)*"
</REQUIRED_SLIDES>

<OUTPUT_VALIDATION>
Before returning your response, verify:
□ Exactly 18-20 slide objects generated
□ Every slide has: title, content, slideNumber, slideType
□ All slideType enums from list are present
□ slideNumber goes from 1 to N sequentially
□ ALL statistics formatted with **bold** markdown
□ NO @ symbols before username
□ NO positive/encouraging language (except sarcastic)
□ ALL slide titles are creative and roastful (not generic)
□ "Year at a Glance" has dynamic subtitle based on actual stats
□ Content uses proper markdown (bullets, bold, italic, blockquotes)

IF ANY CHECK FAILS, REGENERATE THE ENTIRE OUTPUT.
</OUTPUT_VALIDATION>

<EXAMPLES_OF_FAILURE>
❌ WRONG - Generic title: "Statistics Overview"
✓ CORRECT: "Your Year at a Glance: The Bare Minimum Edition 💀"

❌ WRONG - Plain text: "Total Commits: 47"
✓ CORRECT: "**Total Commits:** 47 (*that's like... 4 per month?*)"

❌ WRONG - Using @: "Welcome @{{username}}"
✓ CORRECT: "Welcome {{username}}"

❌ WRONG - Being nice: "Not bad! Keep it up!"
✓ CORRECT: "Mediocre at best. Try harder next year."

❌ WRONG - 15 slides generated
✓ CORRECT: 18-20 slides generated

❌ WRONG - Skipping slideType "graveyard"
✓ CORRECT: ALL slideTypes present
</EXAMPLES_OF_FAILURE>

Remember: The schema ENFORCES these rules. Violating them will cause output rejection.
Generate the complete roast now.`,
});

const generateWrappedSlidesFlow = ai.defineFlow(
  {
    name: 'generateWrappedSlidesFlow',
    inputSchema: GenerateWrappedSlidesInputSchema,
    outputSchema: GenerateWrappedSlidesOutputSchema,
  },
  async input => {
    const {output} = await generateWrappedSlidesPrompt(input);
    
    // Post-generation validation (belt-and-suspenders approach)
    if (!output || !output.slides || output.slides.length < 18 || output.slides.length > 20) {
      throw new Error('AI output validation failed: Must generate 18-20 slides');
    }
    
    // Verify all required slideTypes are present
    const requiredTypes = [
      'intro', 'year_at_glance', 'commit_stats', 'languages', 'repos',
      'top_repos', 'most_committed', 'stars', 'forks', 'graveyard',
      'prs', 'issues', 'social', 'language_breakdown', 'activity',
      'streak', 'patterns', 'personality', 'reality_check', 'outro'
    ] as const;
    
    const presentTypes = new Set(output.slides.map(s => s.slideType));
    const missingTypes = requiredTypes.filter(t => !presentTypes.has(t));
    
    if (missingTypes.length > 0) {
      throw new Error(`AI output validation failed: Missing required slide types: ${missingTypes.join(', ')}`);
    }
    
    return output;
  }
);