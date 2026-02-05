# Main Menu Testing Guide

## Quick Start

To test the newly implemented main menu system:

### 1. Launch the Game

```bash
npm start
```

Or if using the built executable:
```bash
./dist/Tower Defense Game.exe
```

### 2. What You Should See

**Main Menu Screen:**
- Dark background overlay
- Gold title: "TOWER DEFENSE GAME"
- Subtitle: "Defend your base from waves of enemies!"
- Four menu buttons:
  - Play Game
  - Select Map
  - Settings
  - Exit Game
- Current map info at bottom: "Selected Map: Default Map"
- Version info: "v1.0 | Made with Claude Code"

### 3. Test Main Menu

**Click "Play Game":**
- ✓ Default map loads
- ✓ Brief "TOWER DEFENSE" / "Click to Start" screen appears
- ✓ Game auto-starts after ~100ms
- ✓ Game state becomes 'playing'
- ✓ HUD displays money, lives, wave info
- ✓ Towers can be selected (1, 2, 3 keys)
- ✓ Towers can be placed (click on valid positions)
- ✓ Waves can be started (SPACE key)

**Click "Select Map":**
- ✓ Map selection screen opens
- ✓ All 4 maps are listed:
  - Default Map - The standard winding path
  - Straight Shot - Simple straight path
  - Serpentine Path - Winding S-shaped path
  - Spiral Fortress - Challenging spiral path
- ✓ Each map shows name and description
- ✓ Currently selected map is highlighted in blue
- ✓ Clicking any map loads it and starts game
- ✓ "Back to Menu" button returns to main menu

**Click "Settings":**
- ✓ Settings screen opens
- ✓ Shows "SETTINGS" title
- ✓ Displays Audio Settings section
- ✓ Shows Music Volume: 50%
- ✓ Shows SFX Volume: 80%
- ✓ Displays Difficulty section
- ✓ Shows Current: normal
- ✓ Shows "Settings editing coming soon!" message
- ✓ Back button returns to main menu

**Click "Exit Game":**
- ✓ In Electron: Window closes
- ✓ In browser: Alert shows "Press Alt+F4 or close the window to exit"

### 4. Test Map Selection Flow

1. Launch game
2. Click "Select Map"
3. Click "Serpentine Path"
4. ✓ Map loads and game starts
5. ✓ Serpentine S-shaped path is visible
6. ✓ Starting money: $125
7. ✓ Starting lives: 25
8. Press ESC to open pause menu
9. Click "Exit to Menu"
10. ✓ Returns to main menu
11. ✓ Main menu fully functional

### 5. Test Each Map

**Default Map:**
- Starting money: $100
- Starting lives: 20
- Path: Winding path through center

**Straight Shot:**
- Starting money: $150
- Starting lives: 15
- Path: Horizontal straight line

**Serpentine Path:**
- Starting money: $125
- Starting lives: 25
- Path: S-shaped winding path

**Spiral Fortress:**
- Starting money: $200
- Starting lives: 30
- Path: Complex spiral to center

### 6. Test UI Elements

**HUD (during gameplay):**
- ✓ Wave info displays correctly
- ✓ Money updates when placing towers
- ✓ Lives decrease when enemies escape
- ✓ Tower selection keys work (1, 2, 3)
- ✓ Start Wave button works
- ✓ Instructions appear at bottom

**Map Selector (old HTML UI):**
- ✓ Should be hidden (display: none)
- ✓ Not visible in top-right corner
- ✓ No interference with game

### 7. Test Pause Menu Integration

1. Start playing a game
2. Press ESC
3. ✓ Pause menu opens
4. ✓ Shows: Continue, Restart, Settings, Exit to Menu
5. Click "Exit to Menu"
6. ✓ Returns to main menu
7. ✓ Main menu is fully functional
8. ✓ Can select different map
9. ✓ Can play again

### 8. Test Edge Cases

**Map Loading Error:**
- Modify a map file to be invalid JSON
- Try to load it
- ✓ Error logged to console
- ✓ Fallback to default path
- ✓ Game remains playable

**Window Resize:**
- Resize window (if possible)
- ✓ Menu buttons still clickable
- ✓ UI elements scale correctly

**Rapid Clicking:**
- Click menu buttons rapidly
- ✓ No double-loading
- ✓ State transitions correctly
- ✓ No errors in console

### 9. Console Verification

Open browser/Electron dev tools console and check for:

**On Launch:**
```
[Main] Script loaded
[Main] DOM ready, creating game...
[Main] Game created, state: mainMenu
[Main] Initializing game...
[Main] Game initialized, state: mainMenu
```

**When Clicking "Play Game":**
```
[Game] Main menu action: play
[Game] Loading map and starting: ./maps/default.json
[Game] Loading map from file: ./maps/default.json
[Game] Map loaded successfully: Default Map
```

**When Selecting Map:**
```
Click detected, game state: mainMenu
[Game] handleClick - state: mainMenu
```

**No Errors:**
- ✓ No red error messages
- ✓ No "undefined" errors
- ✓ No missing file errors

### 10. Unit Tests

Run the test suite:
```bash
npm test
```

Expected results:
- ✓ All 38 tests pass
- ✓ No new test failures
- ✓ Game.js tests include main menu
- ✓ WaveManager tests still pass
- ✓ Entity tests still pass

---

## Known Working Features

After main menu implementation, verify these still work:

### Gameplay
- ✓ Tower placement with path validation
- ✓ Tower size-based clearance calculations
- ✓ Wave spawning and management
- ✓ Enemy movement along path
- ✓ Tower targeting and shooting
- ✓ Money/lives tracking
- ✓ Victory/defeat conditions

### Controls
- ✓ 1, 2, 3 - Select tower types
- ✓ Click - Place tower
- ✓ SPACE - Start/pause wave
- ✓ ESC - Open pause menu
- ✓ Arrow keys - Navigate pause menu
- ✓ Enter - Select pause menu option

### Map System
- ✓ 4 pre-built maps load correctly
- ✓ Map waypoints define path
- ✓ Path width respected
- ✓ Starting resources vary by map

---

## Troubleshooting

### Issue: Main menu doesn't appear

**Check:**
- Game state is 'mainMenu' in console
- renderStateOverlay() is being called
- Canvas is visible and sized correctly

**Fix:**
- Verify game.js line 29: `this.state = 'mainMenu'`
- Check console for errors

### Issue: Buttons don't respond to clicks

**Check:**
- Mouse position is updating
- Click events are registered
- handleMainMenuClick() is being called

**Fix:**
- Check Input.js mouse tracking
- Verify event listeners in game.js
- Check console for click logs

### Issue: Map loads but game doesn't start

**Check:**
- loadMapAndStart() completes
- State transitions to 'menu' then 'playing'
- setTimeout executes after 100ms

**Fix:**
- Check async/await in loadMapFromFile()
- Verify map file is valid JSON
- Check console for loading errors

### Issue: Old map selector still visible

**Check:**
- index.html line 11 has `display: none`
- CSS is applied correctly

**Fix:**
- Add `display: none` to #map-selector style
- Clear browser cache
- Rebuild Electron app

---

## Success Criteria

Main menu implementation is successful if:

1. ✅ Game starts at main menu (not auto-playing)
2. ✅ All 4 menu options work correctly
3. ✅ Map selection shows all 4 maps
4. ✅ Each map loads with correct starting resources
5. ✅ Settings screen displays
6. ✅ Back buttons return to main menu
7. ✅ Pause menu "Exit to Menu" works
8. ✅ HTML map selector is hidden
9. ✅ All gameplay features still work
10. ✅ All unit tests pass
11. ✅ No console errors
12. ✅ Smooth state transitions

---

## Next Steps After Testing

Once testing is complete:

1. **Document any bugs found**
   - Create GitHub issues
   - Note reproduction steps
   - Include console logs

2. **Rebuild executable**
   ```bash
   npm run build
   ```

3. **Update README** with:
   - New main menu feature
   - Map selection instructions
   - Controls reference

4. **Optional Enhancements**
   - Add keyboard navigation to main menu
   - Implement settings editing
   - Add map preview images
   - Add animations/transitions

5. **Commit changes**
   ```bash
   git add .
   git commit -m "Implement main menu system with map selection and settings"
   git push
   ```

---

## Support

If you encounter issues not covered in this guide:

1. Check console for error messages
2. Review [MAIN_MENU_IMPLEMENTATION.md](MAIN_MENU_IMPLEMENTATION.md)
3. Review [MAP_SYSTEM_IMPLEMENTATION.md](MAP_SYSTEM_IMPLEMENTATION.md)
4. Check git history for recent changes
5. Run unit tests for specific failures
