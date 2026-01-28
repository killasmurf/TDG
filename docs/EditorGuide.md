# docs/EditorGuide.md
# TDG Map Editor

The game ships with a built‑in map editor which lets you build a custom path for enemies.

## How to Use

| Key | Action |
|-----|--------|
| **Click** | Add a waypoint. |
| **S** | Save path to local storage (persists for the next game session). |
| **R** | Reset the whole path. |
| **Escape** | Exit edit mode (pause the game). |

Press the **"Edit Map"** button in the HUD to enter edit mode.  When you’re done, click **"Stop Editing"** (or hit `Esc`) to resume normal gameplay.

### Where the path is stored

The path is saved in `localStorage` under the key `tdg-path`.  If no path is found, the default empty path is used.

You can also load a path from a JSON file or your editor tool of choice – simply replace the `localStorage.getItem('tdg-path')` line in `MapEditor.js` to read from your source.
