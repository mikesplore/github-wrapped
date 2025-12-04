"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // Determine error type
  const isRateLimitError = 
    error.message.includes("rate limit") || 
    error.message.includes("403") ||
    error.message.includes("API rate limit exceeded");
  
  const isGeminiError = 
    error.message.includes("Gemini") ||
    error.message.includes("AI") ||
    error.message.includes("quota");

  const isAuthError = 
    error.message.includes("401") ||
    error.message.includes("token") ||
    error.message.includes("Unauthorized");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-red-500/10 via-background to-orange-500/10 p-4">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/5 via-transparent to-transparent" />
      
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Error icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-500/10 p-6">
            {isRateLimitError ? (
              <Clock className="h-16 w-16 text-red-500" />
            ) : (
              <AlertCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
        </div>

        {/* Error title */}
        <div className="space-y-2">
          <h1 className="font-headline text-4xl font-black">
            {isRateLimitError ? "Rate Limit Reached" : "Oops! Something Broke"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {isRateLimitError 
              ? "Too many requests, we need a breather!" 
              : "Even our roasts have limits"}
          </p>
        </div>

        {/* Error details */}
        <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-6 space-y-4">
          {isRateLimitError ? (
            <>
              <div className="space-y-2 text-left">
                <p className="text-sm font-semibold">GitHub API Rate Limit Exceeded</p>
                <p className="text-xs text-muted-foreground">
                  We've hit GitHub's API limits due to high demand. This happens when:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Too many users are generating roasts simultaneously</li>
                  <li>You're not logged in (60 requests/hour limit)</li>
                  <li>The app is experiencing heavy traffic</li>
                </ul>
              </div>
              
              <div className="rounded-md bg-blue-500/10 border border-blue-500/20 p-3 space-y-2">
                <p className="text-sm font-semibold text-blue-400">💡 Solutions:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li><strong>Login with GitHub</strong> - Get 5,000 requests/hour instead of 60</li>
                  <li><strong>Wait 10-15 minutes</strong> - Rate limits reset every hour</li>
                  <li><strong>Try again later</strong> - When traffic is lower</li>
                </ul>
              </div>
            </>
          ) : isGeminiError ? (
            <>
              <div className="space-y-2 text-left">
                <p className="text-sm font-semibold">AI Service Temporarily Unavailable</p>
                <p className="text-xs text-muted-foreground">
                  Our AI roasting engine (Google Gemini) is taking a break. This could be due to:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>API quota exceeded for today</li>
                  <li>Temporary service outage</li>
                  <li>Too many concurrent requests</li>
                </ul>
              </div>
              
              <div className="rounded-md bg-blue-500/10 border border-blue-500/20 p-3 space-y-2">
                <p className="text-sm font-semibold text-blue-400">💡 Try Again:</p>
                <p className="text-xs text-muted-foreground ml-4">
                  Wait a few minutes and retry. AI quotas typically reset within an hour.
                </p>
              </div>
            </>
          ) : isAuthError ? (
            <>
              <div className="space-y-2 text-left">
                <p className="text-sm font-semibold">Authentication Error</p>
                <p className="text-xs text-muted-foreground">
                  There's an issue with your GitHub authentication. Please try logging out and back in.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-left">
                {error.message || "An unexpected error occurred while generating your roast."}
              </p>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button 
            onClick={reset}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Helpful tip */}
        <p className="text-xs text-muted-foreground">
          {isRateLimitError 
            ? "Tip: Login with GitHub for higher rate limits and private repo access"
            : "If this persists, please try again in a few minutes"
          }
        </p>
      </div>
    </div>
  );
}
