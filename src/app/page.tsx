import { generateReport } from "@/app/actions";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flame, Github, LogOut, Settings } from "lucide-react";
import { auth, signIn } from "@/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  // @ts-ignore
  const githubUsername = session?.username as string | undefined;

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      {/* Settings button - top right */}
      <div className="fixed top-4 right-4 z-10">
        <Link href="/settings">
          <Button variant="outline" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-green-500/10 via-background to-blue-500/10" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-400/5 via-transparent to-transparent" />
      
      {/* Floating gradient orbs */}
      <div className="fixed -left-40 top-0 -z-10 h-80 w-80 animate-pulse rounded-full bg-green-500/20 blur-3xl" />
      <div className="fixed -right-40 bottom-0 -z-10 h-80 w-80 animate-pulse rounded-full bg-blue-500/20 blur-3xl delay-1000" />

      {/* Main content - centered */}
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo className="h-20 w-20 sm:h-24 sm:w-24" />
          </div>
          <div>
            <h1 className="font-headline text-5xl sm:text-6xl font-black tracking-tighter">
              Git Roast
            </h1>
            <h2 className="font-headline text-5xl sm:text-6xl font-black tracking-tighter bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Wrapped
            </h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-sm mx-auto">
            Your year in code, roasted by AI. No mercy, just facts.
          </p>
        </div>

        {/* Auth Section */}
        {session?.user ? (
          <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6 space-y-4">
            <div className="flex items-center gap-4">
              {session.user.image && (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || ''} 
                  className="h-12 w-12 rounded-full ring-2 ring-green-500/20"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold">{session.user.name}</p>
                <p className="text-sm text-muted-foreground">@{githubUsername}</p>
              </div>
              <form action={async () => {
                'use server'
                const { signOut } = await import("@/auth");
                await signOut();
              }}>
                <Button variant="ghost" size="icon" type="submit">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
            
            {/* Form for logged-in users */}
            <form action={generateReport} className="space-y-4">
              <Input
                name="username"
                type="hidden"
                value={githubUsername || ""}
              />
              <Select name="year" defaultValue={String(currentYear)}>
                <SelectTrigger className="h-12 bg-background/50">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <SubmitButton 
                size="lg" 
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500"
                loadingText="Generating Roast..."
              >
                <Flame className="mr-2 h-5 w-5" />
                Roast My Year
              </SubmitButton>
            </form>
            
            <p className="text-xs text-center text-muted-foreground">
              Including private repositories
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Guest form */}
            <form action={generateReport} className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6 space-y-4">
              <Input
                name="username"
                placeholder="GitHub username"
                required
                className="h-12 bg-background/50 text-base"
              />
              <Select name="year" defaultValue={String(currentYear)}>
                <SelectTrigger className="h-12 bg-background/50">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <SubmitButton 
                size="lg" 
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500"
                loadingText="Generating Roast..."
              >
                <Flame className="mr-2 h-5 w-5" />
                Roast Me
              </SubmitButton>
              <p className="text-xs text-center text-muted-foreground">
                Public repositories only
              </p>
            </form>

            {/* Login option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <form action={async () => {
              'use server'
              await signIn("github");
            }}>
              <Button 
                variant="outline" 
                className="w-full h-12" 
                type="submit"
              >
                <Github className="mr-2 h-5 w-5" />
                Login for Private Repos
              </Button>
            </form>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Powered by <span className="font-semibold">Gemini AI</span> • Built by <span className="font-semibold">Mike</span>
        </p>
      </div>
    </main>
  );
}
