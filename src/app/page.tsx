import { generateReport } from "@/app/actions";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flame, Github, Sparkles, TrendingUp } from "lucide-react";

export default function Home() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4">
      {/* Spotify-inspired gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-accent/20 via-background to-primary/5" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
      
      {/* Animated gradient orbs */}
      <div className="fixed left-0 top-0 -z-10 h-96 w-96 animate-pulse rounded-full bg-accent/10 blur-3xl" />
      <div className="fixed bottom-0 right-0 -z-10 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl delay-700" />

      <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-8 lg:flex-row lg:items-start lg:gap-12">
        {/* Left side - Hero content */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left lg:pt-12">
          <div className="mb-6 flex items-center gap-3">
            <Logo className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24" />
            <div className="flex flex-col">
              <h1 className="font-headline text-4xl font-black tracking-tighter sm:text-5xl lg:text-6xl xl:text-7xl">
                Git Roast
              </h1>
              <span className="bg-gradient-to-r from-accent to-accent/60 bg-clip-text font-headline text-4xl font-black tracking-tighter text-transparent sm:text-5xl lg:text-6xl xl:text-7xl">
                Wrapped
              </span>
            </div>
          </div>
          
          <p className="mb-6 max-w-lg text-base text-muted-foreground sm:text-lg lg:text-xl">
            Your code doesn't lie, and neither do we. Get ready for the most savage, 
            AI-powered roast of your coding year. Spotify Wrapped vibes, GitHub reality check.
          </p>

          {/* Feature highlights */}
          <div className="mb-8 grid w-full max-w-md gap-3 sm:gap-4">
            <div className="flex items-start gap-3 rounded-lg bg-card/50 p-3 backdrop-blur-sm sm:p-4">
              <Sparkles className="mt-1 h-5 w-5 flex-shrink-0 text-accent sm:h-6 sm:w-6" />
              <div className="text-left">
                <h3 className="text-sm font-bold sm:text-base">Savage AI Roasts</h3>
                <p className="text-xs text-muted-foreground sm:text-sm">No mercy, just facts wrapped in comedy</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-card/50 p-3 backdrop-blur-sm sm:p-4">
              <Github className="mt-1 h-5 w-5 flex-shrink-0 text-accent sm:h-6 sm:w-6" />
              <div className="text-left">
                <h3 className="text-sm font-bold sm:text-base">Public & Private Repos</h3>
                <p className="text-xs text-muted-foreground sm:text-sm">Complete stats, nothing hidden</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-card/50 p-3 backdrop-blur-sm sm:p-4">
              <TrendingUp className="mt-1 h-5 w-5 flex-shrink-0 text-accent sm:h-6 sm:w-6" />
              <div className="text-left">
                <h3 className="text-sm font-bold sm:text-base">Spotify-Style Slides</h3>
                <p className="text-xs text-muted-foreground sm:text-sm">Swipe through your year in code</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form card */}
        <div className="w-full max-w-md lg:max-w-lg">
          <Card className="border-2 shadow-2xl backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl sm:text-3xl">Ready to Get Roasted?</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Enter your GitHub username and brace yourself.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={generateReport} className="flex flex-col gap-4 sm:gap-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium sm:text-base">GitHub Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="e.g., torvalds"
                    required
                    className="h-11 text-base sm:h-12 sm:text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm font-medium sm:text-base">Year</Label>
                  <Select name="year" defaultValue={String(currentYear)}>
                    <SelectTrigger id="year" className="h-11 w-full sm:h-12">
                      <SelectValue placeholder="Select a year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="mt-2 h-12 text-base font-bold sm:h-14 sm:text-lg hover:scale-[1.02] transition-transform"
                >
                  <Flame className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                  Roast Me!
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <p className="mt-6 text-center text-xs text-muted-foreground sm:text-sm">
            Developed by <span className="font-semibold">Mike</span> • Powered by <span className="font-semibold">Gemini</span> & <span className="font-semibold">GitHub</span>
          </p>
        </div>
      </div>
    </main>
  );
}
