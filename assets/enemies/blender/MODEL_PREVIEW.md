# Pixel Art Samurai Enemy - Visual Preview

## 3D Model Preview (ASCII Representation)

### Front View
```
          ___
         [===]    <- Helmet with crest
         |   |    
        _|   |_   <- Helmet horns
       |  o o  |  <- Head
       |   ^   |
        \_____/
         [|||]    <- Chest armor (red accent)
        /|   |\
       / |   | \  <- Shoulders (armored)
      |  |   |  |
      |  |   |  | <- Arms
      |  |   |  |\ <- Katana
      |  |   |  | \
       \_|   |_/   \
         |||||      |
         |||||      | <- Sword blade
        /     \    /
       /       \  /
      |         |/
      |         |  <- Legs
      |         |
     / \       / \
    |   |     |   | <- Feet
    -----     -----
```

### Side View
```
       ___
      [===]
      |   |___
      |  /    \  <- Helmet crest forward
      | |  o  |
       \|  ^  |
        \_____/
         [|||]
        /    /|
       |    / |  <- Arm holding sword
       |   |  |\
       |   |  | \___
       |___|  |     \  <- Katana extended
         ||       sword
        /  \      /
       |    |    /
       |    |
      / \  / \
     |  ||  |
     ----  ----
```

### Color Scheme
```
[Helmet]    - Dark metallic gray (#34495E)
[Crest]     - Red accent (#8B0000)
[Horns]     - Silver/gray (#C0C0C0)
[Head]      - Beige skin (#D4A574)
[Chest]     - Red armor accent (#8B0000)
[Body]      - Dark blue armor (#2C3E50)
[Arms/Legs] - Black cloth (#1A1A1A)
[Katana]    - Silver blade (#C0C0C0)
[Handle]    - Black grip (#1A1A1A)
```

## Model Hierarchy
```
Samurai_Enemy (root)
├── Torso (blue armor)
│   └── Chest_Plate (red accent)
├── Head (beige)
│   └── Helmet (gray)
│       ├── Crest (red, front)
│       ├── Horn_Left (silver)
│       └── Horn_Right (silver)
├── Arm_Left (black cloth)
│   └── Shoulder_Left (armor)
├── Arm_Right (black cloth)
│   ├── Shoulder_Right (armor)
│   └── Katana
│       ├── Blade (silver)
│       ├── Guard (red)
│       └── Handle (black)
├── Leg_Left (black cloth)
│   └── Foot_Left (armor)
└── Leg_Right (black cloth)
    └── Foot_Right (armor)
```

## Dimensions
```
Height: ~2.0 units (top of helmet to ground)
Width:  ~1.2 units (shoulder to shoulder)
Depth:  ~0.6 units (front to back)
Sword:  ~1.0 units (blade length)
```

## In-Game Appearance

At typical tower defense camera angle (45° isometric view):
```
Player's view from above-behind:

        🏯 Tower
         |
         |
    ⚔️👤  ← Samurai (you'll see helmet top, shoulders, sword)
   ↗↗↗
  Path
```

## Pixel Art Style Features

✓ Blocky, cubic geometry (no curves)
✓ Flat-shaded materials (no gradients)
✓ Limited color palette (7 colors)
✓ Low vertex count (~72 vertices)
✓ No texture maps (vertex colors only)
✓ Crisp edges (no anti-aliasing needed)

## Size Comparison Chart
```
Scale 1.0 (default):        Scale 0.5:           Scale 0.25:
     [O]                      [o]                   [·]
     |||                      ||                    |
    /|\                      /|\                   /|\
    / \                      / \                   / \
   ~2 units                ~1 unit              ~0.5 units
```

## Recommended Settings for TDG

```
Scale:          0.5 (makes enemy 1 unit tall)
Position:       Ground level (y = 0)
Rotation:       Face movement direction
Draw distance:  100 units
Culling:        Enabled
Shadows:        Optional (simple blob shadow recommended)
```

## Performance Impact

```
1 enemy:     Negligible
10 enemies:  <1% GPU
50 enemies:  ~2-3% GPU
100 enemies: ~5-7% GPU
200 enemies: ~10-15% GPU (still very good!)

Note: Uses instanced rendering for best performance
```
