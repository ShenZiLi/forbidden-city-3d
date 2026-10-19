import { buildings, walls } from '../data/worldManifest';
import { buildingColliders, platformSize } from './CollisionSystem';
import { toLocal } from '../world/WorldCoordinates';
export interface Waypoint { x:number; z:number }
/** Conservative 2 m exterior navigation grid. Used for reachability audits, never as collision replacement. */
export class NavigationGrid {
  readonly step=2;readonly width=391;readonly height=536;
  private blocked=new Uint8Array(this.width*this.height);
  constructor(){
    const mark=(x:number,z:number,w:number,d:number,rotation:number,clear?:number)=>{
      const radius=Math.hypot(w,d)/2+1;
      const minX=Math.max(0,Math.floor((x-radius+390)/2)),maxX=Math.min(this.width-1,Math.ceil((x+radius+390)/2));
      const minZ=Math.max(0,Math.floor((z-radius+510)/2)),maxZ=Math.min(this.height-1,Math.ceil((z+radius+510)/2));
      for(let j=minZ;j<=maxZ;j++)for(let i=minX;i<=maxX;i++){
        const l=toLocal({x:i*2-390,z:j*2-510},{x,z,rotation});
        if(Math.abs(l.x)<=w/2+.45&&Math.abs(l.z)<=d/2+.45&&(!clear||Math.abs(l.x)>clear/2-.45))this.blocked[j*this.width+i]=1;
      }
    };
    for(const b of buildings)for(const c of buildingColliders(b)){
      if(c.position[1]-c.half[1]>1.7)continue;
      const cos=Math.cos(b.rotation),sin=Math.sin(b.rotation);
      mark(b.x+c.position[0]*cos+c.position[2]*sin,b.z-c.position[0]*sin+c.position[2]*cos,c.half[0]*2,c.half[2]*2,b.rotation);
    }
    // Exterior audit routes walk around stairs rather than entering high risers from the side.
    for(const b of buildings)if(b.id!=='taihedian'&&b.collision==='solid'&&!b.parts?.length&&b.kind!=='platform'&&b.kind!=='wall'){
      const run=b.base*2.4+1,z=platformSize(b)[1]/2+run/2;
      mark(b.x+z*Math.sin(b.rotation),b.z+z*Math.cos(b.rotation),b.id==='taihedian'?16:Math.min(10,b.width*.4),run,b.rotation);
      if(b.id==='taihedian')for(const dx of [-28,28])mark(b.x+dx*Math.cos(b.rotation)+z*Math.sin(b.rotation),b.z-dx*Math.sin(b.rotation)+z*Math.cos(b.rotation),8,run,b.rotation);
    }
    for(const w of walls)mark(w.x,w.z,w.length,w.thickness,w.rotation,w.opening);
    for(const s of [-1,1])mark(20+s*68,501,17,66,0);
    for(let x=-118;x<120;x+=2){if([-64,-32,0,32,64].some(b=>Math.abs(b-x)<3))continue;mark(x,368+Math.sin(x/85)*11,2,9,0);}
  }
  private index(p:Waypoint){return Math.round((p.z+510)/2)*this.width+Math.round((p.x+390)/2);}
  private point(i:number):Waypoint{return {x:i%this.width*2-390,z:Math.floor(i/this.width)*2-510};}
  findPath(from:Waypoint,to:Waypoint):Waypoint[]{
    let start=this.index(from),end=this.index(to);
    const closest=(i:number)=>{if(!this.blocked[i])return i;for(let r=1;r<8;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){const q=i+dz*this.width+dx;if(q>=0&&q<this.blocked.length&&!this.blocked[q])return q;}return -1;};
    start=closest(start);end=closest(end);if(start<0||end<0)return [];
    const previous=new Int32Array(this.blocked.length).fill(-1),queue=new Int32Array(this.blocked.length);let head=0,tail=1;queue[0]=start;previous[start]=start;
    while(head<tail){const i=queue[head++];if(i===end)break;const col=i%this.width;
      for(const q of [col>0?i-1:-1,col<this.width-1?i+1:-1,i-this.width,i+this.width])if(q>=0&&q<previous.length&&!this.blocked[q]&&previous[q]===-1){previous[q]=i;queue[tail++]=q;}
    }
    if(previous[end]===-1)return [];
    const path:Waypoint[]=[];let i=end;while(i!==start){path.push(this.point(i));i=previous[i];}path.push(this.point(start));return path.reverse();
  }
}
