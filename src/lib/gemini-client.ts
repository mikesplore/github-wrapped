/**
 * Client-side Gemini API wrapper that uses custom API keys from localStorage
 */

export class GeminiAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "GeminiAPIError";
  }
}

export async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: "Hello" }],
            },
          ],
        }),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function generateContent(
  prompt: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new GeminiAPIError(
      error.error?.message || "Gemini API error",
      response.status
    );
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function analyzeGitHubData(
  data: any,
  apiKey: string
): Promise<any> {
  const prompt = `Analyze this GitHub activity data and provide insights:

User Info: ${JSON.stringify(data.userInfo, null, 2)}
Repositories (${data.repos.length}): ${JSON.stringify(data.repos.slice(0, 10), null, 2)}
Commits: ${data.commits.length}
Pull Requests: ${data.pullRequests.length}
Issues: ${data.issues.length}
Year: ${data.year}

Provide a detailed analysis including:
1. Overall activity level
2. Most used programming languages
3. Repository patterns
4. Coding habits and patterns
5. Notable achievements

Return as JSON with fields: activityLevel, languages, patterns, habits, achievements`;

  const response = await generateContent(prompt, apiKey);
  
  try {
    // Try to parse as JSON first
    return JSON.parse(response);
  } catch {
    // If not JSON, return structured object
    return {
      activityLevel: "moderate",
      languages: [],
      patterns: response,
      habits: "",
      achievements: [],
    };
  }
}

export async function determineDevPersonality(
  analysis: any,
  apiKey: string
): Promise<string> {
  const prompt = `Based on this GitHub analysis, determine the developer's personality type:

${JSON.stringify(analysis, null, 2)}

Choose from: "Code Ninja", "Bug Hunter", "Feature Factory", "Refactor Master", "Documentation Hero", "Commit Machine", "PR Reviewer", "Issue Tracker", "Open Source Contributor", "Solo Developer"

Return only the personality type as a string.`;

  return generateContent(prompt, apiKey);
}

export async function generateComedicCommentary(
  analysis: any,
  apiKey: string
): Promise<string> {
  const prompt = `Create a comedic, roast-style commentary about this developer's year based on their GitHub analysis:

${JSON.stringify(analysis, null, 2)}

Be funny, witty, and slightly sarcastic but not mean. Focus on patterns, habits, and funny observations. Keep it light and entertaining.

Return 3-5 funny observations as a JSON array of strings.`;

  const response = await generateContent(prompt, apiKey);
  
  try {
    return JSON.parse(response);
  } catch {
    return [response];
  }
}

export async function compareYearStats(
  data: any,
  apiKey: string
): Promise<any> {
  const prompt = `Compare this year's GitHub stats and provide insights:

${JSON.stringify(data, null, 2)}

Provide comparison insights as JSON with: trend, growth, highlights`;

  const response = await generateContent(prompt, apiKey);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      trend: "stable",
      growth: 0,
      highlights: response,
    };
  }
}

export async function generateWrappedSlides(
  data: any,
  apiKey: string
): Promise<any[]> {
  const prompt = `Generate GitHub Wrapped slides for ${data.username}'s ${data.year} in code.

Data:
${JSON.stringify({ analysis: data.analysis, personality: data.personality, commentary: data.commentary }, null, 2)}

Create 8-10 engaging slides with:
1. Welcome slide
2. Stats overview
3. Top languages
4. Biggest achievement
5. Funniest moment/pattern
6. Personality reveal
7. Year comparison
8. Closing roast

Return as JSON array with objects: { title: string, content: string, type: "stat" | "text" | "achievement" | "roast" }`;

  const response = await generateContent(prompt, apiKey);
  
  try {
    return JSON.parse(response);
  } catch {
    // Return default slides if parsing fails
    return [
      {
        title: "Welcome!",
        content: `${data.username}'s ${data.year} in Code`,
        type: "text",
      },
      {
        title: "Your Year",
        content: response,
        type: "text",
      },
    ];
  }
}
