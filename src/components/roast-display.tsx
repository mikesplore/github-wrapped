"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Code,
  Flame,
  GitCommit,
  GitPullRequest,
  Github,
  Heart,
  Home,
  MessageSquare,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Progress } from "./ui/progress";
import { AudioPlayer } from "./audio-player";
import { selectMusicForUser, type UserStats } from "@/lib/music-selector";

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
  for (const key in iconMapping) {
    if (lowerCaseContent.includes(key)) {
      const image =
        PlaceHolderImages.find((img) => img.id === key) ||
        PlaceHolderImages.find((img) => img.id === "fallback");
      return { icon: iconMapping[key], image };
    }
  }
  const fallbackImage = PlaceHolderImages.find((img) => img.id === "fallback");
  // Distribute icons for slides that don't match keywords
  const defaultIcons = Object.values(iconMapping);
  return { icon: defaultIcons[index % defaultIcons.length], image: fallbackImage };
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
      const [title, ...descriptionParts] = slide.split("\n\n");
      const description = descriptionParts.join("\n\n");
      const { icon, image } = getSlideAttributes(slide, index);
      return { title, description, icon, image };
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
      <div className="relative flex-1 overflow-hidden">
        <Carousel setApi={setApi} className="h-full w-full" opts={{ loop: false }}>
          <CarouselContent className="h-full">
            {slideData.map((slide, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="relative flex h-full w-full items-center justify-center p-0">
                  {/* Background gradient based on slide type */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-primary/5" />
                  
                  {/* Image background if available */}
                  {slide.image && (
                    <>
                      <Image
                        src={slide.image.imageUrl}
                        alt={slide.image.description}
                        fill
                        className="object-cover opacity-20"
                        data-ai-hint={slide.image.imageHint}
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" />
                    </>
                  )}

                  {/* Content - with padding to avoid button overlap */}
                  <div className="relative z-10 flex h-full w-full max-w-4xl flex-col items-center justify-center px-20 py-12 text-center sm:px-24 md:px-32 lg:px-40">
                    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 space-y-6 sm:space-y-8">
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

                      {/* Description */}
                      <p className="mx-auto max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl lg:text-2xl">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation buttons - Desktop */}
          <div className="hidden md:block">
            <CarouselPrevious className="absolute left-4 top-1/2 h-12 w-12 -translate-y-1/2 border-2 bg-background/80 backdrop-blur-sm hover:bg-background lg:left-8" />
            <CarouselNext className="absolute right-4 top-1/2 h-12 w-12 -translate-y-1/2 border-2 bg-background/80 backdrop-blur-sm hover:bg-background lg:right-8" />
          </div>

          {/* Navigation buttons - Mobile (touch-friendly, positioned at edges) */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 touch-manipulation rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/60 pointer-events-auto ml-2"
              onClick={() => api?.scrollPrev()}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 touch-manipulation rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/60 pointer-events-auto mr-2"
              onClick={() => api?.scrollNext()}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </Carousel>
      </div>

      {/* Footer - Slide counter */}
      <div className="relative z-10 border-t bg-background/95 px-4 py-3 text-center backdrop-blur-md sm:px-6 sm:py-4">
        <p className="text-xs text-muted-foreground sm:text-sm">
          Slide {current} of {count}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Swipe or use arrow keys to navigate
        </p>
      </div>

      {/* Audio Player */}
      <AudioPlayer track={musicTrack} autoPlay={false} />
    </div>
  );
}
