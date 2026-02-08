# Pixel Art Samurai Enemy - Installation Guide

## Method 1: Run Python Script in Blender (Recommended)

### Step 1: Open Blender
1. Launch Blender on your machine
2. Go to **Scripting** workspace (top menu bar)

### Step 2: Load and Run Script
1. Click **Open** in the text editor
2. Navigate to and open: `create_samurai_enemy.py`
3. Click **Run Script** button (▶ play icon) or press `Alt+P`

### Step 3: View Results
The script will:
- Clear the scene
- Create a low-poly pixel art samurai enemy
- Export to multiple formats:
  - `samurai_enemy.fbx` (for Unity, Unreal, etc.)
  - `samurai_enemy.gltf` (for web/modern engines)
  - `samurai_enemy.obj` (universal format)
  - `samurai_enemy.blend` (Blender file for edits)

## Method 2: Manual Creation via Blender Console

If you prefer to run commands directly:

1. Open Blender
2. Window → Toggle System Console (Windows) or run from terminal (Mac/Linux)
3. In Blender's Python Console (scripting workspace), paste and run:

```python
exec(open("/path/to/create_samurai_enemy.py").read())
```

## Customization Options

Edit these variables at the top of the script:

```python
SCALE_FACTOR = 1.0      # Adjust size for your game (1.0 = ~2 units tall)
PIXEL_ART_SIZE = 32     # Texture resolution (16, 32, or 64)
```

### Color Palette
Modify the `COLORS` dictionary to change the appearance:
- `armor_dark`: Main armor color
- `armor_accent`: Decorative elements (red by default)
- `cloth_black`: Undergarment color
- `helmet`: Helmet color
- `metal`: Sword blade color

## Integration with TDG Project

### For JavaScript/Three.js Games:
1. Use the `.gltf` export
2. Place in your `assets/models/` directory
3. Load with GLTFLoader:

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('assets/models/samurai_enemy.gltf', (gltf) => {
    const samurai = gltf.scene;
    samurai.scale.set(0.5, 0.5, 0.5); // Adjust as needed
    scene.add(samurai);
});
```

### For Unity:
1. Use the `.fbx` export
2. Drag into Unity's Assets folder
3. Set import settings:
   - Generate Colliders: Yes (for tower defense)
   - Material Naming: By Base Texture Name

### For Godot:
1. Use the `.gltf` export
2. Import into your project
3. Adjust scale in scene settings

## Model Stats

- **Vertices**: ~100-150 (very low poly)
- **Materials**: 7 (flat-shaded, pixel art style)
- **Height**: ~2.0 units (customizable)
- **Width**: ~1.0 units
- **Depth**: ~0.5 units

## Troubleshooting

### Script won't run
- Make sure you're using Blender 3.0+
- Check that the file path is correct
- Try running in Blender's Text Editor instead of console

### Model too big/small
- Adjust `SCALE_FACTOR` in the script
- Re-run the script after changing

### Colors not showing
- Switch to Material Preview or Rendered view (Z → Material Preview)
- Check that you're in Solid shading mode with Color Type set to Material

### Export location
- Files are saved to `/home/claude/` by default
- Change `filepath_base` in `export_for_game()` function

## Next Steps

1. Import into your game engine
2. Add animations (walk cycle, attack, death)
3. Attach to enemy AI pathfinding
4. Add particle effects for hits/death
5. Create variations by changing colors
