# 🎉 Parlay Party - DEPLOYMENT COMPLETE!

## ✅ **LIVE AND RUNNING**

**🌐 URL:** https://parlay-party.fly.dev/

**Status:** Fully deployed and operational on Fly.io

---

## 🔧 ALL FIXES APPLIED

### Critical Game Mechanics Fixed

#### 1. **Parlay Selection System** ✅
- **Before:** Players just tapped "It Happened" (tied to their own parlay only)
- **After:** Players tap "It Happened" → Select WHICH parlay from a list of ALL parlays
- **Files:** `apps/web/src/components/player/PlayerVideo.tsx`, `apps/server/src/socket-handlers.ts`

#### 2. **Parlay Reveal Phase** ✅ NEW
- **Added:** After locking, 5-second reveal showing all parlays to everyone
- **Impact:** Players now know what to watch for during the video
- **Files:** 
  - `apps/web/src/components/host/ParlayReveal.tsx` (new)
  - `apps/web/src/components/player/PlayerReveal.tsx` (new)

#### 3. **Pause Duration Changed to 20 Seconds** ✅
- **Before:** 3 second pause (not enough time to smoke/drink)
- **After:** 20 second configurable pause
- **File:** `apps/server/src/socket-handlers.ts:386-390`
- **Config:** `pauseDurationSec` added to `RoomSettings`

#### 4. **All Parlays Visible to Players** ✅
- **Before:** Players only saw their own prediction
- **After:** Players see ALL parlays at top of screen during video
- **Impact:** Everyone knows what to call
- **File:** `apps/web/src/components/player/PlayerVideo.tsx`

#### 5. **Event Counter Now Works** ✅
- **Before:** Always showed "0"
- **After:** Increments when events confirmed
- **File:** `apps/web/src/components/host/VideoPhase.tsx:60-67, 145`

#### 6. **Review Phase Fully Implemented** ✅
- Socket handlers for `review:list` and `review:confirm`
- Timeline UI with markers
- Retroactive point awards
- **Files:** `apps/server/src/socket-handlers.ts`, `apps/web/src/components/host/ReviewPhase.tsx`

#### 7. **Video → Wheel Transition** ✅
- "END ROUND" button appears when video finishes
- Routes to review if markers exist, otherwise wheel
- **File:** `apps/web/src/components/host/VideoPhase.tsx`

#### 8. **False Call Penalties** ✅
- -0.5 points when host dismisses an event
- **File:** `apps/server/src/socket-handlers.ts:398-433`

#### 9. **Fast-Tap Bonus Calculation** ✅
- Calculates median vote time
- Awards +0.25 for votes within 1 second of median
- **File:** `apps/server/src/socket-handlers.ts:309-333`

#### 10. **TikTok & Upload Support** ✅
- TikTok embed with iframe
- Video upload with multer (500MB max)
- Range request streaming
- **Files:** `apps/server/src/upload.ts`, `apps/web/src/components/host/HostLobby.tsx`

---

## 🏗️ Infrastructure Setup

### Fly.io Resources Created

| Resource | Name | Status |
|----------|------|--------|
| **App** | parlay-party | ✅ Running |
| **PostgreSQL** | parlay-party-db | ✅ Connected |
| **Redis** | parlay-party-redis | ✅ Connected |
| **Volume** | uploads_data (1GB) | ✅ Mounted |

### Environment Variables Set

- `DATABASE_URL` - Auto-set by Fly Postgres attach
- `REDIS_URL` - Set to Upstash Redis connection
- `SERVER_SALT` - Random salt for wheel RNG
- `NODE_ENV=production`
- `PORT=8080`
- `UPLOADS_DIR=/data/uploads`

---

## 🎮 Complete Game Flow

### 1. Lobby
- Host creates room with 4-char code
- Players join on mobile
- Host selects YouTube/TikTok URL or uploads video

### 2. Parlay Entry
- Each player types prediction
- Player locks in (card flips with glow)
- Host clicks "LOCK ALL & START VIDEO"

### 3. **Parlay Reveal (NEW)** - 5 seconds
- **Host Screen:** Shows all parlays in grid
- **Player Screen:** Shows ALL parlays with "yours" highlighted
- **Purpose:** Everyone knows what to watch for
- **Auto-transitions** to video after 5 seconds

### 4. Video Phase
- **Host:** YouTube player with controls
- **Players:** See all parlays at top + giant "IT HAPPENED!" button
- **Click Flow:**
  1. Player taps "IT HAPPENED!"
  2. Modal appears with ALL parlays
  3. Player selects which one happened
  4. Vote sent to server
- **Auto-Pause:** When consensus reached
- **Pause Duration:** 20 seconds (configurable)
- **Host:** Confirms or dismisses event
- **Scoring:** Rarity-weighted, fast-tap bonus, penalties for false calls

### 5. Review Phase (If Markers Exist)
- Timeline of host markers
- Click marker → jump to -3s context
- Confirm or skip each
- Awards points retroactively

### 6. Wheel of Punishment
- Everyone submits punishment ideas
- Host approves/rejects
- Loser (lowest score) spins wheel
- Weighted RNG with commit-reveal fairness
- Sparks and crash sound on result

### 7. Results
- Final scoreboard
- Winner crowned
- Play again option

---

## 🎯 Game Features Implemented

- ✅ YouTube video playback with full controls
- ✅ TikTok embed support
- ✅ Video uploads (500MB max)
- ✅ Real-time Socket.io communication
- ✅ Rarity-weighted scoring
- ✅ Fast-tap bonus (+0.25 pts)
- ✅ False call penalty (-0.5 pts)
- ✅ Configurable pause duration (20s default)
- ✅ Auto-pause on consensus
- ✅ Host mark & review system
- ✅ Wheel of punishment with weighted RNG
- ✅ Dark neon theme with glow effects
- ✅ Framer Motion animations
- ✅ Pixi.js VFX (confetti, sparks, ambient gradients)
- ✅ Simplified audio system
- ✅ Latency compensation
- ✅ 2-player modes (unanimous, single-caller, judge, speed-call)

---

## 🐛 Bugs Fixed

| # | Issue | Status |
|---|-------|--------|
| 1 | Missing review socket handlers | ✅ Fixed |
| 2 | Player review phase handling | ✅ Fixed |
| 3 | animateWheel scope issue | ✅ Fixed |
| 4 | Upload directory mismatch | ✅ Fixed |
| 5 | Fast-tap never calculated | ✅ Fixed |
| 6 | Event counter showing 0 | ✅ Fixed |
| 7 | No video→wheel transition | ✅ Fixed |
| 8 | Review phase missing | ✅ Implemented |
| 9 | TikTok not supported | ✅ Implemented |
| 10 | Upload not working | ✅ Implemented |
| 11 | Windows build compatibility | ✅ Fixed |
| 12 | Parlay selection wrong | ✅ Fixed - players select from list |
| 13 | Pause only 3 seconds | ✅ Fixed - now 20 seconds |
| 14 | Players can't see all parlays | ✅ Fixed - reveal phase added |
| 15 | Vote tied to own parlay only | ✅ Fixed - can select any parlay |
| 16 | TypeScript errors | ✅ All fixed |
| 17 | OpenSSL missing in Docker | ✅ Fixed |
| 18 | Windows tar permission issue | ✅ Fixed with git |

---

## 🚀 How to Play

### **For Host (Desktop/TV)**

1. Visit https://parlay-party.fly.dev/
2. Click "CREATE ROOM"
3. Note your 4-character code
4. Paste YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
5. Click "START ROUND"
6. Wait for players to submit parlays
7. Click "LOCK ALL & START VIDEO"
8. **Parlay Reveal shows for 5 seconds**
9. Video plays automatically
10. Confirm/dismiss events when players call them
11. Click "END ROUND" when video finishes
12. Review markers (if any)
13. Approve punishments and spin wheel

### **For Players (Mobile)**

1. Visit https://parlay-party.fly.dev/play/[CODE]
2. Enter your name
3. Type a prediction (e.g., "Someone screams")
4. Click "🔒 LOCK IN"
5. **See ALL parlays revealed** (5 second screen)
6. During video:
   - **All parlays shown at top**
   - Watch for ANY of them
   - Tap "🎯 IT HAPPENED!" when you see something
   - **Select WHICH parlay happened** from the list
7. Get points for correct, rare predictions
8. Submit punishment idea for wheel
9. Watch loser spin!

---

## 📊 Scoring

```
Rarity Weight = 1 + ln((totalHits + 10) / (textHits + 1))
Base Score = weight * 1.0
Completion Bonus = baseScore * (multiplier - 1)  // 3x default
Fast Tap Bonus = +0.25 (if within 1s of median)
False Call Penalty = -0.5

Total = Base + Bonus + FastTap
```

**Examples:**
- Common event (many people called it): Lower weight, fewer points
- Rare event (only you called it): Higher weight, MORE points
- Fast reaction: Extra 0.25 bonus
- Wrong call: -0.5 penalty

---

## 🎨 Visual Features

- **Dark neon theme** (#0B0B0B background, cyan/magenta/violet accents)
- **Glow effects** on all interactive elements
- **Animated gradients** in background
- **Card flip animations** when parlays lock
- **Cinematic pause** effect (screen flash, neon text)
- **Floating score numbers** when points awarded
- **Pixi.js confetti** on confirmations
- **Breathing glow** on "IT HAPPENED" button
- **Modal parlay picker** with neon borders

---

## 🔑 Key Differences from Original Implementation

### What Changed Based on User Feedback:

1. **Parlay Selection:** Players can now call ANY parlay, not just their own
2. **Reveal Phase:** 5-second screen showing all parlays before video
3. **Pause Duration:** 20 seconds (enough time to smoke/drink), configurable
4. **Player Awareness:** Players always see all parlays during video phase
5. **Selection Interface:** Modal picker for choosing which event happened

---

## 🧪 Testing Checklist

- [x] Create room
- [x] Join as player
- [x] Submit parlay
- [x] Lock parlays
- [x] See reveal phase (5s)
- [x] See all parlays during video
- [x] Tap "It Happened"
- [x] Select parlay from list
- [x] Auto-pause triggers
- [x] Host confirms event
- [x] 20 second pause for smoke/drink
- [x] Points awarded correctly
- [x] Fast-tap bonus works
- [x] Event counter increments
- [x] End round button appears
- [x] Wheel spin works
- [x] Deployed to Fly.io

---

## 📝 Configuration Options

Edit `packages/shared/src/types.ts` DEFAULT_ROOM_SETTINGS:

```typescript
{
  voteWindowSec: 3,           // Time window for clustering votes
  consensusThresholdPct: 0.5, // % of players needed for auto-pause
  minVotes: 3,                // Minimum votes for auto-pause
  cooldownPerTextSec: 6,      // Cooldown between same event calls
  fastTapWindow: 1.0,         // Fast-tap bonus window (seconds)
  twoPlayerMode: 'unanimous', // Mode for 2-player games
  scoreMultiplier: 3.0,       // Completion bonus multiplier
  pauseDurationSec: 20,       // How long to pause (smoke/drink time!)
}
```

---

## 🎮 **THE GAME IS READY!**

Visit **https://parlay-party.fly.dev/** and start playing!

All features working:
- ✅ YouTube videos
- ✅ Parlay predictions
- ✅ Event calling with parlay selection
- ✅ 20-second pause for smoking/drinking
- ✅ Scoring system
- ✅ Wheel of punishment
- ✅ Dark neon party theme

**Have fun! 🎊🎉🎮**

