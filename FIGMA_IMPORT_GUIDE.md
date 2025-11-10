# 📐 How to Import Parlay Party into Figma

## Quick Start

I've created `parlay-party-figma.json` with all screens and design tokens!

---

## 🎨 What's Included

### Design Tokens (Ready to Use):
- ✅ **10 Color Styles** - All neon colors defined
- ✅ **8 Text Styles** - Display, body, mono variants
- ✅ **3 Effect Styles** - Cyan, magenta, violet glows
- ✅ **5 Component Templates** - Buttons, cards, inputs

### Screens (15 Total):
1. Home Page (1920×1080)
2. Host Lobby with Video Queue (1920×1080)
3. Player Join (375×812 mobile)
4. Host - Parlay Entry (1920×1080)
5. Host - Parlay Reveal (1920×1080)
6. Player - Parlay Reveal (375×812)
7. Host - Video Phase (1920×1080)
8. Player - Video Phase (375×812)
9. Player - Parlay Picker Modal (375×812)
10. Cinematic Pause Overlay (1920×1080)
11. Host - Review Phase (1920×1080)
12. Host - Wheel (1920×1080)
13. Player - Wheel Submit (375×812)
14. Host - Results (1920×1080)
15. Player - Results (375×812)

---

## 📥 Import Methods

### **Option 1: Figma Plugin (Easiest)**

Unfortunately Figma doesn't support direct JSON import anymore. Instead:

1. Use the **FIGMA_DESIGN_SUPERPROMPT.md** with these plugins:
   - **Figma AI** - Generate designs from text
   - **Genius** - AI design assistant
   - **Diagram** - Generate from descriptions

2. Or use **v0.dev** to generate React code → Screenshot → Import to Figma

### **Option 2: Manual Recreation (Most Control)**

Use the JSON as a blueprint:

1. Open Figma
2. Create new file: "Parlay Party UI Kit"
3. Import fonts:
   - Bebas Neue
   - Inter
   - Orbitron
4. Create color styles from `styles.colors`
5. Create text styles from `styles.text`
6. Create effect styles from `styles.effects`
7. Build frames using JSON specs

### **Option 3: FigJam Flow Diagram**

I can create a FigJam board showing:
- All screens as boxes
- Flow arrows between states
- Annotations for interactions
- State transitions

---

## 🎨 **Figma Variables to Create**

### Colors (Create as Figma Variables):

```
Collections: "Parlay Party Colors"

└─ Background
   ├─ bg-0: #0B0B0B
   └─ bg-1: #121212

└─ Foreground
   ├─ fg-0: #F5F8FF
   └─ fg-subtle: #B6C2E1

└─ Accent
   ├─ cyan: #00FFF7
   ├─ magenta: #FF2D95
   └─ violet: #8A6BFF

└─ Status
   ├─ success: #7FFF00
   ├─ danger: #FF4444
   └─ warning: #FFC400
```

### Text Styles:

```
Display XL    Bebas Neue 96px Bold UPPERCASE Letter 15%
Display LG    Bebas Neue 64px Bold UPPERCASE Letter 10%
Display MD    Bebas Neue 48px Bold UPPERCASE Letter 10%
Display SM    Bebas Neue 32px Bold UPPERCASE Letter 10%

Body LG       Inter 20px Regular
Body MD       Inter 16px Regular  
Body SM       Inter 14px Regular

Mono Score    Orbitron 36px Bold
Mono Code     Orbitron 64px Bold Letter 30%
```

### Effects (Outer Glow):

```
Glow Cyan      Drop Shadow: 0,0 Blur 40 #00FFF7 60% opacity
Glow Magenta   Drop Shadow: 0,0 Blur 40 #FF2D95 60% opacity
Glow Violet    Drop Shadow: 0,0 Blur 40 #8A6BFF 60% opacity
```

---

## 🔧 **Better Alternative: Use v0.dev**

Since Figma doesn't import JSON directly anymore, here's the BEST workflow:

### **Step 1: Generate with v0.dev**
- Go to https://v0.dev
- Paste sections from `FIGMA_DESIGN_SUPERPROMPT.md`
- Generate React components with exact styling
- Download as images or copy code

### **Step 2: Import Screenshots to Figma**
- Screenshot the generated designs
- Import to Figma
- Use as reference or trace over

### **Step 3: Use Existing Code**
- The actual React code already works!
- Just refine the styling in code
- No need to redesign from scratch

---

## 🎯 **What You Should Do**

**Recommended Path:**

1. **Use the working app** as your design reference
   - Visit: https://parlay-party.fly.dev/
   - Screenshot each screen
   - Import screenshots to Figma

2. **Use FIGMA_DESIGN_SUPERPROMPT.md** with:
   - Claude with design mode
   - v0.dev for individual screens
   - Midjourney for mockups

3. **Create design variations** in Figma:
   - Try different color combinations
   - Experiment with layouts
   - Polish animations
   - Design alternate themes

4. **Export tokens back** to code:
   - Update Tailwind config
   - Refine CSS variables
   - Iterate on live site

---

## 💡 **Pro Tip:**

The game is **already fully functional** with a dark neon theme! You can:
- Use it as-is for your party
- Refine designs incrementally
- A/B test variations
- Polish specific screens

No need to redesign from scratch - the hard work is done! 🎉

---

## 📞 **Need Help?**

The `parlay-party-figma.json` file contains the structure. While Figma can't import it directly, you can:
- Use it as documentation
- Reference for measurements
- Guide for recreation
- Token specification

Or just use the live app and iterate on the actual code! 🚀

