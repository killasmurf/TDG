#!/usr/bin/env python3
"""Generate all 3 Sniper Tower tiers - Buddhist Pagoda"""
import os

class OBJBuilder:
    def __init__(self):
        self.vertices=[]; self.normals=[(0,0,1),(0,0,-1),(0,1,0),(0,-1,0),(1,0,0),(-1,0,0)]
        self.faces=[]; self.current_material=None
    def set_material(self,n): self.current_material=n
    def v(self,x,y,z): self.vertices.append((x,y,z)); return len(self.vertices)
    def add_box(self,cx,cy,cz,sx,sy,sz):
        x0,x1=cx-sx,cx+sx;y0,y1=cy-sy,cy+sy;z0,z1=cz-sz,cz+sz
        v=self.v(x0,y0,z1);self.v(x1,y0,z1);self.v(x1,y1,z1);self.v(x0,y1,z1)
        self.v(x0,y0,z0);self.v(x1,y0,z0);self.v(x1,y1,z0);self.v(x0,y1,z0)
        m=self.current_material
        self.faces.append((m,[(v,1),(v+1,1),(v+2,1),(v+3,1)]))
        self.faces.append((m,[(v+5,2),(v+4,2),(v+7,2),(v+6,2)]))
        self.faces.append((m,[(v+3,3),(v+2,3),(v+6,3),(v+7,3)]))
        self.faces.append((m,[(v+4,4),(v+5,4),(v+1,4),(v,4)]))
        self.faces.append((m,[(v+1,5),(v+5,5),(v+6,5),(v+2,5)]))
        self.faces.append((m,[(v+4,6),(v,6),(v+3,6),(v+7,6)]))
    def add_flared_roof(self,cx,cy,cz,bsx,bsz,tsx,tsz,sy,oh=0):
        bsx+=oh;bsz+=oh
        v=self.v(cx-bsx,cy,cz+bsz);self.v(cx+bsx,cy,cz+bsz);self.v(cx+tsx,cy+sy,cz+tsz);self.v(cx-tsx,cy+sy,cz+tsz)
        self.v(cx-bsx,cy,cz-bsz);self.v(cx+bsx,cy,cz-bsz);self.v(cx+tsx,cy+sy,cz-tsz);self.v(cx-tsx,cy+sy,cz-tsz)
        m=self.current_material
        self.faces.append((m,[(v,1),(v+1,1),(v+2,1),(v+3,1)]))
        self.faces.append((m,[(v+5,2),(v+4,2),(v+7,2),(v+6,2)]))
        self.faces.append((m,[(v+3,3),(v+2,3),(v+6,3),(v+7,3)]))
        self.faces.append((m,[(v+4,4),(v+5,4),(v+1,4),(v,4)]))
        self.faces.append((m,[(v+1,5),(v+5,5),(v+6,5),(v+2,5)]))
        self.faces.append((m,[(v+4,6),(v,6),(v+3,6),(v+7,6)]))
    def export_obj(self,filename,title="Tower"):
        mtl=filename.replace('\\','/').split('/')[-1].replace('.obj','.mtl')
        with open(filename,'w') as f:
            f.write(f"# {title}\n# Vertices: {len(self.vertices)}\nmtllib {mtl}\n\n")
            for vv in self.vertices: f.write(f"v {vv[0]:.4f} {vv[1]:.4f} {vv[2]:.4f}\n")
            f.write("\n")
            for n in self.normals: f.write(f"vn {n[0]:.4f} {n[1]:.4f} {n[2]:.4f}\n")
            f.write("\n");cm=None
            for mat,fv in self.faces:
                if mat!=cm: f.write(f"\nusemtl {mat}\n");cm=mat
                f.write("f "+" ".join(f"{vi}//{ni}" for vi,ni in fv)+"\n")

def write_mtl(filename, mats, title="Tower"):
    with open(filename,'w') as f:
        f.write(f"# Materials for {title}\n\n")
        for name,kd in mats.items():
            ka=tuple(v*0.1 for v in kd)
            f.write(f"newmtl {name}\nKa {ka[0]:.4f} {ka[1]:.4f} {ka[2]:.4f}\n")
            f.write(f"Kd {kd[0]:.4f} {kd[1]:.4f} {kd[2]:.4f}\n")
            f.write("Ks 0.0000 0.0000 0.0000\nNs 0.0\nd 1.0\n\n")

# ============ TIER 1: 3-story pagoda ============
def build_t1():
    b=OBJBuilder()
    b.set_material('Stone')
    b.add_box(0,0.75,0,10,0.75,10); b.add_box(0,2,0,9,0.5,9)
    b.set_material('Wood'); b.add_box(0,3,0,8.5,0.5,8.5)
    b.set_material('WhiteWall')
    b.add_box(0,7,8,7.5,3.5,0.5); b.add_box(0,7,-8,7.5,3.5,0.5)
    b.add_box(8,7,0,0.5,3.5,7.5); b.add_box(-8,7,0,0.5,3.5,7.5)
    b.set_material('DarkWood')
    for px,pz in [(-8,8),(8,8),(-8,-8),(8,-8)]: b.add_box(px,7,pz,0.8,3.5,0.8)
    b.add_box(8.2,7,0,0.3,1.5,1.5); b.add_box(-8.2,7,0,0.3,1.5,1.5)
    b.add_box(0,6,-8.2,2,2.5,0.3)
    b.set_material('RoofTile'); b.add_flared_roof(0,10.5,0,9.5,9.5,7.5,7.5,2,oh=2)
    b.set_material('Wood'); b.add_box(0,12.5,0,7,0.4,7)
    b.set_material('WhiteWall')
    b.add_box(0,15.5,6.5,6,2.5,0.4); b.add_box(0,15.5,-6.5,6,2.5,0.4)
    b.add_box(6.5,15.5,0,0.4,2.5,6); b.add_box(-6.5,15.5,0,0.4,2.5,6)
    b.set_material('DarkWood')
    for px,pz in [(-6.5,6.5),(6.5,6.5),(-6.5,-6.5),(6.5,-6.5)]: b.add_box(px,15.5,pz,0.6,2.5,0.6)
    for pz in [-6.7,6.7]: b.add_box(0,15.5,pz,1,1,0.3)
    b.set_material('RoofTile'); b.add_flared_roof(0,18,0,8,8,6,6,1.8,oh=2)
    b.set_material('Wood'); b.add_box(0,19.8,0,5.5,0.4,5.5)
    b.set_material('RedPaint')
    for px,pz in [(-5,5),(5,5),(-5,-5),(5,-5),(0,5),(0,-5),(5,0),(-5,0)]: b.add_box(px,21.3,pz,0.3,1.2,0.3)
    b.add_box(0,21.3,5,5,0.15,0.15); b.add_box(0,21.3,-5,5,0.15,0.15)
    b.add_box(5,21.3,0,0.15,0.15,5); b.add_box(-5,21.3,0,0.15,0.15,5)
    b.set_material('WhiteWall'); b.add_box(0,23,0,3.5,1.5,3.5)
    b.set_material('DarkWood')
    for px,pz in [(-3.5,3.5),(3.5,3.5),(-3.5,-3.5),(3.5,-3.5)]: b.add_box(px,23,pz,0.4,1.5,0.4)
    b.set_material('RoofTile'); b.add_flared_roof(0,24.5,0,6,6,2,2,3.5,oh=1.5)
    b.set_material('Gold')
    b.add_box(0,28.5,0,0.8,0.5,0.8); b.add_box(0,30,0,0.4,1,0.4)
    b.add_box(0,31.5,0,0.6,0.3,0.6); b.add_box(0,32.5,0,0.2,0.8,0.2)
    b.set_material('Paper'); b.add_box(-2.5,6,-8.5,1,2,0.1); b.add_box(2.5,6,-8.5,1,2,0.1)
    b.set_material('Stone'); b.add_box(0,3.3,-9.5,3,0.3,1)
    return b

# ============ TIER 2: 4-story pagoda + bells + scope ============
def build_t2():
    b=OBJBuilder()
    b.set_material('Stone')
    b.add_box(0,0.75,0,11,0.75,11); b.add_box(0,2,0,10,0.5,10); b.add_box(0,2.75,0,9.5,0.25,9.5)
    for s in [1,-1]: b.add_box(0,1.5,s*11.5,9,0.3,0.3); b.add_box(s*11.5,1.5,0,0.3,0.3,9)
    # Floor 1
    b.set_material('Wood'); b.add_box(0,3.5,0,9,0.5,9)
    b.set_material('WhiteWall')
    b.add_box(0,7.5,8.5,8,3.5,0.5); b.add_box(0,7.5,-8.5,8,3.5,0.5)
    b.add_box(8.5,7.5,0,0.5,3.5,8); b.add_box(-8.5,7.5,0,0.5,3.5,8)
    b.set_material('DarkWood')
    for px,pz in [(-8.5,8.5),(8.5,8.5),(-8.5,-8.5),(8.5,-8.5)]: b.add_box(px,7.5,pz,0.8,3.5,0.8)
    b.set_material('Iron')
    for px,pz in [(-8.5,8.5),(8.5,8.5),(-8.5,-8.5),(8.5,-8.5)]:
        b.add_box(px,5,pz,1,0.3,1); b.add_box(px,10,pz,1,0.3,1)
    b.set_material('DarkWood')
    for pz in [-8.7,8.7]: b.add_box(0,7.5,pz,1.5,1.5,0.3)
    for px in [-8.7,8.7]: b.add_box(px,7.5,0,0.3,1.5,1.5)
    b.set_material('RoofTile'); b.add_flared_roof(0,11,0,10,10,8,8,2,oh=2)
    # Floor 2
    b.set_material('Wood'); b.add_box(0,13,0,7.5,0.4,7.5)
    b.set_material('WhiteWall')
    b.add_box(0,16,7,6.5,2.5,0.4); b.add_box(0,16,-7,6.5,2.5,0.4)
    b.add_box(7,16,0,0.4,2.5,6.5); b.add_box(-7,16,0,0.4,2.5,6.5)
    b.set_material('DarkWood')
    for px,pz in [(-7,7),(7,7),(-7,-7),(7,-7)]: b.add_box(px,16,pz,0.6,2.5,0.6)
    for pz in [-7.2,7.2]: b.add_box(0,16,pz,1,1,0.3)
    b.set_material('RoofTile'); b.add_flared_roof(0,18.5,0,8.5,8.5,6.5,6.5,1.8,oh=2)
    # Floor 3
    b.set_material('Wood'); b.add_box(0,20.3,0,6,0.4,6)
    b.set_material('WhiteWall')
    b.add_box(0,23,5.5,5,2.3,0.4); b.add_box(0,23,-5.5,5,2.3,0.4)
    b.add_box(5.5,23,0,0.4,2.3,5); b.add_box(-5.5,23,0,0.4,2.3,5)
    b.set_material('DarkWood')
    for px,pz in [(-5.5,5.5),(5.5,5.5),(-5.5,-5.5),(5.5,-5.5)]: b.add_box(px,23,pz,0.5,2.3,0.5)
    b.set_material('RoofTile'); b.add_flared_roof(0,25.3,0,7,7,5,5,1.6,oh=1.5)
    # Floor 4 (deck)
    b.set_material('Wood'); b.add_box(0,26.9,0,4.5,0.3,4.5)
    b.set_material('RedPaint')
    for px,pz in [(-4.5,4.5),(4.5,4.5),(-4.5,-4.5),(4.5,-4.5),(0,4.5),(0,-4.5),(4.5,0),(-4.5,0)]: b.add_box(px,28,pz,0.25,1,0.25)
    b.add_box(0,28,4.5,4.5,0.12,0.12); b.add_box(0,28,-4.5,4.5,0.12,0.12)
    b.add_box(4.5,28,0,0.12,0.12,4.5); b.add_box(-4.5,28,0,0.12,0.12,4.5)
    b.set_material('WhiteWall'); b.add_box(0,29.8,0,3,1.2,3)
    b.set_material('DarkWood')
    for px,pz in [(-3,3),(3,3),(-3,-3),(3,-3)]: b.add_box(px,29.8,pz,0.35,1.2,0.35)
    b.set_material('RoofTile'); b.add_flared_roof(0,31,0,5,5,1.5,1.5,3.5,oh=1.5)
    # Sorin
    b.set_material('Gold')
    b.add_box(0,35,0,0.9,0.5,0.9); b.add_box(0,36,0,0.6,0.5,0.6)
    b.add_box(0,37.5,0,0.4,1,0.4); b.add_box(0,39,0,0.7,0.3,0.7); b.add_box(0,40,0,0.2,0.8,0.2)
    # Bells
    b.set_material('Bronze')
    for pz in [-1,1]:
        for px in [-1,1]:
            b.add_box(px*10,10.5,pz*10,0.6,0.8,0.6)
            b.add_box(px*8,18,pz*8,0.5,0.6,0.5)
    # Scope
    b.set_material('Iron'); b.add_box(0,29,0,0.5,0.5,3.5)
    b.set_material('Glow'); b.add_box(0,29,-3.7,0.6,0.6,0.2)
    # Entrance
    b.set_material('Paper'); b.add_box(-3,6,-8.8,1.2,2.2,0.1); b.add_box(3,6,-8.8,1.2,2.2,0.1)
    b.set_material('DarkWood'); b.add_box(0,6,-8.8,2,2.5,0.3)
    b.set_material('Stone'); b.add_box(0,3.3,-10,3.5,0.3,1)
    return b

# ============ TIER 3: 5-story grand pagoda ============
def build_t3():
    b=OBJBuilder()
    def floor_section(y_base,wh,wall_h,eb,et,eh,eoh=2):
        b.set_material('Wood'); b.add_box(0,y_base,0,wh+1.5,0.4,wh+1.5)
        b.set_material('WhiteWall')
        b.add_box(0,y_base+0.4+wall_h/2,wh,wh-1,wall_h/2,0.4)
        b.add_box(0,y_base+0.4+wall_h/2,-wh,wh-1,wall_h/2,0.4)
        b.add_box(wh,y_base+0.4+wall_h/2,0,0.4,wall_h/2,wh-1)
        b.add_box(-wh,y_base+0.4+wall_h/2,0,0.4,wall_h/2,wh-1)
        b.set_material('DarkWood')
        for px,pz in [(-wh,wh),(wh,wh),(-wh,-wh),(wh,-wh)]: b.add_box(px,y_base+0.4+wall_h/2,pz,0.6,wall_h/2,0.6)
        for pz in [-wh-0.2,wh+0.2]: b.add_box(0,y_base+0.4+wall_h/2,pz,1,1,0.3)
        b.set_material('RoofTile'); b.add_flared_roof(0,y_base+0.4+wall_h,0,eb,eb,et,et,eh,oh=eoh)
    # Foundation
    b.set_material('Stone')
    b.add_box(0,0.75,0,12,0.75,12); b.add_box(0,2,0,11,0.5,11)
    b.add_box(0,2.75,0,10.5,0.25,10.5); b.add_box(0,3.25,0,10,0.25,10)
    for s in [1,-1]: b.add_box(0,1.5,s*12.5,10,0.3,0.3); b.add_box(s*12.5,1.5,0,0.3,0.3,10)
    b.set_material('Iron')
    for px,pz in [(-12,12),(12,12),(-12,-12),(12,-12)]: b.add_box(px,1,pz,0.8,0.8,0.8)
    # Floor 1 (manual for entrance)
    b.set_material('Wood'); b.add_box(0,3.5,0,9.5,0.5,9.5)
    b.set_material('WhiteWall')
    b.add_box(0,7.5,9,8,3.5,0.5); b.add_box(0,7.5,-9,8,3.5,0.5)
    b.add_box(9,7.5,0,0.5,3.5,8); b.add_box(-9,7.5,0,0.5,3.5,8)
    b.set_material('DarkWood')
    for px,pz in [(-9,9),(9,9),(-9,-9),(9,-9)]: b.add_box(px,7.5,pz,0.8,3.5,0.8)
    b.set_material('Iron')
    for px,pz in [(-9,9),(9,9),(-9,-9),(9,-9)]: b.add_box(px,5,pz,1,0.3,1); b.add_box(px,10,pz,1,0.3,1)
    b.set_material('DarkWood')
    for pz in [-9.2,9.2]: b.add_box(0,7.5,pz,1.5,1.5,0.3)
    b.set_material('RoofTile'); b.add_flared_roof(0,11,0,10.5,10.5,8.5,8.5,2,oh=2.5)
    # Floors 2-4
    floor_section(13,7.5,5,9,7,1.8,2)
    floor_section(20.8,6,4.5,7.5,5.5,1.6,1.8)
    floor_section(27.5,4.5,4,6,4,1.5,1.5)
    # Floor 5 deck
    y5=33.5
    b.set_material('Wood'); b.add_box(0,y5,0,4,0.3,4)
    b.set_material('RedPaint')
    for px,pz in [(-4,4),(4,4),(-4,-4),(4,-4),(0,4),(0,-4),(4,0),(-4,0)]: b.add_box(px,y5+1.2,pz,0.25,0.9,0.25)
    b.add_box(0,y5+1.2,4,4,0.1,0.1); b.add_box(0,y5+1.2,-4,4,0.1,0.1)
    b.add_box(4,y5+1.2,0,0.1,0.1,4); b.add_box(-4,y5+1.2,0,0.1,0.1,4)
    b.set_material('WhiteWall'); b.add_box(0,y5+3,0,2.5,1,2.5)
    b.set_material('DarkWood')
    for px,pz in [(-2.5,2.5),(2.5,2.5),(-2.5,-2.5),(2.5,-2.5)]: b.add_box(px,y5+3,pz,0.3,1,0.3)
    b.set_material('RoofTile'); b.add_flared_roof(0,y5+4,0,5,5,1.5,1.5,3.5,oh=1.5)
    # Elaborate Sorin
    sy=y5+7.5
    b.set_material('Gold')
    b.add_box(0,sy,0,1,0.5,1); b.add_box(0,sy+1.2,0,0.7,0.5,0.7)
    b.add_box(0,sy+2.2,0,0.5,0.5,0.5); b.add_box(0,sy+3.2,0,0.3,0.5,0.3)
    for i in range(5): b.add_box(0,sy+4+i*0.6,0,0.8-i*0.1,0.2,0.8-i*0.1)
    b.add_box(0,sy+7.5,0,0.4,0.3,0.4); b.add_box(0,sy+8.5,0,0.15,0.8,0.15)
    # Jade corners
    b.set_material('Jade')
    for ey in [11,20,26.5,32.5]:
        idx=[11,20,26.5,32.5].index(ey); sc=10-idx*1.5
        for px,pz in [(-1,1),(1,1),(-1,-1),(1,-1)]: b.add_box(px*sc,ey+0.5,pz*sc,0.4,0.4,0.4)
    # Bells
    b.set_material('Bronze')
    for ey,sc in [(11,10.5),(20,8.5),(26.5,7),(32.5,5.5)]:
        for px,pz in [(-1,1),(1,1),(-1,-1),(1,-1)]: b.add_box(px*sc,ey,pz*sc,0.5,0.7,0.5)
    # Prayer wheels
    b.set_material('Bronze')
    for px in [-9.5,9.5]:
        for pz in [-3,0,3]: b.add_box(px,6,pz,0.4,0.8,0.4)
    b.set_material('Gold')
    for px in [-9.5,9.5]:
        for pz in [-3,0,3]: b.add_box(px,6,pz,0.3,0.5,0.3)
    # Scope
    b.set_material('Iron'); b.add_box(0,y5+2.5,0,0.6,0.6,4.5); b.add_box(0,y5+2.5,-4.8,0.8,0.8,0.3)
    b.set_material('Glow'); b.add_box(0,y5+2.5,-5.2,0.7,0.7,0.15); b.add_box(0,y5+2.5,-5.4,1,1,0.05)
    # Glow
    b.set_material('GlowGold'); b.add_box(0,3.6,0,10,0.1,10)
    b.set_material('Glow'); b.add_box(0,sy+8,0,0.5,0.15,0.5)
    # Entrance
    b.set_material('Paper'); b.add_box(-3.5,6,-9.3,1.5,2.5,0.1); b.add_box(3.5,6,-9.3,1.5,2.5,0.1)
    b.set_material('DarkWood'); b.add_box(0,6,-9.3,2.5,3,0.3)
    b.set_material('Stone'); b.add_box(0,3.5,-10.5,4,0.4,1)
    # Gold caps
    b.set_material('Gold')
    for px,pz in [(-9,9),(9,9),(-9,-9),(9,-9)]: b.add_box(px,11.2,pz,1,0.2,1); b.add_box(px,4.2,pz,1,0.2,1)
    # Flags
    b.set_material('DarkWood'); b.add_box(-12,14,12,0.3,12,0.3); b.add_box(12,14,12,0.3,12,0.3)
    b.set_material('RedPaint'); b.add_box(-12,24,13,0.1,3,1.5); b.add_box(12,24,13,0.1,3,1.5)
    return b

outdir = r'C:\Users\Adam Murphy\AI\TDG\assets\towers\models'
os.makedirs(outdir, exist_ok=True)

t1_mats={'Wood':(0.50,0.30,0.14),'DarkWood':(0.22,0.13,0.07),'WhiteWall':(0.88,0.85,0.80),'RoofTile':(0.12,0.12,0.16),'Stone':(0.42,0.42,0.40),'Gold':(0.75,0.60,0.15),'RedPaint':(0.70,0.12,0.08),'Paper':(0.92,0.90,0.85)}
t2_mats={**t1_mats,'Gold':(0.82,0.66,0.16),'RedPaint':(0.75,0.10,0.06),'Bronze':(0.55,0.40,0.22),'Iron':(0.30,0.30,0.32),'Glow':(0.30,0.50,1.00)}
t3_mats={**t2_mats,'Gold':(0.90,0.72,0.15),'RedPaint':(0.80,0.08,0.05),'RoofTile':(0.10,0.10,0.14),'Glow':(0.20,0.55,1.00),'GlowGold':(1.00,0.85,0.30),'Jade':(0.30,0.65,0.40)}

for tier,builder,mats,title in [(1,build_t1(),t1_mats,"Sniper T1 - Buddhist Pagoda"),(2,build_t2(),t2_mats,"Sniper T2 - Enhanced Pagoda"),(3,build_t3(),t3_mats,"Sniper T3 - Grand Pagoda")]:
    builder.export_obj(os.path.join(outdir,f'sniper_t{tier}.obj'),title)
    write_mtl(os.path.join(outdir,f'sniper_t{tier}.mtl'),mats,title)
    print(f"T{tier}: {len(builder.vertices)} verts, {len(builder.faces)} faces")
print("All sniper towers generated!")
