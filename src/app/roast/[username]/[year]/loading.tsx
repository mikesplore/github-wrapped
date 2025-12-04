import { Logo } from "@/components/logo";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="relative">
        <Logo className="h-24 w-24" />
        <Loader2 className="absolute -top-2 -right-2 h-8 w-8 animate-spin text-accent" />
      </div>
      <h1 className="mt-4 font-headline text-3xl font-bold tracking-tight">
        Brewing the perfect roast...
      </h1>
      <p className="max-w-sm text-muted-foreground">
        Our AI is meticulously analyzing your commits, one witty remark at a
        time. Please wait, greatness (and mockery) takes a moment.
      </p>
    </main>
  );
}
