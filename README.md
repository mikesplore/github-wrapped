# 🔥 Git Roast Wrapped

> **Your code doesn't lie, and neither do we.**

Get ready for the most savage, AI-powered roast of your GitHub year. Spotify Wrapped vibes meet brutal coding reality checks. Swipe through beautifully designed slides showcasing your commits, repos, languages, and personality—all wrapped in cutting comedy.

![Git Roast Wrapped](https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Genkit](https://img.shields.io/badge/Genkit-AI-purple?style=for-the-badge)

## ✨ Features

- **🎭 Savage AI Roasting** - No mercy, just facts wrapped in comedy. Our AI doesn't hold back.
- **📊 Complete GitHub Stats** - Fetches both public AND private repos for accurate insights.
- **🎵 Dynamic Background Music** - Music selection based on your coding personality and stats.
- **📱 Spotify-Inspired UI** - Full-screen swipeable slides with smooth animations and gradients.
- **🌙 Dark Mode Support** - Beautiful in both light and dark themes.
- **⚡ Mobile-First Design** - Touch-optimized with swipe gestures for the perfect mobile experience.

## 🚀 Tech Stack

- **Framework:** Next.js 15.3 with App Router
- **Language:** TypeScript
- **AI:** Google Genkit with Gemini
- **Styling:** Tailwind CSS + shadcn/ui components
- **API:** GitHub REST API v3
- **Deployment:** Firebase App Hosting

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A GitHub account
- A GitHub Personal Access Token (for API access)
- A Google Cloud account (for Genkit AI)

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mikesplore/github-wrapped.git
cd github-wrapped
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# GitHub Personal Access Token (required)
# Generate at: https://github.com/settings/tokens
# Scopes needed: repo, read:user
GITHUB_TOKEN=your_github_personal_access_token

# Google Genkit API Key (required for AI features)
# Get from: https://console.cloud.google.com/
GOOGLE_GENAI_API_KEY=your_google_api_key
```

**Getting your tokens:**

- **GitHub Token:** Visit [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic) → Select scopes: `repo`, `read:user`
- **Google API Key:** Visit [Google AI Studio](https://makersuite.google.com/app/apikey) → Create API key

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:9002](http://localhost:9002) to see the app.

### 5. Test Genkit AI Flows (Optional)

To test and debug AI flows in the Genkit Developer UI:

```bash
npm run genkit:dev
```

## 📁 Project Structure

```
github-wrapped/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── actions.ts         # Server actions
│   │   └── roast/[username]/[year]/
│   │       └── page.tsx       # Roast display page
│   ├── components/            # React components
│   │   ├── roast-display.tsx  # Main slide display
│   │   ├── audio-player.tsx   # Music player
│   │   └── ui/                # shadcn components
│   ├── lib/                   # Utilities
│   │   ├── github.ts          # GitHub API integration
│   │   ├── music-selector.ts  # Music selection logic
│   │   └── utils.ts           # Helper functions
│   └── ai/                    # Genkit AI flows
│       ├── genkit.ts          # Genkit configuration
│       └── flows/             # AI workflow definitions
│           ├── generate-wrapped-slides.ts
│           ├── generate-comedic-commentary.ts
│           └── determine-dev-personality.ts
├── .env                       # Environment variables
├── package.json
└── README.md
```

## 🎨 Customization

### Modify AI Roasting Style

Edit the prompts in:
- `src/ai/flows/generate-comedic-commentary.ts`
- `src/ai/flows/determine-dev-personality.ts`

### Change Music Tracks

Update the music library in:
- `src/lib/music-selector.ts`

Replace URLs with your own royalty-free music or API integrations.

### Adjust Design Theme

Modify colors and styles in:
- `src/app/globals.css` - CSS variables and utilities
- `tailwind.config.ts` - Tailwind configuration

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase

```bash
firebase deploy
```

Make sure you have the Firebase CLI installed and configured:

```bash
npm install -g firebase-tools
firebase login
firebase init
```

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
