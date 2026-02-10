# TDG Map Editor - Integration Guide

## 🎯 Goal

Add the waypoint map editor to your existing TDG project so you can create custom maps visually.

---

## 📋 Prerequisites

- Your TDG project at `C:\Users\Adam Murphy\AI\TDG`
- React already set up (you have `src/components/MapEditor.tsx` skeleton)
- Existing map loading system works (you have 4 maps in `maps/` folder)

---

## 🚀 Step-by-Step Integration

### Step 1: Copy Files (2 minutes)

Copy the 4 new files into your project:

```bash
# Navigate to your project
cd "C:\Users\Adam Murphy\AI\TDG"

# Copy the new map editor files
# (Assuming the output files are in your downloads or specified location)

src/components/MapEditor/
├── MapEditorApp.tsx       ← Main app (NEW)
├── WaypointEditor.tsx     ← Core editor (REPLACES skeleton)
├── SettingsPanel.tsx      ← Settings UI (NEW)
└── MapSerializer.ts       ← Utilities (NEW)
```

**Action:**
1. Create folder: `src/components/MapEditor/` (if it doesn't exist)
2. Copy all 4 files into this folder
3. Delete or backup old `src/components/MapEditor.tsx` skeleton

---

### Step 2: Update Your Route/Navigation (3 minutes)

#### Option A: Add to React Router (if you have it)

```tsx
// In your App.tsx or main router file
import { MapEditorApp } from './components/MapEditor/MapEditorApp';

// Add route
<Route path="/map-editor" element={<MapEditorApp />} />
```

#### Option B: Add Link in index.html (simpler)

```html
<!-- In your index.html, add to your game controls -->
<div id="game-controls">
  <!-- Your existing controls -->
  <button id="open-map-editor">🗺️ Map Editor</button>
</div>

<script>
  // In your main.js or index.js
  document.getElementById('open-map-editor')?.addEventListener('click', () => {
    window.open('/map-editor.html', '_blank');
  });
</script>
```

Then create `public/map-editor.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TDG Map Editor</title>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import { MapEditorApp } from './src/components/MapEditor/MapEditorApp';

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<MapEditorApp />);
  </script>
</body>
</html>
```

#### Option C: Standalone Demo (quickest)

Just open `map-editor-demo.html` in your browser!

```bash
# From project root
start map-editor-demo.html
# or
open map-editor-demo.html
```

---

### Step 3: Test the Editor (5 minutes)

1. **Open the editor** (using option A, B, or C above)

2. **Create a test map:**
   - Click to add 3-4 waypoints
   - Change map name to "Test Map"
   - Set starting money to 150
   - Click "EXPORT JSON"

3. **Verify JSON downloaded:**
   ```
   Downloads/test-map.json
   ```

4. **Load in your game:**
   - Copy `test-map.json` to `maps/` folder
   - Add to map selector in `index.html`:
   ```html
   <option value="./maps/test-map.json">Test Map</option>
   ```
   - Refresh game and select "Test Map"

---

### Step 4: Customize Defaults (Optional, 5 minutes)

Edit `WaypointEditor.tsx` to match your game's style:

```typescript
// Line ~45
const DEFAULT_SETTINGS: MapSettings = {
  name: 'Untitled Map',
  description: 'A custom tower defense map',
  startingMoney: 100,        // ← Change your default money
  startingLives: 20,         // ← Change your default lives
  pathWidth: 40,             // ← Match your game's path width
  pathColor: '#8b7355',      // ← Match your game's path color
  canvasWidth: 800,          // ← Your game canvas width
  canvasHeight: 600,         // ← Your game canvas height
  backgroundColor: '#2d2d2d', // ← Your game background
};
```

---

## 🎨 Styling Integration

### Match Your Game's Theme

If your game uses different colors, update the SettingsPanel styles:

```tsx
// In SettingsPanel.tsx, around line 20
const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',  // ← Change to match your inputs
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#c8d0d8',
  // ...
};
```

### Use Your Font

```tsx
// In MapEditorApp.tsx, top level style
fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
// Change to:
fontFamily: "Your-Font-Here"
```

---

## 🔄 Workflow Example

### Creating a New Map

1. **Open Map Editor**
   - Click "Map Editor" button in game
   - Or navigate to `/map-editor` route

2. **Design the Path**
   - Click to add waypoints (minimum 2)
   - First waypoint = enemy spawn (green)
   - Last waypoint = end goal (red)
   - Drag waypoints to adjust if needed

3. **Configure Settings**
   - Name: "Desert Crossing"
   - Description: "A winding path through the desert"
   - Starting Money: $125
   - Starting Lives: 25
   - Path Width: 45px
   - Path Color: #d4a574 (sandy)
   - Background: #f4e4c4 (desert)

4. **Export**
   - Click "EXPORT JSON"
   - Saves as `desert-crossing.json`

5. **Add to Game**
   - Move to `maps/desert-crossing.json`
   - Update map selector in `index.html`
   - Play test!

### Editing Existing Map

1. **Load Map**
   - Click "LOAD FILE" in editor
   - Select `maps/serpentine.json`

2. **Make Changes**
   - Drag waypoints to new positions
   - Adjust path width
   - Change starting resources

3. **Re-export**
   - Export with same filename
   - Overwrites old version

---

## 🧪 Testing Checklist

- [ ] Editor opens without errors
- [ ] Can add waypoints by clicking
- [ ] Waypoints snap to grid
- [ ] Path renders correctly
- [ ] Can change map name
- [ ] Can adjust settings (money, lives, etc.)
- [ ] Export creates valid JSON
- [ ] Downloaded JSON loads in game
- [ ] Game renders custom map correctly
- [ ] Enemies follow waypoint path
- [ ] Tower placement validates against custom path width

---

## 🐛 Common Issues

### Issue: "Cannot find module './MapEditorApp'"

**Cause:** File path incorrect

**Fix:**
```typescript
// Make sure import path matches your file structure
import { MapEditorApp } from './components/MapEditor/MapEditorApp';
// Not:
import { MapEditorApp } from './MapEditor/MapEditorApp';
```

---

### Issue: Editor shows but canvas is blank

**Cause:** Canvas dimensions don't match

**Fix:**
```typescript
// In WaypointEditor.tsx, verify:
<canvas
  width={settings.canvasWidth}   // Must be numbers
  height={settings.canvasHeight} // Must be numbers
/>
```

---

### Issue: Exported map won't load in game

**Cause:** Validation errors or wrong format

**Fix:**
1. Check browser console for errors
2. Verify JSON structure:
   ```json
   {
     "name": "...",
     "version": "1.0",
     "path": { "waypoints": [...], "width": 40 },
     "settings": { "startingMoney": 100, "startingLives": 20 }
   }
   ```
3. Use editor's validation before export

---

### Issue: Can't drag waypoints

**Cause:** Need to select "MOVE" tool

**Fix:**
- Click "✋ MOVE" button in toolbar
- Then click and drag waypoints

---

## 📊 Integration Verification

Run these tests to confirm everything works:

```javascript
// In browser console while editor is open
console.log('Testing editor...');

// Test 1: Add waypoint programmatically
// (This won't work in production, just for testing)

// Test 2: Check exports
// Click Export and verify download occurs

// Test 3: Load exported map in game
// Verify path renders and enemies move correctly
```

---

## 🚀 Next Steps

### Phase 1: Basic Usage (Week 1)
- Create 2-3 custom maps
- Test with different difficulties
- Share with playtesters

### Phase 2: Community Maps (Week 2)
- Add map sharing feature
- Create map gallery
- Community voting system

### Phase 3: Advanced Features (Week 3+)
- Tile-based visual editing
- Decorative elements (trees, rocks)
- Wave editor for custom enemy patterns
- Tower placement zones

---

## 📚 Resources

- **README:** `MAP_EDITOR_README.md` - Complete feature documentation
- **Demo:** `map-editor-demo.html` - Standalone demo
- **Examples:** Check `maps/` folder for JSON examples
- **Game Integration:** Existing `Game.loadMapFromFile()` method

---

## 🎉 You're Done!

Your map editor is now integrated. Start creating custom maps for your TDG!

**Quick Win:** Try recreating one of your existing maps (default.json, serpentine.json) using the visual editor to see how it matches up.
