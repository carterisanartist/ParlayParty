# 🏗️ Parlay Party - Architecture Documentation

## System Overview

Parlay Party is a real-time multiplayer party game built as a production-ready monorepo. The architecture follows a client-server model with WebSocket-based real-time communication.

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Host (Next.js)          │        Player (Mobile Next.js)   │
│  - Lobby Management      │        - Join Flow               │
│  - Video Playback        │        - Parlay Submission       │
│  - Event Confirmation    │        - "It Happened!" Button   │
│  - Wheel Spin            │        - Results View            │
└─────────────────────────────────────────────────────────────┘
                           │
                    WebSocket (Socket.io)
                           │
┌─────────────────────────────────────────────────────────────┐
│                      SERVER LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  Express + Socket.io Server                                  │
│  - Room Management                                           │
│  - Real-time Event Processing                                │
│  - Vote Clustering & Consensus                               │
│  - Scoring Engine                                            │
│  - Wheel RNG                                                 │
└─────────────────────────────────────────────────────────────┘
           │                          │
      PostgreSQL                   Redis
    (Persistent Data)          (Live State)
```

## Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **Tailwind CSS** | Utility-first styling with custom theme |
| **Framer Motion** | Animation and transitions |
| **Pixi.js** | Hardware-accelerated VFX (confetti, sparks, ambient effects) |
| **Tone.js** | Web Audio API for lo-fi loops and SFX |
| **Socket.io Client** | WebSocket communication |
| **React YouTube** | YouTube player integration |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js 20** | JavaScript runtime |
| **Express** | HTTP server & API |
| **Socket.io** | WebSocket server |
| **Prisma** | Type-safe database ORM |
| **PostgreSQL** | Relational database |
| **Redis** | In-memory cache for live stats |
| **TypeScript** | Type safety across codebase |

### DevOps

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Fly.io** | Cloud deployment platform |
| **GitHub Actions** | CI/CD pipeline |
| **pnpm** | Fast, disk-efficient package manager |
| **Jest** | Unit testing framework |

## Monorepo Structure

```
ParlayParty/
├── apps/
│   ├── server/              # Backend service
│   │   ├── src/
│   │   │   ├── index.ts              # Express + Socket.io bootstrap
│   │   │   ├── socket-handlers.ts    # All WebSocket event handlers
│   │   │   ├── scoring.ts            # Rarity-weighted scoring engine
│   │   │   ├── clustering.ts         # Vote clustering algorithms
│   │   │   ├── redis.ts              # Redis client & event stats
│   │   │   ├── *.test.ts             # Unit tests
│   │   │   └── ...
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema
│   │   │   ├── seed.ts               # Sample data
│   │   │   └── migrations/           # SQL migrations
│   │   └── package.json
│   │
│   └── web/                 # Frontend application
│       ├── src/
│       │   ├── app/                  # Next.js routes
│       │   │   ├── page.tsx              # Home (create/join)
│       │   │   ├── host/[code]/          # Host screens
│       │   │   └── play/[code]/          # Player screens
│       │   ├── components/
│       │   │   ├── host/                 # Host components
│       │   │   │   ├── HostLobby.tsx
│       │   │   │   ├── ParlayPhase.tsx
│       │   │   │   ├── VideoPhase.tsx
│       │   │   │   ├── WheelPhase.tsx
│       │   │   │   └── ResultsPhase.tsx
│       │   │   ├── player/               # Player components
│       │   │   │   ├── PlayerJoin.tsx
│       │   │   │   ├── PlayerParlay.tsx
│       │   │   │   ├── PlayerVideo.tsx
│       │   │   │   ├── PlayerWheel.tsx
│       │   │   │   └── PlayerResults.tsx
│       │   │   ├── VFXLayer.tsx          # Pixi.js canvas
│       │   │   ├── CinematicPause.tsx    # Pause effect
│       │   │   ├── PlayerAvatar.tsx
│       │   │   ├── ParlayCard.tsx
│       │   │   └── Scoreboard.tsx
│       │   └── lib/
│       │       ├── socket.ts             # Socket.io client
│       │       └── audio.ts              # Tone.js audio manager
│       ├── public/                   # Static assets
│       ├── tailwind.config.js
│       └── package.json
│
└── packages/
    └── shared/              # Shared code
        └── src/
            ├── types.ts              # TypeScript interfaces
            ├── utils.ts              # Shared utilities
            ├── events.ts             # Socket event types
            └── *.test.ts             # Unit tests
```

## Data Flow

### 1. Room Creation & Join

```
[Host Browser]
    │
    ├─→ HTTP GET / (Next.js page)
    ├─→ WebSocket connect with roomCode
    ├─→ emit('player:join', {name: 'Host'})
    │
[Server]
    │
    ├─→ Create/Find Room in PostgreSQL
    ├─→ Create Player record (isHost: true)
    ├─→ Join Socket.io room namespace
    ├─→ Broadcast 'roster:update'
    │
[Player Mobile]
    │
    ├─→ HTTP GET /play/[CODE]
    ├─→ WebSocket connect
    ├─→ emit('player:join', {name})
    └─→ Receive roster & room state
```

### 2. Parlay Submission & Locking

```
[Players]
    │
    ├─→ Submit prediction text
    ├─→ emit('parlay:submit', {text})
    │
[Server]
    │
    ├─→ Normalize text (trim, lowercase)
    ├─→ Save Parlay to PostgreSQL
    ├─→ Broadcast 'parlay:progress'
    │
[Host]
    │
    ├─→ Sees progress bar fill
    ├─→ Clicks "Lock All"
    ├─→ emit('parlay:lock')
    │
[Server]
    │
    ├─→ Update Round status → 'video'
    └─→ Broadcast 'parlay:locked'
```

### 3. Video Playback & Voting

```
[Host]
    │
    ├─→ YouTube player starts
    │
[Players]
    │
    ├─→ Watch host screen
    ├─→ Tap "It Happened!" button
    ├─→ emit('vote:add', {tVideoSec})
    │
[Server]
    │
    ├─→ Adjust timestamp for latency
    ├─→ Store Vote in PostgreSQL
    ├─→ Cluster votes by (normalizedText, time window)
    ├─→ Check consensus threshold
    │   ├─→ If met: emit('video:pause_auto', {...})
    │   └─→ Else: continue
    │
[Host]
    │
    ├─→ Video auto-pauses
    ├─→ CinematicPause effect plays
    ├─→ Confirm/Dismiss modal appears
    │
[Host Confirms]
    │
    ├─→ emit('host:confirmEvent', {tCenter, normalizedText})
    │
[Server]
    │
    ├─→ Calculate rarity weight for event
    ├─→ Query Redis for event stats
    ├─→ Award points to matching parlays
    ├─→ Update Player.scoreTotal
    ├─→ Create ConfirmedEvent
    ├─→ Broadcast 'event:confirmed'
    ├─→ Broadcast 'scoreboard:update'
    └─→ After 3s: emit('video:resume')
```

### 4. Wheel of Punishment

```
[Players]
    │
    ├─→ Submit punishment ideas
    ├─→ emit('wheel:submit', {text})
    │
[Server]
    │
    ├─→ Create WheelEntry (status: 'pending')
    ├─→ Broadcast 'wheel:entry_added'
    │
[Host]
    │
    ├─→ Approve/Reject submissions
    ├─→ emit('wheel:moderate', {entryId, status})
    ├─→ Click "Spin Wheel"
    ├─→ emit('wheel:spin')
    │
[Server]
    │
    ├─→ Determine loser (lowest score)
    ├─→ Filter approved entries
    ├─→ Apply karma weight to loser's submissions
    ├─→ Generate commit seed
    ├─→ Broadcast 'wheel:spinning'
    │
[5 seconds later]
    │
    ├─→ Weighted random selection
    ├─→ Create PunishmentSpin record
    ├─→ Broadcast 'wheel:result'
    │
[All Clients]
    │
    └─→ Show result with confetti effect
```

## Scoring Algorithm

### Rarity Weight Calculation

```typescript
weight = 1 + ln((R + K) / (H + 1))
```

Where:
- `R` = total hits across all events this round
- `H` = hits for this specific parlay text
- `K` = smoothing constant (10)

**Example:**
- Common event (50/100 hits): `weight ≈ 1.69`
- Rare event (5/100 hits): `weight ≈ 2.99`
- Very rare (1/100 hits): `weight ≈ 3.69`

### Score Calculation

```typescript
baseScore = weight * 1.0
completionBonus = baseScore * (multiplier - 1)  // default multiplier: 3.0
fastTapBonus = isWithin1Second ? 0.25 : 0
totalScore = baseScore + completionBonus + fastTapBonus
```

### Loser Determination

1. Sort by `scoreFinal` (ascending)
2. Tie-breaker 1: fewer `legsHit`
3. Tie-breaker 2: lower `accuracy`
4. Tie-breaker 3: slower completion time
5. Final tie: random selection

## Redis Event Stats

Redis stores live statistics for rarity calculation:

```
Key: round:{roundId}:stats
Hash structure:
  {normalizedText}: {
    hits: number,
    uniquePlayers: string[]
  }
```

**Operations:**
- `updateEventStats()` - Increment hits, add player to unique set
- `getEventStats()` - Fetch all stats for a round
- `clearRoundStats()` - Clean up after round ends

## Socket.io Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `player:join` | `{name, avatarUrl?}` | Join a room |
| `host:startRound` | `{videoType, videoUrl, videoId}` | Start new round |
| `parlay:submit` | `{text}` | Submit prediction |
| `parlay:lock` | - | Lock all parlays |
| `vote:add` | `{tVideoSec}` | Call an event |
| `host:confirmEvent` | `{tCenter, normalizedText}` | Confirm auto-pause |
| `host:dismissEvent` | `{tCenter, normalizedText}` | Dismiss false alarm |
| `host:mark` | `{tVideoSec, note?}` | Drop timestamp marker |
| `wheel:submit` | `{text}` | Submit punishment |
| `wheel:moderate` | `{entryId, status}` | Approve/reject entry |
| `wheel:spin` | - | Spin the wheel |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `roster:update` | `{players[]}` | Player list changed |
| `room:update` | `{room}` | Room state changed |
| `round:started` | `{round}` | New round began |
| `round:status` | `{status}` | Phase transition |
| `parlay:progress` | `{playerId, submitted}` | Player locked parlay |
| `parlay:locked` | - | All parlays locked |
| `video:pause_auto` | `{tCenter, normalizedText, voters[]}` | Consensus reached |
| `video:resume` | - | Resume playback |
| `event:confirmed` | `{event}` | Event awarded points |
| `scoreboard:update` | `{scores[]}` | Points changed |
| `wheel:spinning` | `{commitSeed}` | Wheel started |
| `wheel:result` | `{selectedEntry, loser, spin}` | Wheel landed |
| `player:joined` | `{player}` | New player joined |

## Visual Effects System

### Pixi.js VFX Layer

Renders on a transparent canvas overlay:

```typescript
VFXLayer
├── Ambient Gradient Sprites (moving background lights)
├── Confetti Emitter (particle system)
├── Spark Emitter (wheel spin effects)
└── Bloom Filter (glow post-processing)
```

**Performance:**
- Target: 60 FPS on host screen
- Graceful degradation on low-end devices
- Canvas auto-resizes on window resize

### Cinematic Pause Effect

Sequence:
1. Video freezes
2. Screen desaturates
3. White flash
4. Bass boom (Tone.js MembraneSynth)
5. Neon banner appears with event text
6. 3-second countdown
7. Glitch wipe transition
8. Resume playback

## Audio System (Tone.js)

### Audio Manager

```typescript
class AudioManager {
  lobbyPlayer: Tone.Player      // Lo-fi background loop
  sfxSynth: Tone.Synth           // Button clicks, lock-ins
  noiseSynth: Tone.NoiseSynth    // Whooshes, ticks
  
  initialize()                   // Requires user gesture
  playLobbyLoop()
  playLockIn()                   // C5 tone
  playPauseBoom()                // C1 bass + noise burst
  playWheelTick()                // A4 short note
  playWheelCrash()               // MetalSynth
  playScorePop()                 // E5 → A5 sequence
}
```

**User Interaction Requirement:**
Audio context starts on first click (browser security requirement).

## Deployment Architecture

### Fly.io Production Setup

```
┌─────────────────────────────────────┐
│         Fly.io Machine              │
│  ┌──────────────────────────────┐  │
│  │   Docker Container           │  │
│  │  ┌────────────────────────┐  │  │
│  │  │  Node.js Server        │  │  │
│  │  │  - Express HTTP        │  │  │
│  │  │  - Socket.io WS        │  │  │
│  │  │  - Bundled Next.js     │  │  │
│  │  └────────────────────────┘  │  │
│  │                                │  │
│  │  /data/uploads (Volume)       │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
         │              │
    PostgreSQL       Redis
   (Fly Postgres) (Fly Redis)
```

**Scaling:**
- Single machine for cost efficiency
- Auto-stop/start when idle
- Persistent volume for video uploads
- Health checks via `/healthz`

## Security Considerations

1. **RNG Fairness:** Commit-reveal seed scheme for wheel
2. **Input Validation:** Normalize and sanitize all user text
3. **Rate Limiting:** 2s cooldown on vote submissions
4. **Latency Compensation:** Adjust vote timestamps by RTT/2
5. **Anomaly Detection:** Flag if >80% votes from same IP within 50ms

## Testing Strategy

### Unit Tests

- **Scoring Engine:** Rarity weight calculations
- **Clustering:** Vote grouping logic
- **Utils:** Text normalization, weighted random selection

### Integration Tests (TODO)

- Full room lifecycle
- Multi-player vote consensus
- Wheel spin fairness distribution

### E2E Tests (TODO)

- Selenium/Playwright flows
- Host creates room → players join → full game

## Performance Targets

| Metric | Target |
|--------|--------|
| **Host UI** | 60 FPS animations |
| **Player Mobile** | < 100ms button response |
| **WebSocket Latency** | < 50ms round-trip |
| **Vote Clustering** | < 10ms processing |
| **Score Calculation** | < 5ms per event |
| **DB Queries** | < 100ms p95 |

## Future Enhancements

- [ ] Multiple rounds per game
- [ ] Player avatars/customization
- [ ] Replay highlights
- [ ] Streamer overlays (OBS integration)
- [ ] Mobile app (React Native)
- [ ] Voice chat integration
- [ ] Tournament mode
- [ ] Analytics dashboard

---

**Last Updated:** 2024-01-10  
**Version:** 1.0.0

