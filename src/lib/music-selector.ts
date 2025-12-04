/**
 * Selects background music based on GitHub user stats and personality
 */

export interface UserStats {
  commits: number;
  repos: number;
  pullRequests: number;
  issues: number;
  dominantLanguage?: string;
  personality?: string;
}

export interface MusicTrack {
  name: string;
  url: string;
  vibe: string;
}

// Curated list of royalty-free music tracks from Bensound
// These are real, high-quality tracks that are free to use with attribution
const musicLibrary: MusicTrack[] = [
  // High energy tracks for productive developers
  {
    name: "Epic",
    url: "https://www.bensound.com/bensound-music/bensound-epic.mp3",
    vibe: "high-energy"
  },
  {
    name: "Groovy Hip Hop",
    url: "https://www.bensound.com/bensound-music/bensound-groovyhiphop.mp3",
    vibe: "high-energy"
  },
  {
    name: "Energy",
    url: "https://www.bensound.com/bensound-music/bensound-energy.mp3",
    vibe: "high-energy"
  },
  
  // Chill tracks for moderate activity
  {
    name: "Sunny",
    url: "https://www.bensound.com/bensound-music/bensound-sunny.mp3",
    vibe: "chill"
  },
  {
    name: "Creative Minds",
    url: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3",
    vibe: "chill"
  },
  {
    name: "The Lounge",
    url: "https://www.bensound.com/bensound-music/bensound-thelounge.mp3",
    vibe: "chill"
  },
  
  // Dramatic tracks for prolific coders
  {
    name: "Memories",
    url: "https://www.bensound.com/bensound-music/bensound-memories.mp3",
    vibe: "dramatic"
  },
  {
    name: "Sci-Fi",
    url: "https://www.bensound.com/bensound-music/bensound-scifi.mp3",
    vibe: "dramatic"
  },
  {
    name: "Extreme Action",
    url: "https://www.bensound.com/bensound-music/bensound-extremeaction.mp3",
    vibe: "dramatic"
  },
  
  // Comedic/quirky tracks
  {
    name: "Funny Song",
    url: "https://www.bensound.com/bensound-music/bensound-funnysong.mp3",
    vibe: "quirky"
  },
  {
    name: "Little Idea",
    url: "https://www.bensound.com/bensound-music/bensound-littleidea.mp3",
    vibe: "quirky"
  },
  {
    name: "Ukulele",
    url: "https://www.bensound.com/bensound-music/bensound-ukulele.mp3",
    vibe: "quirky"
  },
  
  // Ambient for beginners
  {
    name: "Deep Blue",
    url: "https://www.bensound.com/bensound-music/bensound-deepblue.mp3",
    vibe: "ambient"
  },
  {
    name: "A New Beginning",
    url: "https://www.bensound.com/bensound-music/bensound-anewbeginning.mp3",
    vibe: "ambient"
  },
  {
    name: "Acoustic Breeze",
    url: "https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3",
    vibe: "ambient"
  }
];

/**
 * Determines music vibe based on user stats
 */
export function getMusicVibeFromStats(stats: UserStats): string {
  const { commits, repos, pullRequests, issues, dominantLanguage, personality } = stats;
  
  // Check personality first if available
  if (personality) {
    const lowerPersonality = personality.toLowerCase();
    if (lowerPersonality.includes("tutorial") || lowerPersonality.includes("beginner")) {
      return "ambient";
    }
    if (lowerPersonality.includes("prolific") || lowerPersonality.includes("master")) {
      return "dramatic";
    }
    if (lowerPersonality.includes("procrastinator") || lowerPersonality.includes("lazy")) {
      return "quirky";
    }
  }
  
  // High activity = high energy or dramatic
  if (commits > 500 && pullRequests > 50) {
    return "dramatic";
  }
  
  if (commits > 200) {
    return "high-energy";
  }
  
  // Low activity = chill or quirky
  if (commits < 50) {
    return repos > 10 ? "quirky" : "ambient"; // Many repos, few commits = repo collector
  }
  
  // Moderate activity
  if (commits >= 50 && commits <= 200) {
    return "chill";
  }
  
  // Language-based vibes
  if (dominantLanguage) {
    const lang = dominantLanguage.toLowerCase();
    if (lang === "javascript" || lang === "typescript") {
      return "high-energy";
    }
    if (lang === "python" || lang === "go") {
      return "chill";
    }
    if (lang === "rust" || lang === "c++" || lang === "c") {
      return "dramatic";
    }
  }
  
  // Default
  return "chill";
}

/**
 * Selects a random music track based on user stats
 */
export function selectMusicForUser(stats: UserStats): MusicTrack {
  const vibe = getMusicVibeFromStats(stats);
  const matchingTracks = musicLibrary.filter(track => track.vibe === vibe);
  
  if (matchingTracks.length === 0) {
    // Fallback to any track
    return musicLibrary[Math.floor(Math.random() * musicLibrary.length)];
  }
  
  // Select random track from matching vibe
  return matchingTracks[Math.floor(Math.random() * matchingTracks.length)];
}

/**
 * Get all available tracks (for manual selection)
 */
export function getAllTracks(): MusicTrack[] {
  return musicLibrary;
}
