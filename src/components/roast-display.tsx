"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Code,
  Flame,
  GitCommit,
  GitPullRequest,
  Heart,
  Home,
  MessageSquare,
  Sparkles,
  Star,
  Trash2,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AudioPlayer } from "./audio-player";
import { selectMusicForUser, type UserStats } from "@/lib/music-selector";
import { MarkdownRenderer } from "./markdown-renderer";

type RoastDisplayProps = {
  slides: string[];
  username: string;
  year: number;
  avatarUrl: string;
  stats: UserStats;
};

const iconMapping: Record<string, React.ReactNode> = {
  intro: <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />,
  commit: <GitCommit className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />,
  language: <Code className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />,
  repo: <Trash2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />,
  pr: <GitPullRequest className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />,
  issue: <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />,
  star: <Star className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />,
  activity: <Trophy className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />,
  personality: <Heart className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />,
  outro: <Flame className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />,
};

function getSlideAttributes(slideContent: string, index: number) {
  const lowerCaseContent = slideContent.toLowerCase();
  
  // Enhanced gradient mapping for better visual variety
  const gradientMap: Record<string, string> = {
    intro: "from-purple-900/20 via-pink-900/10 to-red-900/20",
    commit: "from-green-900/20 via-emerald-900/10 to-teal-900/20",
    language: "from-blue-900/20 via-indigo-900/10 to-violet-900/20",
    repo: "from-orange-900/20 via-amber-900/10 to-yellow-900/20",
    graveyard: "from-gray-900/30 via-slate-900/20 to-zinc-900/30",
    pr: "from-cyan-900/20 via-sky-900/10 to-blue-900/20",
    issue: "from-red-900/20 via-rose-900/10 to-pink-900/20",
    star: "from-yellow-900/20 via-amber-900/10 to-orange-900/20",
    activity: "from-emerald-900/20 via-green-900/10 to-lime-900/20",
    personality: "from-fuchsia-900/20 via-purple-900/10 to-violet-900/20",
    streak: "from-red-900/20 via-orange-900/10 to-yellow-900/20",
    social: "from-pink-900/20 via-rose-900/10 to-red-900/20",
    outro: "from-black/40 via-gray-900/30 to-black/40",
  };
  
  let gradient = "from-accent/10 via-background to-primary/5"; // default
  
  for (const key in iconMapping) {
    if (lowerCaseContent.includes(key)) {
      const image =
        PlaceHolderImages.find((img) => img.id === key) ||
        PlaceHolderImages.find((img) => img.id === "fallback");
      gradient = gradientMap[key] || gradient;
      return { icon: iconMapping[key], image, gradient };
    }
  }
  
  const fallbackImage = PlaceHolderImages.find((img) => img.id === "fallback");
  // Distribute icons for slides that don't match keywords
  const defaultIcons = Object.values(iconMapping);
  const gradientValues = Object.values(gradientMap);
  return { 
    icon: defaultIcons[index % defaultIcons.length], 
    image: fallbackImage,
    gradient: gradientValues[index % gradientValues.length]
  };
}

export default function RoastDisplay({
  slides,
  username,
  year,
  avatarUrl,
  stats,
}: RoastDisplayProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Select music based on user stats
  const musicTrack = useMemo(() => selectMusicForUser(stats), [stats]);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const slideData = useMemo(() => {
    return slides.map((slide, index) => {
      const [rawTitle, ...descriptionParts] = slide.split("\n\n");
      // Remove markdown formatting from title (**, *, etc.)
      const title = rawTitle.replace(/\*\*|\*/g, '').trim();
      const description = descriptionParts.join("\n\n");
      const { icon, image, gradient } = getSlideAttributes(slide, index);
      return { title, description, icon, image, gradient };
    });
  }, [slides]);
  
  const progressValue = (current / count) * 100;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        api?.scrollPrev();
      } else if (e.key === "ArrowRight") {
        api?.scrollNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [api]);

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header - Spotify style */}
      <div className="relative z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold sm:text-base">{username}</p>
            <p className="text-xs text-muted-foreground sm:text-sm">{year} Wrapped</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" asChild className="h-10 w-10 sm:h-12 sm:w-12">
          <Link href="/">
            <Home className="h-5 w-5 sm:h-6 sm:w-6" />
          </Link>
        </Button>
      </div>

      {/* Progress bar - Spotify style segmented */}
      <div className="relative z-10 flex gap-1 px-4 py-2 sm:px-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{
                width: i < current - 1 ? "100%" : i === current - 1 ? "100%" : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Main content area - Full screen slides */}
      <div className="relative flex-1 overflow-x-hidden overflow-y-auto">
        <Carousel setApi={setApi} className="h-full w-full" opts={{ loop: false }}>
          <CarouselContent className="h-full">
            {slideData.map((slide, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="relative flex min-h-full w-full items-center justify-center p-0">
                  {/* Enhanced background gradient based on slide type */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/50 to-background" />
                  
                  {/* Image background if available */}
                  {slide.image && (
                    <>
                      <Image
                        src={slide.image.imageUrl}
                        alt={slide.image.description}
                        fill
                        className="object-cover opacity-30 mix-blend-soft-light"
                        data-ai-hint={slide.image.imageHint}
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
                    </>
                  )}

                  {/* Content - optimized for mobile */}
                  <div className="relative z-10 flex min-h-full w-full max-w-4xl flex-col items-center justify-center px-6 py-12 text-center sm:px-12 md:px-20 lg:px-32">
                    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 space-y-6 sm:space-y-8 w-full">
                      {/* Icon */}
                      <div className="flex items-center justify-center">
                        <div className="rounded-full bg-accent/10 p-4 text-accent sm:p-5 md:p-6">
                          {slide.icon}
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="font-headline text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                        {slide.title}
                      </h2>

                      {/* Description - Now with Markdown rendering and proper scrolling */}
                      <div className="mx-auto max-w-2xl w-full">
                        <MarkdownRenderer 
                          content={slide.description}
                          className="text-base sm:text-lg md:text-xl lg:text-2xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation removed - swipe/touch only */}
        </Carousel>
      </div>

      {/* Footer - Slide counter */}
      <div className="relative z-10 border-t bg-background/95 px-4 py-3 text-center backdrop-blur-md sm:px-6 sm:py-4">
        <p className="text-xs text-muted-foreground sm:text-sm">
          Slide {current} of {count}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Swipe to navigate
        </p>
        <p className="mt-2 text-xs text-muted-foreground/60">
          Developed by <span className="font-medium">Mike</span> • Powered by <span className="font-medium">Gemini</span> & <span className="font-medium">GitHub</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground/50">
          Music: <span className="font-medium">{musicTrack.name}</span> • Bensound.com
        </p>
      </div>

      {/* Audio Player */}
      <AudioPlayer track={musicTrack} autoPlay={true} />
    </div>
  );
}
