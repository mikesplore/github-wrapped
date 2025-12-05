"use client";

import { useState, useEffect } from "react";
import RoastDisplay from "./roast-display";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings } from "lucide-react";
import * as GitHubClient from "@/lib/github-client";
import * as GeminiClient from "@/lib/gemini-client";

interface RoastGeneratorProps {
  username: string;
  year: number;
}

export function RoastGenerator({ username, year }: RoastGeneratorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roastData, setRoastData] = useState<any>(null);
  const [useCustomKeys, setUseCustomKeys] = useState(false);
  const [progress, setProgress] = useState<string>("Initializing...");

  useEffect(() => {
    async function generateRoast() {
      try {
        setLoading(true);
        setError(null);

        // Check for custom keys in localStorage
        const userGithubToken = localStorage.getItem("user_github_token");
        const userGeminiKey = localStorage.getItem("user_gemini_key");
        
        if (userGithubToken || userGeminiKey) {
          setUseCustomKeys(true);
        }

        // Fetch GitHub data
        setProgress("Fetching GitHub data...");
        const [userInfo, repos, commits, pullRequests, issues] = await Promise.all([
          GitHubClient.getUserInfo(username, userGithubToken || undefined),
          GitHubClient.getUserRepositories(username, year, userGithubToken || undefined),
          GitHubClient.getUserCommits(username, year, userGithubToken || undefined),
          GitHubClient.getUserPullRequests(username, year, userGithubToken || undefined),
          GitHubClient.getUserIssues(username, year, userGithubToken || undefined),
        ]);

        // If we have a custom Gemini key, use client-side AI
        if (userGeminiKey) {
          setProgress("Analyzing your GitHub data...");
          const analysis = await GeminiClient.analyzeGitHubData({
            userInfo,
            repos,
            commits,
            pullRequests,
            issues,
            year,
          }, userGeminiKey);

          setProgress("Determining your dev personality...");
          const personality = await GeminiClient.determineDevPersonality(analysis, userGeminiKey);

          setProgress("Generating comedic commentary...");
          const commentary = await GeminiClient.generateComedicCommentary(analysis, userGeminiKey);

          setProgress("Comparing year stats...");
          const comparison = await GeminiClient.compareYearStats({
            currentYear: year,
            analysis,
          }, userGeminiKey);

          setProgress("Creating your personalized slides...");
          const slides = await GeminiClient.generateWrappedSlides({
            username,
            year,
            analysis,
            personality,
            commentary,
            comparison,
          }, userGeminiKey);

          setRoastData({ slides });
        } else {
          // Use server-side generation (existing flow)
          setProgress("Generating your roast...");
          const response = await fetch("/api/generate-roast", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              year,
              userInfo,
              repos,
              commits,
              pullRequests,
              issues,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate roast");
          }

          const data = await response.json();
          setRoastData(data);
        }
      } catch (err) {
        console.error("Error generating roast:", err);
        if (err instanceof GitHubClient.GitHubAPIError) {
          setError(err.message);
        } else if (err instanceof GeminiClient.GeminiAPIError) {
          setError(err.message);
        } else {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    generateRoast();
  }, [username, year]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-xl text-gray-300">
            {progress}
          </p>
          <p className="text-sm text-gray-500">
            {useCustomKeys ? "Using your custom API keys" : "This may take a moment"}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    const isRateLimit = error.toLowerCase().includes("rate limit");
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-6">
          <div className="text-6xl">😞</div>
          <h1 className="text-3xl font-bold text-white">Oops!</h1>
          <p className="text-gray-300">{error}</p>
          
          {isRateLimit && !useCustomKeys && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
              <p className="text-blue-300 text-sm">
                💡 <strong>Tip:</strong> Provide your own API keys to avoid rate limits!
              </p>
              <Link href="/settings">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure API Keys
                </Button>
              </Link>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button 
              onClick={() => router.push("/")}
              variant="outline"
              className="flex-1"
            >
              Go Home
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!roastData) {
    return null;
  }

  return <RoastDisplay slides={roastData.slides} />;
}
