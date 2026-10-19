import { Euler, Quaternion, Vector3 } from 'three';
import type { Part } from '../Instances';
import { heroColumnGrid, heroStairParts, taiheAssetSpec as spec } from './HeroAssetSpec';
import { roofPoint } from './HeroRoofGeometry';
import { heroRoofCourses } from './HeroRoofCourses';
import type { HeroTileDetail } from './HeroRoofCourses';

export interface HeroPartGroups {
  stone:Part[]; railPanels:Part[]; railFrames:Part[]; stonePosts:Part[]; stoneCaps:Part[]; columnBases:Part[];
  columns:Part[]; wallPanels:Part[]; doorFrames:Part[]; windowLattice:Part[];
  beams:Part[]; brackets:Part[]; bracketBlocks:Part[]; rafters:Part[]; tiles:Part[]; tileCaps:Part[]; ridges:Part[];
}
const box=(a:Part[],x:number,y:number,z:number,w:number,h:number,d:number)=>a.push({position:[x,y,z],scale:[w,h,d]});

/** Unit Y-axis primitive aligned between two points, shared by wood members and round tiles. */
function member(a:Part[],from:[number,number,number],to:[number,number,number],w:number,d=w){
  const v=new Vector3(...to).sub(new Vector3(...from)),length=v.length();
  const q=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),v.normalize()),e=new Euler().setFromQuaternion(q);
  a.push({position:[(from[0]+to[0])/2,(from[1]+to[1])/2,(from[2]+to[2])/2],scale:[w,length,d],rotation:[e.x,e.y,e.z]});
}

export function buildHeroParts({tileDetail='near'}:{tileDetail?:HeroTileDetail}={}):HeroPartGroups{
  const p:HeroPartGroups={stone:[],railPanels:[],railFrames:[],stonePosts:[],stoneCaps:[],columnBases:[],columns:[],wallPanels:[],doorFrames:[],windowLattice:[],beams:[],brackets:[],bracketBlocks:[],rafters:[],tiles:[],tileCaps:[],ridges:[]};
  const grid=heroColumnGrid(),base=spec.dimensions.terraceHeight;
  for(const t of spec.terraces){
    const h=t.top-t.bottom;
    // Stepped foot, projecting lower/upper mouldings, recessed waist and continuous coping.
    for(const [offset,height,projection] of [[.12,.24,0],[.36,.22,.16],[.62,.18,-.06],[h-.55,.22,.13],[h-.28,.18,.27],[h-.08,.16,.34]]){
      box(p.stone,0,t.bottom+offset,0,t.width+projection,height,t.depth+projection);
    }
    box(p.stone,0,t.bottom+h/2,0,t.width-.32,h-.72,t.depth-.32);
    for(const side of [-1,1]){
      const z=side*(t.depth/2-.35),count=Math.ceil((t.width-.8)/2.35),step=(t.width-.8)/count;
      for(let i=0;i<count;i++){
        const x=-(t.width-.8)/2+(i+.5)*step,left=x-step/2,right=x+step/2;
        if(side===1&&spec.stairs.filter(f=>f.top===t.top).some(f=>right>f.x-f.width/2-.35&&left<f.x+f.width/2+.35))continue;
        box(p.railPanels,x,t.top+.63,z,step-.18,.77,.14);
        box(p.railFrames,x,t.top+1.1,z,step,.16,.24);
        box(p.railFrames,x,t.top+.2,z,step,.19,.25);
        box(p.stonePosts,left,t.top+.61,z,.24,1.22,.24);
        box(p.stoneCaps,left,t.top+1.36,z,.34,.30,.34);
      }
    }
    for(const side of [-1,1]){
      const x=side*(t.width/2-.35),count=Math.ceil((t.depth-.8)/2.35),step=(t.depth-.8)/count;
      for(let i=0;i<count;i++){
        const z=-(t.depth-.8)/2+(i+.5)*step;
        p.railPanels.push({position:[x,t.top+.63,z],scale:[step-.18,.77,.14],rotation:[0,Math.PI/2,0]});
        box(p.railFrames,x,t.top+1.1,z,.24,.16,step);
        box(p.railFrames,x,t.top+.2,z,.25,.19,step);
        box(p.stonePosts,x,t.top+.61,z-step/2,.24,1.22,.24);
        box(p.stoneCaps,x,t.top+1.36,z-step/2,.34,.30,.34);
      }
    }
  }
  for(const f of spec.stairs)p.stone.push(...heroStairParts(f));
  const column=(x:number,z:number,y:number,height:number,radius:number)=>{
    box(p.columnBases,x,y+.2,z,radius*2.9,.4,radius*2.9);
    p.columns.push({position:[x,y+.38+height/2,z],scale:[radius,height,radius]});
  };
  for(const x of grid.x)for(const side of [-1,1])column(x,side*18.5,base,10.12,.46);
  for(const z of grid.z.slice(1,-1))for(const side of [-1,1])column(side*31.98,z,base,10.12,.46);
  for(const x of grid.x)for(const side of [-1,1])column(x*.83,side*14.15,base,9.85,.38);
  // Upper clerestory is separate from the lower colonnade and roof.
  for(const x of grid.x)for(const side of [-1,1])column(x*.81,side*12.4,20.5,3.85,.29);
  for(const side of [-1,1]){
    for(const [z,y,w,h,d] of [[side*18.5,18.23,64.9,.42,.6],[side*18.5,18.7,66.2,.22,.68],[side*14.15,17.5,55.8,.64,.45],[side*12.4,24.45,54.8,.36,.45]])box(p.beams,0,y,z,w,h,d);
    for(const [x,y,w,h,d] of [[side*31.98,18.23,.6,.42,37.6],[side*31.98,18.7,.68,.22,38.8]])box(p.beams,x,y,0,w,h,d);
    // Inset side-wall bays: a visible corridor remains between wall and outer columns.
    box(p.wallPanels,side*27.3,base+4.9,0,.34,9.8,28.6);
    box(p.wallPanels,side*24,22.6,0,.32,3.7,23.6);
  }
  // Thick, individually framed leaves. Upper lattice is recessed behind their face.
  const facade=(side:number,upper=false)=>{
    const z=side*(upper?12.02:14.3),y=upper?20.7:base+.25,scale=upper?.75:.83,height=upper?3.4:8.2;
    for(let i=0;i<grid.x.length-1;i++){
      const left=grid.x[i]*scale,right=grid.x[i+1]*scale,bay=right-left;
      box(p.doorFrames,(left+right)/2,y+height+.16,z,bay,.34,.38);
      box(p.doorFrames,(left+right)/2,y+.08,z,bay,.16,.42);
      const leaves=upper?2:4,leaf=bay/leaves;
      for(let k=0;k<leaves;k++){
        const x=left+(k+.5)*leaf,panelH=upper?.45:2.15,latticeBottom=y+panelH+.36,latticeTop=y+height-.18;
        box(p.wallPanels,x,y+panelH/2+.13,z,leaf-.10,panelH,.15);
        for(const sx of [-1,1])box(p.doorFrames,x+sx*(leaf-.08)/2,y+height/2,z+side*.11,.09,height,.22);
        for(const yy of [y+.16,y+panelH+.23,y+height-.05])box(p.doorFrames,x,yy,z+side*.1,leaf-.04,.14,.21);
        // Rhombic lattice, clipped exactly to each leaf's rectangle; no random ornament.
        const half=(leaf-.21)/2,H=latticeTop-latticeBottom,spacing=upper?.43:.46;
        for(const slope of [-1,1])for(let offset=-H-half;offset<=half;offset+=spacing){
          const minY=Math.max(0,-half-offset),maxY=Math.min(H,half-offset);
          if(maxY-minY<.07)continue;
          const u=offset+minY,v=offset+maxY;
          member(p.windowLattice,[x+slope*u,latticeBottom+minY,z-side*.07],[x+slope*v,latticeBottom+maxY,z-side*.07],.037,.052);
        }
      }
    }
  };
  facade(-1);facade(1);facade(-1,true);facade(1,true);
  // Three stepped arms, bearing blocks, crossing members and angled outer struts.
  const bracket=(x:number,z:number,y:number,side:number,alongX=false,size=1)=>{
    const put=(arr:Part[],dx:number,dy:number,dz:number,w:number,h:number,d:number)=>{
      if(alongX)box(arr,x+dz*side*size,y+dy*size,z+dx*size,d*size,h*size,w*size);
      else box(arr,x+dx*size,y+dy*size,z+dz*side*size,w*size,h*size,d*size);
    };
    put(p.bracketBlocks,0,0,0,.6,.26,.6);
    for(let level=0;level<3;level++){
      const width=.85+level*.49,projection=.24+level*.29;
      put(p.brackets,0,.28+level*.27,projection,width,.17,.30);
      put(p.brackets,0,.36+level*.27,projection,.26,.16,1.0+level*.45);
      for(const sx of [-1,1])put(p.bracketBlocks,sx*(width/2-.12),.43+level*.27,projection,.23,.18,.28);
    }
    const from:[number,number,number]=[x,y+.2,z],to:[number,number,number]=alongX?[x+side*1.25*size,y+.92*size,z]:[x,y+.92*size,z+side*1.25*size];
    member(p.brackets,from,to,.19*size,.23*size);
  };
  for(const side of [-1,1]){
    for(let i=0;i<grid.x.length;i++){
      bracket(grid.x[i],side*18.5,17.98,side);
      bracket(grid.x[i]*.81,side*12.4,24.04,side,false,.76);
      if(i<grid.x.length-1)for(const f of [1/3,2/3]){
        bracket(grid.x[i]+(grid.x[i+1]-grid.x[i])*f,side*18.5,17.98,side,false,.82);
        bracket((grid.x[i]+(grid.x[i+1]-grid.x[i])*f)*.81,side*12.4,24.04,side,false,.62);
      }
    }
    for(let z=-15;z<=15;z+=2.5)bracket(side*31.98,z,17.98,side,true,.85);
    // Corner sets add the diagonal load path instead of another aligned copy.
    for(const sz of [-1,1])member(p.brackets,[side*31.98,18.1,sz*18.5],[side*33.35,19,sz*19.87],.3,.3);
  }
  for(const r of spec.roofs){
    // Each parallel course starts on the ridge or the appropriate hip boundary.
    // The transverse coordinate stays fixed as the rectangular rings widen.
    for(const course of heroRoofCourses(r,tileDetail)){
      for(let j=0;j<course.points.length-1;j++){
        const a:[number,number,number]=[...course.points[j]],b:[number,number,number]=[...course.points[j+1]];
        a[1]+=.055;b[1]+=.055;
        const v=new Vector3(...b).sub(new Vector3(...a)).normalize();
        // Small longitudinal overlap avoids cracks between tessellated barrel segments.
        if(j>0){a[0]-=v.x*.025;a[1]-=v.y*.025;a[2]-=v.z*.025;}
        if(j<course.points.length-2){b[0]+=v.x*.025;b[1]+=v.y*.025;b[2]+=v.z*.025;}
        member(p.tiles,a,b,.105,.105);
      }
      // Plain, uncarved eave terminal. Relief motifs await verified references.
      const end:[number,number,number]=[...course.points.at(-1)!],previous=course.points.at(-2)!;
      const v=new Vector3(...end).sub(new Vector3(...previous)).normalize();end[1]+=.055;
      member(p.tileCaps,end,[end[0]+v.x*.10,end[1]+v.y*.10,end[2]+v.z*.10],.122,.122);
    }
    for(let side=0;side<4;side++){
      const edgeLength=side%2===0?r.width:r.depth;
      const count=Math.ceil(edgeLength/.53);
      for(let i=0;i<count;i++){
        const f=(i+.5)/count,a=roofPoint(r,.78,side,f),b=roofPoint(r,1,side,f);
        a[1]-=r.thickness+.1;b[1]-=r.thickness+.16;
        member(p.rafters,a,b,.16,.19);
      }
      for(let j=0;j<18;j++)member(p.ridges,roofPoint(r,j/18,side,0),roofPoint(r,(j+1)/18,side,0),.19,.19);
    }
    // Continuous ridge courses, with envelope-limited terminal blocks pending sculpted chiwen.
    box(p.ridges,0,r.y+r.rise+.15,0,r.ridgeHalf*2+.6,.3,.52);
    box(p.ridges,0,r.y+r.rise+.37,0,r.ridgeHalf*2,.14,.32);
    for(const sx of [-1,1])box(p.ridges,sx*r.ridgeHalf,r.y+r.rise+.325,0,.5,.65,.65);
  }
  return p;
}
