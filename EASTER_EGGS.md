# 🍕 Parlay Party - Easter Eggs

## Pizza Hut Logo Easter Egg

### **Trigger Names:**
Any player with these names (case-insensitive) gets the Pizza Hut logo as their avatar:

- **Bart** (and any variation like "Bart Simpson", "Bartman")
- **Matthew** (and variations like "Matthew B", "Matthew123")
- **Matty B** (and "MattyB", "Matty-B", etc.)
- **Matty** (standalone)
- **Matt** (standalone)

### **How It Works:**
- Automatically detects name on join
- Replaces avatar with Pizza Hut logo
- Shows in all views (lobby, scoreboard, results)
- Works with any spacing/capitalization

### **Examples:**
- "Bart" → 🍕 Pizza Hut logo
- "matthew" → 🍕 Pizza Hut logo  
- "MATTY B" → 🍕 Pizza Hut logo
- "Matt the Great" → 🍕 Pizza Hut logo
- "BartSimpson420" → 🍕 Pizza Hut logo

### **Technical:**
- URL: `https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/Pizza_Hut_logo.svg/1200px-Pizza_Hut_logo.svg.png`
- Location: `apps/web/src/components/PlayerAvatar.tsx`
- Function: `isPizzaHutName()`

---

## 🎮 Have fun at Pizza Hut! 🍕

