# Integrating Samurai Enemy into TDG Project

## Quick Start - Files Available

You now have THREE options:

### Option 1: OBJ Model (Ready to Use NOW)
- ✅ `samurai_enemy.obj` - The 3D model
- ✅ `samurai_enemy.mtl` - Material definitions
- **Use this if**: You want to test immediately without Blender

### Option 2: Blender Script (Best Quality)
- ✅ `create_samurai_enemy.py` - Full Blender script
- **Use this if**: You have Blender and want FBX/glTF exports
- **See**: `INSTALLATION_GUIDE.md` for instructions

### Option 3: Manual Creation
- Follow the visual guide to build it yourself in Blender

---

## Integration Steps for TDG

### Step 1: Add Model Files to Your Project

```bash
# Navigate to your TDG project
cd /path/to/TDG

# Create assets directory if it doesn't exist
mkdir -p assets/models/enemies

# Copy the OBJ files
cp samurai_enemy.obj assets/models/enemies/
cp samurai_enemy.mtl assets/models/enemies/
```

### Step 2: Load in Three.js (Assuming TDG uses Three.js)

Update your enemy loading code:

```javascript
// In your enemy manager or game initialization

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemyModel = null;
        this.loadEnemyModel();
    }
    
    loadEnemyModel() {
        const mtlLoader = new MTLLoader();
        mtlLoader.setPath('assets/models/enemies/');
        
        mtlLoader.load('samurai_enemy.mtl', (materials) => {
            materials.preload();
            
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('assets/models/enemies/');
            
            objLoader.load('samurai_enemy.obj', (object) => {
                // Store as template
                this.enemyModel = object;
                
                // Scale to game size (adjust as needed)
                this.enemyModel.scale.set(0.5, 0.5, 0.5);
                
                console.log('Samurai enemy model loaded!');
                console.log('Vertices:', this.getVertexCount(object));
            });
        });
    }
    
    getVertexCount(object) {
        let count = 0;
        object.traverse((child) => {
            if (child.isMesh) {
                count += child.geometry.attributes.position.count;
            }
        });
        return count;
    }
    
    // Spawn a new enemy instance
    spawnEnemy(position) {
        if (!this.enemyModel) {
            console.warn('Enemy model not loaded yet!');
            return null;
        }
        
        // Clone the model for each enemy
        const enemyInstance = this.enemyModel.clone();
        enemyInstance.position.copy(position);
        
        // Add to scene
        this.scene.add(enemyInstance);
        
        return enemyInstance;
    }
}

// Usage
const enemyManager = new EnemyManager(scene);

// Later, when spawning enemies:
const enemy = enemyManager.spawnEnemy(new THREE.Vector3(10, 0, 5));
```

### Step 3: Size Calibration

The model is approximately 2 units tall. Adjust scale based on your game:

```javascript
// If enemies should be 1 unit tall
enemyModel.scale.set(0.5, 0.5, 0.5);

// If enemies should be 0.5 units tall
enemyModel.scale.set(0.25, 0.25, 0.25);

// For precise sizing
const boundingBox = new THREE.Box3().setFromObject(enemyModel);
const size = boundingBox.getSize(new THREE.Vector3());
const desiredHeight = 1.0; // Your target height
const scale = desiredHeight / size.y;
enemyModel.scale.setScalar(scale);
```

### Step 4: Add to Enemy Configuration

Update your enemy data file (e.g., `game/data/enemies.json`):

```json
{
  "basic_samurai": {
    "name": "Samurai Warrior",
    "modelPath": "assets/models/enemies/samurai_enemy.obj",
    "health": 100,
    "speed": 1.5,
    "reward": 10,
    "type": "basic",
    "armor": 5,
    "scale": 0.5
  }
}
```

### Step 5: Performance Optimization

The model is already optimized, but here are some tips:

```javascript
// Enable frustum culling
enemyInstance.frustumCulled = true;

// Use instanced rendering for many enemies
const instancedMesh = new THREE.InstancedMesh(
    geometry,
    material,
    maxEnemyCount
);

// LOD (Level of Detail) - optional
const lod = new THREE.LOD();
lod.addLevel(highDetailModel, 0);
lod.addLevel(mediumDetailModel, 50);
lod.addLevel(lowDetailModel, 100);
```

### Step 6: Add Animation (Optional Future Enhancement)

For walking animation, you can:

1. **Simple bobbing motion**:
```javascript
function updateEnemy(enemy, deltaTime) {
    // Simple walking bob
    enemy.position.y = Math.sin(Date.now() * 0.003) * 0.05;
    
    // Rotate slightly while walking
    enemy.rotation.y += deltaTime * 0.5;
}
```

2. **Move along path**:
```javascript
enemy.userData.pathProgress += enemy.speed * deltaTime;
const newPosition = getPositionOnPath(
    enemy.userData.path,
    enemy.userData.pathProgress
);
enemy.position.copy(newPosition);
```

---

## Model Specifications

- **Vertices**: ~72 (very low poly!)
- **Faces**: ~66
- **Materials**: 7 (flat-shaded)
- **File size**: <10 KB
- **Height**: ~2.0 units
- **Width**: ~1.2 units

---

## Customization Options

### Change Colors

Edit `samurai_enemy.mtl` file:

```mtl
# Make armor red instead of blue
newmtl ArmorDark
Kd 0.545 0.000 0.000  # RGB values (0-1 range)
```

### Create Variants

```javascript
// Elite samurai (bigger, different color)
const eliteSamurai = enemyModel.clone();
eliteSamurai.scale.set(0.7, 0.7, 0.7);
eliteSamurai.traverse((child) => {
    if (child.isMesh && child.material.name === 'ArmorDark') {
        child.material = child.material.clone();
        child.material.color.setHex(0x8B0000); // Dark red
    }
});
```

---

## Testing Checklist

- [ ] Model loads without errors
- [ ] Materials display correctly
- [ ] Scale is appropriate for game
- [ ] Performs well with 50+ enemies on screen
- [ ] Collision detection works with tower projectiles
- [ ] Path following works correctly
- [ ] Model is visible from camera angle

---

## Troubleshooting

### Model doesn't appear
```javascript
// Check if model loaded
console.log('Enemy model:', enemyModel);
console.log('Position:', enemyModel.position);
console.log('Scale:', enemyModel.scale);

// Make sure it's in camera view
camera.lookAt(enemyModel.position);
```

### Materials are all white/gray
- Make sure `samurai_enemy.mtl` is in same folder as `.obj`
- Check MTLLoader path is correct
- Try setting materials manually if loader fails

### Too many draw calls
- Use InstancedMesh for multiple enemies
- Merge geometries if you have many static enemies
- Implement frustum culling

### Performance issues
- Reduce number of enemy instances
- Implement object pooling
- Use simpler collision detection (sphere/box instead of mesh)

---

## Next Steps

1. **Test the model**: Load it and verify it appears correctly
2. **Adjust scale**: Fine-tune size to match your game
3. **Add to enemy spawn**: Integrate with your wave system
4. **Create variants**: Make different colored versions for enemy types
5. **Add effects**: Particle effects for death/hit animations
6. **Optimize**: Profile performance with 100+ enemies

## Future Enhancements

- Create animated version with walk cycle
- Add different armor variants (light/heavy)
- Create ranged variant (with bow)
- Add LOD levels for performance
- Bake textures for even better pixel art look
