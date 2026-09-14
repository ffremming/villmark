/* VILLMARK - voxel engine: builds THREE meshes out of voxel boxes */

// ---------- voxel collection ----------
class Vox {
  constructor(){ this.m = new Map(); }
  key(x,y,z){ return x+','+y+','+z; }
  set(x,y,z,c){ if(c==null) return; this.m.set(this.key(x,y,z), c); }
  get(x,y,z){ return this.m.get(this.key(x,y,z)); }
  has(x,y,z){ return this.m.has(this.key(x,y,z)); }
  del(x,y,z){ this.m.delete(this.key(x,y,z)); }
  box(x,y,z,w,h,d,c){
    for(let i=0;i<w;i++) for(let j=0;j<h;j++) for(let k=0;k<d;k++)
      this.set(x+i, y+j, z+k, c);
  }
  /** fill a circular disc in the XZ plane */
  disc(cx,y,cz,r,c){
    const ri = Math.ceil(r);
    for(let i=-ri;i<=ri;i++) for(let k=-ri;k<=ri;k++)
      if(i*i+k*k <= r*r+0.25) this.set(cx+i, y, cz+k, c);
  }
  get size(){ return this.m.size; }
}

// ---------- cube template (r128: +X,-X,+Y,-Y,+Z,-Z in groups of 6 corners) ----------
const _cube = new THREE.BoxGeometry(1,1,1).toNonIndexed();
const _CP = _cube.attributes.position.array;
const _CN = _cube.attributes.normal.array;
const _DIR = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];

function jitter(hex, amt){
  const r=(hex>>16&255), g=(hex>>8&255), b=(hex&255);
  const f = 1 + (Math.random()*2-1)*amt;
  return [Math.min(1,r/255*f), Math.min(1,g/255*f), Math.min(1,b/255*f)];
}

/** Vox -> BufferGeometry, hidden faces removed, centered in X/Z, y=0 at the bottom */
function voxGeometry(vox, opt={}){
  const scale = opt.scale ?? 1;
  const noise = opt.noise ?? 0.05;
  const pos=[], nor=[], col=[];
  let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9,minZ=1e9,maxZ=-1e9;

  for(const [k] of vox.m){
    const [x,y,z]=k.split(',').map(Number);
    if(x<minX)minX=x; if(x>maxX)maxX=x;
    if(y<minY)minY=y; if(y>maxY)maxY=y;
    if(z<minZ)minZ=z; if(z>maxZ)maxZ=z;
  }
  if(minX>maxX) return new THREE.BufferGeometry();

  const offX = -(minX+maxX+1)/2, offY = -minY, offZ = -(minZ+maxZ+1)/2;

  for(const [k,hex] of vox.m){
    const [x,y,z]=k.split(',').map(Number);
    const rgb = jitter(hex, noise);
    for(let f=0; f<6; f++){
      const d=_DIR[f];
      if(vox.has(x+d[0], y+d[1], z+d[2])) continue; // hidden face
      for(let vtx=0; vtx<6; vtx++){
        const i=(f*6+vtx)*3;
        pos.push((_CP[i]  +0.5+x+offX)*scale,
                 (_CP[i+1]+0.5+y+offY)*scale,
                 (_CP[i+2]+0.5+z+offZ)*scale);
        nor.push(_CN[i], _CN[i+1], _CN[i+2]);
        col.push(rgb[0], rgb[1], rgb[2]);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',   new THREE.Float32BufferAttribute(nor,3));
  g.setAttribute('color',    new THREE.Float32BufferAttribute(col,3));
  g.computeBoundingSphere();
  g.computeBoundingBox();
  return g;
}

const VOX_MAT = new THREE.MeshLambertMaterial({ vertexColors:true });

function voxMesh(vox, opt){
  const m = new THREE.Mesh(voxGeometry(vox, opt), VOX_MAT);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

// =======================================================================
//  MODEL BUILDERS
// =======================================================================

function buildQuadruped(p){
  const v=new Vox();
  const L=p.len, H=p.height, B=p.width, K=p.legs;
  const bodyLen = Math.max(3, L-3);
  const lw = B>=5 ? 2 : 1;

  // legs
  const bx=[1, bodyLen-1-lw], bz=[0, B-lw];
  for(const x of bx) for(const z of bz) v.box(x,0,z,lw,K,lw,p.legColor);

  // body
  v.box(0,K,0,bodyLen,H,B,p.body);
  // belly
  for(let i=0;i<bodyLen;i++) for(let k=0;k<B;k++) v.set(i,K,k,p.belly);
  // round off shoulders/hips
  v.del(0,K+H-1,0); v.del(0,K+H-1,B-1);
  v.del(bodyLen-1,K+H-1,0); v.del(bodyLen-1,K+H-1,B-1);
  // spots (lynx)
  if(p.spots){
    for(let i=1;i<bodyLen-1;i+=2) for(let j=K+1;j<K+H;j+=2)
      { v.set(i,j,0,p.spots); v.set(i,j,B-1,p.spots); }
  }

  // head
  const headD=3, hz=Math.floor((B-3)/2), hy=K+H-2, hx=bodyLen;
  v.box(hx,hy,hz,headD,3,3,p.head);
  // neck
  v.box(hx-1,hy,hz,1,3,3,p.head);
  // snout
  v.box(hx+headD,hy,hz+1,1,2,1,p.snout);
  // eyes
  v.set(hx+headD-1, hy+2, hz, p.eyes);
  v.set(hx+headD-1, hy+2, hz+2, p.eyes);

  // ears
  if(p.ears){
    const eh=p.ears.h;
    for(const ez of [hz, hz+2]){
      v.box(hx+1, hy+3, ez, 1, eh, 1, p.ears.color);
      if(p.ears.tip) v.set(hx+1, hy+3+eh-1, ez, p.ears.tip);
      if(p.ears.tuft) v.set(hx+1, hy+3+eh, ez, p.ears.tuftColor ?? p.ears.color);
    }
  }

  // antlers (moose)
  if(p.antlers){
    const g=p.antlers, half=Math.floor(g.span/2);
    for(let s of [-1,1]){
      const z0 = s<0 ? hz-1 : hz+3;
      v.box(hx+1, hy+3, z0, 1, 1, 1, g.color);
      for(let i=0;i<half;i++){
        const zz = z0 + s*i;
        v.set(hx+1, hy+4, zz, g.color);
        if(i>0) v.set(hx+2, hy+4, zz, g.color);
        if(i%2===0) v.set(hx+1, hy+5, zz, g.color);
      }
    }
  }
  if(p.dewlap) v.box(hx+headD-1, hy-2, hz+1, 1, 2, 1, p.dewlap);

  // tail
  if(p.tail && p.tail.len>0){
    const h=p.tail, ty=K+H-1, tz=Math.floor((B-1)/2);
    for(let i=0;i<h.len;i++){
      const c = (i>=h.len-1) ? h.tip : h.color;
      if(h.up){
        v.box(-1, ty+i, tz-Math.floor(h.bristle/2), 1, 1, h.bristle||1, c);
        if(h.bristle>1) v.box(-2, ty+i, tz-Math.floor(h.bristle/2), 1, 1, h.bristle, c);
      } else {
        const b=h.bristle||1;
        v.box(-1-i, ty-Math.floor(i/3), tz-Math.floor(b/2), 1, b>1?2:1, b, c);
      }
    }
  }
  return v;
}

function buildBird(p){
  const v=new Vox();
  const D=p.depth, H=p.height, B=p.width;
  const bh = H-2;
  // feet
  v.box(D-2,0,1,1,2,1,p.legColor);
  v.box(D-2,0,B-2,1,2,1,p.legColor);
  // body
  v.box(0,2,0,D,bh,B,p.body);
  // breast (front = +X)
  for(let j=2;j<2+bh;j++) for(let k=0;k<B;k++) v.set(D-1,j,k,p.breast);
  // wings
  for(let i=0;i<D;i++) for(let j=3;j<2+bh-1;j++){ v.set(i,j,0,p.wing); v.set(i,j,B-1,p.wing); }
  // streaked back
  if(p.streak) for(let j=3;j<2+bh;j+=2) for(let k=1;k<B-1;k++) v.set(0,j,k,p.streak);
  // round off the top
  v.del(0,2+bh-1,0); v.del(0,2+bh-1,B-1); v.del(D-1,2+bh-1,0); v.del(D-1,2+bh-1,B-1);
  // facial disc
  const ay=2+bh-3;
  for(let j=ay;j<ay+3;j++) for(let k=1;k<B-1;k++) v.set(D-1,j,k,p.breast);
  // eyes
  v.set(D-1,ay+1,1,p.eyes); v.set(D-1,ay+1,B-2,p.eyes);
  v.set(D-1,ay+2,1,p.streak||p.wing); v.set(D-1,ay+2,B-2,p.streak||p.wing);
  // beak
  v.box(D,ay,Math.floor(B/2),1,2,1,p.beak);
  // ear tufts
  if(p.ears) for(const z of [1,B-2]) v.box(D-2,2+bh,z,1,p.ears.h,1,p.ears.color);
  return v;
}

function buildConifer(p){
  const v=new Vox();

  // pine: bare trunk, crown only at the top
  if(p.form === 'pine'){
    const st = Math.floor(p.height*0.6);
    v.box(0,0,0,2,st,2,p.trunk);
    v.box(2,st-3,0,2,1,1,p.trunk);
    v.box(-2,st-5,1,2,1,1,p.trunk);
    for(let y=st; y<p.height; y++){
      const t=(y-st)/(p.height-st);
      const r = p.radius*(0.5 + 0.5*Math.sin(Math.PI*Math.min(1,t*1.05)));
      v.disc(0, y, 0, Math.max(0.9,r), y%2 ? p.foliage : p.foliage2);
    }
    return v;
  }

  // spruce
  const trunkH=3;
  v.box(0,0,0,2,trunkH+1,2,p.trunk);
  const top=p.height, R=p.radius;
  let layer=0;
  for(let y=trunkH; y<top; y++){
    const t=(y-trunkH)/(top-trunkH);
    // stepped spruce shape: radius falls, but jumps up a little every 3rd layer
    let r = R*(1-t) + (layer%3===0 ? 0.9 : 0);
    r = Math.max(0.6, r);
    v.disc(0, y, 0, r, layer%2 ? p.foliage : p.foliage2);
    layer++;
  }
  v.set(0, top, 0, p.foliage);
  return v;
}

/** broadleaf - slim trunk, round crown (birch) */
function buildBroadleaf(p){
  const v=new Vox();
  const trunkH = Math.max(3, Math.floor(p.height*0.52));
  for(let y=0;y<trunkH;y++){
    v.set(0,y,0, (p.fleck && y%3===1) ? p.fleck : p.trunk);
    if(y<2){ v.set(1,y,0,p.trunk); v.set(0,y,1,p.trunk); }
  }
  const R = p.crownR, cy = trunkH + R - 1;
  for(let y=trunkH; y<=trunkH+R*2-1; y++){
    const dy = y - cy;
    const r = Math.sqrt(Math.max(0, R*R - dy*dy)) * 1.05;
    if(r < 0.7) continue;
    v.disc(0, y, 0, r, (y%2) ? p.foliage : p.foliage2);
  }
  for(let y=trunkH; y<trunkH+2; y++) v.set(0,y,0,p.trunk);
  return v;
}

function buildFlower(p){
  const v=new Vox();
  const H=p.height;
  v.box(0,0,0,1,H,1,p.stem);
  // leaves
  v.box(1,0,0,2,1,1,p.leaf); v.box(-2,0,0,2,1,1,p.leaf);
  v.box(0,0,1,1,1,2,p.leaf); v.box(0,0,-2,1,1,2,p.leaf);
  // petals in a ring
  const n=p.petals||5;
  for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2;
    const x=Math.round(Math.cos(a)*2), z=Math.round(Math.sin(a)*2);
    v.set(x,H,z, i%2 ? p.petal : p.petal2);
    v.set(Math.round(x/2),H,Math.round(z/2), p.petal);
  }
  v.set(0,H,0,p.center);
  v.set(0,H+1,0,p.center);
  return v;
}

function buildMushroom(p){
  const v=new Vox();
  const H=p.height;

  // funnel (chanterelle): wavy, sunken cap
  if(p.funnel){
    for(let y=0;y<H;y++) v.disc(0,y,0, 0.8 + y*0.12, p.stem);
    v.disc(0,H-1,0, 2.4, p.gills);
    v.disc(0,H,  0, 3.1, p.cap);
    v.disc(0,H+1,0, 3.4, p.cap);
    for(let i=-1;i<=1;i++) for(let k=-1;k<=1;k++) v.del(i,H+1,k);
    for(const pos of [[3,0],[-3,0],[0,3],[0,-3],[2,2],[-2,2],[2,-2],[-2,-2]])
      v.set(pos[0],H+2,pos[1],p.cap);
    return v;
  }

  v.box(0,0,0,1,H,1,p.stem);
  v.disc(0,H-2,0,1.6,p.stem);              // ring
  v.disc(0,H-1,0,3.2,p.gills);             // gills
  v.disc(0,H,0,3.2,p.cap);                 // cap
  v.disc(0,H+1,0,2.2,p.cap);
  v.disc(0,H+2,0,1.1,p.cap);
  // dots
  const pk=[[2,H,0],[-2,H,1],[0,H,-2],[1,H,2],[-1,H+1,-1],[1,H+1,1],[0,H+2,0]];
  for(const [x,y,z] of pk) if(v.has(x,y,z)) v.set(x,y,z,p.dots);
  return v;
}

function buildBerry(p){
  const v=new Vox();
  // low shrub
  for(let y=0;y<p.height;y++){
    const r = y<2 ? 2.4 : 2.9-(y-2)*0.9;
    v.disc(0,y,0,Math.max(0.8,r), y%2 ? p.leaf : p.leaf2);
  }
  v.box(0,0,0,1,2,1,p.stem);
  const b=[[2,2,0],[-2,3,1],[0,3,-2],[1,4,1],[-1,2,-2],[2,3,2]];
  for(const [x,y,z] of b){ v.set(x,y,z,p.berry); v.set(x,y+1,z,p.berry); }
  return v;
}

/** fish - spindle shape along X, head at +X */
function buildFish(p){
  const v=new Vox();
  const L=p.len, H=p.height, B=p.width;
  const cy=Math.floor(H/2), cz=Math.floor(B/2);
  for(let i=0;i<L;i++){
    const t=i/(L-1);
    const f=Math.sin(Math.PI*Math.min(0.99, 0.16 + t*0.8));
    const hh=Math.max(1, Math.round(H*f));
    const bb=Math.max(1, Math.round(B*f));
    const y0=cy-Math.floor(hh/2), z0=cz-Math.floor(bb/2);
    v.box(i, y0, z0, 1, hh, bb, i > L-4 ? p.head : p.body);
    for(let k=0;k<bb;k++) v.set(i, y0, z0+k, p.belly);               // pale belly
    if(p.streak && hh>2) for(let k=0;k<bb;k++) v.set(i, y0+hh-2, z0+k, p.streak);
  }
  // tail fin
  for(let j=0;j<H;j++) v.set(-1, cy-Math.floor(H/2)+j, cz, p.fin);
  v.set(-2, cy+Math.floor(H/2), cz, p.fin);
  v.set(-2, cy-Math.floor(H/2), cz, p.fin);
  // dorsal fins
  for(let i=Math.floor(L*0.22); i<Math.floor(L*0.44); i++) v.set(i, cy+Math.floor(H/2), cz, p.fin);
  for(let i=Math.floor(L*0.52); i<Math.floor(L*0.72); i++) v.set(i, cy+Math.floor(H/2), cz, p.fin);
  // pectoral fins
  const fx=Math.floor(L*0.7);
  v.box(fx, cy-1, cz-2, 2, 1, 1, p.fin);
  v.box(fx, cy-1, cz+2, 2, 1, 1, p.fin);
  // eyes + barbel
  v.set(L-2, cy+1, cz-Math.floor(B/2), p.eyes);
  v.set(L-2, cy+1, cz+Math.floor(B/2), p.eyes);
  if(p.barbel) v.set(L, cy-1, cz, p.barbel);
  return v;
}

/** seal - blubbery body, flippers, raised head */
function buildSeal(p){
  const v=new Vox();
  const L=p.len, H=p.height, B=p.width;
  for(let i=0;i<L;i++){
    const t=i/(L-1);
    const f=Math.sin(Math.PI*Math.min(0.99, 0.2 + t*0.76));
    const hh=Math.max(1, Math.round(H*f));
    const bb=Math.max(1, Math.round(B*f));
    const z0=Math.round((B-bb)/2);
    v.box(i, 0, z0, 1, hh, bb, p.body);
    for(let k=0;k<bb;k++) v.set(i, 0, z0+k, p.belly);
    if(p.spots && i%2===0){ v.set(i, hh-1, z0, p.spots); v.set(i, hh-1, z0+bb-1, p.spots); }
  }
  const hy=Math.max(1, H-2), hz=Math.floor(B/2)-1;
  v.box(L, hy-1, hz, 2, 3, 3, p.head);
  v.box(L+2, hy, hz+1, 1, 1, 1, p.snout);
  v.set(L+1, hy+1, hz,   p.eyes);
  v.set(L+1, hy+1, hz+2, p.eyes);
  v.box(L-4, 0, -1, 3, 1, 1, p.flipper);
  v.box(L-4, 0,  B, 3, 1, 1, p.flipper);
  v.box(-2, 0, 0,   2, 1, 2, p.flipper);
  v.box(-2, 0, B-2, 2, 1, 2, p.flipper);
  return v;
}

/** kelp - holdfast, bent stipe, hanging blades */
function buildKelp(p){
  const v=new Vox();
  v.disc(0,0,0,2.2,p.holdfast);
  v.disc(0,1,0,1.6,p.holdfast);
  const H=p.height;
  let x=0, z=0;
  for(let y=2;y<H;y++){
    if(y%3===0) x += (y%6===0 ? 1 : -1);
    if(y%4===0) z += (y%8===0 ? 1 : -1);
    v.set(x, y, z, p.stem);
  }
  const n=p.blades;
  for(let b=0;b<n;b++){
    const a=b/n*Math.PI*2;
    const dx=Math.cos(a), dz=Math.sin(a);
    for(let i=1;i<=p.bladeLen;i++){
      const px=x+Math.round(dx*i), pz=z+Math.round(dz*i);
      const py=H - Math.floor(i*0.7);
      v.set(px, py,   pz, i%2 ? p.leaf : p.leaf2);
      v.set(px, py-1, pz, p.leaf2);
    }
  }
  return v;
}

// ---------- garden props from the shop ----------
const PROP = {
  wood:0x8a6a3f, wood2:0x6b5130, stone:0x93968f, stone2:0x7b7e78,
  soil:0x4e3a28, post:0x3a3f42, glass:0xf4dc94,
  flower:[0xd8536a, 0xe8b93c, 0x6f8fd8, 0xf2f0e6],
};

/** one fence panel: two posts and two rails */
function buildFence(){
  const v=new Vox();
  for(const x of [0, 7]) v.box(x, 0, 0, 1, 7, 1, PROP.wood2);
  for(const y of [2, 5]) v.box(0, y, 0, 8, 1, 1, PROP.wood);
  v.set(0, 7, 0, PROP.wood); v.set(7, 7, 0, PROP.wood);
  return v;
}

/** a stone slab */
function buildSlab(){
  const v=new Vox();
  v.disc(0, 0, 0, 2.6, PROP.stone);
  for(let i=0;i<5;i++) v.set(rndInt(-2,2), 0, rndInt(-2,2), PROP.stone2);
  return v;
}
function rndInt(a,b){ return a + Math.floor(Math.random()*(b-a+1)); }

function buildBench(){
  const v=new Vox();
  v.box(0,0,0,1,3,1,PROP.wood2); v.box(0,0,5,1,3,1,PROP.wood2);
  v.box(6,0,0,1,3,1,PROP.wood2); v.box(6,0,5,1,3,1,PROP.wood2);
  v.box(0,3,0,7,1,6,PROP.wood);         // seat
  v.box(0,4,0,1,4,6,PROP.wood);         // back
  v.box(0,8,0,1,1,6,PROP.wood2);
  return v;
}

function buildLantern(){
  const v=new Vox();
  v.box(0,0,0,1,11,1,PROP.post);
  v.disc(0,0,0,1.6,PROP.stone2);
  v.box(-1,11,-1,3,3,3,PROP.glass);
  v.box(-1,14,-1,3,1,3,PROP.post);
  return v;
}

/** flower clump for the bed: soil at the bottom, tall stems with a clear bloom */
function buildFlowerClump(){
  const v=new Vox();
  v.disc(0,0,0,1.8,PROP.soil);
  const spots = [[0,0],[1,1],[-1,1],[1,-1],[-1,-1],[2,0],[0,2],[-2,0]];
  for(let i=0;i<spots.length;i++){
    const x = spots[i][0], z = spots[i][1];
    const h = 3 + (i % 3);
    v.box(x, 1, z, 1, h, 1, 0x3f7f3f);
    const color = PROP.flower[i % PROP.flower.length];
    v.set(x, 1+h, z, color);
    v.set(x+1, h, z, color);
    v.set(x, h, z+1, color);
  }
  return v;
}

/** boulder */
function buildBoulder(){
  const v=new Vox();
  v.disc(0,0,0,3.2,PROP.stone);
  v.disc(0,1,0,2.9,PROP.stone2);
  v.disc(0,2,0,2.2,PROP.stone);
  v.disc(0,3,0,1.3,PROP.stone2);
  v.set(1,4,0,PROP.stone);
  return v;
}

/** tree stump with a pale cut surface */
function buildStump(){
  const v=new Vox();
  v.disc(0,0,0,2.7,PROP.wood2);
  v.disc(0,1,0,2.3,PROP.wood2);
  v.disc(0,2,0,2.1,PROP.wood2);
  v.disc(0,3,0,2.0,0xb99a63);
  v.set(0,3,0,PROP.wood2);
  v.set(3,0,0,PROP.wood2); v.set(-3,0,1,PROP.wood2); v.set(0,0,3,PROP.wood2);
  return v;
}

/** low bush */
function buildBush(){
  const v=new Vox();
  v.box(0,0,0,1,2,1,PROP.wood2);
  v.disc(0,2,0,2.6,0x3f7f3f);
  v.disc(0,3,0,3.0,0x4a8c46);
  v.disc(0,4,0,2.5,0x3f7f3f);
  v.disc(0,5,0,1.5,0x4a8c46);
  return v;
}

/** one hedge section - set several in a row for a wall */
function buildHedge(){
  const v=new Vox();
  v.box(-5,0,-1,10,5,3,0x35703a);
  v.box(-5,5,-1,10,1,3,0x4a8c46);
  for(let i=0;i<14;i++) v.set(rndInt(-5,4), 5, rndInt(-1,1), 0x56994f);
  return v;
}

/** birdhouse on a post */
function buildBirdhouse(){
  const v=new Vox();
  v.box(0,0,0,1,12,1,PROP.post);
  v.box(-2,12,-2,5,6,5,PROP.wood);
  v.box(-2,18,-2,5,1,5,PROP.wood2);
  v.del(0,15,-2); v.set(0,15,-1,0x241c18);
  return v;
}

/** fire pit: ring of stones, logs and a flame */
function buildFirepit(){
  const v=new Vox();
  for(let i=0;i<12;i++){
    const a=i/12*6.28;
    v.set(Math.round(Math.cos(a)*3), 0, Math.round(Math.sin(a)*3), i%2?PROP.stone:PROP.stone2);
  }
  v.box(-2,0,0,5,1,1,PROP.wood2);
  v.box(0,1,-2,1,1,5,PROP.wood2);
  v.box(-1,2,-1,3,1,3,0xe8862c);
  v.box(0,3,0,1,2,1,0xf2d24a);
  v.set(0,5,0,0xe8862c);
  return v;
}

/** sign with a post */
function buildSign(){
  const v=new Vox();
  v.box(0,0,0,1,10,1,PROP.wood2);
  v.box(-3,7,0,7,4,1,PROP.wood);
  v.box(-3,7,0,7,1,1,PROP.wood2);
  v.box(-3,10,0,7,1,1,PROP.wood2);
  v.box(-2,9,-1,5,1,1,0x2a1f08);
  v.box(-2,8,-1,3,1,1,0x2a1f08);
  return v;
}

/** woodpile */
function buildWoodpile(){
  const v=new Vox();
  for(let y=0;y<4;y++){
    const w = 8 - y*2;
    for(let z=0;z<3;z++) v.box(-Math.floor(w/2), y, z-1, w, 1, 1, (y+z)%2 ? PROP.wood : PROP.wood2);
  }
  for(let y=0;y<4;y++){
    const w = 8 - y*2, x = -Math.floor(w/2);
    for(let z=0;z<3;z++){ v.set(x, y, z-1, 0xb99a63); v.set(x+w-1, y, z-1, 0xb99a63); }
  }
  return v;
}

/** birdbath with a water surface */
function buildBirdbath(){
  const v=new Vox();
  v.disc(0,0,0,2.2,PROP.stone2);
  v.box(-1,1,-1,3,4,3,PROP.stone);
  v.disc(0,5,0,3.2,PROP.stone2);
  v.disc(0,6,0,3.2,PROP.stone);
  v.disc(0,6,0,2.3,0x2f86b4);
  return v;
}

/** tent with the opening facing forward */
function buildTent(){
  const v=new Vox();
  const canvas=0xd8cdb4, canvas2=0xbfb195;
  for(let y=0;y<=6;y++){
    const w = 7-y;
    for(let z=-4;z<=4;z++){
      v.set(-w, y, z, (y+z)%2 ? canvas : canvas2);
      v.set( w, y, z, (y+z)%2 ? canvas : canvas2);
      for(let x=-w+1;x<w;x++) if(z===4) v.set(x, y, z, canvas2);
    }
  }
  v.box(-1,7,-4,3,1,9,PROP.wood2);
  for(let y=0;y<=3;y++) for(const x of [-(7-y), 7-y]) v.set(x, y, -5, PROP.wood2);
  return v;
}

/** flagpole */
function buildFlagpole(){
  const v=new Vox();
  v.disc(0,0,0,2.0,PROP.stone2);
  v.box(0,1,0,1,20,1,0xe6e0d2);
  v.box(1,15,0,6,5,1,0xc8471f);
  v.box(1,17,0,6,1,1,0xf4efe2);
  v.box(3,15,0,1,5,1,0xf4efe2);
  return v;
}

/** pond: water mirror in a stone rim - icon use only, the lawn builds its own surface */
function buildPond(){
  const v=new Vox();
  v.disc(0,0,0,5.4,PROP.stone2);
  v.disc(0,1,0,5.4,PROP.stone);
  for(let i=0;i<10;i++){
    const a=i/10*6.28, r=5.0;
    v.set(Math.round(Math.cos(a)*r), 2, Math.round(Math.sin(a)*r), PROP.stone2);
  }
  v.disc(0,1,0,4.2,0x2f86b4);
  return v;
}

const PROP_BUILD = {
  _fence:buildFence, _slab:buildSlab, _bench:buildBench, _lantern:buildLantern,
  _flower:buildFlowerClump, _boulder:buildBoulder, _stump:buildStump, _bush:buildBush,
  _hedge:buildHedge, _birdhouse:buildBirdhouse, _firepit:buildFirepit, _sign:buildSign,
  _woodpile:buildWoodpile, _birdbath:buildBirdbath, _tent:buildTent, _flagpole:buildFlagpole,
  _pond:buildPond,
};

/** player figure - hiker with a pack */
function buildPlayer(){
  const skin=0xe8b48c, jacket=0xc8471f, trousers=0x2c3a52, shoes=0x241c18,
        pack=0x3c6b45, hat=0xe2d24a, hair=0x4a3524;
  const v=new Vox();
  v.box(1,0,1,1,2,1,shoes); v.box(1,0,3,1,2,1,shoes);    // feet
  v.box(1,2,1,1,3,3,trousers);                           // legs/hips
  v.box(0,5,1,3,4,3,jacket);                             // torso
  v.box(0,5,0,3,3,1,skin); v.box(0,5,4,3,3,1,skin);      // arms
  v.box(0,4,0,3,1,1,skin); v.box(0,4,4,3,1,1,skin);
  v.box(-1,6,1,1,3,3,pack);                              // backpack
  v.box(0,9,1,3,3,3,skin);                               // head
  v.box(0,11,1,3,1,3,hair);
  v.box(0,12,1,3,1,3,hat);
  v.set(3,10,1,0x1a1418); v.set(3,10,3,0x1a1418);        // eyes
  return v;
}

// ---------- color transforms (variants + season) ----------
function hexToHsl(hex){
  const r=(hex>>16&255)/255, g=(hex>>8&255)/255, b=(hex&255)/255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn;
  let h=0; const l=(mx+mn)/2;
  const s = d===0 ? 0 : d/(1-Math.abs(2*l-1));
  if(d!==0){
    if(mx===r)      h=((g-b)/d + (g<b?6:0))/6;
    else if(mx===g) h=((b-r)/d + 2)/6;
    else            h=((r-g)/d + 4)/6;
  }
  return [h,s,l];
}
function hslToHex(h,s,l){
  h=((h%1)+1)%1; s=Math.max(0,Math.min(1,s)); l=Math.max(0,Math.min(1,l));
  const c=(1-Math.abs(2*l-1))*s, x=c*(1-Math.abs((h*6)%2-1)), m=l-c/2;
  let r,g,b;
  const seg=Math.floor(h*6);
  if(seg===0)      { r=c; g=x; b=0; }
  else if(seg===1) { r=x; g=c; b=0; }
  else if(seg===2) { r=0; g=c; b=x; }
  else if(seg===3) { r=0; g=x; b=c; }
  else if(seg===4) { r=x; g=0; b=c; }
  else             { r=c; g=0; b=x; }
  return (Math.round((r+m)*255)<<16) | (Math.round((g+m)*255)<<8) | Math.round((b+m)*255);
}

/** walk the recipe and swap every color value (number > 0xFFF) */
function mapColors(o, fn){
  if(Array.isArray(o)) return o.map(x => mapColors(x, fn));
  if(o && typeof o === 'object'){
    const r={}; for(const k in o) r[k] = mapColors(o[k], fn); return r;
  }
  if(typeof o === 'number' && o > 0xFFF) return fn(o);
  return o;
}

const VARIANT_FX = {
  albino: hex => { const a = hexToHsl(hex); return hslToHex(a[0], 0.06, Math.min(0.95, 0.62 + a[2]*0.34)); },
  melanist: hex => { const a = hexToHsl(hex); return hslToHex(a[0], a[1]*0.45, a[2]*0.3 + 0.03); },
  golden: hex => { const a = hexToHsl(hex); return hslToHex(0.108, Math.max(0.72, a[1]), Math.min(0.6, a[2]*0.4 + 0.2)); },
};

/** seasonal shift - applied only to plants and scenery */
const SEASON_FX = {
  spring: hex => { const a = hexToHsl(hex);
    return (a[0]>0.2 && a[0]<0.45) ? hslToHex(a[0]+0.02, Math.min(1,a[1]*1.2), Math.min(0.72, a[2]*1.18)) : hex; },
  summer: null,
  autumn: hex => { const a = hexToHsl(hex);
    return (a[0]>0.2 && a[0]<0.45)
      ? hslToHex(0.06 + (a[0]-0.2)*0.09, Math.min(1, a[1]*1.5), Math.max(0.1, Math.min(0.36, a[2]*0.78)))
      : hex; },
  // winter lays snow over everything, including colors outside the green tones
  winter: hex => { const a = hexToHsl(hex);
    return hslToHex(0.58, 0.05 + a[1]*0.06, Math.min(0.95, a[2]*0.3 + 0.6)); },
};

/* conifers do not change color in autumn - only frost in winter */
const SEASON_FX_CONIFER = {
  spring: null, summer: null, autumn: null,
  winter: hex => { const a = hexToHsl(hex);
    return hslToHex(a[0], a[1]*0.4, Math.min(0.82, a[2]*0.8 + 0.2)); },
};

/** which season table the species follows */
const SEASON_TYPE = {
  spruce:'conifer', pine:'conifer', kelp:'conifer',
  juniper:'conifer', yew:'conifer', sugarkelp:'conifer', knottedwrack:'conifer', eelgrass:'conifer',
  birch:'deciduous', lingonberry:'deciduous', cloudberry:'deciduous', heather:'deciduous', hepatica:'deciduous',
  aspen:'deciduous', rowan:'deciduous', greyalder:'deciduous', goatwillow:'deciduous', oak:'deciduous', dwarfbirch:'deciduous',
  bilberry:'deciduous', crowberry:'deciduous', dwarfcornel:'deciduous',
  woodanemone:'deciduous', mountainavens:'deciduous', ladysslipper:'deciduous', sundew:'deciduous', cottongrass:'deciduous',
  flyagaric:null, chanterelle:null,
  porcini:null, deadlywebcap:null, blacktrumpet:null, orangebolete:null,
};

function colorFilter(opt){
  opt = opt || {};
  const fns = [];
  if(opt.variant && VARIANT_FX[opt.variant]) fns.push(VARIANT_FX[opt.variant]);
  if(opt.season){
    const tab = opt.seasonType === 'conifer' ? SEASON_FX_CONIFER : SEASON_FX;
    if(tab[opt.season]) fns.push(tab[opt.season]);
  }
  if(!fns.length) return null;
  return hex => fns.reduce((c,f) => f(c), hex);
}

// ---------- factory ----------
const _cacheGeo = new Map();

function buildVox(id, opt){
  opt = opt || {};
  if(id === '_player')   return buildPlayer();
  if(PROP_BUILD[id])     return PROP_BUILD[id]();
  const sp = SPECIES_BY_ID[id];
  if(!sp) return new Vox();
  const st = SEASON_TYPE[id];
  const fx = colorFilter({ variant:opt.variant, season: st ? opt.season : null, seasonType: st });
  const p = fx ? mapColors(sp.vox, fx) : sp.vox;
  switch(p.type){
    case 'quadruped': return buildQuadruped(p);
    case 'bird':      return buildBird(p);
    case 'fish':      return buildFish(p);
    case 'seal':      return buildSeal(p);
    case 'conifer':   return buildConifer(p);
    case 'broadleaf': return buildBroadleaf(p);
    case 'flower':    return buildFlower(p);
    case 'mushroom':  return buildMushroom(p);
    case 'berry':     return buildBerry(p);
    case 'kelp':      return buildKelp(p);
    default:          return new Vox();
  }
}

function modelGeometry(id, opt){
  opt = opt || {};
  const key = id + '|' + (opt.variant||'') + '|' + (SEASON_TYPE[id] ? (opt.season||'') : '');
  if(_cacheGeo.has(key)) return _cacheGeo.get(key);
  const g = voxGeometry(buildVox(id, opt), {scale:1, noise:0.06});
  _cacheGeo.set(key, g);
  return g;
}

function model(id, opt){
  const m = new THREE.Mesh(modelGeometry(id, opt), VOX_MAT);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** normalize height -> wanted world height, return a Group with the mesh inside */
function modelScaled(id, targetHeight, opt){
  const g = modelGeometry(id, opt);
  const bb = g.boundingBox;
  const h = bb.max.y - bb.min.y;
  const b = bb.max.x - bb.min.x;
  const d = bb.max.z - bb.min.z;
  const grp = new THREE.Group();
  const m = new THREE.Mesh(g, VOX_MAT);
  m.castShadow = true; m.receiveShadow = true;
  /* long, low animals (fish, otter, seal) get huge if only the height is
     normalized - let the width constrain it once it is over 1.7x the height */
  const target = Math.max(h || 1, b/1.7, d/1.7);
  const s = targetHeight / target;
  m.scale.setScalar(s);
  grp.add(m);
  grp.userData.inner = m;
  return grp;
}
