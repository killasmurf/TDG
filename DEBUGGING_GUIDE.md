# TDG Game - Debugging Guide

## 🐛 Current Issues Being Debugged

### **Issue #1: Towers Not Showing Images**
- **Status:** ✅ NOT A BUG - Working as designed
- **Explanation:** Towers are rendered as colored rectangles, not images
- **Location:** `src/entities/Tower.js` lines 149-187
- **No fix needed**

### **Issue #2: Money Not Decreasing When Placing Towers**
- **Status:** 🔍 Under Investigation
- **Expected Behavior:** Money should decrease by tower cost when placed
- **Location:** `src/core/game.js` lines 176-208
- **Debug Logs Added:** ✅
  - Tower placement attempt logs
  - Money before/after logs
  - Validation failure logs

### **Issue #3: Enemies Not Moving Through Complete Path**
- **Status:** 🔍 Under Investigation
- **Expected Behavior:** Enemies should move through all waypoints and reduce lives when reaching the end
- **Location:** `src/entities/Enemy.js` lines 108-157
- **Debug Logs Added:** ✅
  - Waypoint progress logs
  - Path completion logs
  - Event emission logs

---

## 🧪 How to Debug

### **1. Open Browser Console**
Press `F12` in your browser to open Developer Tools, then click on the "Console" tab.

### **2. Refresh the Game**
Reload the page (Ctrl+R or Cmd+R) to see initialization logs.

### **3. Test Tower Placement**

**Steps:**
1. Start the game (click on the canvas)
2. Press `1`, `2`, or `3` to select a tower type
3. Click on the canvas away from the path
4. **Watch the console** for these logs:

```
💰 Attempting tower placement: { type: 'basic', cost: 50, currentMoney: 200, position: {...} }
```

**Expected outcomes:**

✅ **SUCCESS:**
```
✅ Tower placed! Money: $200 → $150
```

❌ **NOT ENOUGH MONEY:**
```
❌ Not enough money! Need $50, have $25
```

❌ **INVALID POSITION:**
```
❌ Invalid tower position (too close to path or other tower)
```

### **4. Test Enemy Path Movement**

**Steps:**
1. Start the game and place 1-2 towers
2. Press `SPACE` to start a wave
3. **Watch the console** for these logs:

```
📍 Enemy reached waypoint 1/6 { position: {...} }
📍 Enemy reached waypoint 2/6 { position: {...} }
...
📍 Enemy reached waypoint 6/6 { position: {...} }
🏁 Enemy reached END OF PATH! Emitting event...
🏁 Enemy reached end! { type: 'basic', damage: 1, lives: 10 }
💔 Lives: 10 → 9
```

**OR (if killed by tower):**
```
💀 Enemy killed! { type: 'basic', reward: 10, money: 200 }
💰 Money: $200 → $210
```

---

## 🔍 Common Issues & Solutions

### **Money Not Decreasing**

**Possible Causes:**
1. **Clicking too fast** - The tower type is deselected after first click, so second click doesn't register
2. **Invalid position** - Tower position is too close to path or another tower
3. **Not enough money** - Trying to place a tower you can't afford

**Check Console For:**
- ❌ `Invalid tower position` message
- ❌ `Not enough money` message
- ✅ `Tower placed!` message (money DID decrease)

**Fix:**
- Make sure you see "Selected: BASIC ($50)" in the top UI
- Click AWAY from the gray path lines
- Click at least 50 pixels away from existing towers

### **Enemies Not Reaching End**

**Possible Causes:**
1. **Towers killing all enemies** - Working as intended!
2. **Path configuration issue** - Enemies stuck at a waypoint
3. **Event not connected** - Event emitted but not handled

**Check Console For:**
- 📍 Waypoint progress messages
- 🏁 "Enemy reached END OF PATH!" message
- 💔 Lives decreasing message

**If No Logs Appear:**
- Enemies may be getting killed before reaching the end (check for 💀 logs instead)
- Path may have issue (enemies stuck)

### **Enemies Stuck at Waypoint**

**Check Config:**
- `Config.path.waypointThreshold` (in `src/config.js`)
- Should be set to a reasonable value (default: 10)
- If too small, enemies may never "reach" waypoint

---

## 📊 Expected Console Output (Normal Game)

### **Game Start:**
```
Tower Defense Game v0.1.0
Initializing...
Game initialized. Click to start!
Tower Defense Game Initialized
```

### **Tower Placement:**
```
💰 Attempting tower placement: { type: 'basic', cost: 50, currentMoney: 200, ... }
✅ Tower placed! Money: $200 → $150
```

### **Wave Start:**
```
📍 Enemy reached waypoint 1/6 { position: { x: 200, y: 100 } }
📍 Enemy reached waypoint 2/6 { position: { x: 200, y: 300 } }
💀 Enemy killed! { type: 'basic', reward: 10, money: 150 }
💰 Money: $150 → $160
```

### **Enemy Reaches End:**
```
📍 Enemy reached waypoint 6/6 { position: { x: 800, y: 500 } }
🏁 Enemy reached END OF PATH! Emitting event...
🏁 Enemy reached end! { type: 'basic', damage: 1, lives: 10 }
💔 Lives: 10 → 9
```

---

## 🛠️ Next Steps

1. **Test the game** with browser console open
2. **Report the console output** for the issues you're experiencing
3. **Compare** with expected output above
4. **Identify** which logs are missing or unexpected

Once we see the actual console output, we can pinpoint the exact issue and fix it!
