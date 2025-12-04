import { generateWrappedSlides } from "@/ai/flows/generate-wrapped-slides";
import RoastDisplay from "@/components/roast-display";
import { getGithubData } from "@/lib/github";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

export const revalidate = 3600; // Revalidate every hour

type RoastPageProps = {
  params: {
    username: string;
    year: string;
  };
};

export async function generateMetadata({ params }: RoastPageProps) {
  return {
    title: `Git Roast for ${params.username} (${params.year})`,
    description: `See the ${params.year} Git Roast for ${params.username}.`,
  };
}

export default async function RoastPage({ params }: RoastPageProps) {
  const { username } = params;
  const year = parseInt(params.year, 10);

  if (isNaN(year)) {
    notFound();
  }

  // Get OAuth session if user is logged in
  const session = await auth();
  // @ts-ignore
  const userToken = session?.accessToken as string | undefined;

  let githubData;
  try {
    githubData = await getGithubData(username, year, userToken);
  } catch (error) {
    if (error instanceof Error) {
        // This will be caught by the nearest error.js file
        throw new Error(error.message || 'Failed to fetch data from GitHub.');
    }
    throw new Error('An unknown error occurred while fetching GitHub data.');
  }

  if (!githubData) {
    throw new Error("Could not retrieve GitHub data.");
  }
  
  let slides;
  try {
    const result = await generateWrappedSlides({
      githubData: JSON.stringify(githubData, null, 2),
      username,
      year,
    });
    slides = result.slides;
  } catch (error) {
    console.error("AI Generation Error:", error);
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      // Check for specific Gemini errors
      if (errorMsg.includes('overloaded') || errorMsg.includes('503')) {
        throw new Error("🔥 Gemini AI is overloaded! The model is experiencing high traffic right now. Please wait a few minutes and try again. Your roast will be worth the wait!");
      } else if (errorMsg.includes('quota') || 
                 errorMsg.includes('resource_exhausted') ||
                 errorMsg.includes('429')) {
        throw new Error("💀 Gemini AI quota exceeded! We've hit the daily limit for roasting. Please try again in a few hours or tomorrow. The AI needs a break from being so savage!");
      } else if (errorMsg.includes('api key') || errorMsg.includes('401')) {
        throw new Error("🔑 Gemini AI authentication failed. Please contact support - our roasting credentials need refreshing!");
      } else if (errorMsg.includes('rate limit')) {
        throw new Error("⚡ Gemini AI rate limit reached. Too many roasts happening at once! Wait a minute and try again.");
      } else if (errorMsg.includes('timeout')) {
        throw new Error("⏱️ Gemini AI request timed out. The AI is thinking too hard about how to roast you. Try again!");
      } else {
        // Pass through the actual error message from Gemini
        throw new Error(`🤖 Gemini AI Error: ${error.message}`);
      }
    }
    throw new Error("Failed to generate roast slides. The AI might be overwhelmed with your epic coding stats!");
  }

  if (!slides || slides.length === 0) {
    throw new Error("The AI failed to generate slides. It might be speechless for once.");
  }

  return (
    <main className="h-screen w-full overflow-hidden">
      <RoastDisplay
        slides={slides}
        username={username}
        year={year}
        avatarUrl={githubData.user.avatar_url}
        stats={{
          commits: githubData.stats.commits,
          repos: githubData.stats.repos,
          pullRequests: githubData.stats.pullRequests,
          issues: githubData.stats.issues,
          dominantLanguage: githubData.languages[0]?.[0],
        }}
      />
    </main>
  );
}
