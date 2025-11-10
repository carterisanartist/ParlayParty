# 🎨 PARLAY PARTY - COMPLETE FIGMA DESIGN SUPERPROMPT

Use this prompt with AI design tools (v0.dev, Figma AI, Claude, etc.) to generate complete designs for all screens.

---

## 🎨 DESIGN SYSTEM - MANDATORY SPECS

### **COLOR PALETTE (Dark Neon Party Theme)**

**Background:**
- `--bg-0`: #0B0B0B (deepest black - page background)
- `--bg-1`: #121212 (dark charcoal - card/panel backgrounds)

**Foreground:**
- `--fg-0`: #F5F8FF (primary text - almost white)
- `--fg-subtle`: #B6C2E1 (secondary text - light blue-grey)

**Accent Colors (Neon Glow):**
- `--accent-1`: #00FFF7 (neon cyan - primary actions, glow)
- `--accent-2`: #FF2D95 (neon magenta/hot pink - secondary actions)
- `--accent-3`: #8A6BFF (neon violet/purple - tertiary accent)

**Status Colors:**
- `--success`: #7FFF00 (chartreuse green)
- `--danger`: #FF4444 (red)
- `--warning`: #FFC400 (amber)

### **Typography**

**Display/Headers:**
- Font: Bebas Neue (or Impact as fallback)
- Style: ALL CAPS, WIDE TRACKING
- Use: Page titles, section headers, buttons
- Sizes: 48px-96px for main titles

**Body Text:**
- Font: Inter
- Style: Clean, modern sans-serif
- Use: Paragraphs, labels, descriptions
- Sizes: 14px-20px

**Monospace/Numbers:**
- Font: Orbitron
- Style: Futuristic, sci-fi monospace
- Use: Codes, scores, timers, stats
- Sizes: 16px-48px for scores

### **Visual Effects - MUST INCLUDE**

**Glow/Neon Effects:**
- All interactive elements have soft outer glow
- Text shadows on neon colors (layered 10px, 20px, 30px blur)
- Box shadows with inner + outer glow on borders
- Example: `box-shadow: inset 0 0 10px cyan, 0 0 20px cyan, 0 0 40px cyan`

**Backgrounds:**
- Moving radial gradients (cyan and magenta orbs)
- Subtle animated gradient layer behind all content
- Frosted glass/blur effects on floating panels
- Alpha transparency for depth

**Animations:**
- Card flips: rotateY 180deg, 0.5s duration
- Buttons: Scale 1.05 on hover, 0.95 on click
- Scene transitions: 300-420ms ease-out
- Pulse/breathing: 2s infinite ease-in-out

**Particles:**
- Confetti on confirmations (50 particles, rainbow colors)
- Sparks on wheel spin (20 particles, hot colors)
- Ambient floating particles in lobby

---

## 📱 ALL SCREENS - COMPLETE SPECIFICATIONS

---

## **SCREEN 1: HOME PAGE (Entry)**

**Route:** `/`
**Users:** Everyone (first visit)

### Layout:
```
┌─────────────────────────────────────────┐
│    [Moving gradient background]          │
│                                          │
│       PARLAY PARTY (huge, glowing)      │
│     Predict. Compete. Get Punished.     │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  [CREATE ROOM button - massive]  │   │
│  │     (magenta neon glow)          │   │
│  ├──────────────────────────────────┤   │
│  │           — OR —                 │   │
│  ├──────────────────────────────────┤   │
│  │  [Enter Room Code input]         │   │
│  │  [JOIN ROOM button]              │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Host on desktop • Play on mobile       │
└─────────────────────────────────────────┘
```

### Elements:
1. **Title:** "PARLAY PARTY"
   - 128px Bebas Neue, cyan glow
   - Tracking: 0.15em
   - Centered, animated scale-in

2. **Tagline:** "Predict. Compete. Get Punished."
   - 24px Inter, #B6C2E1
   - Below title, fade-in delay 0.2s

3. **CREATE ROOM Button:**
   - 320px wide × 80px tall
   - Magenta border + glow
   - Hover: Fill magenta, text turns black
   - "CREATE ROOM" in Bebas Neue 32px

4. **Room Code Input:**
   - 320px wide × 60px tall
   - Center-aligned text
   - 32px Orbitron monospace
   - Cyan border when focused
   - Placeholder: "ENTER CODE"

5. **JOIN ROOM Button:**
   - Same style as CREATE but cyan instead of magenta

### Background:
- #0B0B0B solid
- Radial gradients: cyan blob at 20%/50%, magenta at 80%/50%
- Slow rotation animation (20s loop)

---

## **SCREEN 2: HOST LOBBY**

**Route:** `/host/[code]`
**User:** Host on desktop/TV

### Layout:
```
┌──────────────────────────────────────────────────────────────┐
│  PARLAY PARTY (title, smaller, top)                           │
│  ┌────────────┐                                               │
│  │ ROOM CODE  │                                               │
│  │   X7K2     │ (huge, glowing, centered card)               │
│  └────────────┘                                               │
│                                                                │
│ ┌─────────────────────┐  ┌───────────────────────────────┐   │
│ │ VIDEO QUEUE (3)     │  │ PLAYERS (2)                   │   │
│ │                     │  │                                │   │
│ │ [+ Add Video Form]  │  │ [Player Avatar + Name]        │   │
│ │ ├─ YouTube/TikTok   │  │ [Player Avatar + Name]        │   │
│ │ ├─ Title (optional) │  │                                │   │
│ │ └─ [Add button]     │  │ (Waiting for players...)      │   │
│ │                     │  │                                │   │
│ │ 1. ▲▼ Rick Roll    ✕│  └───────────────────────────────┘   │
│ │    Added by: Carter │  ┌───────────────────────────────┐   │
│ │                     │  │   [START GAME button]         │   │
│ │ 2. ▲▼ Funny Cats   ✕│  │   (magenta, huge, pulsing)    │   │
│ │    Added by: Trevor │  │                                │   │
│ │                     │  │ Will play videos in queue      │   │
│ │ 3. ▲▼ Fails Comp   ✕│  └───────────────────────────────┘   │
│ │    Added by: Sarah  │                                       │
│ └─────────────────────┘                                       │
│                                                                │
│  Players visit: parlay-party.fly.dev/play/X7K2                │
└──────────────────────────────────────────────────────────────┘
```

### Components:

**1. Room Code Card (centered, top):**
- 300px × 150px card with neon border
- "ROOM CODE" label (14px, subtle)
- Code: 72px Orbitron, magenta glow
- Tracking: 0.3em

**2. Video Queue Panel (left, 50%):**
- Card with cyan neon border
- Header: "VIDEO QUEUE (count)" in Bebas Neue 32px
- **Add Form:**
  - Toggle: YouTube / TikTok (pills, magenta when active)
  - Title input: 40px tall, subtle border
  - URL input: 48px tall, cyan border
  - "+ ADD TO QUEUE" button (cyan glow)
- **Queue List:**
  - Max height: 400px, scroll if needed
  - Each item:
    - #121212 background, rounded 12px
    - ▲▼ buttons (16px, cyan, left side)
    - Title (18px semibold) or "YouTube Video"
    - "Added by: [name]" (12px, subtle)
    - ✕ button (red, right side)

**3. Players Panel (right top, 25%):**
- Card with violet neon border
- Header: "PLAYERS (count)" in Bebas Neue 32px
- List:
  - Avatar circles (48px) with first initial
  - Name (18px semibold)
  - Latency badge if > 0
  - Host badge (crown emoji or "HOST" text)
  - **Host NOT shown in this list**
- Empty state: "Waiting for players..." (subtle text, centered)

**4. Start Button (right bottom, 25%):**
- 280px × 80px
- Magenta neon border + glow
- "START GAME" in Bebas Neue 36px
- Subtle pulse animation
- Below: "Will play videos in queue order" (14px subtle)

**5. Join Instructions (bottom):**
- Centered, subtle text
- "Players visit: [URL]" (20px, cyan text for URL)

---

## **SCREEN 3: PLAYER JOIN**

**Route:** `/play/[code]`
**User:** Player on mobile (before joining)

### Layout:
```
┌─────────────────────────┐
│   JOIN ROOM             │
│                         │
│   ┌─────────┐           │
│   │ X7K2    │ (code)    │
│   └─────────┘           │
│                         │
│   YOUR NAME             │
│   [________________]    │
│                         │
│   [JOIN PARTY button]   │
│   (magenta, full width) │
│                         │
└─────────────────────────┘
```

### Components:
- **Title:** "JOIN ROOM" (48px Bebas Neue, cyan)
- **Code Display:** Card with room code (48px Orbitron, magenta)
- **Name Input:** Full width, 56px tall, cyan border
- **Join Button:** 100% width, 64px tall, magenta glow
- Vertical centering, max-width 400px

---

## **SCREEN 4: HOST - PARLAY ENTRY**

**Route:** `/host/[code]` (status: parlay)
**User:** Host watching players

### Layout:
```
┌──────────────────────────────────────────────────────────┐
│        PARLAY ENTRY (title)                               │
│        Players are making their predictions...            │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  3 / 6 Locked In                           50%     │   │
│  │  [████████████░░░░░░░░░░░░] (progress bar)        │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  [Player Cards Grid - 4 columns]                          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                             │
│  │ 🔒 │ │ 🔒 │ │ 🔒 │ │ ⏳ │  (locked vs unlocked)       │
│  │Cart│ │Trev│ │Sara│ │Mike│                              │
│  └────┘ └────┘ └────┘ └────┘                             │
│                                                            │
│         [LOCK ALL & START VIDEO button]                   │
│                (magenta, huge)                             │
└──────────────────────────────────────────────────────────┘
```

### Components:

**1. Progress Card:**
- Full width, 80px tall
- Text: "3 / 6 Locked In" + percentage
- Animated progress bar (gradient: cyan → magenta → violet)
- Smooth width animation

**2. Player Cards (Grid):**
- **Unlocked state:**
  - 150px × 180px
  - Flipped (backside showing)
  - Grey border, opacity 0.3
  - Avatar circle (56px)
  - Name (14px)
  - No glow
  
- **Locked state:**
  - Card flips to front (rotateY 180→0)
  - Cyan neon border + glow
  - "✓ LOCKED" badge (12px, cyan)
  - Pulsing glow animation

**3. Lock Button:**
- 320px × 64px, centered
- Magenta glow
- "LOCK ALL & START VIDEO" (24px Bebas Neue)

---

## **SCREEN 5: PLAYER - PARLAY ENTRY**

**Route:** `/play/[code]` (status: parlay)
**User:** Player on mobile submitting prediction

### Layout:
```
┌─────────────────────────────────┐
│      PREDICT                     │
│  What will happen in this video? │
│                                   │
│  YOUR PREDICTION                  │
│  ┌─────────────────────────────┐ │
│  │                             │ │
│  │ e.g., "Someone screams"     │ │
│  │                             │ │
│  └─────────────────────────────┘ │
│  150/200 characters               │
│                                   │
│  [🔒 LOCK IN button]             │
│  (magenta, breathing glow)        │
└─────────────────────────────────┘
```

### Components:

**1. Title:** "PREDICT" (56px Bebas Neue, cyan glow)
**2. Subtitle:** "What will happen..." (18px, subtle)
**3. Textarea:**
- Full width, 120px height
- Cyan border, 2px
- Focus: Magenta border + glow
- Placeholder with example
- Character counter (right-aligned, 12px)
**4. Lock Button:**
- 100% width, 72px tall
- Magenta neon border + breathing glow
- "🔒 LOCK IN" (32px Bebas Neue)
- Disabled state: opacity 0.5

**After Locking:**
- Card flips to show locked state
- 🔒 icon (64px)
- "LOCKED IN" title (36px cyan)
- Their parlay in a card
- "Waiting for other players..." (subtle)

---

## **SCREEN 6: PARLAY REVEAL (Host & Players)**

**Duration:** 5 seconds
**Both screens:** Show all parlays

### HOST Layout:
```
┌──────────────────────────────────────────────────────────┐
│        PARLAYS LOCKED! (huge, magenta)                    │
│        Here's what everyone is watching for...            │
│                                                            │
│  [3x2 Grid of Parlay Cards]                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐           │
│  │ Carter     │ │ Trevor     │ │ Sarah      │           │
│  │ "Cat jumps"│ │ "Car alarm"│ │ "Screams"  │           │
│  └────────────┘ └────────────┘ └────────────┘           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐           │
│  │ Mike       │ │ Lisa       │ │ Dave       │           │
│  │ "Phone     │ │ "Dog       │ │ "Glass     │           │
│  │  rings"    │ │  barks"    │ │  breaks"   │           │
│  └────────────┘ └────────────┘ └────────────┘           │
│                                                            │
│           GET READY... (pulsing cyan)                     │
│           Video starts automatically                       │
└──────────────────────────────────────────────────────────┘
```

### PLAYER Layout:
```
┌─────────────────────────────────┐
│   PARLAYS LOCKED!                │
│   Here's what to watch for...    │
│                                   │
│  ┌─────────────────────────────┐ │
│  │ YOUR PARLAY: (cyan, bold)   │ │
│  │ "Cat jumps"                 │ │
│  │ (magenta bg, huge text)     │ │
│  └─────────────────────────────┘ │
│                                   │
│  ALL PARLAYS:                     │
│  ┌─────────────────────────────┐ │
│  │ "Cat jumps"     ←YOU        │ │
│  │ (cyan border, highlighted)  │ │
│  ├─────────────────────────────┤ │
│  │ "Car alarm goes off"        │ │
│  │ (white border)              │ │
│  ├─────────────────────────────┤ │
│  │ "Someone screams"           │ │
│  ├─────────────────────────────┤ │
│  │ "Phone rings"               │ │
│  ├─────────────────────────────┤ │
│  │ "Dog barks twice"           │ │
│  └─────────────────────────────┘ │
│                                   │
│  VIDEO STARTING SOON...           │
│  (pulsing, cyan)                  │
└─────────────────────────────────┘
```

### Parlay Cards:
- **Your Parlay:**
  - Special card, gradient bg (magenta/cyan 20% opacity)
  - 280px wide, 100px tall
  - "YOUR PARLAY:" label (12px, cyan)
  - Text: 24px bold

- **Others' Parlays:**
  - Standard list items
  - 100% width, 60px tall
  - Subtle border, dark bg
  - 16px text
  - Staggered fade-in animation (0.1s delay each)

---

## **SCREEN 7: HOST - VIDEO PHASE**

**Route:** `/host/[code]` (status: video)
**User:** Host with TV/desktop

### Layout:
```
┌──────────────────────────────────────────────────────────┐
│  ┌───────────┐                         ┌────────────┐    │
│  │EVENT COUNT│                         │▶️ PAUSE    │    │
│  │    5      │  [YouTube Video Player] │📍 MARK     │    │
│  │(live updt)│                         └────────────┘    │
│  └───────────┘                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │          [16:9 YouTube Video]                      │  │
│  │                                                     │  │
│  │                                                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  [Confirm/Dismiss Modal - shows when paused]              │
│  ┌────────────────────────────────────────────────────┐  │
│  │ PAUSE - CONFIRM EVENT?                             │  │
│  │ "Cat jumps off the couch"                          │  │
│  │ Called by 4 player(s)                              │  │
│  │ [✓ CONFIRM]  [✗ DISMISS]                          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  [END ROUND → button] (bottom, when video ends)          │
└──────────────────────────────────────────────────────────┘
```

### Components:

**1. Event Counter (top-left floating):**
- 120px × 100px card
- Frosted glass bg (rgba(18,18,18,0.9))
- Cyan neon border
- "EVENT COUNT" (10px, subtle)
- Number (40px Orbitron, cyan)
- Increments with scale animation

**2. Controls (top-right floating):**
- Two buttons side-by-side
- "▶️ PAUSE" / "⏸️ PAUSE" toggle
- "📍 MARK" button (violet glow)
- Each 100px × 48px

**3. Video Player:**
- Aspect ratio 16:9
- Black background
- Rounded corners (16px)
- YouTube iframe fills space

**4. Confirm Modal (when paused):**
- 600px wide card
- Cyan neon border
- "PAUSE - CONFIRM EVENT?" (32px Bebas Neue, cyan)
- Event text (28px, magenta, quoted)
- "Called by X player(s)" (16px, subtle)
- Two buttons:
  - "✓ CONFIRM" (magenta, 48% width)
  - "✗ DISMISS" (red border, 48% width)

**5. End Round Button (bottom center):**
- Appears when video ends
- 280px × 72px
- Magenta glow, scale animation
- "END ROUND →" (28px Bebas Neue)

---

## **SCREEN 8: PLAYER - VIDEO PHASE**

**Route:** `/play/[code]` (status: video)
**User:** Player on mobile during video

### Layout:
```
┌─────────────────────────────────┐
│  WATCH FOR THESE: (title)        │
│  ┌─────────────────────────────┐ │
│  │ "Cat jumps"                 │ │
│  ├─────────────────────────────┤ │
│  │ "Car alarm"                 │ │
│  ├─────────────────────────────┤ │
│  │ "Someone screams"           │ │
│  ├─────────────────────────────┤ │
│  │ "Phone rings"               │ │
│  └─────────────────────────────┘ │
│  (scrollable, max 200px)         │
│                                   │
│                                   │
│        ┌───────────┐              │
│        │           │              │
│        │    🎯     │ (280x280)   │
│        │           │  button     │
│        │IT HAPPENED│  breathing  │
│        │           │   glow      │
│        └───────────┘              │
│                                   │
│  ┌─────────────────────────────┐ │
│  │ ✓ Called @ 12.5s            │ │
│  │ (feedback card)             │ │
│  └─────────────────────────────┘ │
│                                   │
│  Watch the host screen           │
│  for video playback              │
└─────────────────────────────────┘
```

### Components:

**1. Parlay List Card (top):**
- Full width, 220px max height
- Scrollable
- Each parlay:
  - 100% width, 48px tall
  - #121212 bg, subtle border
  - 14px text, left-aligned
  - 8px margin between

**2. IT HAPPENED Button (center):**
- 280px × 280px circular
- Magenta neon border (4px)
- Breathing glow animation (0-60px blur, 2s loop)
- Content:
  - 🎯 emoji (72px)
  - "IT HAPPENED!" (32px Bebas Neue)
- **Cooldown state:**
  - Grey border
  - ⏱️ emoji
  - "COOLDOWN" text
  - Disabled appearance

**3. Feedback Card (below button):**
- Appears after clicking
- 280px wide, 80px tall
- Cyan neon border
- "✓ Called @ 12.5s" (20px semibold, cyan)
- Scale-in animation

**4. Instructions (bottom):**
- Subtle text, centered
- 12px, two lines

---

## **SCREEN 9: PARLAY PICKER MODAL**

**Triggered:** Player taps "IT HAPPENED!"
**Overlay:** Full screen

### Layout:
```
┌─────────────────────────────────┐
│ [Black 90% opacity backdrop]     │
│                                   │
│  ┌─────────────────────────────┐ │
│  │  WHAT HAPPENED?             │ │
│  │  (magenta glow, centered)   │ │
│  │                             │ │
│  │  ┌───────────────────────┐  │ │
│  │  │ "Cat jumps"           │  │ │
│  │  │ (button, cyan border) │  │ │
│  │  ├───────────────────────┤  │ │
│  │  │ "Car alarm goes off"  │  │ │
│  │  ├───────────────────────┤  │ │
│  │  │ "Someone screams"     │  │ │
│  │  ├───────────────────────┤  │ │
│  │  │ "Phone rings"         │  │ │
│  │  ├───────────────────────┤  │ │
│  │  │ "Dog barks"           │  │ │
│  │  └───────────────────────┘  │ │
│  │  (scrollable list)          │ │
│  │                             │ │
│  │  [CANCEL button]            │ │
│  │  (red border)               │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Components:

**1. Backdrop:**
- rgba(0, 0, 0, 0.9)
- Click to dismiss

**2. Modal Card:**
- 360px × 600px max
- #121212 bg
- Cyan neon border + glow
- Rounded 16px
- Scale-in animation (0.8 → 1.0)

**3. Title:**
- "WHAT HAPPENED?" (36px Bebas Neue, magenta)
- Centered, top padding 24px

**4. Parlay Buttons (list):**
- 100% width, 64px tall each
- Cyan border (2px)
- #0B0B0B bg
- Hover: cyan bg (10% opacity)
- Text: 18px semibold, left-aligned
- Padding: 16px
- Gap: 12px between items
- Scrollable if > 6 items

**5. Cancel Button:**
- 100% width, 56px tall
- Red border (2px)
- "CANCEL" (20px Bebas Neue)
- Top margin: 24px

---

## **SCREEN 10: CINEMATIC PAUSE OVERLAY**

**Triggered:** Auto-pause when consensus reached
**Full screen overlay**

### Layout:
```
┌─────────────────────────────────┐
│ [Darken background to 80%]       │
│                                   │
│           ⏸️ (huge)              │
│                                   │
│      IT HAPPENED!                │
│   (giant, cyan, pulsing glow)    │
│                                   │
│    "Cat jumps off couch"         │
│   (magenta, quoted, large)       │
│                                   │
│     Resuming in 20...            │
│   (countdown, white text)        │
│                                   │
└─────────────────────────────────┘
```

### Animation Sequence:
1. **0.0s:** Fade in, blur effect
2. **0.2s:** Screen desaturates briefly
3. **0.3s:** White flash (200ms)
4. **0.5s:** Pause emoji scales in (0 → 1.2 → 1.0)
5. **0.7s:** "IT HAPPENED!" appears (slide up + fade)
6. **0.9s:** Event text appears (slide up + fade)
7. **1.2s:** Countdown starts
8. **20.0s:** Fade out, video resumes

### Components:
- **Emoji:** ⏸️ 128px
- **Title:** "IT HAPPENED!" (96px Bebas Neue, cyan, multi-layer glow)
- **Event Text:** 56px, magenta, quoted, semibold
- **Countdown:** 24px, subtle color, updates every second

---

## **SCREEN 11: HOST - REVIEW PHASE**

**Route:** `/host/[code]` (status: review)
**Condition:** If markers exist

### Layout:
```
┌──────────────────────────────────────────────────────────┐
│              REVIEW MARKERS (title)                       │
│              3 markers to review                          │
│                                                            │
│  ┌────────────────────────┐  ┌──────────────────────┐    │
│  │  [YouTube Player]      │  │  TIMELINE            │    │
│  │  (for reviewing)       │  │                      │    │
│  │                        │  │  ┌────────────────┐  │    │
│  │                        │  │  │ 📍 12.5s       │  │    │
│  │                        │  │  │ (selected)     │  │    │
│  │                        │  │  └────────────────┘  │    │
│  └────────────────────────┘  │  ┌────────────────┐  │    │
│                               │  │ 📍 24.8s       │  │    │
│  ┌────────────────────────┐  │  │ Note: rewatch  │  │    │
│  │ CONFIRM EVENT          │  │  └────────────────┘  │    │
│  │ Marker at 12.5s        │  │  ┌────────────────┐  │    │
│  │                        │  │  │ 📍 31.2s       │  │    │
│  │ WHAT HAPPENED?         │  │  └────────────────┘  │    │
│  │ [input: match text]    │  │                      │    │
│  │                        │  │  (scrollable)        │    │
│  │ [✓CONFIRM] [SKIP]     │  │                      │    │
│  └────────────────────────┘  │  [CONTINUE→] (when │    │
│                               │   all reviewed)     │    │
│                               └──────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### Components:
- **Video:** 60% width, 16:9
- **Timeline:** 35% width, cyan neon card
- **Marker Items:**
  - 100% width, 72px tall
  - Timestamp (24px Orbitron, cyan)
  - 📍 emoji (24px)
  - Note text if exists (14px)
  - Hover: scale 1.05
  - Selected: cyan glow border
- **Confirm Panel:**
  - Below video
  - Input for parlay text
  - Confirm (magenta) + Skip (red) buttons

---

## **SCREEN 12: PLAYER - VIDEO PHASE (Full Spec)**

**Route:** `/play/[code]` (status: video)
**User:** Player watching and calling

### Complete Layout:
```
┌─────────────────────────────────┐
│  WATCH & CALL (title, small)     │
│  Tap when your prediction happens│
│                                   │
│  ┌─────────────────────────────┐ │
│  │ WATCH FOR THESE:            │ │
│  │ ┌─────────────────────────┐ │ │
│  │ │ "Cat jumps"             │ │ │
│  │ ├─────────────────────────┤ │ │
│  │ │ "Car alarm"             │ │ │
│  │ ├─────────────────────────┤ │ │
│  │ │ "Someone screams"       │ │ │
│  │ └─────────────────────────┘ │ │
│  │ (scrollable, 180px max)     │ │
│  └─────────────────────────────┘ │
│                                   │
│                                   │
│        ┌───────────┐              │
│        │    🎯     │              │
│        │  (120px)  │              │
│        │           │              │
│        │    IT     │              │
│        │ HAPPENED! │              │
│        └───────────┘              │
│     (280x280 circle)              │
│     (breathing glow)              │
│                                   │
│  ┌─────────────────────────────┐ │
│  │ ✓ Called @ 12.5s            │ │
│  └─────────────────────────────┘ │
│                                   │
│  Watch the host screen           │
│  for video playback              │
└─────────────────────────────────┘
```

**Parlay List:**
- Fixed at top, always visible
- Compact size (each 44px tall)
- Easy to scan quickly

**Button:**
- Dominant center focus
- Large touch target (280px)
- Can't miss it!

---

## **SCREEN 13: WHEEL OF PUNISHMENT**

**Route:** Host & Players (status: wheel)

### HOST Layout:
```
┌──────────────────────────────────────────────────────────┐
│          WHEEL OF PUNISHMENT                              │
│          4 punishments approved                           │
│                                                            │
│  ┌──────────────────┐  ┌──────────────────────────────┐  │
│  │ SUBMISSIONS      │  │      [Wheel Canvas]          │  │
│  │                  │  │   (500x500px Pixi.js)        │  │
│  │ Take a shot  ✓   │  │                              │  │
│  │ [Approve][Reject]│  │    Metallic wheel with       │  │
│  │                  │  │    colored wedges            │  │
│  │ Call your ex  ✓  │  │    Sparks when spinning      │  │
│  │                  │  │                              │  │
│  │ Dance 30s     ✓  │  │                              │  │
│  │                  │  │  [SPIN THE WHEEL button]     │  │
│  │ Post selfie   ✓  │  │  (magenta, huge)             │  │
│  │                  │  │                              │  │
│  │ (scrollable)     │  │  [Result shown below:]       │  │
│  └──────────────────┘  │  The loser is... CARTER      │  │
│                        │  "Take a shot"               │  │
│                        └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### PLAYER Layout:
```
┌─────────────────────────────────┐
│    PUNISHMENT                     │
│    Submit a dare for the wheel!   │
│                                   │
│  YOUR PUNISHMENT IDEA             │
│  ┌─────────────────────────────┐ │
│  │                             │ │
│  │ e.g., "Take a shot"         │ │
│  │                             │ │
│  └─────────────────────────────┘ │
│  85/100                           │
│                                   │
│  [SUBMIT button]                  │
│  (magenta, full width)            │
│                                   │
│  OR after submitting:             │
│                                   │
│  ✅ SUBMITTED                     │
│  ┌─────────────────────────────┐ │
│  │ "Take a shot"               │ │
│  └─────────────────────────────┘ │
│  Watch the host screen!           │
└─────────────────────────────────┘
```

### Wheel Visual:
- **Canvas:** 500×500px
- **Style:** Metallic/3D appearance
- **Segments:** Equal wedges, colored (cyan/magenta/violet/green/amber)
- **Center:** Small circle with pointer
- **Animation:** 
  - Rotation with deceleration
  - Sparks trailing (orange/red particles)
  - Tick sounds speeding up
  - Flash on land
  - Result text appears with scale-in

---

## **SCREEN 14: RESULTS / SCOREBOARD**

**Route:** Both (status: results)

### Layout:
```
┌──────────────────────────────────────────────────────────┐
│               GAME OVER (huge, cyan)                      │
│                                                            │
│               ┌────────────┐                              │
│               │  WINNER    │                              │
│               │     👑     │                              │
│               │   Carter   │                              │
│               │  24.75 pts │                              │
│               └────────────┘                              │
│               (huge card, glowing)                        │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  SCOREBOARD                                        │  │
│  │  ┌──┬────────┬────────┬────────────────┐          │  │
│  │  │1 │ Carter │ [👤]   │ 24.75          │ (cyan)   │  │
│  │  ├──┼────────┼────────┼────────────────┤          │  │
│  │  │2 │ Trevor │ [👤]   │ 18.30          │          │  │
│  │  ├──┼────────┼────────┼────────────────┤          │  │
│  │  │3 │ Sarah  │ [👤]   │ 12.85          │          │  │
│  │  └──┴────────┴────────┴────────────────┘          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│              [PLAY AGAIN button]                          │
│              (magenta, large)                             │
└──────────────────────────────────────────────────────────┘
```

### Components:

**1. Winner Card:**
- 400px × 300px
- Cyan neon border + glow
- Crown emoji 64px
- Name: 48px Bebas Neue, magenta
- Score: 36px Orbitron, cyan

**2. Scoreboard Table:**
- Full width max 800px
- Neon separators between rows
- Rank: 32px bold, magenta
- Name: 24px semibold
- Score: 28px Orbitron, animated on change
- #1 has cyan glow/highlight

**3. Play Again:**
- 280px × 64px
- Magenta glow
- "PLAY AGAIN" (24px Bebas Neue)

---

## 🎨 **COMPONENT LIBRARY**

### **Buttons**

**Primary (Cyan Neon):**
- Cyan border (2px) + outer glow (0 0 20px cyan)
- #121212 background
- Hover: Cyan background + black text
- Transition: 200ms ease-out

**Secondary (Magenta Neon):**
- Same as primary but magenta
- Use for primary actions

**Violet Neon:**
- Use for tertiary actions

**Danger:**
- Red border + glow
- Transparent bg
- Hover: Red bg (20% opacity)

### **Cards**

**Standard Neon Card:**
- #121212 background
- 1px inner border + outer glow (cyan)
- Border radius: 12-16px
- Padding: 24-32px
- Drop shadow: 0 4px 24px rgba(0, 255, 247, 0.1)

**Gradient Card (special):**
- Same but with gradient overlay
- `background: linear-gradient(135deg, rgba(0,255,247,0.05), rgba(255,45,149,0.05))`

### **Inputs**

**Neon Input:**
- #0B0B0B background
- Cyan border (2px)
- Focus: Magenta border + glow
- Text: #F5F8FF, 16-18px
- Placeholder: #B6C2E1
- Padding: 12-16px
- Border radius: 8px

**Textarea:**
- Same as input but taller
- Resize: none
- Min height: 120px

### **Avatars**

**Player Avatar Circle:**
- 48-64px diameter
- Cyan neon border when active
- Grey border when inactive
- Initial letter (24-32px, cyan)
- Host badge: Crown emoji top-right corner

---

## 🎬 **ANIMATION SPECS**

### **Page Transitions:**
- Fade + slide up (20px)
- Duration: 300ms
- Easing: ease-out

### **Card Flips:**
- rotateY: 180deg → 0deg
- Duration: 500ms
- Easing: ease-in-out
- Backface visibility: hidden

### **Glow Pulse (Breathing):**
- box-shadow blur: 20px → 40px → 20px
- Duration: 2000ms
- Loop: infinite
- Easing: ease-in-out

### **Button Interactions:**
- Hover: scale(1.05), 180ms
- Click: scale(0.95), 120ms
- Active: Add inner shadow

### **Score Pop:**
- New score: cyan color flash
- Scale: 1.5 → 1.0
- Duration: 300ms
- Floating +X indicator above

### **Confetti:**
- 50 particles
- Colors: cyan, magenta, violet, green
- Spread: 360 degrees from center
- Velocity: 2-6 units/frame
- Gravity: 0.2
- Fade: alpha -= 0.02 per frame
- Rotation: += 0.1 per frame

---

## 📐 **RESPONSIVE BREAKPOINTS**

**Mobile (< 768px):**
- Single column layouts
- Larger touch targets (min 48px)
- Full-width buttons
- Compact spacing (16px gaps)

**Tablet (768-1024px):**
- 2-column grids
- Medium spacing (24px gaps)

**Desktop (> 1024px):**
- 3-column grids for cards
- 2-column for main content
- Large spacing (32px gaps)

---

## 🎯 **FIGMA FRAME SPECIFICATIONS**

Create these frames:

1. **Home** - 1920×1080 (desktop)
2. **Host Lobby** - 1920×1080
3. **Host Parlay Entry** - 1920×1080
4. **Host Reveal** - 1920×1080
5. **Host Video Phase** - 1920×1080
6. **Host Review** - 1920×1080
7. **Host Wheel** - 1920×1080
8. **Host Results** - 1920×1080
9. **Player Join** - 375×812 (iPhone)
10. **Player Parlay Entry** - 375×812
11. **Player Reveal** - 375×812
12. **Player Video Phase** - 375×812
13. **Player Parlay Picker Modal** - 375×812
14. **Player Wheel** - 375×812
15. **Player Results** - 375×812

---

## 🚀 **USE THIS SUPERPROMPT:**

```
Design a complete dark neon party game UI for "Parlay Party" - a real-time multiplayer video prediction game where players smoke/drink when events happen.

STRICT VISUAL REQUIREMENTS:
- Theme: Dark futuristic club/arcade aesthetic
- Background: Pure black (#0B0B0B) with deep charcoal panels (#121212)
- Never use light backgrounds - everything must be dark
- Accent colors: Neon cyan (#00FFF7), hot magenta (#FF2D95), violet (#8A6BFF)
- All interactive elements MUST have neon glow effects (multi-layer box-shadow)
- Typography: Bebas Neue for headers (all caps, wide tracking), Inter for body
- Animations: Card flips (500ms), breathing glow (2s pulse), scale hovers

COLOR PALETTE:
--bg-0: #0B0B0B
--bg-1: #121212
--fg-0: #F5F8FF
--fg-subtle: #B6C2E1
--accent-1: #00FFF7 (cyan)
--accent-2: #FF2D95 (magenta)
--accent-3: #8A6BFF (violet)

DESIGN ALL 15 SCREENS with these exact specifications:
[paste each screen spec above]

Each screen must have:
- Dark theme (no light backgrounds ever)
- Neon glows on all buttons/borders
- Proper spacing and hierarchy
- Responsive sizing
- Clear interactive states
- Smooth animations
- Gaming/party aesthetic

Export as high-fidelity mockups with all states shown (hover, active, disabled, etc.)
```

---

Would you like me to:
1. **Create a Figma plugin script** that automates this?
2. **Generate a Figjam flow diagram** showing all screens connected?
3. **Create individual screen prompts** for v0.dev/Claude?
4. **Export current CSS/Tailwind as Figma tokens**?

Let me know and I'll set it up! Meanwhile, the deployment is still running in the background.
