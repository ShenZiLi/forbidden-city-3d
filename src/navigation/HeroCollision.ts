import { heroColumnGrid,heroStairParts,taiheAssetSpec as spec } from '../architecture/hero/HeroAssetSpec';
import type { HeroBox } from '../architecture/hero/HeroAssetSpec';
/** Shared authored terrace/stair dimensions drive physics as well as visual construction. */
export function buildHeroColliders():HeroBox[]{
  const boxes:HeroBox[]=[...spec.platformColliders,spec.bodyCollider];
  for(const stair of spec.stairs)for(const part of heroStairParts(stair))boxes.push({position:part.position,half:part.scale.map(v=>v/2) as [number,number,number]});
  for(const t of spec.terraces){
    for(const side of [-1,1]){
      const count=Math.ceil((t.width-.8)/2.35),step=(t.width-.8)/count;
      for(let i=0;i<count;i++){
        const x=-(t.width-.8)/2+(i+.5)*step,left=x-step/2,right=x+step/2;
        if(side===1&&spec.stairs.filter(f=>f.top===t.top).some(f=>right>f.x-f.width/2-.35&&left<f.x+f.width/2+.35))continue;
        boxes.push({position:[x,t.top+.63,side*(t.depth/2-.35)],half:[step/2,.63,.12]});
      }
      boxes.push({position:[side*(t.width/2-.35),t.top+.63,0],half:[.12,.63,(t.depth-.8)/2]});
    }
  }
  const grid=heroColumnGrid();
  for(const x of grid.x)for(const side of [-1,1])boxes.push({position:[x,8.51+10.12/2,side*18.5],half:[.46,10.12/2,.46]});
  for(const z of grid.z.slice(1,-1))for(const side of [-1,1])boxes.push({position:[side*31.98,8.51+10.12/2,z],half:[.46,10.12/2,.46]});
  return boxes;
}
export const heroColliders=buildHeroColliders();
