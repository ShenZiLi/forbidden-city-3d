import { buildings, destinations, regions, walls } from '../data/worldManifest';
import type { Building } from '../data/types';
import { insideBounds, toLocal } from '../world/WorldCoordinates';
import { heroColliders } from './HeroCollision';
export type BoxCollider = { position: [number,number,number]; half: [number,number,number] };
export const PLAYER = { radius:0.32, halfHeight:0.55, eye:1.65, center:0.87, speed:3.2, runSpeed:7.0, stepHeight:0.24 };
export function gateSegments(width:number, depth:number, height:number, opening:number, clearHeight:number):BoxCollider[] {
  const side=(width-opening)/2;
  return [
    {position:[-(opening+side)/2,height/2,0],half:[side/2,height/2,depth/2]},
    {position:[(opening+side)/2,height/2,0],half:[side/2,height/2,depth/2]},
    {position:[0,(height+clearHeight)/2,0],half:[opening/2,(height-clearHeight)/2,depth/2]},
  ];
}
export function platformSize(b:Building):[number,number] {
  return b.id==='taihedian'?[100,70]:b.major?[b.width+7,b.depth+8]:[b.width*.96,b.depth*.96];
}
export function buildingColliders(b:Building):BoxCollider[] {
  if(b.id==='taihedian')return heroColliders;
  if(b.collision==='passage')return gateSegments(b.width*.88,b.depth*.8,b.base+b.height*.65,b.passageWidth??4,Math.max(4.5,b.base*.75));
  if(b.parts?.length)return b.parts.map(p=>({position:[p.x,(b.base+b.height*.6)/2,p.z],half:[p.width/2,(b.base+b.height*.6)/2,p.depth/2]}));
  if(b.kind==='platform')return [{position:[0,b.base/2,0],half:[b.width/2,b.base/2,b.depth/2]}];
  if(b.kind==='wall')return [{position:[0,b.height/2,0],half:[b.width/2,b.height/2,b.depth/2]}];
  const [w,d]=platformSize(b);
  return [
    {position:[0,b.base/2,0],half:[w/2,b.base/2,d/2]},
    {position:[0,b.base+b.height*.31,0],half:[b.width*.43,b.height*.31,b.depth*.4]},
  ];
}
export function isSafeSpawn(position:[number,number,number]) {
  const p={x:position[0],z:position[2]};
  if(!insideBounds(p,{minX:-430,maxX:430,minZ:-550,maxZ:565},1))return false;
  if(buildings.some(b=>{const l=toLocal(p,b);return buildingColliders(b).some(c=>Math.abs(l.x-c.position[0])<c.half[0]+PLAYER.radius&&Math.abs(l.z-c.position[2])<c.half[2]+PLAYER.radius&&c.position[1]-c.half[1]<1.8);} ))return false;
  return !walls.some(w=>{const l=toLocal(p,w);return Math.abs(l.z)<w.thickness/2+PLAYER.radius&&Math.abs(l.x)<w.length/2+PLAYER.radius&&(!w.opening||Math.abs(l.x)>w.opening/2-PLAYER.radius);});
}
export function validateWorld() {
  const errors:string[]=[];const ids=new Set<string>();
  for(const b of buildings){
    if(ids.has(b.id))errors.push(`重复 ID: ${b.id}`);ids.add(b.id);
    if(![b.x,b.z,b.width,b.depth,b.height,b.rotation,b.base].every(Number.isFinite))errors.push(`非数值: ${b.id}`);
    if(b.width<=0||b.depth<=0||b.height<=0||b.base<0)errors.push(`尺寸异常: ${b.id}`);
    if(!regions.find(r=>r.id===b.region))errors.push(`区域缺失: ${b.id}`);
    if(!b.sources.length||b.model!=='procedural:v1')errors.push(`资源或来源缺失: ${b.id}`);
    if(b.enterable&&b.collision!=='passage')errors.push(`可进入建筑缺少入口: ${b.id}`);
  }
  for(const d of destinations)if(!isSafeSpawn(d.position))errors.push(`不安全传送点: ${d.name}`);
  return errors;
}
