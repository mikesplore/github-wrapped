# 🔥 Git Roast Wrapped

> **Your code doesn't lie, and neither do we.**

Get ready for the most savage, AI-powered roast of your GitHub year. Spotify Wrapped vibes meet brutal coding reality checks. Swipe through beautifully designed slides showcasing your commits, repos, languages, and personality—all wrapped in cutting comedy.

![Git Roast Wrapped](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Genkit](https://img.shields.io/badge/Genkit-AI-purple?style=for-the-badge)

## ✨ Features

- **🎭 Savage AI Roasting** - No mercy, just facts wrapped in comedy. Our AI doesn't hold back.
- **📊 Complete GitHub Stats** - Fetches both public AND private repos (with OAuth) for accurate insights.
- **📈 Visual Data Charts** - Bar charts and stat comparisons for commits, languages, and repo metrics.
- **🏆 Comprehensive Rankings** - Top repos by stars, forks, and commits with detailed breakdowns.
- **🎵 Dynamic Background Music** - Music selection based on your coding personality and stats.
- **📱 Spotify-Inspired UI** - Full-screen swipeable slides with smooth animations and gradients.
- **🌙 Dark Mode Support** - Beautiful in both light and dark themes.
- **⚡ Mobile-First Design** - Touch-optimized with swipe gestures for the perfect mobile experience.
- **📋 Detailed Insights** - 18-20 comprehensive slides covering every aspect of your GitHub year.

## 🚀 Tech Stack

- **Framework:** Next.js 15.5 with App Router
- **Language:** TypeScript
- **AI:** Google Genkit with Gemini 2.5 Flash
- **Authentication:** NextAuth.js with GitHub OAuth
- **Styling:** Tailwind CSS + shadcn/ui components
- **API:** GitHub REST API v3
- **Deployment:** Firebase App Hosting

## 🎯 How It Works

### **The Complete Flow Explained**

Git Roast Wrapped takes your GitHub activity and transforms it into a brutally honest, hilarious year-in-review experience. Here's exactly how the magic happens:

---

### **1. User Input & Authentication** 🔐

**Landing Page (`src/app/page.tsx`)**
- Users can enter any GitHub username as a guest OR login with GitHub OAuth
- **Guest mode:** Only fetches public repositories
- **Authenticated mode:** Accesses both public AND private repositories using OAuth token
- User selects a year (2008 - current year)
- Form submission triggers server action `generateReport()` which redirects to `/roast/[username]/[year]`

**Authentication (`auth.ts` + NextAuth.js)**
- GitHub OAuth provider configured with `repo` and `read:user` scopes
- Access token stored in session for API calls
- Username extracted and stored in session for convenience

---

### **2. Data Fetching** 📊

**Roast Page (`src/app/roast/[username]/[year]/page.tsx`)**

This is where the heavy lifting begins. The page is a server component that:

1. **Validates Input:**
   - Checks if year is valid (not in future, not before 2008)
   - Returns 404 if invalid

2. **Gets OAuth Session:**
   ```typescript
   const session = await auth();
   const userToken = session?.accessToken;
   ```

3. **Fetches Comprehensive GitHub Data:**
   ```typescript
   const githubData = await getGithubData(username, year, userToken);
   ```

**GitHub Data Fetching (`src/lib/github.ts`)**

The `getGithubData()` function is the data powerhouse. Here's what it fetches:

**Step 1: User Profile**
- Fetches authenticated user info first
- Determines if viewing own profile or someone else's
- Gets user details: name, avatar, bio, follower/following counts

**Step 2: Repository Data**
- **For authenticated users:** Fetches ALL repos (public + private) using `/user/repos?visibility=all`
- **For guests:** Only public repos via `/users/{username}/repos`
- Paginates through up to 1,000 repos (10 pages × 100 per page)
- Separates repos into public and private arrays

**Step 3: Parallel API Calls**

Fetches multiple data points simultaneously:
```typescript
Promise.all([
  PRs count,              // Search API: author:{user} is:pr created:{year}
  Issues count,           // Search API: author:{user} is:issue created:{year}
  Starred repos,          // /users/{user}/starred
  Followers list,         // /users/{user}/followers
  Following list,         // /users/{user}/following
])
```

**Step 4: Deep Dive - Commit Analysis**

For each repository (in batches of 10 to avoid rate limits):
- Uses `/repos/{owner}/{repo}/contributors` endpoint for accurate commit counts
- Finds user's contribution count per repo
- Fetches up to 100 commits per repo with `/repos/{owner}/{repo}/commits?author={user}`
- Collects all commit dates for streak calculation

**Step 5: Streak Calculation**
- Sorts all commit dates chronologically
- Removes duplicates (same-day commits)
- Calculates longest consecutive day streak
- Example: Commits on Jan 1, 2, 3, 5, 6, 7 → longest streak = 3 days

**Step 6: Language Analysis**

For each repository (in batches of 20):
- Calls `/repos/{owner}/{repo}/languages` endpoint
- Gets bytes of code per language
- Aggregates across all repos into language map
- Sorts by total bytes to find dominant languages

**Step 7: Rankings & Insights**

Creates multiple sorted lists:
- **Top Repos by Stars:** Top 10 most starred
- **Top Repos by Forks:** Top 10 most forked  
- **Top Repo by Commits:** Single repo with most user commits
- **Recently Updated:** Repos updated in selected year
- **Repo Graveyard:** Repos not pushed since before selected year
- **Forked Repos:** Count of repos that are forks vs originals

**Final Data Structure:**
```typescript
{
  user: { login, avatar_url, name, bio, followers, following, ... },
  stats: {
    commits, pullRequests, issues, repos, publicRepos, privateRepos,
    forkedRepos, starred, totalStarsReceived, totalForksReceived,
    longestStreak
  },
  languages: [["TypeScript", 1234567], ["JavaScript", 987654], ...],
  topReposByStars: [{ name, stars, description, language, url }, ...],
  topReposByForks: [{ name, forks, language }, ...],
  topRepoByCommits: { repo, commits, language },
  recentlyUpdated: [{ name, updated_at, language }, ...],
  repoGraveyard: [{ name, pushed_at, language }, ...],
  starredSample: [...],
  activityHistory: { ... },
  socialStats: { followers, following, followRatio }
}
```

---

### **3. AI Roast Generation** 🤖

**Genkit AI Flow (`src/ai/flows/generate-wrapped-slides.ts`)**

With all GitHub data collected, it's time for the AI to work its magic.

**Architecture:**
- Uses **Google Genkit** framework (not raw Gemini API)
- Genkit provides type safety, prompt templates, schema validation
- Model: `gemini-2.5-flash` (fast, cost-effective, quality output)

**Single Comprehensive Prompt:**
```typescript
const result = await generateWrappedSlides({
  githubData: JSON.stringify(githubData, null, 2),
  username,
  year
});
```

**The Prompt Strategy:**

The AI receives ONE detailed prompt with:
1. **Role:** "Brutally honest and sarcastic AI creating GitHub Wrapped"
2. **Full GitHub Data:** Entire JSON structure with all stats
3. **Output Format:** Markdown with specific formatting rules
4. **Slide Topics:** 18-20 required slides with exact structure

**Required Slides:**
1. Intro (personalized, savage)
2. Year at a Glance (commits, PRs, issues, repos)
3. Commit Analysis
4. Top Languages (numbered list with percentages)
5. Repo Reality Check (public vs private)
6. Top Repos Showcase (by stars)
7. Most Committed Repo
8. Star Power (stars received vs given)
9. Fork Analysis (original vs forked)
10. The Digital Graveyard (abandoned repos)
11. PR & Collaboration
12. Issue Drama
13. Social Butterfly (followers/following ratio)
14. Language Breakdown
15. Recent Activity
16. Commit Streak (if available)
17. Code Patterns
18. Dev Personality (assigned archetype)
19. Reality Check (comparison stats)
20. Outro (final devastating punchline)

**Markdown Formatting Rules:**
- Use `**bold**` and `*italic*` for emphasis
- Bullet lists (`- item`) for stats
- Numbered lists (`1. item`) for rankings
- `##` for section headers
- `>` for blockquotes/callouts
- Emojis liberally 🎯🔥💀😭

**Output:**
```typescript
{
  slides: [
    "**Welcome to Hell, @username** 🔥\n\nReady to see what...",
    "**Year at a Glance** 🎯\n\nLet's see what you've...",
    ...
  ]
}
```

---

### **4. Music Selection** 🎵

**Music Selector (`src/lib/music-selector.ts`)**

Based on GitHub stats, picks perfect background music:

```typescript
const music = selectMusic({
  commits: githubData.stats.commits,
  repos: githubData.stats.repos,
  pullRequests: githubData.stats.pullRequests,
  issues: githubData.stats.issues,
  dominantLanguage: githubData.languages[0]?.[0]
});
```

**15 Bensound Tracks** categorized by:
- **High Activity:** Epic, inspiring tracks for prolific coders
- **Moderate:** Chill, groovy beats
- **Low Activity:** Slow, melancholic tunes (for slackers)
- **Language-Specific:** Special tracks for certain languages

**Examples:**
- 500+ commits → "Epic" (triumphant orchestral)
- Python dominant → "Tenderness" (smooth jazz)
- <50 commits → "Slowmotion" (sad piano)

---

### **5. Slide Display** 🎨

**Roast Display Component (`src/components/roast-display.tsx`)**

A sophisticated carousel with:

**Core Features:**
- **Embla Carousel** for smooth, touch-optimized swiping
- **react-markdown** with **remark-gfm** for GitHub-flavored markdown rendering
- **Audio player** with music from music selector
- **Progress indicator** showing slide X of Y
- **Navigation:** Touch swipe, keyboard arrows, mouse wheel

**Slide Rendering:**
```typescript
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    strong: ({children}) => <strong className="text-green-400">...,
    em: ({children}) => <em className="text-blue-400">...,
    ul: ({children}) => <ul className="space-y-2">...,
    // Custom styling for all markdown elements
  }}
>
  {slide}
</ReactMarkdown>
```

**Gradient Background:**
- Dynamic gradient based on slide content
- Smooth color transitions between slides
- Animated floating orbs for visual depth

**Mobile Optimization:**
- Touch gestures for swiping
- Responsive typography (scales from mobile to desktop)
- Prevents scroll bounce
- Auto-hides browser UI on scroll

---

### **6. Error Handling** ⚠️

**Error Page (`src/app/roast/[username]/[year]/error.tsx`)**

**GitHub API Errors:**
- **Rate Limit (403/429):** Shows reset time, suggests GitHub login
- **Not Found (404):** User doesn't exist
- **Auth Failed (401):** Suggests re-login

**Gemini AI Errors:**
- **Overloaded (503):** "AI is experiencing high traffic"
- **Quota Exceeded:** "Hit daily limit, try tomorrow"
- **Timeout:** "AI thinking too hard, try again"

**User-Friendly Messages:**
- No technical jargon
- Actionable solutions
- Links to retry or login

---

### **7. Performance Optimizations** ⚡

**Caching:**
```typescript
export const revalidate = 3600; // Cache for 1 hour
```

**Parallel Processing:**
- GitHub API calls run in parallel where possible
- Repo batching prevents overwhelming API
- Efficient use of Promise.all()

**Server-Side Rendering:**
- All data fetching happens server-side
- No client-side API keys needed
- Faster initial page load

**Image Optimization:**
- Next.js automatic image optimization
- Avatar images lazy-loaded

---

## 📁 Project Structure

## 📁 Project Structure

```
github-wrapped/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page with auth
│   │   ├── actions.ts                  # Server actions (form handler)
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles
│   │   ├── error.tsx                   # Error boundary
│   │   └── roast/[username]/[year]/
│   │       ├── page.tsx               # Main roast page (server component)
│   │       ├── error.tsx              # Route error handler
│   │       └── loading.tsx            # Loading state
│   ├── components/
│   │   ├── roast-display.tsx          # Carousel slide display
│   │   ├── audio-player.tsx           # Background music player
│   │   ├── logo.tsx                   # App logo
│   │   └── ui/                        # shadcn/ui components
│   ├── lib/
│   │   ├── github.ts                  # GitHub API data fetching
│   │   ├── music-selector.ts          # Music selection algorithm
│   │   ├── placeholder-images.ts      # Fallback images
│   │   └── utils.ts                   # Utility functions
│   └── ai/
│       ├── genkit.ts                  # Genkit configuration
│       └── flows/
│           └── generate-wrapped-slides.ts  # Main AI prompt
├── auth.ts                            # NextAuth.js configuration
├── .env                               # Environment variables
├── package.json
└── README.md
```

## 🎨 Customization

### Modify AI Roasting Style

Edit the comprehensive prompt in:
- `src/ai/flows/generate-wrapped-slides.ts`

Adjust the tone, add/remove slide topics, or change formatting rules.

### Change Music Tracks

Update the music library in:
- `src/lib/music-selector.ts`

Replace Bensound URLs with your own royalty-free music or integrate with Spotify API.

### Adjust Design Theme

Modify colors and styles in:
- `src/app/globals.css` - CSS variables and Tailwind utilities
- `tailwind.config.ts` - Color palette and theme configuration
- `src/components/roast-display.tsx` - Gradient combinations

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Google Genkit](https://firebase.google.com/docs/genkit)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Inspired by [Spotify Wrapped](https://www.spotify.com/wrapped/)

## 💬 Support

Having issues? Open an issue on GitHub or reach out to [@mikesplore](https://github.com/mikesplore).

---

**Made with 💀 and absolutely zero chill.**
