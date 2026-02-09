"""
Tower Model Generator for TDG (Tower Defense Game)
Creates low-poly tower models for all 3 types at all 3 upgrade tiers.

Tower Types:
  - Basic (Archer Tower)   : Wooden watch tower with bow platform
  - Sniper (Ballista Tower): Stone tower with mounted ballista
  - Rapid (Crossbow Tower) : Compact metal turret with repeating mechanism

Each tower has 3 tiers that progressively add visual complexity:
  Tier 1: Base structure
  Tier 2: Reinforced, added details
  Tier 3: Full upgrade with glowing accents

Usage:
  Open in Blender → Run Script (Alt+P)
  Models are exported as OBJ to the same directory.
"""

import bpy
import math
import os

# ─── Configuration ───────────────────────────────────────────────
SCALE_FACTOR = 1.0
EXPORT_DIR = os.path.dirname(bpy.data.filepath) if bpy.data.filepath else "/tmp"

# ─── Color palettes per tower type / tier ───────────────────────
PALETTES = {
    'basic': {
        1: {
            'base':    (0.45, 0.30, 0.15, 1.0),  # Wood brown
            'accent':  (0.30, 0.20, 0.10, 1.0),  # Dark wood
            'weapon':  (0.55, 0.40, 0.20, 1.0),  # Light wood (bow)
            'metal':   (0.50, 0.50, 0.50, 1.0),  # Iron
            'flag':    (0.15, 0.30, 0.60, 1.0),  # Blue banner
            'glow':    (0.15, 0.30, 0.60, 1.0),  # No glow at tier 1
        },
        2: {
            'base':    (0.40, 0.28, 0.14, 1.0),
            'accent':  (0.25, 0.18, 0.08, 1.0),
            'weapon':  (0.50, 0.38, 0.18, 1.0),
            'metal':   (0.55, 0.55, 0.55, 1.0),  # Better iron
            'flag':    (0.10, 0.25, 0.70, 1.0),  # Brighter blue
            'glow':    (0.20, 0.50, 1.00, 1.0),  # Faint blue glow
        },
        3: {
            'base':    (0.35, 0.25, 0.12, 1.0),
            'accent':  (0.20, 0.15, 0.06, 1.0),
            'weapon':  (0.70, 0.60, 0.30, 1.0),  # Gold-tinted bow
            'metal':   (0.70, 0.70, 0.75, 1.0),  # Steel
            'flag':    (0.05, 0.20, 0.80, 1.0),  # Deep blue
            'glow':    (0.30, 0.60, 1.00, 1.0),  # Strong blue glow
        },
    },
    'sniper': {
        1: {
            'base':    (0.35, 0.35, 0.40, 1.0),  # Dark stone
            'accent':  (0.25, 0.25, 0.30, 1.0),  # Darker stone
            'weapon':  (0.45, 0.40, 0.30, 1.0),  # Wood/metal ballista
            'metal':   (0.40, 0.40, 0.45, 1.0),  # Dark iron
            'flag':    (0.15, 0.10, 0.35, 1.0),  # Dark blue/purple
            'glow':    (0.15, 0.10, 0.35, 1.0),
        },
        2: {
            'base':    (0.30, 0.30, 0.38, 1.0),
            'accent':  (0.22, 0.22, 0.28, 1.0),
            'weapon':  (0.50, 0.45, 0.35, 1.0),
            'metal':   (0.50, 0.48, 0.55, 1.0),  # Better metal
            'flag':    (0.20, 0.12, 0.50, 1.0),
            'glow':    (0.40, 0.20, 0.80, 1.0),  # Purple glow
        },
        3: {
            'base':    (0.28, 0.28, 0.35, 1.0),
            'accent':  (0.18, 0.18, 0.25, 1.0),
            'weapon':  (0.60, 0.55, 0.40, 1.0),  # Gilded
            'metal':   (0.60, 0.55, 0.65, 1.0),  # Ornate metal
            'flag':    (0.30, 0.15, 0.65, 1.0),  # Rich purple
            'glow':    (0.60, 0.30, 1.00, 1.0),  # Strong purple glow
        },
    },
    'rapid': {
        1: {
            'base':    (0.25, 0.35, 0.35, 1.0),  # Dark teal metal
            'accent':  (0.18, 0.25, 0.28, 1.0),  # Darker
            'weapon':  (0.30, 0.45, 0.45, 1.0),  # Teal mechanism
            'metal':   (0.50, 0.55, 0.55, 1.0),  # Bright metal
            'flag':    (0.00, 0.55, 0.55, 1.0),  # Cyan
            'glow':    (0.00, 0.55, 0.55, 1.0),
        },
        2: {
            'base':    (0.22, 0.32, 0.33, 1.0),
            'accent':  (0.15, 0.22, 0.25, 1.0),
            'weapon':  (0.28, 0.48, 0.48, 1.0),
            'metal':   (0.55, 0.62, 0.62, 1.0),
            'flag':    (0.00, 0.65, 0.65, 1.0),
            'glow':    (0.00, 0.80, 0.80, 1.0),  # Cyan glow
        },
        3: {
            'base':    (0.20, 0.30, 0.32, 1.0),
            'accent':  (0.12, 0.20, 0.22, 1.0),
            'weapon':  (0.25, 0.55, 0.55, 1.0),
            'metal':   (0.65, 0.75, 0.75, 1.0),  # Polished
            'flag':    (0.00, 0.80, 0.80, 1.0),  # Bright cyan
            'glow':    (0.00, 1.00, 1.00, 1.0),  # Full cyan glow
        },
    },
}


# ─── Helper functions ────────────────────────────────────────────

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat)

def create_material(name, color, emission=0.0, emission_color=None):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()

    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')

    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = 1.0
    bsdf.inputs['Specular IOR Level'].default_value = 0.0

    if emission > 0 and emission_color:
        bsdf.inputs['Emission Color'].default_value = emission_color
        bsdf.inputs['Emission Strength'].default_value = emission

    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

def make_cube(location, scale, name, material=None):
    bpy.ops.mesh.primitive_cube_add(location=location, scale=scale)
    obj = bpy.context.active_object
    obj.name = name
    if material:
        if obj.data.materials:
            obj.data.materials[0] = material
        else:
            obj.data.materials.append(material)
    return obj

def make_cylinder(location, radius, depth, name, material=None, segments=8):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=segments, radius=radius, depth=depth, location=location
    )
    obj = bpy.context.active_object
    obj.name = name
    if material:
        if obj.data.materials:
            obj.data.materials[0] = material
        else:
            obj.data.materials.append(material)
    return obj

def join_parts(parts, final_name):
    bpy.ops.object.select_all(action='DESELECT')
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    obj = bpy.context.active_object
    obj.name = final_name
    return obj


# ─── BASIC TOWER (Archer Tower) ─────────────────────────────────

def create_basic_tower(tier=1):
    pal = PALETTES['basic'][tier]
    mats = {k: create_material(f"Basic_T{tier}_{k}", v) for k, v in pal.items()}
    if tier >= 2:
        mats['glow'] = create_material(f"Basic_T{tier}_glow", pal['glow'], emission=0.5 * tier, emission_color=pal['glow'])
    parts = []

    # Foundation platform
    parts.append(make_cube((0, 0, 0.05), (0.50, 0.50, 0.05), f"BT{tier}_Foundation", mats['accent']))

    # Main tower body (square log structure)
    parts.append(make_cube((0, 0, 0.55), (0.38, 0.38, 0.50), f"BT{tier}_Body", mats['base']))

    # Corner posts (4 wooden pillars)
    for sx, sy in [(-1, -1), (-1, 1), (1, -1), (1, 1)]:
        parts.append(make_cube(
            (sx * 0.35, sy * 0.35, 0.55),
            (0.06, 0.06, 0.55),
            f"BT{tier}_Post_{sx}_{sy}",
            mats['accent']
        ))

    # Platform / walkway at top
    parts.append(make_cube((0, 0, 1.05), (0.48, 0.48, 0.05), f"BT{tier}_Platform", mats['accent']))

    # Crenellations (battlements)
    for sx in [-1, 0, 1]:
        for sy in [-1, 1]:
            parts.append(make_cube(
                (sx * 0.35, sy * 0.45, 1.20),
                (0.10, 0.04, 0.10),
                f"BT{tier}_Crenel_{sx}_{sy}",
                mats['base']
            ))
        for sx2 in [-1, 1]:
            parts.append(make_cube(
                (sx2 * 0.45, 0, 1.20),
                (0.04, 0.10, 0.10),
                f"BT{tier}_CrenelSide_{sx2}",
                mats['base']
            ))

    # Bow weapon (mounted on platform center)
    # Bow limbs
    parts.append(make_cube((0, -0.10, 1.25), (0.03, 0.03, 0.25), f"BT{tier}_BowLimb", mats['weapon']))
    # Bow string
    parts.append(make_cube((0, -0.15, 1.25), (0.01, 0.01, 0.20), f"BT{tier}_BowString", mats['metal']))

    # Tier 2+: reinforced base, iron bands
    if tier >= 2:
        parts.append(make_cube((0, 0, 0.30), (0.42, 0.42, 0.03), f"BT{tier}_IronBand1", mats['metal']))
        parts.append(make_cube((0, 0, 0.70), (0.42, 0.42, 0.03), f"BT{tier}_IronBand2", mats['metal']))
        # Flag post
        parts.append(make_cube((0.35, 0.35, 1.50), (0.02, 0.02, 0.30), f"BT{tier}_FlagPole", mats['accent']))
        parts.append(make_cube((0.35, 0.30, 1.65), (0.02, 0.12, 0.08), f"BT{tier}_Flag", mats['flag']))

    # Tier 3: glow ring, golden accents, larger bow
    if tier >= 3:
        parts.append(make_cylinder((0, 0, 1.10), 0.55, 0.04, f"BT{tier}_GlowRing", mats['glow'], segments=16))
        # Upgraded bow (thicker, gold-tinted)
        parts.append(make_cube((0.15, -0.10, 1.30), (0.04, 0.04, 0.30), f"BT{tier}_BowUpgrade", mats['weapon']))
        # Crown ornament
        parts.append(make_cube((0, 0, 1.40), (0.06, 0.06, 0.06), f"BT{tier}_Crown", mats['glow']))

    return join_parts(parts, f"Tower_Basic_T{tier}")


# ─── SNIPER TOWER (Ballista Tower) ──────────────────────────────

def create_sniper_tower(tier=1):
    pal = PALETTES['sniper'][tier]
    mats = {k: create_material(f"Sniper_T{tier}_{k}", v) for k, v in pal.items()}
    if tier >= 2:
        mats['glow'] = create_material(f"Sniper_T{tier}_glow", pal['glow'], emission=0.5 * tier, emission_color=pal['glow'])
    parts = []

    # Heavy stone foundation
    parts.append(make_cube((0, 0, 0.10), (0.55, 0.55, 0.10), f"ST{tier}_Foundation", mats['accent']))

    # Thick stone tower body (tapers slightly)
    parts.append(make_cube((0, 0, 0.60), (0.45, 0.45, 0.50), f"ST{tier}_Body", mats['base']))
    parts.append(make_cube((0, 0, 1.10), (0.40, 0.40, 0.10), f"ST{tier}_UpperBody", mats['base']))

    # Stone texture detail (horizontal lines)
    for h in [0.30, 0.50, 0.70, 0.90]:
        parts.append(make_cube(
            (0, 0, h), (0.46, 0.46, 0.01),
            f"ST{tier}_StoneLine_{h}",
            mats['accent']
        ))

    # Observation slit
    parts.append(make_cube((0, -0.46, 0.80), (0.12, 0.02, 0.04), f"ST{tier}_Slit", mats['accent']))

    # Ballista weapon on top
    # Base mount
    parts.append(make_cube((0, 0, 1.22), (0.20, 0.20, 0.04), f"ST{tier}_BallistaBase", mats['metal']))
    # Arm beams (V-shape)
    parts.append(make_cube((-0.15, -0.05, 1.35), (0.04, 0.04, 0.15), f"ST{tier}_ArmL", mats['weapon']))
    parts.append(make_cube((0.15, -0.05, 1.35), (0.04, 0.04, 0.15), f"ST{tier}_ArmR", mats['weapon']))
    # Crossbar
    parts.append(make_cube((0, -0.05, 1.45), (0.20, 0.03, 0.03), f"ST{tier}_Crossbar", mats['weapon']))
    # Bolt channel
    parts.append(make_cube((0, -0.10, 1.28), (0.03, 0.20, 0.03), f"ST{tier}_Channel", mats['metal']))
    # Bolt (projectile)
    parts.append(make_cube((0, -0.25, 1.28), (0.02, 0.12, 0.02), f"ST{tier}_Bolt", mats['metal']))

    # Tier 2+: buttresses, thicker walls
    if tier >= 2:
        for sx in [-1, 1]:
            parts.append(make_cube(
                (sx * 0.48, 0, 0.35),
                (0.06, 0.30, 0.35),
                f"ST{tier}_Buttress_{sx}",
                mats['accent']
            ))
        # Reinforced ballista rails
        parts.append(make_cube((0, -0.10, 1.20), (0.25, 0.25, 0.02), f"ST{tier}_RailPlate", mats['metal']))

    # Tier 3: scope lens, glow runes, ornate carvings
    if tier >= 3:
        # Scope on ballista
        parts.append(make_cylinder((0, -0.30, 1.32), 0.04, 0.10, f"ST{tier}_Scope", mats['glow'], segments=8))
        # Rune stones on corners
        for sx, sy in [(-1, -1), (-1, 1), (1, -1), (1, 1)]:
            parts.append(make_cube(
                (sx * 0.42, sy * 0.42, 1.15),
                (0.05, 0.05, 0.05),
                f"ST{tier}_Rune_{sx}_{sy}",
                mats['glow']
            ))
        # Glow ring at base
        parts.append(make_cylinder((0, 0, 0.02), 0.60, 0.03, f"ST{tier}_GlowBase", mats['glow'], segments=16))

    return join_parts(parts, f"Tower_Sniper_T{tier}")


# ─── RAPID TOWER (Repeating Crossbow Turret) ────────────────────

def create_rapid_tower(tier=1):
    pal = PALETTES['rapid'][tier]
    mats = {k: create_material(f"Rapid_T{tier}_{k}", v) for k, v in pal.items()}
    if tier >= 2:
        mats['glow'] = create_material(f"Rapid_T{tier}_glow", pal['glow'], emission=0.5 * tier, emission_color=pal['glow'])
    parts = []

    # Low metal platform
    parts.append(make_cube((0, 0, 0.06), (0.40, 0.40, 0.06), f"RT{tier}_Platform", mats['accent']))

    # Cylindrical turret base
    parts.append(make_cylinder((0, 0, 0.30), 0.30, 0.40, f"RT{tier}_TurretBase", mats['base'], segments=8))

    # Rotating ring (shows it can swivel)
    parts.append(make_cylinder((0, 0, 0.52), 0.33, 0.04, f"RT{tier}_SwiveRing", mats['metal'], segments=12))

    # Upper turret housing (where the crossbow mechanism lives)
    parts.append(make_cube((0, 0, 0.70), (0.28, 0.28, 0.18), f"RT{tier}_Housing", mats['base']))

    # Crossbow barrel (forward-facing)
    parts.append(make_cube((0, -0.30, 0.72), (0.06, 0.20, 0.06), f"RT{tier}_Barrel", mats['weapon']))
    # Magazine / bolt hopper on top
    parts.append(make_cube((0, 0, 0.90), (0.12, 0.12, 0.08), f"RT{tier}_Magazine", mats['metal']))

    # Side bolt guides
    parts.append(make_cube((-0.15, -0.20, 0.72), (0.02, 0.10, 0.04), f"RT{tier}_GuideL", mats['metal']))
    parts.append(make_cube((0.15, -0.20, 0.72), (0.02, 0.10, 0.04), f"RT{tier}_GuideR", mats['metal']))

    # Tier 2+: extra barrels, armor plating
    if tier >= 2:
        # Second barrel
        parts.append(make_cube((-0.10, -0.30, 0.66), (0.04, 0.18, 0.04), f"RT{tier}_Barrel2", mats['weapon']))
        parts.append(make_cube((0.10, -0.30, 0.66), (0.04, 0.18, 0.04), f"RT{tier}_Barrel3", mats['weapon']))
        # Armor shields on sides
        parts.append(make_cube((-0.30, 0, 0.65), (0.03, 0.25, 0.15), f"RT{tier}_ShieldL", mats['accent']))
        parts.append(make_cube((0.30, 0, 0.65), (0.03, 0.25, 0.15), f"RT{tier}_ShieldR", mats['accent']))
        # Bigger magazine
        parts.append(make_cube((0, 0.05, 0.98), (0.15, 0.15, 0.06), f"RT{tier}_MagUpgrade", mats['metal']))

    # Tier 3: quad barrels, glow coils, antenna
    if tier >= 3:
        # Quad barrel arrangement
        parts.append(make_cube((-0.08, -0.35, 0.78), (0.03, 0.15, 0.03), f"RT{tier}_Barrel4", mats['weapon']))
        parts.append(make_cube((0.08, -0.35, 0.78), (0.03, 0.15, 0.03), f"RT{tier}_Barrel5", mats['weapon']))
        # Glow coils on barrel tips
        parts.append(make_cylinder((0, -0.45, 0.72), 0.08, 0.02, f"RT{tier}_GlowTip", mats['glow'], segments=8))
        # Energy antenna
        parts.append(make_cube((0, 0, 1.10), (0.02, 0.02, 0.15), f"RT{tier}_Antenna", mats['metal']))
        parts.append(make_cube((0, 0, 1.22), (0.04, 0.04, 0.04), f"RT{tier}_AntennaTip", mats['glow']))
        # Glow ring at base
        parts.append(make_cylinder((0, 0, 0.08), 0.45, 0.03, f"RT{tier}_GlowBase", mats['glow'], segments=16))

    return join_parts(parts, f"Tower_Rapid_T{tier}")


# ─── Export ──────────────────────────────────────────────────────

def export_obj(obj, filepath):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    bpy.ops.wm.obj_export(
        filepath=filepath,
        export_selected_objects=True,
        forward_axis='NEGATIVE_Z',
        up_axis='Y',
        export_materials=True
    )
    print(f"  Exported: {filepath}")


def setup_scene():
    bpy.ops.object.light_add(type='SUN', location=(5, -5, 10))
    sun = bpy.context.active_object
    sun.data.energy = 2.0
    sun.name = "Sun_Light"

    bpy.ops.object.camera_add(location=(4, -4, 3))
    camera = bpy.context.active_object
    camera.rotation_euler = (math.radians(65), 0, math.radians(45))
    bpy.context.scene.camera = camera
    camera.name = "Camera"


# ─── Main ────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("TDG TOWER MODEL GENERATOR")
    print("Basic / Sniper / Rapid × 3 Tiers = 9 Models")
    print("=" * 60)

    clear_scene()

    creators = {
        'basic':  create_basic_tower,
        'sniper': create_sniper_tower,
        'rapid':  create_rapid_tower,
    }

    models = {}
    offset_x = 0

    for tower_type, creator_fn in creators.items():
        for tier in [1, 2, 3]:
            print(f"\nCreating {tower_type} tower tier {tier}...")
            obj = creator_fn(tier)
            # Arrange models in a row for preview
            obj.location.x = offset_x
            obj.location.y = (tier - 1) * 2.5
            offset_x_key = f"{tower_type}_t{tier}"
            models[offset_x_key] = obj

            verts = len(obj.data.vertices)
            faces = len(obj.data.polygons)
            mat_count = len(obj.data.materials)
            print(f"  {tower_type} T{tier}: {verts} verts, {faces} faces, {mat_count} materials")

        offset_x += 3.0

    setup_scene()

    # Export each model
    print("\n--- Exporting OBJ files ---")
    export_base = EXPORT_DIR
    for key, obj in models.items():
        # Move to origin for export
        saved_loc = obj.location.copy()
        obj.location = (0, 0, 0)
        filepath = os.path.join(export_base, f"{key}.obj")
        export_obj(obj, filepath)
        obj.location = saved_loc

    print("\n" + "=" * 60)
    print("COMPLETE! 9 tower models generated and exported.")
    print("=" * 60)
    print("\nFiles created:")
    for key in models:
        print(f"  {key}.obj + {key}.mtl")

if __name__ == "__main__":
    main()
