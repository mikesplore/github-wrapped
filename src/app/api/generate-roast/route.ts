import { NextRequest, NextResponse } from "next/server";
import { generateWrappedSlides } from "@/ai/flows/generate-wrapped-slides";
import { analyzeGithubData } from "@/ai/flows/analyze-github-data";
import { determineDevPersonality } from "@/ai/flows/determine-dev-personality";
import { generateComedicCommentary } from "@/ai/flows/generate-comedic-commentary";
import { compareYearStats } from "@/ai/flows/compare-year-stats";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, year, userInfo, repos, commits, pullRequests, issues } = body;

    if (!username || !year) {
      return NextResponse.json(
        { error: "Username and year are required" },
        { status: 400 }
      );
    }

    // Analyze data with Gemini (using server-side Genkit)
    const analysis = await analyzeGithubData({
      userInfo,
      repos,
      commits,
      pullRequests,
      issues,
      year,
    });

    const personality = await determineDevPersonality(analysis);
    const commentary = await generateComedicCommentary(analysis);
    const comparison = await compareYearStats({
      currentYear: year,
      analysis,
    });

    // Generate slides
    const slides = await generateWrappedSlides({
      username,
      year,
      analysis,
      personality,
      commentary,
      comparison,
    });

    return NextResponse.json({ slides });
  } catch (error) {
    console.error("Error generating roast:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    const isRateLimit = errorMessage.toLowerCase().includes("rate limit") ||
                        errorMessage.toLowerCase().includes("quota");
    
    return NextResponse.json(
      { 
        error: errorMessage,
        isRateLimit,
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
