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
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Progress } from "./ui/progress";

type RoastDisplayProps = {
  slides: string[];
  username: string;
  year: number;
  avatarUrl: string;
};

const iconMapping: Record<string, React.ReactNode> = {
  intro: <Sparkles className="h-8 w-8 text-accent" />,
  commit: <GitCommit className="h-8 w-8 text-accent" />,
  language: <Code className="h-8 w-8 text-accent" />,
  repo: <Trash2 className="h-8 w-8 text-accent" />,
  pr: <GitPullRequest className="h-8 w-8 text-accent" />,
  issue: <MessageSquare className="h-8 w-8 text-accent" />,
  star: <Star className="h-8 w-8 text-accent" />,
  activity: <Trophy className="h-8 w-8 text-accent" />,
  personality: <Heart className="h-8 w-8 text-accent" />,
  outro: <Flame className="h-8 w-8 text-accent" />,
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
}: RoastDisplayProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

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

  return (
    <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={avatarUrl} alt={username} />
                    <AvatarFallback>{username.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold">{username}</p>
                    <p className="text-sm text-muted-foreground">{year} Wrapped</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" asChild>
                <Link href="/"><Home /></Link>
            </Button>
        </div>

        <Progress value={progressValue} className="mb-4 h-2" />

      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {slideData.map((slide, index) => (
            <CarouselItem key={index}>
              <Card className="relative aspect-[4/3] w-full overflow-hidden border-2 shadow-lg">
                {slide.image && (
                  <Image
                    src={slide.image.imageUrl}
                    alt={slide.image.description}
                    fill
                    className="object-cover"
                    data-ai-hint={slide.image.imageHint}
                    priority={index === 0}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                    <div className="mb-2 flex items-center gap-3">{slide.icon}</div>
                    <h2 className="font-headline text-3xl font-bold text-white shadow-black/50 text-shadow-lg md:text-4xl">
                      {slide.title}
                    </h2>
                    <p className="mt-2 text-base text-gray-200 shadow-black/50 text-shadow-md md:text-lg whitespace-pre-wrap">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-[-4rem]" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-[-4rem]" />
      </Carousel>

      <div className="py-2 text-center text-sm text-muted-foreground">
        Slide {current} of {count}
      </div>
    </div>
  );
}
