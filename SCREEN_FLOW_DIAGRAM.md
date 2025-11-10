# 🎮 Parlay Party - Complete Screen Flow Diagram

## 📊 Visual Flow Map

```
                            START
                              │
                              ↓
                    ┌──────────────────┐
                    │   HOME PAGE      │
                    │ - Create Room    │
                    │ - Join Room      │
                    └──────────────────┘
                       │              │
           HOST ←──────┘              └──────→ PLAYER
                │                              │
                ↓                              ↓
        ┌──────────────┐              ┌──────────────┐
        │ HOST LOBBY   │              │ PLAYER JOIN  │
        │ • Video Queue│              │ • Enter Name │
        │ • Add Videos │              │              │
        │ • Reorder    │              │              │
        │ • See Players│              │              │
        └──────────────┘              └──────────────┘
                │                              │
                │  [Host clicks START]         │
                │                              │
                ↓                              ↓
        ┌──────────────┐              ┌──────────────┐
        │PARLAY ENTRY  │              │PARLAY ENTRY  │
        │ • Grid view  │              │ • Big input  │
        │ • Progress   │              │ • Lock In    │
        │ • Lock All   │              │              │
        └──────────────┘              └──────────────┘
                │                              │
                │ [All locked]                 │
                ↓                              ↓
        ┌──────────────┐              ┌──────────────┐
        │PARLAY REVEAL │              │PARLAY REVEAL │
        │ • Grid of all│              │ • Your parlay│
        │   parlays    │              │ • All parlays│
        │ • 5 seconds  │              │ • 5 seconds  │
        └──────────────┘              └──────────────┘
                │                              │
                │ [Auto-transition]            │
                ↓                              ↓
        ┌──────────────┐              ┌──────────────┐
        │ VIDEO PHASE  │              │ VIDEO PHASE  │
        │ • YouTube    │◄─────────────│ • Parlay List│
        │ • Event Count│   SYNCED     │ • IT HAPPENED│
        │ • Controls   │              │   Button     │
        │              │              │              │
        │ ┌──────────┐ │              │ ┌──────────┐ │
        │ │When votes│ │              │ │Tap button│ │
        │ │reach     │ │              │ │          │ │
        │ │consensus │ │              │ │Select    │ │
        │ │          │ │              │ │parlay    │ │
        │ │Auto-Pause│ │              │ │from list │ │
        │ └──────────┘ │              │ └──────────┘ │
        │      ↓       │              │      ↓       │
        │ ┌──────────┐ │              │ ┌──────────┐ │
        │ │CINEMATIC │ │◄─────────────┤ │Vote sent │ │
        │ │PAUSE     │ │   BROADCAST  │ │to server │ │
        │ │          │ │              │ └──────────┘ │
        │ │Flash+Boom│ │              │              │
        │ │20 seconds│ │              │              │
        │ └──────────┘ │              │              │
        │      ↓       │              │              │
        │ ┌──────────┐ │              │              │
        │ │Host      │ │              │              │
        │ │Confirms  │ │              │              │
        │ │or        │ │              │              │
        │ │Dismisses │ │              │              │
        │ └──────────┘ │              │              │
        │      ↓       │              │              │
        │ Points awarded              │              │
        │ Video resumes               │              │
        └──────────────┘              └──────────────┘
                │                              │
                │ [Video ends]                 │
                ↓                              ↓
        ┌──────────────┐              ┌──────────────┐
        │   REVIEW     │              │   REVIEW     │
        │ (if markers) │              │  • Waiting   │
        │ • Timeline   │              │  • Message   │
        │ • Jump to    │              │              │
        │ • Confirm    │              │              │
        └──────────────┘              └──────────────┘
                │                              │
                │ [All reviewed or skip]       │
                ↓                              ↓
        ┌──────────────┐              ┌──────────────┐
        │ WHEEL PHASE  │              │ WHEEL SUBMIT │
        │ • Submissions│              │ • Text input │
        │ • Approve    │              │ • Submit     │
        │ • Spin       │              │ • Watch host │
        │ • Result     │              │              │
        └──────────────┘              └──────────────┘
                │                              │
                │ [Wheel complete]             │
                ↓                              ↓
        ┌──────────────┐              ┌──────────────┐
        │   RESULTS    │              │   RESULTS    │
        │ • Winner     │              │ • Your Score │
        │ • Scoreboard │              │ • Watch host │
        │ • Play Again │              │              │
        └──────────────┘              └──────────────┘
                │                              │
                └──────────┬───────────────────┘
                           ↓
                    [Play Again] → Back to Lobby
                           OR
                    [End Game] → END
```

---

## 🎯 KEY INTERACTION POINTS

### **1. Video Queue (New!)**
```
LOBBY
  ↓
ANY PLAYER adds video
  ↓
Broadcasts to all players
  ↓
Queue updates in real-time
  ↓
Host can reorder (▲▼)
  ↓
Host clicks START
  ↓
Pulls first video from queue
```

### **2. Parlay Submission Flow**
```
PARLAY ENTRY
  ↓
Player types prediction
  ↓
Clicks LOCK IN
  ↓
Card flips + glows
  ↓
Server stores + broadcasts progress
  ↓
Host sees X/Y locked in
  ↓
Host clicks LOCK ALL
  ↓
Server fetches ALL parlays
  ↓
Broadcasts to everyone
```

### **3. Reveal Phase Flow**
```
PARLAYS LOCKED
  ↓
5-second reveal screen
  ↓
HOST: Grid of all parlays
PLAYERS: List with yours highlighted
  ↓
Auto-transition to video
```

### **4. Event Calling Flow (Critical!)**
```
VIDEO PLAYING
  ↓
Player sees parlay list at top
  ↓
Something happens in video
  ↓
Player taps "IT HAPPENED!"
  ↓
MODAL OPENS with ALL parlays
  ↓
Player SELECTS which one
  ↓
Vote sent with normalizedText + timestamp
  ↓
Server clusters votes
  ↓
If consensus → AUTO-PAUSE
  ↓
CINEMATIC EFFECT (flash, boom)
  ↓
Host sees confirm modal
  ↓
Host CONFIRMS → 20-second pause
  OR
Host DISMISSES → -0.5 penalty
  ↓
Points awarded
  ↓
Video resumes after 20 seconds
  ↓
Repeat until video ends
```

---

## 🔄 STATE MACHINE

```
Room States:
  lobby → parlay → video → review → wheel → results → [ended]
                     ↑                            ↓
                     └────────[Next Round]────────┘

Round States:
  pending → parlay → video → review → wheel → completed
```

---

## 📱 SCREEN DIMENSIONS

### Desktop/TV (Host):
- **Resolution:** 1920×1080
- **Safe Area:** 1800×960 (60px margins)
- **Grid:** 12 columns, 32px gutter
- **Cards:** Max 800px width

### Mobile (Players):
- **Resolution:** 375×812 (iPhone 13)
- **Safe Area:** 343×744 (16px margins)
- **Touch Targets:** Min 48px
- **Buttons:** Full width minus margins

---

## 🎨 COMPONENT STATES

### Button States:
- **Default:** Neon border + glow
- **Hover:** Scale 1.05 + brighter glow
- **Active:** Scale 0.95 + fill color
- **Disabled:** Opacity 0.5, no glow
- **Loading:** Pulse animation

### Card States:
- **Default:** Neon border
- **Hover:** Scale 1.02
- **Selected:** Brighter glow
- **Locked:** Cyan glow + checkmark

### Input States:
- **Default:** Cyan border
- **Focus:** Magenta border + glow
- **Error:** Red border + shake
- **Success:** Green border + checkmark

---

## 📐 SPACING SYSTEM

```
4px   - Tiny gaps (icon spacing)
8px   - Small gaps (between related items)
12px  - Medium gaps (list items)
16px  - Standard gaps (sections)
24px  - Large gaps (major sections)
32px  - XL gaps (between major blocks)
48px  - XXL gaps (between screen sections)
```

---

## 🎬 ANIMATION TIMELINE

### Page Load:
- 0ms: Fade in background
- 100ms: Title scales in
- 300ms: Content fades up
- 500ms: Buttons appear

### Card Flip:
- 0ms: Start rotation
- 250ms: Halfway (backface)
- 500ms: Complete (frontface)
- Add: Glow pulse at 400ms

### Cinematic Pause:
- 0ms: Blur + darken
- 200ms: White flash
- 300ms: Pause icon scales in
- 500ms: Title appears
- 700ms: Event text appears
- 20000ms: Fade out

---

## 🔗 SCREEN CONNECTIONS

```
Home ──→ Host Lobby ──→ Parlay Entry ──→ Reveal ──→ Video ──→ Review ──→ Wheel ──→ Results
  │                                         ↑    ↓                    ↓
  └──→ Player Join ──→ Parlay Entry ──→ Reveal  └→ Video ──→ Wheel ──→ Results
```

---

## 🎨 **QUICK FIGMA SETUP**

### 1. Create New File
File → New Design File → "Parlay Party"

### 2. Set Canvas Background
- Color: #0B0B0B
- Grid: 8px

### 3. Import Fonts
- Google Fonts: Bebas Neue, Inter, Orbitron
- Or use system: Impact, System UI, Courier

### 4. Create Color Variables
- Right panel → Variables → New collection
- Add all 10 colors from spec

### 5. Create Text Styles
- Right panel → Text styles → New style
- Create 8 styles from spec

### 6. Create Effect Styles
- Effects → New style
- Add 3 glow variations

### 7. Build Screens
- Use JSON measurements
- Apply styles
- Add interactions
- Create prototypes

---

## 🎯 **You Now Have:**

1. ✅ `parlay-party-figma.json` - Complete structure
2. ✅ `FIGMA_DESIGN_SUPERPROMPT.md` - Full specifications
3. ✅ `FIGMA_IMPORT_GUIDE.md` - How to use it
4. ✅ `SCREEN_FLOW_DIAGRAM.md` - This visual flow

**Plus the actual working game deployed at:**
**https://parlay-party.fly.dev/** 🎉

You can now design in Figma using these specs, or just polish the existing live app!

