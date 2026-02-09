"""Sniper Tower T1 - Buddhist Pagoda OBJ Generator
3-story pagoda with stacked eaves, spire finial, and observation platforms.
Each floor narrows slightly for the classic pagoda silhouette."""
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
            f.write(f"# Sniper Tower T1 - Buddhist Pagoda\n# Vertices: {len(self.v)}, Faces: {sum(len(v) for v in self.f.values())}\nmtllib {mtl}\n\n")
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

# === STONE FOUNDATION ===
b.sm("Stone");b.box(0,1,0,18,2,18);b.box(0,3,0,16,2,16)

# === FLOOR 1 (ground level, widest) ===
b.sm("Wood");b.box(0,5,0,14,2,14)  # floor
b.sm("DarkWood")
# 4 pillars
for px,pz in [(-5,5),(5,5),(-5,-5),(5,-5)]:b.box(px,9.5,pz,2,9,2)
# Walls (paper screens)
b.sm("Paper");b.box(0,8,5.5,12,5,0.5);b.box(0,8,-5.5,12,5,0.5);b.box(-5.5,8,0,0.5,5,12);b.box(5.5,8,0,0.5,5,12)
# Floor 1 eave
b.sm("RoofTile");b.roof(0,13,0,20,20,12,12,3)

# === FLOOR 2 (middle, narrower) ===
b.sm("Wood");b.box(0,16.5,0,11,1,11)
b.sm("DarkWood")
for px,pz in [(-4,4),(4,4),(-4,-4),(4,-4)]:b.box(px,20,pz,1.6,6,1.6)
b.sm("Paper");b.box(0,19,4.5,10,4,0.5);b.box(0,19,-4.5,10,4,0.5);b.box(-4.5,19,0,0.5,4,10);b.box(4.5,19,0,0.5,4,10)
# Floor 2 eave
b.sm("RoofTile");b.roof(0,23,0,16,16,10,10,2.5)

# === FLOOR 3 (top, smallest) ===
b.sm("Wood");b.box(0,26,0,9,1,9)
b.sm("DarkWood")
for px,pz in [(-3,3),(3,3),(-3,-3),(3,-3)]:b.box(px,29,pz,1.4,5,1.4)
b.sm("Paper");b.box(0,28.5,3.5,8,3.5,0.4);b.box(0,28.5,-3.5,8,3.5,0.4);b.box(-3.5,28.5,0,0.4,3.5,8);b.box(3.5,28.5,0,0.4,3.5,8)
# Floor 3 eave (top roof)
b.sm("RoofTile");b.roof(0,31.5,0,14,14,6,6,3)

# === ROOF CAP ===
b.sm("DarkWood");b.box(0,35,0,5,1,2)

# === SPIRE (sorin) ===
b.sm("Gold")
b.box(0,36,0,1,2,1)      # shaft
b.box(0,37.5,0,2,0.5,2)  # ring 1
b.box(0,38.5,0,1.6,0.5,1.6)  # ring 2
b.box(0,39.5,0,1.2,0.5,1.2)  # ring 3
b.box(0,40.5,0,0.6,2,0.6)    # needle

# === OBSERVATION RAILING (each floor) ===
b.sm("Wood")
# Floor 1 railing
b.box(0,14,7,14,1,0.5);b.box(0,14,-7,14,1,0.5);b.box(-7,14,0,0.5,1,14);b.box(7,14,0,0.5,1,14)
# Floor 2 railing  
b.box(0,24,5.5,11,0.8,0.4);b.box(0,24,-5.5,11,0.8,0.4);b.box(-5.5,24,0,0.4,0.8,11);b.box(5.5,24,0,0.4,0.8,11)

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sniper_t1.obj")
b.write(out, "sniper_t1.mtl")
