"""
Gothic Church Tower Generator for TDG
Generates T1 Chapel, T2 Parish Church, and T3 Grand Cathedral
Supports OBJ export and interactive preview
"""

import bpy
import bmesh
from math import pi, sin, cos

# ─── Color Palette ───
COLORS = {
    'stone': (0.54, 0.49, 0.44, 1.0),          # Warm stone
    'stone_dark': (0.42, 0.37, 0.31, 1.0),     # Foundation
    'stone_light': (0.60, 0.55, 0.50, 1.0),    # Walls
    'slate': (0.23, 0.16, 0.16, 1.0),          # Roof
    'slate_dark': (0.16, 0.12, 0.12, 1.0),     # Spire
    'gold': (0.83, 0.69, 0.22, 1.0),           # Cross
    'wood': (0.54, 0.45, 0.33, 1.0),           # Bell
    'glass_blue': (0.29, 0.42, 0.60, 1.0),     # Stained glass
    'glass_red': (0.60, 0.29, 0.42, 1.0),
    'glass_purple': (0.42, 0.29, 0.60, 1.0),
    'glass_green': (0.29, 0.60, 0.42, 1.0),
    'glass_orange': (0.60, 0.42, 0.29, 1.0),
    'dark': (0.16, 0.16, 0.16, 1.0),           # Doorway
}

def clear_scene():
    """Remove all mesh objects from scene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def create_material(name, color):
    """Create a material with given color"""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = False
    mat.diffuse_color = color
    return mat

def create_box(name, location, size, material):
    """Create a box mesh"""
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0]/2, size[1]/2, size[2]/2)
    bpy.ops.object.transform_apply(scale=True)
    
    if material:
        if obj.data.materials:
            obj.data.materials[0] = material
        else:
            obj.data.materials.append(material)
    
    return obj

def create_pyramid(name, location, base_size, height, material):
    """Create a pyramid for roofs/spires"""
    bpy.ops.mesh.primitive_cone_add(
        vertices=4,
        radius1=max(base_size[0], base_size[1])/2,
        depth=height,
        location=(location[0], location[1], location[2] + height/2)
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler[2] = pi/4  # Rotate 45 degrees
    
    if material:
        if obj.data.materials:
            obj.data.materials[0] = material
        else:
            obj.data.materials.append(material)
    
    return obj

def create_cross(name, location, size, material):
    """Create a cross shape"""
    # Vertical beam
    v_beam = create_box(
        f"{name}_vertical",
        (location[0], location[1], location[2] + size[2]/2),
        (size[0], size[0], size[2]),
        material
    )
    
    # Horizontal beam (positioned at upper third)
    h_beam = create_box(
        f"{name}_horizontal",
        (location[0], location[1], location[2] + size[2] * 0.65),
        (size[1], size[0], size[0]),
        material
    )
    
    # Join them
    bpy.context.view_layer.objects.active = v_beam
    h_beam.select_set(True)
    bpy.ops.object.join()
    v_beam.name = name
    
    return v_beam

def create_lancet_window(name, location, size, material):
    """Create a Gothic pointed arch window"""
    # Main rectangle
    window = create_box(
        f"{name}_main",
        location,
        size,
        material
    )
    
    # Add pointed top (small triangle)
    bpy.ops.mesh.primitive_cone_add(
        vertices=3,
        radius1=size[0]/2,
        depth=size[0] * 0.8,
        location=(location[0], location[1], location[2] + size[2]/2 + size[0]*0.4)
    )
    arch_top = bpy.context.active_object
    arch_top.rotation_euler[1] = pi/2  # Point up
    arch_top.rotation_euler[2] = pi/2
    
    if material:
        if arch_top.data.materials:
            arch_top.data.materials[0] = material
        else:
            arch_top.data.materials.append(material)
    
    # Join
    bpy.context.view_layer.objects.active = window
    arch_top.select_set(True)
    bpy.ops.object.join()
    window.name = name
    
    return window

def create_bell(name, location, size, material):
    """Create a simple bell shape"""
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=8,
        ring_count=6,
        radius=size[0]/2,
        location=(location[0], location[1], location[2])
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (1, 1, 1.2)  # Elongate slightly
    bpy.ops.object.transform_apply(scale=True)
    
    if material:
        if obj.data.materials:
            obj.data.materials[0] = material
        else:
            obj.data.materials.append(material)
    
    return obj

def create_rose_window(name, location, size, material_outer, material_inner):
    """Create a circular rose window with concentric circles"""
    # Outer circle
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=12,
        radius=size/2,
        depth=0.1,
        location=location
    )
    outer = bpy.context.active_object
    outer.name = f"{name}_outer"
    outer.rotation_euler[1] = pi/2
    
    if material_outer:
        if outer.data.materials:
            outer.data.materials[0] = material_outer
        else:
            outer.data.materials.append(material_outer)
    
    # Inner circle
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=12,
        radius=size/3,
        depth=0.12,
        location=location
    )
    inner = bpy.context.active_object
    inner.name = f"{name}_inner"
    inner.rotation_euler[1] = pi/2
    
    if material_inner:
        if inner.data.materials:
            inner.data.materials[0] = material_inner
        else:
            inner.data.materials.append(material_inner)
    
    # Join
    bpy.context.view_layer.objects.active = outer
    inner.select_set(True)
    bpy.ops.object.join()
    outer.name = name
    
    return outer

# ═══════════════════════════════════════════════════════════════
# T1 CHAPEL
# ═══════════════════════════════════════════════════════════════

def create_t1_chapel():
    """Create T1 Chapel tower"""
    print("Creating T1 Chapel...")
    
    # Materials
    mat_stone = create_material("Stone", COLORS['stone'])
    mat_stone_dark = create_material("StoneDark", COLORS['stone_dark'])
    mat_stone_light = create_material("StoneLight", COLORS['stone_light'])
    mat_slate = create_material("Slate", COLORS['slate'])
    mat_gold = create_material("Gold", COLORS['gold'])
    mat_wood = create_material("Wood", COLORS['wood'])
    mat_glass_blue = create_material("GlassBlue", COLORS['glass_blue'])
    mat_glass_red = create_material("GlassRed", COLORS['glass_red'])
    mat_dark = create_material("Dark", COLORS['dark'])
    
    parts = []
    
    # Base
    parts.append(create_box("T1_Base", (0, 0, 0.6), (3.2, 3.2, 0.5), mat_stone))
    
    # Foundation
    parts.append(create_box("T1_Foundation", (0, 0, 1.3), (3.5, 3.5, 0.4), mat_stone_dark))
    
    # Main wall
    parts.append(create_box("T1_Wall", (0, 0, 3.65), (3.0, 3.0, 1.85), mat_stone_light))
    
    # Doorway
    parts.append(create_box("T1_Doorway", (0, -1.5, 2.2), (0.8, 0.05, 0.9), mat_dark))
    # Door arch
    parts.append(create_box("T1_DoorArch", (0, -1.5, 2.95), (1.0, 0.05, 0.2), mat_stone))
    
    # Stained glass windows
    parts.append(create_lancet_window("T1_WindowLeft", (-1.1, -1.5, 3.85), (0.4, 0.05, 0.7), mat_glass_blue))
    parts.append(create_lancet_window("T1_WindowRight", (1.1, -1.5, 3.85), (0.4, 0.05, 0.7), mat_glass_red))
    
    # Roof base
    parts.append(create_box("T1_RoofBase", (0, 0, 4.65), (3.3, 3.3, 0.25), mat_stone_dark))
    
    # Roof pyramid
    parts.append(create_pyramid("T1_Roof", (0, 0, 4.9), (2.8, 2.8), 1.25, mat_slate))
    
    # Bell
    parts.append(create_bell("T1_Bell", (0, 0, 5.0), (0.5, 0.5, 0.4), mat_wood))
    
    # Cross on top
    parts.append(create_cross("T1_Cross", (0, 0, 6.3), (0.2, 0.6, 0.9), mat_gold))
    
    # Join all parts
    bpy.context.view_layer.objects.active = parts[0]
    for obj in parts[1:]:
        obj.select_set(True)
    bpy.ops.object.join()
    
    tower = bpy.context.active_object
    tower.name = "ChurchTower_T1"
    tower.location = (0, 0, 0)
    
    print("T1 Chapel created successfully!")
    return tower

# ═══════════════════════════════════════════════════════════════
# T2 PARISH CHURCH
# ═══════════════════════════════════════════════════════════════

def create_t2_parish():
    """Create T2 Parish Church tower"""
    print("Creating T2 Parish Church...")
    
    # Materials
    mat_stone = create_material("Stone", COLORS['stone'])
    mat_stone_dark = create_material("StoneDark", COLORS['stone_dark'])
    mat_stone_light = create_material("StoneLight", COLORS['stone_light'])
    mat_slate = create_material("Slate", COLORS['slate'])
    mat_slate_dark = create_material("SlateDark", COLORS['slate_dark'])
    mat_gold = create_material("Gold", COLORS['gold'])
    mat_wood = create_material("Wood", COLORS['wood'])
    mat_glass_blue = create_material("GlassBlue", COLORS['glass_blue'])
    mat_glass_red = create_material("GlassRed", COLORS['glass_red'])
    mat_glass_purple = create_material("GlassPurple", COLORS['glass_purple'])
    mat_glass_green = create_material("GlassGreen", COLORS['glass_green'])
    mat_glass_orange = create_material("GlassOrange", COLORS['glass_orange'])
    mat_dark = create_material("Dark", COLORS['dark'])
    
    parts = []
    
    # Base
    parts.append(create_box("T2_Base", (0, 0, 0.6), (4.0, 4.0, 0.6), mat_stone))
    
    # Foundation
    parts.append(create_box("T2_Foundation", (0, 0, 1.45), (4.3, 4.3, 0.5), mat_stone_dark))
    
    # Main nave
    parts.append(create_box("T2_Nave", (0, 0, 4.35), (3.5, 3.5, 2.15), mat_stone_light))
    
    # Doorway
    parts.append(create_box("T2_Doorway", (0, -1.75, 2.85), (1.0, 0.05, 1.1), mat_dark))
    # Door arches (layered)
    parts.append(create_box("T2_DoorArchOuter", (0, -1.75, 3.75), (1.2, 0.05, 0.25), mat_stone))
    parts.append(create_box("T2_DoorArchInner", (0, -1.75, 3.65), (1.0, 0.05, 0.2), mat_stone_light))
    
    # Side windows (4 lancet windows)
    parts.append(create_lancet_window("T2_WindowL1", (-1.6, -1.75, 3.85), (0.35, 0.05, 0.8), mat_glass_purple))
    parts.append(create_lancet_window("T2_WindowL2", (-1.6, -1.75, 2.65), (0.35, 0.05, 0.8), mat_glass_green))
    parts.append(create_lancet_window("T2_WindowR1", (1.6, -1.75, 3.85), (0.35, 0.05, 0.8), mat_glass_orange))
    parts.append(create_lancet_window("T2_WindowR2", (1.6, -1.75, 2.65), (0.35, 0.05, 0.8), mat_glass_blue))
    
    # Rose window
    parts.append(create_rose_window("T2_RoseWindow", (0, -1.8, 4.65), 1.2, mat_glass_blue, mat_glass_red))
    
    # Roof base
    parts.append(create_box("T2_RoofBase", (0, 0, 5.55), (3.8, 3.8, 0.25), mat_stone_dark))
    
    # Main roof
    parts.append(create_pyramid("T2_Roof", (0, 0, 5.8), (3.3, 3.3), 1.25, mat_slate))
    
    # Left tower
    parts.append(create_box("T2_TowerLeft", (-1.9, 0, 6.75), (0.9, 0.9, 1.5), mat_stone))
    parts.append(create_box("T2_BellOpenLeft", (-1.9, -0.45, 6.6), (0.5, 0.05, 0.6), mat_dark))
    parts.append(create_bell("T2_BellLeft", (-1.9, 0, 6.65), (0.3, 0.3, 0.3), mat_wood))
    parts.append(create_pyramid("T2_SpireLeft", (-1.9, 0, 7.6), (0.5, 0.5), 1.0, mat_slate_dark))
    parts.append(create_cross("T2_CrossLeft", (-1.9, 0, 8.7), (0.2, 0.4, 0.7), mat_gold))
    
    # Right tower
    parts.append(create_box("T2_TowerRight", (1.9, 0, 6.75), (0.9, 0.9, 1.5), mat_stone))
    parts.append(create_box("T2_BellOpenRight", (1.9, -0.45, 6.6), (0.5, 0.05, 0.6), mat_dark))
    parts.append(create_bell("T2_BellRight", (1.9, 0, 6.65), (0.3, 0.3, 0.3), mat_wood))
    parts.append(create_pyramid("T2_SpireRight", (1.9, 0, 7.6), (0.5, 0.5), 1.0, mat_slate_dark))
    parts.append(create_cross("T2_CrossRight", (1.9, 0, 8.7), (0.2, 0.4, 0.7), mat_gold))
    
    # Join all parts
    bpy.context.view_layer.objects.active = parts[0]
    for obj in parts[1:]:
        obj.select_set(True)
    bpy.ops.object.join()
    
    tower = bpy.context.active_object
    tower.name = "ChurchTower_T2"
    tower.location = (0, 0, 0)
    
    print("T2 Parish Church created successfully!")
    return tower

# ═══════════════════════════════════════════════════════════════
# T3 GRAND CATHEDRAL
# ═══════════════════════════════════════════════════════════════

def create_t3_cathedral():
    """Create T3 Grand Cathedral tower"""
    print("Creating T3 Grand Cathedral...")
    
    # Materials
    mat_stone = create_material("Stone", COLORS['stone'])
    mat_stone_dark = create_material("StoneDark", COLORS['stone_dark'])
    mat_stone_light = create_material("StoneLight", COLORS['stone_light'])
    mat_slate = create_material("Slate", COLORS['slate'])
    mat_slate_dark = create_material("SlateDark", COLORS['slate_dark'])
    mat_gold = create_material("Gold", COLORS['gold'])
    mat_wood = create_material("Wood", COLORS['wood'])
    mat_glass_blue = create_material("GlassBlue", COLORS['glass_blue'])
    mat_glass_red = create_material("GlassRed", COLORS['glass_red'])
    mat_glass_purple = create_material("GlassPurple", COLORS['glass_purple'])
    mat_glass_green = create_material("GlassGreen", COLORS['glass_green'])
    mat_glass_orange = create_material("GlassOrange", COLORS['glass_orange'])
    mat_dark = create_material("Dark", COLORS['dark'])
    
    parts = []
    
    # Base
    parts.append(create_box("T3_Base", (0, 0, 0.75), (4.8, 4.8, 0.75), mat_stone))
    
    # Foundation
    parts.append(create_box("T3_Foundation", (0, 0, 1.85), (5.2, 5.2, 0.65), mat_stone_dark))
    
    # Main cathedral body
    parts.append(create_box("T3_Cathedral", (0, 0, 5.35), (4.4, 4.4, 2.85), mat_stone_light))
    
    # Grand entrance
    parts.append(create_box("T3_Doorway", (0, -2.2, 3.25), (1.4, 0.05, 1.4), mat_dark))
    parts.append(create_box("T3_DoorArchOuter", (0, -2.2, 4.4), (1.8, 0.05, 0.3), mat_stone))
    parts.append(create_box("T3_DoorArchInner", (0, -2.2, 4.3), (1.6, 0.05, 0.2), mat_stone_light))
    
    # Side lancet windows (6 total)
    parts.append(create_lancet_window("T3_WindowL1", (-2.0, -2.2, 5.55), (0.4, 0.05, 1.0), mat_glass_purple))
    parts.append(create_lancet_window("T3_WindowL2", (-2.0, -2.2, 4.05), (0.4, 0.05, 1.0), mat_glass_green))
    parts.append(create_lancet_window("T3_WindowL3", (-1.4, -2.2, 4.05), (0.4, 0.05, 1.0), mat_glass_orange))
    parts.append(create_lancet_window("T3_WindowR1", (2.0, -2.2, 5.55), (0.4, 0.05, 1.0), mat_glass_red))
    parts.append(create_lancet_window("T3_WindowR2", (2.0, -2.2, 4.05), (0.4, 0.05, 1.0), mat_glass_blue))
    parts.append(create_lancet_window("T3_WindowR3", (1.4, -2.2, 4.05), (0.4, 0.05, 1.0), mat_glass_green))
    
    # Grand rose window (3 layers)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16,
        radius=0.9,
        depth=0.1,
        location=(0, -2.25, 5.65)
    )
    rose_outer = bpy.context.active_object
    rose_outer.rotation_euler[1] = pi/2
    rose_outer.data.materials.append(mat_glass_blue)
    parts.append(rose_outer)
    
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=12,
        radius=0.7,
        depth=0.12,
        location=(0, -2.25, 5.65)
    )
    rose_mid = bpy.context.active_object
    rose_mid.rotation_euler[1] = pi/2
    rose_mid.data.materials.append(mat_glass_red)
    parts.append(rose_mid)
    
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8,
        radius=0.4,
        depth=0.14,
        location=(0, -2.25, 5.65)
    )
    rose_center = bpy.context.active_object
    rose_center.rotation_euler[1] = pi/2
    rose_center.data.materials.append(mat_glass_green)
    parts.append(rose_center)
    
    # Main roof base
    parts.append(create_box("T3_RoofBase", (0, 0, 6.9), (4.6, 4.6, 0.25), mat_stone_dark))
    
    # Main roof
    parts.append(create_pyramid("T3_Roof", (0, 0, 7.2), (4.0, 4.0), 1.5, mat_slate))
    
    # Left side tower
    parts.append(create_box("T3_TowerLeft", (-2.3, 0, 8.5), (1.1, 1.1, 1.75), mat_stone))
    parts.append(create_box("T3_BellOpenLeft", (-2.3, -0.55, 8.25), (0.7, 0.05, 0.8), mat_dark))
    parts.append(create_bell("T3_BellLeft", (-2.3, 0, 8.3), (0.4, 0.4, 0.4), mat_wood))
    parts.append(create_pyramid("T3_SpireLeft", (-2.3, 0, 9.5), (0.7, 0.7), 1.25, mat_slate_dark))
    parts.append(create_cross("T3_CrossLeft", (-2.3, 0, 10.85), (0.2, 0.5, 0.7), mat_gold))
    
    # Right side tower
    parts.append(create_box("T3_TowerRight", (2.3, 0, 8.5), (1.1, 1.1, 1.75), mat_stone))
    parts.append(create_box("T3_BellOpenRight", (2.3, -0.55, 8.25), (0.7, 0.05, 0.8), mat_dark))
    parts.append(create_bell("T3_BellRight", (2.3, 0, 8.3), (0.4, 0.4, 0.4), mat_wood))
    parts.append(create_pyramid("T3_SpireRight", (2.3, 0, 9.5), (0.7, 0.7), 1.25, mat_slate_dark))
    parts.append(create_cross("T3_CrossRight", (2.3, 0, 10.85), (0.2, 0.5, 0.7), mat_gold))
    
    # Central tower (tallest)
    parts.append(create_box("T3_CentralTowerBase", (0, 0, 7.75), (1.6, 1.6, 0.75), mat_stone_dark))
    parts.append(create_box("T3_CentralTower", (0, 0, 9.95), (1.4, 1.4, 2.25), mat_stone))
    parts.append(create_box("T3_CentralBellOpen", (0, -0.7, 9.7), (1.0, 0.05, 0.9), mat_dark))
    parts.append(create_bell("T3_BellCenter", (0, 0, 9.75), (0.6, 0.6, 0.5), mat_wood))
    parts.append(create_pyramid("T3_CentralSpire", (0, 0, 11.2), (1.0, 1.0), 1.5, mat_slate_dark))
    parts.append(create_cross("T3_CrossCenter", (0, 0, 13.0), (0.2, 0.6, 0.9), mat_gold))
    
    # Join all parts
    bpy.context.view_layer.objects.active = parts[0]
    for obj in parts[1:]:
        obj.select_set(True)
    bpy.ops.object.join()
    
    tower = bpy.context.active_object
    tower.name = "ChurchTower_T3"
    tower.location = (0, 0, 0)
    
    print("T3 Grand Cathedral created successfully!")
    return tower

# ═══════════════════════════════════════════════════════════════
# EXPORT & UTILITIES
# ═══════════════════════════════════════════════════════════════

def export_obj(obj, filepath):
    """Export object as OBJ with MTL"""
    # Select only this object
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    
    # Export
    bpy.ops.export_scene.obj(
        filepath=filepath,
        use_selection=True,
        use_materials=True,
        use_triangles=False,
        use_mesh_modifiers=True
    )
    print(f"Exported: {filepath}")

def setup_camera_and_lighting():
    """Setup camera and lighting for preview"""
    # Camera
    bpy.ops.object.camera_add(location=(8, -12, 10))
    camera = bpy.context.active_object
    camera.rotation_euler = (1.1, 0, 0.6)
    bpy.context.scene.camera = camera
    
    # Sun light
    bpy.ops.object.light_add(type='SUN', location=(5, -5, 10))
    sun = bpy.context.active_object
    sun.data.energy = 1.5
    sun.rotation_euler = (0.8, 0.3, 1.0)
    
    # Fill light
    bpy.ops.object.light_add(type='AREA', location=(-5, 5, 8))
    fill = bpy.context.active_object
    fill.data.energy = 0.5
    fill.rotation_euler = (1.2, 0, -0.8)

# ═══════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════

def main(tier="T1", export_path=None):
    """
    Main function to generate church towers
    
    Args:
        tier: "T1", "T2", "T3", or "ALL"
        export_path: Optional path to export OBJ files
    """
    clear_scene()
    
    towers = []
    
    if tier == "T1" or tier == "ALL":
        tower = create_t1_chapel()
        towers.append(("T1", tower))
        if export_path:
            export_obj(tower, f"{export_path}/church_tower_t1.obj")
    
    if tier == "T2" or tier == "ALL":
        if tier != "ALL":
            clear_scene()
        tower = create_t2_parish()
        towers.append(("T2", tower))
        if export_path:
            export_obj(tower, f"{export_path}/church_tower_t2.obj")
    
    if tier == "T3" or tier == "ALL":
        if tier != "ALL":
            clear_scene()
        tower = create_t3_cathedral()
        towers.append(("T3", tower))
        if export_path:
            export_obj(tower, f"{export_path}/church_tower_t3.obj")
    
    # Setup scene for preview
    if tier == "ALL":
        # Arrange towers side by side
        for i, (name, tower) in enumerate(towers):
            tower.location = (i * 8 - 8, 0, 0)
    
    setup_camera_and_lighting()
    
    print(f"\n{'='*60}")
    print("CHURCH TOWER GENERATION COMPLETE")
    print(f"{'='*60}")
    print(f"Generated: {', '.join([t[0] for t in towers])}")
    if export_path:
        print(f"Exported to: {export_path}")
    print(f"{'='*60}\n")

# Execute
if __name__ == "__main__":
    # Change these parameters as needed
    TIER = "ALL"  # "T1", "T2", "T3", or "ALL"
    EXPORT_PATH = "/tmp"  # Set to None to skip export, or provide path
    
    main(tier=TIER, export_path=EXPORT_PATH)
