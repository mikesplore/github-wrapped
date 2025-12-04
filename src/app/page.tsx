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
import { Flame } from "lucide-react";

export default function Home() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center text-center">
        <Logo className="h-24 w-24" />
        <h1 className="mt-4 font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
          Git Roast <span className="text-accent">Wrapped</span>
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground md:text-lg">
          Ever wonder if your code speaks for itself? Well, now it can... and
          it's got jokes. Enter your GitHub username to get your personalized,
          AI-powered roast of your year in code.
        </p>
      </div>

      <Card className="mt-8 w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle>Get Your Roast</CardTitle>
          <CardDescription>
            Enter your GitHub username to begin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={generateReport} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">GitHub Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="e.g., torvalds"
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select name="year" defaultValue={String(currentYear)}>
                <SelectTrigger id="year" className="w-full">
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
            <Button type="submit" size="lg" className="mt-2">
              <Flame className="mr-2 h-5 w-5" />
              Roast Me!
            </Button>
          </form>
        </CardContent>
      </Card>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>Built with Next.js, Genkit, and a questionable sense of humor.</p>
      </footer>
    </main>
  );
}
