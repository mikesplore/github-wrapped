import { generateWrappedSlides } from "@/ai/flows/generate-wrapped-slides";
import RoastDisplay from "@/components/roast-display";
import { getGithubData } from "@/lib/github";
import { notFound } from "next/navigation";

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

  let githubData;
  try {
    githubData = await getGithubData(username, year);
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
  
  const { slides } = await generateWrappedSlides({
    githubData: JSON.stringify(githubData, null, 2),
    username,
    year,
  });

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
      />
    </main>
  );
}
