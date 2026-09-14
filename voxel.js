/* VILLMARK - voxel-motor: bygger THREE-mesh av voxelbokser */

// ---------- voxel-samling ----------
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
  /** fyll en sirkelskive i XZ-planet */
  disc(cx,y,cz,r,c){
    const ri = Math.ceil(r);
    for(let i=-ri;i<=ri;i++) for(let k=-ri;k<=ri;k++)
      if(i*i+k*k <= r*r+0.25) this.set(cx+i, y, cz+k, c);
  }
  get size(){ return this.m.size; }
}

// ---------- kube-mal (r128: +X,-X,+Y,-Y,+Z,-Z i grupper a 6 hjorner) ----------
const _cube = new THREE.BoxGeometry(1,1,1).toNonIndexed();
const _CP = _cube.attributes.position.array;
const _CN = _cube.attributes.normal.array;
const _DIR = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];

function jitter(hex, amt){
  const r=(hex>>16&255), g=(hex>>8&255), b=(hex&255);
  const f = 1 + (Math.random()*2-1)*amt;
  return [Math.min(1,r/255*f), Math.min(1,g/255*f), Math.min(1,b/255*f)];
}

/** Vox -> BufferGeometry, skjulte flater fjernet, sentrert i X/Z, y=0 i bunn */
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
      if(vox.has(x+d[0], y+d[1], z+d[2])) continue; // skjult flate
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
//  MODELLBYGGERE
// =======================================================================

function byggFirbeint(p){
  const v=new Vox();
  const L=p.len, H=p.hoy, B=p.bred, K=p.ben;
  const kroppLen = Math.max(3, L-3);
  const lw = B>=5 ? 2 : 1;

  // bein
  const bx=[1, kroppLen-1-lw], bz=[0, B-lw];
  for(const x of bx) for(const z of bz) v.box(x,0,z,lw,K,lw,p.bein);

  // kropp
  v.box(0,K,0,kroppLen,H,B,p.kropp);
  // buk
  for(let i=0;i<kroppLen;i++) for(let k=0;k<B;k++) v.set(i,K,k,p.buk);
  // avrund skuldre/hofter
  v.del(0,K+H-1,0); v.del(0,K+H-1,B-1);
  v.del(kroppLen-1,K+H-1,0); v.del(kroppLen-1,K+H-1,B-1);
  // flekker (gaupe)
  if(p.flekker){
    for(let i=1;i<kroppLen-1;i+=2) for(let j=K+1;j<K+H;j+=2)
      { v.set(i,j,0,p.flekker); v.set(i,j,B-1,p.flekker); }
  }

  // hode
  const hodeD=3, hz=Math.floor((B-3)/2), hy=K+H-2, hx=kroppLen;
  v.box(hx,hy,hz,hodeD,3,3,p.hode);
  // hals
  v.box(hx-1,hy,hz,1,3,3,p.hode);
  // snute
  v.box(hx+hodeD,hy,hz+1,1,2,1,p.snute);
  // oyne
  v.set(hx+hodeD-1, hy+2, hz, p.oyne);
  v.set(hx+hodeD-1, hy+2, hz+2, p.oyne);

  // orer
  if(p.orer){
    const oh=p.orer.h;
    for(const oz of [hz, hz+2]){
      v.box(hx+1, hy+3, oz, 1, oh, 1, p.orer.farge);
      if(p.orer.tupp) v.set(hx+1, hy+3+oh-1, oz, p.orer.tupp);
      if(p.orer.dusk) v.set(hx+1, hy+3+oh, oz, p.orer.duskFarge ?? p.orer.farge);
    }
  }

  // gevir (elg)
  if(p.gevir){
    const g=p.gevir, halv=Math.floor(g.spenn/2);
    for(let s of [-1,1]){
      const z0 = s<0 ? hz-1 : hz+3;
      v.box(hx+1, hy+3, z0, 1, 1, 1, g.farge);
      for(let i=0;i<halv;i++){
        const zz = z0 + s*i;
        v.set(hx+1, hy+4, zz, g.farge);
        if(i>0) v.set(hx+2, hy+4, zz, g.farge);
        if(i%2===0) v.set(hx+1, hy+5, zz, g.farge);
      }
    }
  }
  if(p.muleskjegg) v.box(hx+hodeD-1, hy-2, hz+1, 1, 2, 1, p.muleskjegg);

  // hale
  if(p.hale && p.hale.len>0){
    const h=p.hale, ty=K+H-1, tz=Math.floor((B-1)/2);
    for(let i=0;i<h.len;i++){
      const c = (i>=h.len-1) ? h.tupp : h.farge;
      if(h.opp){
        v.box(-1, ty+i, tz-Math.floor(h.bust/2), 1, 1, h.bust||1, c);
        if(h.bust>1) v.box(-2, ty+i, tz-Math.floor(h.bust/2), 1, 1, h.bust, c);
      } else {
        const b=h.bust||1;
        v.box(-1-i, ty-Math.floor(i/3), tz-Math.floor(b/2), 1, b>1?2:1, b, c);
      }
    }
  }
  return v;
}

function byggFugl(p){
  const v=new Vox();
  const D=p.dyp, H=p.hoy, B=p.bred;
  const kh = H-2;
  // fotter
  v.box(D-2,0,1,1,2,1,p.bein);
  v.box(D-2,0,B-2,1,2,1,p.bein);
  // kropp
  v.box(0,2,0,D,kh,B,p.kropp);
  // bryst (front = +X)
  for(let j=2;j<2+kh;j++) for(let k=0;k<B;k++) v.set(D-1,j,k,p.bryst);
  // vinger
  for(let i=0;i<D;i++) for(let j=3;j<2+kh-1;j++){ v.set(i,j,0,p.vinge); v.set(i,j,B-1,p.vinge); }
  // stripete rygg
  if(p.strek) for(let j=3;j<2+kh;j+=2) for(let k=1;k<B-1;k++) v.set(0,j,k,p.strek);
  // avrund topp
  v.del(0,2+kh-1,0); v.del(0,2+kh-1,B-1); v.del(D-1,2+kh-1,0); v.del(D-1,2+kh-1,B-1);
  // ansiktsskive
  const ay=2+kh-3;
  for(let j=ay;j<ay+3;j++) for(let k=1;k<B-1;k++) v.set(D-1,j,k,p.bryst);
  // oyne
  v.set(D-1,ay+1,1,p.oyne); v.set(D-1,ay+1,B-2,p.oyne);
  v.set(D-1,ay+2,1,p.strek||p.vinge); v.set(D-1,ay+2,B-2,p.strek||p.vinge);
  // nebb
  v.box(D,ay,Math.floor(B/2),1,2,1,p.nebb);
  // oretufser
  if(p.orer) for(const z of [1,B-2]) v.box(D-2,2+kh,z,1,p.orer.h,1,p.orer.farge);
  return v;
}

function byggTre(p){
  const v=new Vox();

  // furu: naken stamme, krone bare oeverst
  if(p.form === 'furu'){
    const st = Math.floor(p.hoy*0.6);
    v.box(0,0,0,2,st,2,p.stamme);
    v.box(2,st-3,0,2,1,1,p.stamme);
    v.box(-2,st-5,1,2,1,1,p.stamme);
    for(let y=st; y<p.hoy; y++){
      const t=(y-st)/(p.hoy-st);
      const r = p.radius*(0.5 + 0.5*Math.sin(Math.PI*Math.min(1,t*1.05)));
      v.disc(0, y, 0, Math.max(0.9,r), y%2 ? p.lov : p.lov2);
    }
    return v;
  }

  // gran
  const stH=3;
  v.box(0,0,0,2,stH+1,2,p.stamme);
  const topp=p.hoy, R=p.radius;
  let lag=0;
  for(let y=stH; y<topp; y++){
    const t=(y-stH)/(topp-stH);
    // trinnvis granform: radius faller, men hopper opp litt hvert 3. lag
    let r = R*(1-t) + (lag%3===0 ? 0.9 : 0);
    r = Math.max(0.6, r);
    v.disc(0, y, 0, r, lag%2 ? p.lov : p.lov2);
    lag++;
  }
  v.set(0, topp, 0, p.lov);
  return v;
}

/** lauvtre - slank stamme, rund krone (bjoerk) */
function byggLauvtre(p){
  const v=new Vox();
  const stH = Math.max(3, Math.floor(p.hoy*0.52));
  for(let y=0;y<stH;y++){
    v.set(0,y,0, (p.flekk && y%3===1) ? p.flekk : p.stamme);
    if(y<2){ v.set(1,y,0,p.stamme); v.set(0,y,1,p.stamme); }
  }
  const R = p.kronR, cy = stH + R - 1;
  for(let y=stH; y<=stH+R*2-1; y++){
    const dy = y - cy;
    const r = Math.sqrt(Math.max(0, R*R - dy*dy)) * 1.05;
    if(r < 0.7) continue;
    v.disc(0, y, 0, r, (y%2) ? p.lov : p.lov2);
  }
  for(let y=stH; y<stH+2; y++) v.set(0,y,0,p.stamme);
  return v;
}

function byggBlomst(p){
  const v=new Vox();
  const H=p.hoy;
  v.box(0,0,0,1,H,1,p.stilk);
  // blader
  v.box(1,0,0,2,1,1,p.blad); v.box(-2,0,0,2,1,1,p.blad);
  v.box(0,0,1,1,1,2,p.blad); v.box(0,0,-2,1,1,2,p.blad);
  // kronblad i ring
  const n=p.kinder||5;
  for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2;
    const x=Math.round(Math.cos(a)*2), z=Math.round(Math.sin(a)*2);
    v.set(x,H,z, i%2 ? p.kron : p.kron2);
    v.set(Math.round(x/2),H,Math.round(z/2), p.kron);
  }
  v.set(0,H,0,p.midt);
  v.set(0,H+1,0,p.midt);
  return v;
}

function byggSopp(p){
  const v=new Vox();
  const H=p.hoy;

  // trakt (kantarell): boelgete, innsunket hatt
  if(p.trakt){
    for(let y=0;y<H;y++) v.disc(0,y,0, 0.8 + y*0.12, p.stilk);
    v.disc(0,H-1,0, 2.4, p.lamell);
    v.disc(0,H,  0, 3.1, p.hatt);
    v.disc(0,H+1,0, 3.4, p.hatt);
    for(let i=-1;i<=1;i++) for(let k=-1;k<=1;k++) v.del(i,H+1,k);
    for(const pos of [[3,0],[-3,0],[0,3],[0,-3],[2,2],[-2,2],[2,-2],[-2,-2]])
      v.set(pos[0],H+2,pos[1],p.hatt);
    return v;
  }

  v.box(0,0,0,1,H,1,p.stilk);
  v.disc(0,H-2,0,1.6,p.stilk);             // ring
  v.disc(0,H-1,0,3.2,p.lamell);            // lameller
  v.disc(0,H,0,3.2,p.hatt);                // hatt
  v.disc(0,H+1,0,2.2,p.hatt);
  v.disc(0,H+2,0,1.1,p.hatt);
  // prikker
  const pk=[[2,H,0],[-2,H,1],[0,H,-2],[1,H,2],[-1,H+1,-1],[1,H+1,1],[0,H+2,0]];
  for(const [x,y,z] of pk) if(v.has(x,y,z)) v.set(x,y,z,p.prikk);
  return v;
}

function byggBaer(p){
  const v=new Vox();
  // lav busk
  for(let y=0;y<p.hoy;y++){
    const r = y<2 ? 2.4 : 2.9-(y-2)*0.9;
    v.disc(0,y,0,Math.max(0.8,r), y%2 ? p.blad : p.blad2);
  }
  v.box(0,0,0,1,2,1,p.stilk);
  const b=[[2,2,0],[-2,3,1],[0,3,-2],[1,4,1],[-1,2,-2],[2,3,2]];
  for(const [x,y,z] of b){ v.set(x,y,z,p.baer); v.set(x,y+1,z,p.baer); }
  return v;
}

/** fisk - spolform langs X, hode i +X */
function byggFisk(p){
  const v=new Vox();
  const L=p.len, H=p.hoy, B=p.bred;
  const cy=Math.floor(H/2), cz=Math.floor(B/2);
  for(let i=0;i<L;i++){
    const t=i/(L-1);
    const f=Math.sin(Math.PI*Math.min(0.99, 0.16 + t*0.8));
    const hh=Math.max(1, Math.round(H*f));
    const bb=Math.max(1, Math.round(B*f));
    const y0=cy-Math.floor(hh/2), z0=cz-Math.floor(bb/2);
    v.box(i, y0, z0, 1, hh, bb, i > L-4 ? p.hode : p.kropp);
    for(let k=0;k<bb;k++) v.set(i, y0, z0+k, p.buk);                 // lys buk
    if(p.strek && hh>2) for(let k=0;k<bb;k++) v.set(i, y0+hh-2, z0+k, p.strek);
  }
  // halefinne
  for(let j=0;j<H;j++) v.set(-1, cy-Math.floor(H/2)+j, cz, p.finne);
  v.set(-2, cy+Math.floor(H/2), cz, p.finne);
  v.set(-2, cy-Math.floor(H/2), cz, p.finne);
  // ryggfinner
  for(let i=Math.floor(L*0.22); i<Math.floor(L*0.44); i++) v.set(i, cy+Math.floor(H/2), cz, p.finne);
  for(let i=Math.floor(L*0.52); i<Math.floor(L*0.72); i++) v.set(i, cy+Math.floor(H/2), cz, p.finne);
  // brystfinner
  const fx=Math.floor(L*0.7);
  v.box(fx, cy-1, cz-2, 2, 1, 1, p.finne);
  v.box(fx, cy-1, cz+2, 2, 1, 1, p.finne);
  // oyne + skjeggtraad
  v.set(L-2, cy+1, cz-Math.floor(B/2), p.oyne);
  v.set(L-2, cy+1, cz+Math.floor(B/2), p.oyne);
  if(p.skjegg) v.set(L, cy-1, cz, p.skjegg);
  return v;
}

/** sel - blubbete kropp, luffer, loeftet hode */
function byggSel(p){
  const v=new Vox();
  const L=p.len, H=p.hoy, B=p.bred;
  for(let i=0;i<L;i++){
    const t=i/(L-1);
    const f=Math.sin(Math.PI*Math.min(0.99, 0.2 + t*0.76));
    const hh=Math.max(1, Math.round(H*f));
    const bb=Math.max(1, Math.round(B*f));
    const z0=Math.round((B-bb)/2);
    v.box(i, 0, z0, 1, hh, bb, p.kropp);
    for(let k=0;k<bb;k++) v.set(i, 0, z0+k, p.buk);
    if(p.flekker && i%2===0){ v.set(i, hh-1, z0, p.flekker); v.set(i, hh-1, z0+bb-1, p.flekker); }
  }
  const hy=Math.max(1, H-2), hz=Math.floor(B/2)-1;
  v.box(L, hy-1, hz, 2, 3, 3, p.hode);
  v.box(L+2, hy, hz+1, 1, 1, 1, p.snute);
  v.set(L+1, hy+1, hz,   p.oyne);
  v.set(L+1, hy+1, hz+2, p.oyne);
  v.box(L-4, 0, -1, 3, 1, 1, p.luffe);
  v.box(L-4, 0,  B, 3, 1, 1, p.luffe);
  v.box(-2, 0, 0,   2, 1, 2, p.luffe);
  v.box(-2, 0, B-2, 2, 1, 2, p.luffe);
  return v;
}

/** tare - festeorgan, boeyd stilk, hengende blad */
function byggTare(p){
  const v=new Vox();
  v.disc(0,0,0,2.2,p.fot);
  v.disc(0,1,0,1.6,p.fot);
  const H=p.hoy;
  let x=0, z=0;
  for(let y=2;y<H;y++){
    if(y%3===0) x += (y%6===0 ? 1 : -1);
    if(y%4===0) z += (y%8===0 ? 1 : -1);
    v.set(x, y, z, p.stilk);
  }
  const n=p.blader;
  for(let b=0;b<n;b++){
    const a=b/n*Math.PI*2;
    const dx=Math.cos(a), dz=Math.sin(a);
    for(let i=1;i<=p.bladLen;i++){
      const px=x+Math.round(dx*i), pz=z+Math.round(dz*i);
      const py=H - Math.floor(i*0.7);
      v.set(px, py,   pz, i%2 ? p.blad : p.blad2);
      v.set(px, py-1, pz, p.blad2);
    }
  }
  return v;
}

// ---------- hageting fra butikken ----------
const PROP = {
  tre:0x8a6a3f, tre2:0x6b5130, stein:0x93968f, stein2:0x7b7e78,
  jord:0x4e3a28, stolpe:0x3a3f42, glass:0xf4dc94,
  blomst:[0xd8536a, 0xe8b93c, 0x6f8fd8, 0xf2f0e6],
};

/** ett gjerdefag: to stolper og to slaaer */
function byggGjerde(){
  const v=new Vox();
  for(const x of [0, 7]) v.box(x, 0, 0, 1, 7, 1, PROP.tre2);
  for(const y of [2, 5]) v.box(0, y, 0, 8, 1, 1, PROP.tre);
  v.set(0, 7, 0, PROP.tre); v.set(7, 7, 0, PROP.tre);
  return v;
}

/** en steinhelle */
function byggHelle(){
  const v=new Vox();
  v.disc(0, 0, 0, 2.6, PROP.stein);
  for(let i=0;i<5;i++) v.set(rndInt(-2,2), 0, rndInt(-2,2), PROP.stein2);
  return v;
}
function rndInt(a,b){ return a + Math.floor(Math.random()*(b-a+1)); }

function byggBenk(){
  const v=new Vox();
  v.box(0,0,0,1,3,1,PROP.tre2); v.box(0,0,5,1,3,1,PROP.tre2);
  v.box(6,0,0,1,3,1,PROP.tre2); v.box(6,0,5,1,3,1,PROP.tre2);
  v.box(0,3,0,7,1,6,PROP.tre);          // sete
  v.box(0,4,0,1,4,6,PROP.tre);          // rygg
  v.box(0,8,0,1,1,6,PROP.tre2);
  return v;
}

function byggLykt(){
  const v=new Vox();
  v.box(0,0,0,1,11,1,PROP.stolpe);
  v.disc(0,0,0,1.6,PROP.stein2);
  v.box(-1,11,-1,3,3,3,PROP.glass);
  v.box(-1,14,-1,3,1,3,PROP.stolpe);
  return v;
}

/** blomstertust til bedet: mold i bunn, hoye stilker med tydelig blomst */
function byggBlomsttust(){
  const v=new Vox();
  v.disc(0,0,0,1.8,PROP.jord);
  const plasser = [[0,0],[1,1],[-1,1],[1,-1],[-1,-1],[2,0],[0,2],[-2,0]];
  for(let i=0;i<plasser.length;i++){
    const x = plasser[i][0], z = plasser[i][1];
    const h = 3 + (i % 3);
    v.box(x, 1, z, 1, h, 1, 0x3f7f3f);
    const farge = PROP.blomst[i % PROP.blomst.length];
    v.set(x, 1+h, z, farge);
    v.set(x+1, h, z, farge);
    v.set(x, h, z+1, farge);
  }
  return v;
}

/** kampestein */
function byggStein(){
  const v=new Vox();
  v.disc(0,0,0,3.2,PROP.stein);
  v.disc(0,1,0,2.9,PROP.stein2);
  v.disc(0,2,0,2.2,PROP.stein);
  v.disc(0,3,0,1.3,PROP.stein2);
  v.set(1,4,0,PROP.stein);
  return v;
}

/** trestubbe med lys snittflate */
function byggStubbe(){
  const v=new Vox();
  v.disc(0,0,0,2.7,PROP.tre2);
  v.disc(0,1,0,2.3,PROP.tre2);
  v.disc(0,2,0,2.1,PROP.tre2);
  v.disc(0,3,0,2.0,0xb99a63);
  v.set(0,3,0,PROP.tre2);
  v.set(3,0,0,PROP.tre2); v.set(-3,0,1,PROP.tre2); v.set(0,0,3,PROP.tre2);
  return v;
}

/** lav busk */
function byggBusk(){
  const v=new Vox();
  v.box(0,0,0,1,2,1,PROP.tre2);
  v.disc(0,2,0,2.6,0x3f7f3f);
  v.disc(0,3,0,3.0,0x4a8c46);
  v.disc(0,4,0,2.5,0x3f7f3f);
  v.disc(0,5,0,1.5,0x4a8c46);
  return v;
}

/** ett hekkfelt - sett flere i rad for en vegg */
function byggHekk(){
  const v=new Vox();
  v.box(-5,0,-1,10,5,3,0x35703a);
  v.box(-5,5,-1,10,1,3,0x4a8c46);
  for(let i=0;i<14;i++) v.set(rndInt(-5,4), 5, rndInt(-1,1), 0x56994f);
  return v;
}

/** fuglekasse paa stolpe */
function byggFuglekasse(){
  const v=new Vox();
  v.box(0,0,0,1,12,1,PROP.stolpe);
  v.box(-2,12,-2,5,6,5,PROP.tre);
  v.box(-2,18,-2,5,1,5,PROP.tre2);
  v.del(0,15,-2); v.set(0,15,-1,0x241c18);
  return v;
}

/** baalplass: steinring, kubber og flamme */
function byggBaal(){
  const v=new Vox();
  for(let i=0;i<12;i++){
    const a=i/12*6.28;
    v.set(Math.round(Math.cos(a)*3), 0, Math.round(Math.sin(a)*3), i%2?PROP.stein:PROP.stein2);
  }
  v.box(-2,0,0,5,1,1,PROP.tre2);
  v.box(0,1,-2,1,1,5,PROP.tre2);
  v.box(-1,2,-1,3,1,3,0xe8862c);
  v.box(0,3,0,1,2,1,0xf2d24a);
  v.set(0,5,0,0xe8862c);
  return v;
}

/** skilt med stolpe */
function byggSkilt(){
  const v=new Vox();
  v.box(0,0,0,1,10,1,PROP.tre2);
  v.box(-3,7,0,7,4,1,PROP.tre);
  v.box(-3,7,0,7,1,1,PROP.tre2);
  v.box(-3,10,0,7,1,1,PROP.tre2);
  v.box(-2,9,-1,5,1,1,0x2a1f08);
  v.box(-2,8,-1,3,1,1,0x2a1f08);
  return v;
}

/** vedstabel */
function byggVedstabel(){
  const v=new Vox();
  for(let y=0;y<4;y++){
    const w = 8 - y*2;
    for(let z=0;z<3;z++) v.box(-Math.floor(w/2), y, z-1, w, 1, 1, (y+z)%2 ? PROP.tre : PROP.tre2);
  }
  for(let y=0;y<4;y++){
    const w = 8 - y*2, x = -Math.floor(w/2);
    for(let z=0;z<3;z++){ v.set(x, y, z-1, 0xb99a63); v.set(x+w-1, y, z-1, 0xb99a63); }
  }
  return v;
}

/** fuglebad med vannspeil */
function byggFuglebad(){
  const v=new Vox();
  v.disc(0,0,0,2.2,PROP.stein2);
  v.box(-1,1,-1,3,4,3,PROP.stein);
  v.disc(0,5,0,3.2,PROP.stein2);
  v.disc(0,6,0,3.2,PROP.stein);
  v.disc(0,6,0,2.3,0x2f86b4);
  return v;
}

/** telt med aapning framover */
function byggTelt(){
  const v=new Vox();
  const duk=0xd8cdb4, duk2=0xbfb195;
  for(let y=0;y<=6;y++){
    const w = 7-y;
    for(let z=-4;z<=4;z++){
      v.set(-w, y, z, (y+z)%2 ? duk : duk2);
      v.set( w, y, z, (y+z)%2 ? duk : duk2);
      for(let x=-w+1;x<w;x++) if(z===4) v.set(x, y, z, duk2);
    }
  }
  v.box(-1,7,-4,3,1,9,PROP.tre2);
  for(let y=0;y<=3;y++) for(const x of [-(7-y), 7-y]) v.set(x, y, -5, PROP.tre2);
  return v;
}

/** flaggstang */
function byggFlaggstang(){
  const v=new Vox();
  v.disc(0,0,0,2.0,PROP.stein2);
  v.box(0,1,0,1,20,1,0xe6e0d2);
  v.box(1,15,0,6,5,1,0xc8471f);
  v.box(1,17,0,6,1,1,0xf4efe2);
  v.box(3,15,0,1,5,1,0xf4efe2);
  return v;
}

/** dam: vannspeil i steinkant - bare til ikonbruk, plenen bygger sin egen flate */
function byggDam(){
  const v=new Vox();
  v.disc(0,0,0,5.4,PROP.stein2);
  v.disc(0,1,0,5.4,PROP.stein);
  for(let i=0;i<10;i++){
    const a=i/10*6.28, r=5.0;
    v.set(Math.round(Math.cos(a)*r), 2, Math.round(Math.sin(a)*r), PROP.stein2);
  }
  v.disc(0,1,0,4.2,0x2f86b4);
  return v;
}

const PROP_BYGG = {
  _gjerde:byggGjerde, _helle:byggHelle, _benk:byggBenk, _lykt:byggLykt,
  _blomst:byggBlomsttust, _stein:byggStein, _stubbe:byggStubbe, _busk:byggBusk,
  _hekk:byggHekk, _fuglekasse:byggFuglekasse, _baal:byggBaal, _skilt:byggSkilt,
  _ved:byggVedstabel, _fuglebad:byggFuglebad, _telt:byggTelt, _flagg:byggFlaggstang,
  _dam:byggDam,
};

/** spillerfigur - turgaer med sekk */
function byggSpiller(){
  const hud=0xe8b48c, jakke=0xc8471f, bukse=0x2c3a52, sko=0x241c18,
        sekk=0x3c6b45, lue=0xe2d24a, hår=0x4a3524;
  const v=new Vox();
  v.box(1,0,1,1,2,1,sko); v.box(1,0,3,1,2,1,sko);      // fotter
  v.box(1,2,1,1,3,3,bukse);                             // bein/hofte
  v.box(0,5,1,3,4,3,jakke);                             // torso
  v.box(0,5,0,3,3,1,hud); v.box(0,5,4,3,3,1,hud);       // armer
  v.box(0,4,0,3,1,1,hud); v.box(0,4,4,3,1,1,hud);
  v.box(-1,6,1,1,3,3,sekk);                             // ryggsekk
  v.box(0,9,1,3,3,3,hud);                               // hode
  v.box(0,11,1,3,1,3,hår);
  v.box(0,12,1,3,1,3,lue);
  v.set(3,10,1,0x1a1418); v.set(3,10,3,0x1a1418);       // oyne
  return v;
}

// ---------- fargetransformasjoner (varianter + sesong) ----------
function hexTilHsl(hex){
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
function hslTilHex(h,s,l){
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

/** gaa gjennom oppskrift og bytt alle fargeverdier (tall > 0xFFF) */
function mapFarger(o, fn){
  if(Array.isArray(o)) return o.map(x => mapFarger(x, fn));
  if(o && typeof o === 'object'){
    const r={}; for(const k in o) r[k] = mapFarger(o[k], fn); return r;
  }
  if(typeof o === 'number' && o > 0xFFF) return fn(o);
  return o;
}

const VARIANT_FX = {
  albino: hex => { const a = hexTilHsl(hex); return hslTilHex(a[0], 0.06, Math.min(0.95, 0.62 + a[2]*0.34)); },
  melanist: hex => { const a = hexTilHsl(hex); return hslTilHex(a[0], a[1]*0.45, a[2]*0.3 + 0.03); },
  gyllen: hex => { const a = hexTilHsl(hex); return hslTilHex(0.108, Math.max(0.72, a[1]), Math.min(0.6, a[2]*0.4 + 0.2)); },
};

/** sesongskift - brukes bare paa planter og kulisser */
const SESONG_FX = {
  vaar: hex => { const a = hexTilHsl(hex);
    return (a[0]>0.2 && a[0]<0.45) ? hslTilHex(a[0]+0.02, Math.min(1,a[1]*1.2), Math.min(0.72, a[2]*1.18)) : hex; },
  sommer: null,
  host: hex => { const a = hexTilHsl(hex);
    return (a[0]>0.2 && a[0]<0.45)
      ? hslTilHex(0.06 + (a[0]-0.2)*0.09, Math.min(1, a[1]*1.5), Math.max(0.1, Math.min(0.36, a[2]*0.78)))
      : hex; },
  // vinter legger snoe over alt, ogsaa farger utenfor groenntonene
  vinter: hex => { const a = hexTilHsl(hex);
    return hslTilHex(0.58, 0.05 + a[1]*0.06, Math.min(0.95, a[2]*0.3 + 0.6)); },
};

/* bartraer skifter ikke farge om hoesten - bare rim om vinteren */
const SESONG_FX_BAR = {
  vaar: null, sommer: null, host: null,
  vinter: hex => { const a = hexTilHsl(hex);
    return hslTilHex(a[0], a[1]*0.4, Math.min(0.82, a[2]*0.8 + 0.2)); },
};

/** hvilken sesongtabell arten foelger */
const SESONG_TYPE = {
  gran:'bar', furu:'bar', tare:'bar',
  einer:'bar', barlind:'bar', sukkertare:'bar', grisetang:'bar', alegras:'bar',
  bjork:'lauv', tyttebaer:'lauv', molte:'lauv', rosslyng:'lauv', blaveis:'lauv',
  osp:'lauv', rogn:'lauv', graor:'lauv', selje:'lauv', eik:'lauv', dvergbjork:'lauv',
  blabaer:'lauv', krekling:'lauv', skrubbaer:'lauv',
  hvitveis:'lauv', reinrose:'lauv', marisko:'lauv', soldogg:'lauv', myrull:'lauv',
  fluesopp:null, kantarell:null,
  steinsopp:null, giftslorsopp:null, trompetsopp:null, rodskrubb:null,
};

function fargeFilter(opt){
  opt = opt || {};
  const fns = [];
  if(opt.variant && VARIANT_FX[opt.variant]) fns.push(VARIANT_FX[opt.variant]);
  if(opt.sesong){
    const tab = opt.sesongType === 'bar' ? SESONG_FX_BAR : SESONG_FX;
    if(tab[opt.sesong]) fns.push(tab[opt.sesong]);
  }
  if(!fns.length) return null;
  return hex => fns.reduce((c,f) => f(c), hex);
}

// ---------- fabrikk ----------
const _cacheGeo = new Map();

function byggVox(id, opt){
  opt = opt || {};
  if(id === '_spiller')  return byggSpiller();
  if(PROP_BYGG[id])      return PROP_BYGG[id]();
  const sp = SPECIES_BY_ID[id];
  if(!sp) return new Vox();
  const st = SESONG_TYPE[id];
  const fx = fargeFilter({ variant:opt.variant, sesong: st ? opt.sesong : null, sesongType: st });
  const p = fx ? mapFarger(sp.vox, fx) : sp.vox;
  switch(p.type){
    case 'quadruped': return byggFirbeint(p);
    case 'fugl':      return byggFugl(p);
    case 'fisk':      return byggFisk(p);
    case 'sel':       return byggSel(p);
    case 'tre':       return byggTre(p);
    case 'lauvtre':   return byggLauvtre(p);
    case 'blomst':    return byggBlomst(p);
    case 'sopp':      return byggSopp(p);
    case 'baer':      return byggBaer(p);
    case 'tare':      return byggTare(p);
    default:          return new Vox();
  }
}

function modellGeometri(id, opt){
  opt = opt || {};
  const nokkel = id + '|' + (opt.variant||'') + '|' + (SESONG_TYPE[id] ? (opt.sesong||'') : '');
  if(_cacheGeo.has(nokkel)) return _cacheGeo.get(nokkel);
  const g = voxGeometry(byggVox(id, opt), {scale:1, noise:0.06});
  _cacheGeo.set(nokkel, g);
  return g;
}

function modell(id, opt){
  const m = new THREE.Mesh(modellGeometri(id, opt), VOX_MAT);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** normaliser hoyde -> onsket verdenshoyde, returner Group med mesh i */
function modellSkalert(id, malHoyde, opt){
  const g = modellGeometri(id, opt);
  const bb = g.boundingBox;
  const h = bb.max.y - bb.min.y;
  const b = bb.max.x - bb.min.x;
  const d = bb.max.z - bb.min.z;
  const grp = new THREE.Group();
  const m = new THREE.Mesh(g, VOX_MAT);
  m.castShadow = true; m.receiveShadow = true;
  /* lange, lave dyr (fisk, oter, sel) blir digre hvis bare hoyden
     normaliseres - la bredden begrense naar den er over 1.7x hoyden */
  const mal = Math.max(h || 1, b/1.7, d/1.7);
  const s = malHoyde / mal;
  m.scale.setScalar(s);
  grp.add(m);
  grp.userData.inner = m;
  return grp;
}
