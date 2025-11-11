# 🧪 Parlay Party - Testing & Debugging Guide

## ✅ **Latest Deployment:** 01K9R9011FGXNJM31ZPHT8CKDZ (LIVE)

---

## 🔄 **CRITICAL: Hard Refresh Required!**

The browser has cached old JavaScript. You MUST hard refresh:

### **On Desktop (Host):**
- **Windows:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R
- Or: Ctrl+F5

### **On Phone (Player):**
- **Close tab completely**
- **Clear browser cache** (Settings → Clear browsing data)
- **Reopen:** https://parlay-party.fly.dev/play/[CODE]

---

## 📊 **How to Confirm You're on NEW Version**

### **Console Logs You Should See:**

#### **When Submitting Parlay:**
```
📊 Parlay progress: 1/1
✅ All players submitted, auto-locking in 1 second
```
✅ **YOU SEE THIS** - Good!

#### **When Clicking IT HAPPENED (NEW!):**
```
📱 PLAYER: Sending vote:add {tVideoSec: 12.5, normalizedText: "nword", parlayText: "N word"}
```
❌ **YOU DON'T SEE THIS** - You're on old code! Hard refresh!

#### **On Host When Vote Received (NEW!):**
```
🖥️ HOST: Received video:pause_auto {normalizedText: "nword", punishment: null, ...}
```

---

## 🎯 **Complete Test Flow**

### **Step 1: Clear Cache**
1. Close ALL tabs
2. Clear browser cache
3. Reopen both host and player

### **Step 2: Start Fresh Game**
1. Create new room
2. Join on phone
3. Add video
4. Submit parlay WITH punishment: "N word" + "2 shots"
5. Wait for auto-lock
6. See reveal phase

### **Step 3: Test Vote**
1. Click "IT HAPPENED!" on phone
2. **CHECK CONSOLE** - Should see:
   ```
   📱 PLAYER: Sending vote:add ...
   ```
3. Select parlay from list
4. **In solo mode:** Video should pause within 1 second
5. See punishment screen

---

## 🐛 **If Still Not Working:**

### **Check These:**

1. **Browser console shows emoji logs?**
   - NO → Hard refresh didn't work, clear cache completely

2. **See "📱 PLAYER: Sending vote:add"?**
   - NO → Not on new deployment
   - YES → Check next step

3. **Server receives vote?**
   - Check Fly logs: `fly logs --app parlay-party`
   - Should see: "🎯 VOTE:ADD received"

4. **Solo mode detected?**
   - Should see: "👤 SOLO MODE - Immediate approval"
   - Should see: "✅ Solo approval complete, broadcasting pause"

---

## 🚀 **Expected Behavior (NEW VERSION):**

### **Solo Mode:**
1. Click IT HAPPENED → Select parlay
2. Console: "📱 PLAYER: Sending vote:add"
3. Server: "🎯 VOTE:ADD received"
4. Server: "👤 SOLO MODE - Immediate approval"
5. Video pauses instantly
6. See punishment screen
7. 20-second countdown
8. Resume

### **Multi-Player (3+):**
1. Click IT HAPPENED → Select parlay
2. Console: "📱 PLAYER: Sending vote:add"
3. Server: "📢 Sending verification to X players"
4. Others get TRUE/FALSE popup
5. Majority votes
6. Video pauses if TRUE
7. See punishment screen

---

## 🔥 **FORCE NEW VERSION:**

If hard refresh doesn't work:

### **Incognito/Private Mode:**
1. Open incognito window
2. Go to site fresh
3. Should load new code

### **Different Browser:**
1. Try Chrome if using Firefox
2. Or vice versa
3. New browser = no cache

---

## 📞 **Current Status:**

**Deployment:** ✅ Successfully deployed (01K9R9011FGXNJM31ZPHT8CKDZ)
**Code:** ✅ Solo mode immediate approval implemented
**Logs:** ✅ Full emoji debugging added
**Issue:** ⚠️ Browser cache showing old version

**The fix IS deployed! Just need to get new code loaded in browser!**

---

**Try these steps and let me know what console logs you see!** 🎮

