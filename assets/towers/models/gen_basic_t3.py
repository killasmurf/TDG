"""Basic Tower T3 - Grand Shinto Shrine OBJ Generator
Upgrades from T2: Double-layered roof, torii gate entrance, sacred mirror,
gold-leaf accents, glowing spiritual energy, 4 stone lanterns, guardian statues"""
class B:
    def __init__(self):
        self.v=[];self.n=[(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)];self.f={};self.m=None
    def vt(self,x,y,z):self.v.append((x,y,z));return len(self.v)
    def fc(self,vis,ni):
        if self.m not in self.f:self.f[self.m]=[]
        self.f[self.m].append((vis,ni))
    def sm(self,n):self.m=n
    def box(self,cx,cy,cz,sx,sy,sz):
        x0,x1=cx-sx/2,cx+sx/2;y0,y1=cy-sy/2,cy+sy/2;z0,z1=cz-sz/2,cz+sz/2
        v=self.vt
        v1=v(x0,y0,z1);v2=v(x1,y0,z1);v3=v(x1,y1,z1);v4=v(x0,y1,z1)
        v5=v(x0,y0,z0);v6=v(x1,y0,z0);v7=v(x1,y1,z0);v8=v(x0,y1,z0)
        self.fc([v1,v2,v3,v4],5);self.fc([v6,v5,v8,v7],6);self.fc([v4,v3,v7,v8],3)
        self.fc([v5,v6,v2,v1],4);self.fc([v2,v6,v7,v3],1);self.fc([v5,v1,v4,v8],2)
    def roof(self,cx,cy,cz,bw,bd,tw,td,h):
        hw,hd,htw,htd=bw/2,bd/2,tw/2,td/2;v=self.vt
        b1=v(cx-hw,cy,cz+hd);b2=v(cx+hw,cy,cz+hd);b3=v(cx+hw,cy,cz-hd);b4=v(cx-hw,cy,cz-hd)
        t1=v(cx-htw,cy+h,cz+htd);t2=v(cx+htw,cy+h,cz+htd);t3=v(cx+htw,cy+h,cz-htd);t4=v(cx-htw,cy+h,cz-htd)
        self.fc([b1,b2,t2,t1],5);self.fc([b3,b4,t4,t3],6);self.fc([t1,t2,t3,t4],3)
        self.fc([b4,b3,b2,b1],4);self.fc([b2,b3,t3,t2],1);self.fc([b4,b1,t1,t4],2)
    def write(self,path,mtl):
        with open(path,'w') as f:
            f.write(f"# Basic Tower T3 - Grand Shinto Shrine\n# Vertices: {len(self.v)}, Faces: {sum(len(v) for v in self.f.values())}\nmtllib {mtl}\n\n")
            for x,y,z in self.v:f.write(f"v {x:.4f} {y:.4f} {z:.4f}\n")
            f.write("\n")
            for x,y,z in self.n:f.write(f"vn {x:.4f} {y:.4f} {z:.4f}\n")
            f.write("\n")
            for mat,faces in self.f.items():
                f.write(f"usemtl {mat}\n")
                for vis,ni in faces:f.write(f"f {' '.join(f'{vi}//{ni}' for vi in vis)}\n")
                f.write("\n")
        print(f"Written {path}: {len(self.v)} verts, {sum(len(v) for v in self.f.values())} faces")

import os; b=B()
# === GRAND STONE FOUNDATION (3 tiers) ===
b.sm("Stone");b.box(0,1,0,26,2,26);b.box(0,3,0,24,2,24);b.box(0,5,0,22,2,22)
# === WOODEN FLOOR ===
b.sm("Wood");b.box(0,6.5,0,20,1,20)
# === RED PILLARS x4 (taller: 16 units) ===
b.sm("RedPaint")
for px,pz in [(-8,8),(8,8),(-8,-8),(8,-8)]:b.box(px,15,pz,2.8,16,2.8)
# === IRON CORNER BRACKETS (3 per pillar: base, mid, top) ===
b.sm("Iron")
for px,pz in [(-8,8),(8,8),(-8,-8),(8,-8)]:
    b.box(px,7.5,pz,3.4,1,3.4);b.box(px,15,pz,3.4,1,3.4);b.box(px,22.5,pz,3.4,1,3.4)
# === CROSSBEAMS ===
b.sm("RedPaint");b.box(0,17,8,18,1.6,1.6);b.box(0,17,-8,18,1.6,1.6);b.box(-8,17,0,1.6,1.6,18);b.box(8,17,0,1.6,1.6,18)
# === IRON REINFORCEMENT PLATES ===
b.sm("Iron");b.box(0,17,8,4.5,2,1.8);b.box(0,17,-8,4.5,2,1.8)
# === UPPER FRAME ===
b.sm("DarkWood");b.box(0,21.5,0,21,1.4,21)
# === LOWER ROOF (wider) ===
b.sm("RoofTile");b.roof(0,22,0,28,28,16,16,5)
# === GOLD TRIM ON LOWER ROOF ===
b.sm("Gold")
b.box(0,22.2,14.2,28,0.7,0.7);b.box(0,22.2,-14.2,28,0.7,0.7)
b.box(14.2,22.2,0,0.7,0.7,28);b.box(-14.2,22.2,0,0.7,0.7,28)
# === MID PLATFORM (between roofs) ===
b.sm("DarkWood");b.box(0,27.5,0,14,1,14)
# === UPPER ROOF (smaller, steeper) ===
b.sm("RoofTile");b.roof(0,28,0,18,18,6,6,5)
# === GOLD TRIM ON UPPER ROOF ===
b.sm("Gold")
b.box(0,28.2,9.2,18,0.6,0.6);b.box(0,28.2,-9.2,18,0.6,0.6)
b.box(9.2,28.2,0,0.6,0.6,18);b.box(-9.2,28.2,0,0.6,0.6,18)
# === ROOF RIDGE ===
b.sm("DarkWood");b.box(0,33.5,0,8,1.2,2.4)
# === GOLD FINIAL (elaborate) ===
b.sm("Gold");b.box(0,34.5,0,1.5,2,1.5);b.box(0,36,0,2.5,0.6,2.5);b.box(0,37,0,0.8,2.5,0.8)
# === SHIMENAWA ROPE (thick, grand) ===
b.sm("Rope");b.box(0,18.5,8.5,16,1.8,1.4)
# === SHIDE PAPERS x7 ===
b.sm("Paper")
for sx in [-6,-4,-2,0,2,4,6]:b.box(sx,17,9,1.2,3,0.3)
# === TORII GATE (entrance marker - new for T3) ===
b.sm("RedPaint")
# Torii pillars
b.box(-5,6,14,2,12,2);b.box(5,6,14,2,12,2)
# Torii kasagi (top beam)
b.box(0,12.5,14,14,1.5,2)
# Torii nuki (lower beam)
b.box(0,10,14,12,1,1.5)
b.sm("Gold");b.box(0,13.5,14,15,0.5,2.2)  # gold cap
# === SACRED MIRROR (yata no kagami - new for T3) ===
b.sm("Mirror");b.box(0,14,0,3,3,0.5)
b.sm("Gold");b.box(0,14,0,4,4,0.3)  # gold frame
# === GLOWING SPIRITUAL ENERGY ===
b.sm("Glow");b.box(0,20,0,6,0.5,6)  # energy platform
b.sm("GlowGold");b.box(0,38,0,1,1,1)  # finial glow orb
# === OFFERING BOX (ornate) ===
b.sm("DarkWood");b.box(0,7.5,11,8,3,5)
b.sm("Gold");b.box(0,9.2,11.5,5,0.5,1.5)  # gold slit
# === STONE LANTERNS x4 (all corners) ===
b.sm("Stone")
for lx,lz in [(-12,12),(12,12),(-12,-12),(12,-12)]:
    b.box(lx,1.5,lz,3.5,3,3.5);b.box(lx,4,lz,2.2,2,2.2);b.box(lx,6,lz,4,1.5,4);b.box(lx,7.5,lz,4.5,1,4.5)
b.sm("Lantern")
for lx,lz in [(-12,12),(12,12),(-12,-12),(12,-12)]:b.box(lx,6,lz,2.8,1,2.8)
# === GUARDIAN STONE PEDESTALS x2 (komainu bases) ===
b.sm("Stone");b.box(-6,7.5,12,3,2,3);b.box(6,7.5,12,3,2,3)
b.sm("DarkWood");b.box(-6,9,12,2,1.5,2);b.box(6,9,12,2,1.5,2)

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "basic_t3.obj")
b.write(out, "basic_t3.mtl")
