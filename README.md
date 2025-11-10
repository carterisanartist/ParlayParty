# 🎮 Parlay Party

**Real-time party game with dark neon vibes**  
Predict what happens in videos, compete for points, and punish the loser!

## ✨ Features

- 🎯 **Real-time predictions** - Players call events as they happen
- 🏆 **Rarity-based scoring** - Rare predictions score higher
- 🎡 **Wheel of Punishment** - Loser faces a random dare
- 🎨 **Dark neon theme** - Stunning arcade aesthetics with glow effects
- 🎵 **Immersive audio** - Lo-fi loops and impactful SFX
- 📱 **Mobile-first players** - Join on phones, host on big screen
- 🚀 **Production-ready** - Deploy to Fly.io with one command

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Pixi.js, Tone.js
- **Backend**: Node.js, Express, Socket.io, Prisma, PostgreSQL, Redis
- **Deployment**: Fly.io, Docker

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker (for local development)

### Local Development

1. **Clone and install**

```bash
git clone <your-repo>
cd ParlayParty
pnpm install
```

2. **Start services**

```bash
docker-compose -f docker-compose.dev.yml up -d
```

3. **Set up database**

```bash
cp apps/server/.env.example apps/server/.env
pnpm db:push
pnpm db:seed
```

4. **Run development servers**

```bash
pnpm dev
```

- Host: http://localhost:3000
- Player: http://localhost:3000/play/[CODE]
- API: http://localhost:8080

## 🎮 How to Play

### Host Setup

1. Create a room on desktop/TV
2. Choose a YouTube/TikTok video or upload one
3. Share the room code with players

### Player Flow

1. Join on mobile with room code
2. **Parlay Entry**: Type a prediction
3. **Video Phase**: Tap "IT HAPPENED!" when it occurs
4. **Scoring**: Get points for correct, rare predictions
5. **Wheel**: Submit punishments, watch the loser spin

### Scoring System

```
weight = 1 + ln((R + 10) / (H + 1))
score = baseScore + completionBonus + fastTapBonus
```

- Rare events = higher weight
- Fast taps (within 1s) = +0.25 bonus
- False calls = -0.5 penalty

## 📁 Project Structure

```
ParlayParty/
├── apps/
│   ├── server/          # Express + Socket.io backend
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── socket-handlers.ts
│   │   │   ├── scoring.ts
│   │   │   ├── clustering.ts
│   │   │   └── redis.ts
│   │   └── prisma/
│   │       └── schema.prisma
│   └── web/             # Next.js frontend
│       ├── src/
│       │   ├── app/     # Routes
│       │   ├── components/
│       │   │   ├── host/
│       │   │   └── player/
│       │   └── lib/
│       │       ├── socket.ts
│       │       └── audio.ts
│       └── tailwind.config.js
└── packages/
    └── shared/          # Shared types & utils
        └── src/
            ├── types.ts
            ├── utils.ts
            └── events.ts
```

## 🚢 Deployment

### Fly.io (Recommended)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
chmod +x scripts/deploy-fly.sh
./scripts/deploy-fly.sh
```

### Environment Variables

Set these in Fly.io:

```bash
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set REDIS_URL="redis://..."
fly secrets set SERVER_SALT="your-random-salt"
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific tests
pnpm --filter @parlay-party/server test
pnpm --filter @parlay-party/shared test
```

## 🎨 Visual Style

- **Background**: #0B0B0B → #121212 gradient
- **Accent Colors**:
  - Cyan: #00FFF7
  - Magenta: #FF2D95
  - Violet: #8A6BFF
- **Typography**: Bebas Neue (display), Inter (body), Orbitron (mono)
- **Effects**: Neon glow, particle confetti, cinematic pause, glitch wipe

## 🎯 Game Modes

| Mode | Description |
|------|-------------|
| **Unanimous** | Both players must agree (2-player default) |
| **Single-Caller + Verify** | First call opens 2s verify window |
| **Judge Mode** | Host confirms all events |
| **Speed-Call** | First correct caller scores instantly |

## 📝 License

MIT

## 🤝 Contributing

Pull requests welcome! Please run tests and linting before submitting.

```bash
pnpm lint
pnpm type-check
pnpm test
```

---

**Built with 🎮 for epic party nights**

