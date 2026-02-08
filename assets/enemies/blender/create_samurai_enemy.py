"""
Pixel Art Samurai Enemy Generator for TDG
Creates a low-poly samurai model optimized for tower defense game
Scale: 1 Blender unit = 1 game unit (adjust SCALE_FACTOR if needed)
"""

import bpy
import math

# Configuration
SCALE_FACTOR = 1.0  # Adjust based on your game's unit scale
PIXEL_ART_SIZE = 32  # Texture resolution (32x32 pixels)

# Color palette (RGB)
COLORS = {
    'armor_dark': (0.173, 0.243, 0.314, 1.0),      # Dark blue armor
    'armor_accent': (0.545, 0.000, 0.000, 1.0),    # Dark red accents
    'cloth_black': (0.102, 0.102, 0.102, 1.0),     # Black undergarment
    'skin': (0.831, 0.647, 0.455, 1.0),            # Skin tone
    'metal': (0.753, 0.753, 0.753, 1.0),           # Silver/gray metal
    'helmet': (0.204, 0.286, 0.369, 1.0),          # Dark metallic
    'handle': (0.102, 0.102, 0.102, 1.0),          # Black handle
}

def clear_scene():
    """Clear all objects from the scene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    
def create_material(name, color):
    """Create a flat-shaded material for pixel art style"""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    # Add shader nodes
    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    
    # Pixel art settings: flat, no shine
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = 1.0
    bsdf.inputs['Specular IOR Level'].default_value = 0.0
    
    # Connect nodes
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    
    return mat

def create_cube_at(location, scale, name, material=None):
    """Helper function to create and position a cube"""
    bpy.ops.mesh.primitive_cube_add(location=location, scale=scale)
    obj = bpy.context.active_object
    obj.name = name
    
    if material:
        if obj.data.materials:
            obj.data.materials[0] = material
        else:
            obj.data.materials.append(material)
    
    return obj

def create_samurai_body():
    """Create the main body structure"""
    parts = []
    
    # Create materials
    mats = {key: create_material(f"Mat_{key}", color) for key, color in COLORS.items()}
    
    # Torso (main body)
    torso = create_cube_at(
        location=(0, 0, 0.8),
        scale=(0.35, 0.25, 0.6),
        name="Torso",
        material=mats['armor_dark']
    )
    parts.append(torso)
    
    # Chest armor plate
    chest = create_cube_at(
        location=(0, -0.28, 0.9),
        scale=(0.38, 0.05, 0.5),
        name="Chest_Armor",
        material=mats['armor_accent']
    )
    parts.append(chest)
    
    # Legs (2)
    leg_left = create_cube_at(
        location=(-0.15, 0, 0.15),
        scale=(0.12, 0.12, 0.35),
        name="Leg_Left",
        material=mats['cloth_black']
    )
    parts.append(leg_left)
    
    leg_right = create_cube_at(
        location=(0.15, 0, 0.15),
        scale=(0.12, 0.12, 0.35),
        name="Leg_Right",
        material=mats['cloth_black']
    )
    parts.append(leg_right)
    
    # Feet
    foot_left = create_cube_at(
        location=(-0.15, 0.05, -0.15),
        scale=(0.13, 0.18, 0.08),
        name="Foot_Left",
        material=mats['armor_dark']
    )
    parts.append(foot_left)
    
    foot_right = create_cube_at(
        location=(0.15, 0.05, -0.15),
        scale=(0.13, 0.18, 0.08),
        name="Foot_Right",
        material=mats['armor_dark']
    )
    parts.append(foot_right)
    
    return parts, mats

def create_samurai_arms(mats):
    """Create arms and shoulders"""
    parts = []
    
    # Left arm
    shoulder_left = create_cube_at(
        location=(-0.45, 0, 1.2),
        scale=(0.15, 0.15, 0.2),
        name="Shoulder_Left",
        material=mats['armor_dark']
    )
    parts.append(shoulder_left)
    
    arm_left = create_cube_at(
        location=(-0.5, 0, 0.7),
        scale=(0.1, 0.1, 0.35),
        name="Arm_Left",
        material=mats['cloth_black']
    )
    parts.append(arm_left)
    
    # Right arm (holding sword)
    shoulder_right = create_cube_at(
        location=(0.45, 0, 1.2),
        scale=(0.15, 0.15, 0.2),
        name="Shoulder_Right",
        material=mats['armor_dark']
    )
    parts.append(shoulder_right)
    
    arm_right = create_cube_at(
        location=(0.5, 0, 0.7),
        scale=(0.1, 0.1, 0.35),
        name="Arm_Right",
        material=mats['cloth_black']
    )
    parts.append(arm_right)
    
    return parts

def create_samurai_head(mats):
    """Create head and helmet"""
    parts = []
    
    # Head
    head = create_cube_at(
        location=(0, 0, 1.65),
        scale=(0.25, 0.25, 0.25),
        name="Head",
        material=mats['skin']
    )
    parts.append(head)
    
    # Helmet base (kabuto)
    helmet = create_cube_at(
        location=(0, 0, 1.85),
        scale=(0.32, 0.32, 0.15),
        name="Helmet",
        material=mats['helmet']
    )
    parts.append(helmet)
    
    # Helmet crest (maedate) - front decoration
    crest = create_cube_at(
        location=(0, -0.35, 1.95),
        scale=(0.08, 0.08, 0.25),
        name="Helmet_Crest",
        material=mats['armor_accent']
    )
    parts.append(crest)
    
    # Side horn decorations (optional, smaller)
    horn_left = create_cube_at(
        location=(-0.28, 0, 1.9),
        scale=(0.06, 0.06, 0.15),
        name="Horn_Left",
        material=mats['metal']
    )
    parts.append(horn_left)
    
    horn_right = create_cube_at(
        location=(0.28, 0, 1.9),
        scale=(0.06, 0.06, 0.15),
        name="Horn_Right",
        material=mats['metal']
    )
    parts.append(horn_right)
    
    return parts

def create_katana(mats):
    """Create samurai sword (katana)"""
    parts = []
    
    # Blade
    blade = create_cube_at(
        location=(0.55, 0.15, 0.9),
        scale=(0.04, 0.04, 0.5),
        name="Katana_Blade",
        material=mats['metal']
    )
    # Rotate blade slightly
    blade.rotation_euler = (0, math.radians(25), math.radians(15))
    parts.append(blade)
    
    # Handle (tsuka)
    handle = create_cube_at(
        location=(0.52, 0.08, 0.35),
        scale=(0.06, 0.06, 0.15),
        name="Katana_Handle",
        material=mats['handle']
    )
    handle.rotation_euler = (0, math.radians(25), math.radians(15))
    parts.append(handle)
    
    # Guard (tsuba)
    guard = create_cube_at(
        location=(0.535, 0.12, 0.52),
        scale=(0.12, 0.02, 0.12),
        name="Katana_Guard",
        material=mats['armor_accent']
    )
    guard.rotation_euler = (0, math.radians(25), math.radians(15))
    parts.append(guard)
    
    return parts

def create_full_samurai():
    """Create complete samurai enemy model"""
    print("Creating pixel art samurai enemy...")
    
    all_parts = []
    
    # Create body
    body_parts, mats = create_samurai_body()
    all_parts.extend(body_parts)
    
    # Create arms
    arm_parts = create_samurai_arms(mats)
    all_parts.extend(arm_parts)
    
    # Create head and helmet
    head_parts = create_samurai_head(mats)
    all_parts.extend(head_parts)
    
    # Create weapon
    weapon_parts = create_katana(mats)
    all_parts.extend(weapon_parts)
    
    # Select all parts and join them
    bpy.ops.object.select_all(action='DESELECT')
    for part in all_parts:
        part.select_set(True)
    
    bpy.context.view_layer.objects.active = all_parts[0]
    bpy.ops.object.join()
    
    # Rename the joined object
    samurai = bpy.context.active_object
    samurai.name = "Samurai_Enemy"
    
    # Center to origin (bottom at z=0)
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    
    # Move so feet are at ground level (z=0)
    samurai.location.z = 0.23  # Adjust based on actual dimensions
    
    # Apply scale factor
    samurai.scale = (SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR)
    
    print(f"✓ Samurai enemy created: {len(all_parts)} parts joined")
    print(f"  Dimensions: ~{samurai.dimensions.x:.2f} x {samurai.dimensions.y:.2f} x {samurai.dimensions.z:.2f}")
    
    return samurai

def setup_scene():
    """Setup scene for better visualization"""
    # Add lighting
    bpy.ops.object.light_add(type='SUN', location=(5, -5, 10))
    sun = bpy.context.active_object
    sun.data.energy = 2.0
    
    # Add camera
    bpy.ops.object.camera_add(location=(3, -3, 2))
    camera = bpy.context.active_object
    camera.rotation_euler = (math.radians(75), 0, math.radians(45))
    bpy.context.scene.camera = camera
    
    # Set viewport shading to solid for pixel art preview
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    space.shading.type = 'SOLID'
                    space.shading.color_type = 'MATERIAL'

def export_for_game(filepath_base="/home/claude/samurai_enemy"):
    """Export model in multiple formats for game integration"""
    samurai = bpy.data.objects.get("Samurai_Enemy")
    
    if not samurai:
        print("Error: Samurai model not found!")
        return
    
    # Select only the samurai
    bpy.ops.object.select_all(action='DESELECT')
    samurai.select_set(True)
    bpy.context.view_layer.objects.active = samurai
    
    # Export as FBX (good for most game engines)
    fbx_path = f"{filepath_base}.fbx"
    bpy.ops.export_scene.fbx(
        filepath=fbx_path,
        use_selection=True,
        apply_scale_options='FBX_SCALE_ALL',
        mesh_smooth_type='OFF',  # No smoothing for pixel art
        path_mode='COPY',
        embed_textures=True
    )
    print(f"✓ Exported FBX: {fbx_path}")
    
    # Export as glTF (modern standard, good for web games)
    gltf_path = f"{filepath_base}.gltf"
    bpy.ops.export_scene.gltf(
        filepath=gltf_path,
        use_selection=True,
        export_format='GLTF_SEPARATE',
        export_materials='EXPORT',
        export_colors=True
    )
    print(f"✓ Exported glTF: {gltf_path}")
    
    # Export as OBJ (universal format)
    obj_path = f"{filepath_base}.obj"
    bpy.ops.wm.obj_export(
        filepath=obj_path,
        export_selected_objects=True,
        forward_axis='NEGATIVE_Z',
        up_axis='Y',
        export_materials=True
    )
    print(f"✓ Exported OBJ: {obj_path}")
    
    # Save Blender file
    blend_path = f"{filepath_base}.blend"
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"✓ Saved Blender file: {blend_path}")
    
    print("\nModel statistics:")
    print(f"  Vertices: {len(samurai.data.vertices)}")
    print(f"  Faces: {len(samurai.data.polygons)}")
    print(f"  Materials: {len(samurai.data.materials)}")

def main():
    """Main execution function"""
    print("="*60)
    print("PIXEL ART SAMURAI ENEMY GENERATOR")
    print("For Tower Defense Game (TDG)")
    print("="*60)
    
    # Clear scene
    clear_scene()
    print("✓ Scene cleared")
    
    # Create samurai model
    samurai = create_full_samurai()
    
    # Setup scene
    setup_scene()
    print("✓ Scene setup complete")
    
    # Export for game
    export_for_game()
    
    print("\n" + "="*60)
    print("COMPLETE!")
    print("="*60)
    print("\nNext steps:")
    print("1. Check the exported files in /home/claude/")
    print("2. Import into your game engine (FBX or glTF recommended)")
    print("3. Adjust SCALE_FACTOR in script if size doesn't match game")
    print("4. Use the .blend file to make adjustments if needed")
    print("\nModel features:")
    print("  ✓ Low-poly pixel art style")
    print("  ✓ Samurai armor and helmet")
    print("  ✓ Katana weapon")
    print("  ✓ Flat-shaded materials (no specular)")
    print("  ✓ Game-ready scale")

if __name__ == "__main__":
    main()
