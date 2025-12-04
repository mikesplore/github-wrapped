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

// Curated list of royalty-free/creative commons music tracks
// You can replace these URLs with actual music file URLs
const musicLibrary: MusicTrack[] = [
  // High energy tracks for productive developers
  {
    name: "Code Rush",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    vibe: "high-energy"
  },
  {
    name: "Debug Mode",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    vibe: "high-energy"
  },
  
  // Chill tracks for moderate activity
  {
    name: "Lazy Commits",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    vibe: "chill"
  },
  {
    name: "Weekend Warrior",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    vibe: "chill"
  },
  
  // Dramatic tracks for prolific coders
  {
    name: "Merge Conflict Symphony",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    vibe: "dramatic"
  },
  {
    name: "Production Deploy",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    vibe: "dramatic"
  },
  
  // Comedic/quirky tracks
  {
    name: "Tutorial Hell",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    vibe: "quirky"
  },
  {
    name: "Stack Overflow Shuffle",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    vibe: "quirky"
  },
  
  // Ambient for beginners
  {
    name: "Hello World",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    vibe: "ambient"
  },
  {
    name: "Learning Curve",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
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
