# 🚀 Quick Start - Parlay Party

Get up and running in **5 minutes**!

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start database services
docker-compose -f docker-compose.dev.yml up -d

# 3. Setup database
cd apps/server
pnpm db:push
pnpm db:seed
cd ../..

# 4. Start the app
pnpm dev
```

## Play the Game

### As Host (Desktop/TV)

1. Open http://localhost:3000
2. Click **CREATE ROOM**
3. Note the 4-character room code (e.g., `X7K2`)
4. Paste a YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
5. Click **START ROUND**

### As Player (Mobile)

1. Open http://localhost:3000/play/X7K2 (use your room code)
2. Enter your name and click **JOIN PARTY**
3. Type a prediction: "Someone sings"
4. Click **🔒 LOCK IN**
5. Watch the host screen
6. Tap **🎯 IT HAPPENED!** when you see it

### Complete the Round

1. **Host:** Confirm/dismiss auto-pause events
2. **Players:** Watch scoreboard update
3. **Everyone:** Submit punishment ideas for the wheel
4. **Host:** Approve submissions and spin the wheel
5. **Loser:** Face your punishment! 🎡

## What's Happening?

### Lobby Phase
- Host creates room and chooses video
- Players join via room code
- Lo-fi music plays

### Parlay Phase
- Each player types a prediction
- Cards flip and glow when locked
- Host locks all parlays

### Video Phase
- Host plays YouTube video
- Players tap giant button when their prediction happens
- Auto-pause when enough players agree
- Points awarded for rare predictions

### Wheel Phase
- Everyone submits punishment ideas
- Host approves the best/worst ones
- Loser (lowest score) spins the wheel
- Sparks fly, wheel ticks, cymbal crash!

### Results
- Final scoreboard
- Winner crowned 🏆
- Play again or end game

## Tips

- **Rare predictions score higher** - Be creative!
- **Fast taps get bonus points** - React quickly
- **Host can mark events** - Double-tap for later review
- **2-player modes** - Try "Unanimous" or "Speed-Call"

## Troubleshooting

**Port already in use?**
```bash
lsof -ti:8080 | xargs kill -9
```

**Database connection failed?**
```bash
docker-compose -f docker-compose.dev.yml restart
```

**Can't hear audio?**
Click anywhere on the page first (browser security).

**WebSocket won't connect?**
Check `apps/web/.env.local`:
```
NEXT_PUBLIC_SERVER_URL=http://localhost:8080
```

## Next Steps

- Read [SETUP.md](SETUP.md) for detailed setup
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Read [README.md](README.md) for full documentation

## Deploy to Production

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
chmod +x scripts/deploy-fly.sh
./scripts/deploy-fly.sh
```

Your app will be live at `https://parlay-party.fly.dev` 🎉

---

**Questions?** Check the docs or open an issue!

