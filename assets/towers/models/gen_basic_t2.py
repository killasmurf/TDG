#!/usr/bin/env python3
"""Generate Basic Tower Tier 2 - Enhanced Shinto Shrine"""
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
    def export_obj(self,filename):
        mtl=filename.replace('\\','/').split('/')[-1].replace('.obj','.mtl')
        with open(filename,'w') as f:
            f.write(f"# Basic Tower T2 - Enhanced Shinto Shrine\n# Vertices: {len(self.vertices)}\nmtllib {mtl}\n\n")
            for vv in self.vertices: f.write(f"v {vv[0]:.4f} {vv[1]:.4f} {vv[2]:.4f}\n")
            f.write("\n")
            for n in self.normals: f.write(f"vn {n[0]:.4f} {n[1]:.4f} {n[2]:.4f}\n")
            f.write("\n");cm=None
            for mat,fv in self.faces:
                if mat!=cm: f.write(f"\nusemtl {mat}\n");cm=mat
                f.write("f "+" ".join(f"{vi}//{ni}" for vi,ni in fv)+"\n")

def build():
    b=OBJBuilder()
    b.set_material('Stone')
    b.add_box(0,0.75,0,12,0.75,12); b.add_box(0,2.25,0,11,0.75,11); b.add_box(0,3.5,0,10,0.5,10)
    for s in [1,-1]: b.add_box(0,1.5,s*12.5,10,0.3,0.3); b.add_box(s*12.5,1.5,0,0.3,0.3,10)
    b.set_material('Wood'); b.add_box(0,4.5,0,9.5,0.5,9.5)
    b.set_material('RedPaint')
    for px,pz in [(-7,7),(7,7),(-7,-7),(7,-7)]: b.add_box(px,11.5,pz,1.3,6.5,1.3)
    b.set_material('Iron')
    for px,pz in [(-7,7),(7,7),(-7,-7),(7,-7)]:
        for h in [7,11,15]: b.add_box(px,h,pz,1.5,0.3,1.5)
    b.set_material('RedPaint')
    b.add_box(0,14.5,7,8,0.7,0.7); b.add_box(0,14.5,-7,8,0.7,0.7)
    b.add_box(-7,14.5,0,0.7,0.7,8); b.add_box(7,14.5,0,0.7,0.7,8)
    b.set_material('DarkWood'); b.add_box(0,17.5,0,10,0.5,10)
    b.set_material('RoofTile')
    b.add_flared_roof(0,16,0,8,8,6,6,2,oh=2)
    b.add_flared_roof(0,18,0,10,10,4,4,7,oh=3)
    b.set_material('DarkWood'); b.add_box(0,25.5,0,5,0.5,1.2)
    b.set_material('Gold')
    b.add_box(0,26.5,0,1,0.5,1); b.add_box(0,28.5,0,0.4,1.5,0.4)
    b.add_box(0,25,5.5,4,0.2,0.2); b.add_box(0,25,-5.5,4,0.2,0.2)
    for px,pz in [(-10,10),(10,10),(-10,-10),(10,-10)]: b.add_box(px,17.5,pz,0.4,0.6,0.4)
    b.set_material('Rope')
    b.add_box(0,16,8,7,0.7,0.7); b.add_box(-5,15.3,8,1,0.4,0.4); b.add_box(5,15.3,8,1,0.4,0.4)
    b.set_material('Paper')
    for sx in [-5,-2.5,0,2.5,5]: b.add_box(sx,14.5,8.3,0.5,1.2,0.15)
    b.set_material('Stone')
    for s in [-1,1]:
        b.add_box(s*5,5,11,1.2,1.5,1); b.add_box(s*5,7,11.3,0.8,0.6,0.6)
    b.set_material('DarkWood'); b.add_box(0,5.5,10,3.5,1.2,2.2)
    b.set_material('Iron'); b.add_box(0,7,10.5,2.5,0.15,0.5)
    b.set_material('DarkWood'); b.add_box(4,26,0,0.6,0.8,0.6)
    b.set_material('Lantern'); b.add_box(4,26,0,0.4,0.5,0.4)
    b.set_material('Gold'); b.add_box(4,27,0,0.3,0.2,0.3)
    b.set_material('DarkWood'); b.add_box(-10,15,10,0.3,12,0.3)
    b.set_material('RedPaint'); b.add_box(-10,25,11,0.1,2,1.2)
    b.set_material('Glow'); b.add_box(0,26,0,1.3,0.15,1.3)
    return b

if __name__=='__main__':
    import os
    outdir=r'C:\Users\Adam Murphy\AI\TDG\assets\towers\models'
    os.makedirs(outdir,exist_ok=True)
    builder=build()
    builder.export_obj(os.path.join(outdir,'basic_t2.obj'))
    print(f"Vertices: {len(builder.vertices)}, Faces: {len(builder.faces)}")
