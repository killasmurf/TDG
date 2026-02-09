# Church Tower - Gothic Cathedral Tower Defense System

Gothic Catholic church-themed towers for TDG with divine blessing mechanics, healing auras, and holy smite abilities.

## 📁 File Overview

### 3D Models & Generation
- **`church_tower_generator.py`** - Blender Python script to generate all three tower tiers
- **Generated Models:**
  - `church_tower_t1.obj/mtl` - T1 Chapel (simple bell tower)
  - `church_tower_t2.obj/mtl` - T2 Parish Church (twin towers)
  - `church_tower_t3.obj/mtl` - T3 Grand Cathedral (central spire + twin towers)

### Animation & Preview
- **`church_tower_animations.jsx`** - React animation preview with blessing sequences
- **`ChurchTowerPreview.jsx`** - React Three.js 3D model viewer
- **`church_tower_preview.html`** - Standalone HTML preview (no dependencies)

### Configuration
- **`church_tower_config.json`** - Complete tower stats, abilities, and integration data

---

## 🏰 Tower Architecture

### T1 Chapel
- **Theme:** Simple stone chapel with single bell
- **Features:**
  - Arched doorway
  - 2 stained glass windows (blue & red)
  - Slate pyramid roof
  - Golden cross
  - Single bell tower
- **Gameplay:** Basic healing aura + minor damage

### T2 Parish Church
- **Theme:** Parish church with twin bell towers
- **Features:**
  - Rose window (2 layers - blue outer, red center)
  - 4 lancet side windows (purple, green, orange, blue)
  - Twin towers with spires
  - 2 bells (alternating ring pattern)
  - Golden crosses on both spires
- **Gameplay:** Enhanced healing + coordinated dual attacks

### T3 Grand Cathedral
- **Theme:** Magnificent cathedral with central spire
- **Features:**
  - Grand 3-layer rose window (blue/red/green)
  - 6 lancet windows
  - Twin side towers
  - **Central tower** (tallest, with largest bell)
  - 3 golden crosses
  - Massive arched entrance
- **Gameplay:** Mass healing + devastating holy smite ability

---

## 🎨 Color Palette

```python
Stone Base:     #8a7d6f  # Warm stone
Stone Dark:     #6a5d4f  # Foundation
Stone Light:    #9a8d7f  # Walls
Slate Roof:     #3a2a2a  # Dark slate
Slate Spire:    #2a2a2a  # Darker
Gold Cross:     #d4af37  # Metallic gold
Bell Wood:      #8B7355  # Bronze bell

Stained Glass:
- Blue:         #4a6a9a
- Red:          #9a4a6a
- Purple:       #6a4a9a
- Green:        #4a9a6a
- Orange:       #9a6a4a
```

---

## ⚙️ Generation Instructions

### Using Blender (Recommended)

1. **Open Blender** (tested with 2.93+)

2. **Load the script:**
   ```python
   # In Blender's Scripting tab
   import sys
   sys.path.append('/path/to/scripts')
   import church_tower_generator
   
   # Generate all tiers
   church_tower_generator.main(tier="ALL", export_path="/path/to/export")
   ```

3. **Or use command line:**
   ```bash
   blender --background --python church_tower_generator.py
   ```

4. **Individual tiers:**
   ```python
   # T1 only
   church_tower_generator.main(tier="T1", export_path="./assets/models")
   
   # T2 only
   church_tower_generator.main(tier="T2", export_path="./assets/models")
   
   # T3 only
   church_tower_generator.main(tier="T3", export_path="./assets/models")
   ```

### Output Files
Each tower generates:
- `.obj` - 3D geometry
- `.mtl` - Material definitions with colors

---

## 🎮 Game Integration

### 1. Load Configuration
```javascript
import churchConfig from './church_tower_config.json';

const towerData = churchConfig.tiers.T1; // or T2, T3
console.log(towerData.stats.damage); // 8
console.log(towerData.stats.healPerSecond); // 5
```

### 2. Load 3D Models
```javascript
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

const mtlLoader = new MTLLoader();
mtlLoader.load('assets/models/church_tower_t1.mtl', (materials) => {
  materials.preload();
  
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load('assets/models/church_tower_t1.obj', (object) => {
    scene.add(object);
  });
});
```

### 3. Implement Animations

#### Idle Animation (T1)
```javascript
function updateIdleAnimation(tower, time) {
  const bell = tower.getObjectByName('Bell');
  if (!bell) return;
  
  // Gentle sway
  const sway = Math.sin(time * 2) * 0.05;
  bell.rotation.x = sway;
}
```

#### Blessing Animation (T1)
```javascript
function triggerBlessing(tower) {
  const bell = tower.getObjectByName('Bell');
  const config = churchConfig.tiers.T1.animations.blessing;
  
  animateKeyframes(bell, config.keyframes, config.fps, () => {
    // On complete
    spawnDivineLight(tower.position);
    applyHealingAura(tower);
  });
}
```

#### Twin Bells (T2)
```javascript
function updateT2Blessing(tower, frame) {
  const bellL = tower.getObjectByName('BellLeft');
  const bellR = tower.getObjectByName('BellRight');
  
  const keyframe = config.tiers.T2.animations.blessing.keyframes[frame];
  bellL.rotation.x = keyframe.bellL.rotation * Math.PI / 180;
  bellR.rotation.x = keyframe.bellR.rotation * Math.PI / 180;
}
```

### 4. Divine Effects

#### Light Beams
```javascript
function spawnLightBeam(position) {
  const geometry = new THREE.ConeGeometry(1.5, 10, 8, 1, true);
  const material = new THREE.MeshBasicMaterial({
    color: 0xfff8dc,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  
  const beam = new THREE.Mesh(geometry, material);
  beam.position.copy(position);
  beam.position.y += 8;
  beam.rotation.x = Math.PI;
  
  scene.add(beam);
  
  // Fade out
  animateFade(beam, 2000);
}
```

#### Angelic Particles
```javascript
class AngelicParticle {
  constructor(position) {
    this.position = position.clone();
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      Math.random() * 1.5 + 0.5,
      (Math.random() - 0.5) * 0.5
    );
    this.life = 1.0;
    this.decay = 0.008;
    this.color = 0xffffdd;
  }
  
  update(delta) {
    this.position.add(this.velocity.clone().multiplyScalar(delta));
    this.life -= this.decay;
  }
}
```

#### Healing Aura
```javascript
function applyHealingAura(tower) {
  const config = churchConfig.tiers.T1;
  const nearbyUnits = findUnitsInRange(
    tower.position,
    config.stats.healRange
  );
  
  nearbyUnits.forEach(unit => {
    unit.heal(config.stats.healPerSecond);
    
    // Visual feedback
    spawnHealParticle(unit.position);
  });
}
```

### 5. Abilities (T3 Only)

#### Holy Smite
```javascript
function castHolySmite(tower, targetPosition) {
  const config = churchConfig.tiers.T3.abilities.holySmite;
  
  // Play charging animation
  playAnimation(tower, 'holySmite', () => {
    // Spawn smite effect
    const flash = createFlash(targetPosition, 0xffffff);
    
    // Deal damage in radius
    const enemies = findEnemiesInRadius(targetPosition, config.radius);
    enemies.forEach(enemy => {
      enemy.takeDamage(config.damage);
      enemy.stun(config.stunDuration);
    });
    
    // Explosion particles
    spawnExplosion(targetPosition, {
      count: 80,
      colors: [0xffffff, 0xffffcc, 0xffdd88]
    });
    
    // Sound
    playSound(config.sound);
  });
}
```

#### Sanctuary Aura (Passive)
```javascript
function updateSanctuaryAura(tower) {
  const config = churchConfig.tiers.T3.abilities.sanctuaryAura;
  const allies = findAlliesInRange(tower.position, config.radius);
  
  allies.forEach(ally => {
    ally.applyBuff({
      healMultiplier: config.healBoost,
      damageReduction: config.damageReduction,
      duration: 1.0 // Reapplied each frame
    });
  });
}
```

---

## 🎵 Sound Effects

### Required Audio Files
```
assets/sounds/
├── church_bell_01.ogg      # T1 single bell
├── church_bell_02.ogg      # T2 twin bells
├── church_bell_03.ogg      # T3 cathedral bells
├── holy_smite.ogg          # T3 ability
└── ambient_chant_loop.ogg  # Background ambience
```

### Implementation
```javascript
const audioLoader = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
camera.add(listener);

function playBellSound(tier) {
  const sound = new THREE.Audio(listener);
  const soundFile = churchConfig.sounds[`church_bell_${tier.toLowerCase()}`];
  
  audioLoader.load(soundFile, (buffer) => {
    sound.setBuffer(buffer);
    sound.setVolume(0.8);
    sound.play();
  });
}
```

---

## 📊 Stats Reference

| Stat | T1 Chapel | T2 Parish | T3 Cathedral |
|------|-----------|-----------|--------------|
| **Cost** | 150 | 450 | 1050 |
| **Upgrade** | +300 → T2 | +600 → T3 | Max |
| **Range** | 5.0 | 6.5 | 8.0 |
| **Damage** | 8 | 18 | 35 |
| **Attack Speed** | 1.5s | 1.3s | 1.0s |
| **Heal/sec** | 5 | 12 | 25 |
| **Heal Range** | 4.0 | 5.5 | 7.0 |
| **Armor Buff** | - | +2 | +5 |
| **Damage Buff** | - | - | +10% |

### T3 Abilities
- **Holy Smite:** 150 damage, 4.0 radius, 1.5s stun, 15s cooldown
- **Sanctuary Aura:** 1.5x heal boost, 20% damage reduction

---

## 🎨 Animation Frame Rates

- **Idle:** 8 FPS (all tiers)
- **Blessing T1:** 12 FPS
- **Blessing T2:** 10 FPS
- **Blessing T3:** 8 FPS
- **Holy Smite:** 15 FPS

---

## 🔧 Testing & Preview

### Standalone HTML Preview
```bash
# Open in browser
open church_tower_preview.html

# Or serve locally
python -m http.server 8000
# Navigate to http://localhost:8000/church_tower_preview.html
```

### React Animation Preview
```bash
npm install react react-dom

# Add to your React app
import ChurchAnimations from './church_tower_animations.jsx';

function App() {
  return <ChurchAnimations />;
}
```

### React Three.js Preview
```bash
npm install three @react-three/fiber @react-three/drei

import ChurchTowerPreview from './ChurchTowerPreview.jsx';

function App() {
  return <ChurchTowerPreview />;
}
```

---

## 💡 Design Philosophy

### Support Tower Mechanics
- **Primary:** Healing allies within range
- **Secondary:** Damage to enemies (light/medium)
- **Special:** Buff/debuff auras

### Visual Progression
- **T1:** Simple chapel (1 bell)
- **T2:** Expanded church (2 bells)
- **T3:** Grand cathedral (3 bells + abilities)

### Theme Consistency
- Gothic architecture throughout
- Stained glass increases in complexity
- Golden crosses on all tiers
- Divine light effects scale with tier

---

## 🐛 Troubleshooting

### Models not loading
- Verify OBJ/MTL files are in correct path
- Check MTL file references correct texture paths
- Ensure Three.js version compatibility (r128+)

### Animations jerky
- Check frame interpolation is enabled
- Verify FPS matches game update rate
- Use `requestAnimationFrame` for smooth updates

### Bells not animating
- Ensure bell objects are named correctly
- Check rotation pivot is at top of bell
- Verify keyframe data format matches expected structure

### Divine light too bright/dark
- Adjust intensity values in config
- Check ambient light doesn't overpower effects
- Verify transparency settings on beams

---

## 📝 Credits

- **Architecture:** Gothic Catholic cathedral design
- **Animation System:** Frame interpolation with easing
- **Particle Effects:** Divine light beam system
- **Sound Design:** Church bell harmonics

---

## 🚀 Future Enhancements

- [ ] Organ music on blessing
- [ ] Choir chanting ambient sound
- [ ] Procedural stained glass patterns
- [ ] Dynamic shadow casting
- [ ] Weather effects (rain, fog)
- [ ] Bell rope physics
- [ ] Congregation NPCs

---

## 📄 License

Part of TDG (Tower Defense Game) project.
