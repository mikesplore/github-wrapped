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
    if (error instanceof Error) {
      // Check if it's a Gemini/AI error
      if (error.message.includes('quota') || 
          error.message.includes('RESOURCE_EXHAUSTED') ||
          error.message.includes('429')) {
        throw new Error("Gemini AI quota exceeded. Our AI roasting service has reached its daily limit. Please try again in a few hours or tomorrow.");
      } else if (error.message.includes('API key')) {
        throw new Error("Gemini AI configuration error. Please contact support.");
      } else {
        throw new Error(`AI generation failed: ${error.message}`);
      }
    }
    throw new Error("Failed to generate roast slides. The AI might be overwhelmed.");
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
