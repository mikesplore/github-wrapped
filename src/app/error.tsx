"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="mt-4 font-headline text-2xl">
            Houston, we have a problem!
          </CardTitle>
          <CardDescription className="text-base">
            {error.message || "An unexpected error occurred."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This could be due to an invalid GitHub username, API rate limits, or
            our AI getting a little too creative.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row">
          <Button onClick={() => reset()} className="w-full">
            Try Again
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
