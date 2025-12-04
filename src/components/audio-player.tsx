"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { MusicTrack } from "@/lib/music-selector";

interface AudioPlayerProps {
  track: MusicTrack;
  autoPlay?: boolean;
}

export function AudioPlayer({ track, autoPlay = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3); // Default 30% volume
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      
      if (autoPlay) {
        // Try to autoplay, but handle if browser blocks it
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [autoPlay, volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          console.log("Audio playback was prevented");
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full bg-background/90 px-3 py-2 shadow-lg backdrop-blur-md border sm:bottom-24 sm:right-6 sm:px-4 sm:py-3">
      <audio
        ref={audioRef}
        src={track.url}
        loop
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className="h-8 w-8 sm:h-10 sm:w-10"
        title={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Play className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="h-8 w-8 sm:h-10 sm:w-10"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </Button>

      <div className="hidden sm:flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume * 100}
          onChange={(e) => {
            const newVolume = parseInt(e.target.value) / 100;
            setVolume(newVolume);
            if (audioRef.current) {
              audioRef.current.volume = newVolume;
            }
            if (newVolume > 0 && isMuted) {
              setIsMuted(false);
              if (audioRef.current) {
                audioRef.current.muted = false;
              }
            }
          }}
          className="w-20 accent-accent"
          title="Volume"
        />
      </div>

      <span className="hidden text-xs text-muted-foreground md:block">
        {track.name}
      </span>
    </div>
  );
}
