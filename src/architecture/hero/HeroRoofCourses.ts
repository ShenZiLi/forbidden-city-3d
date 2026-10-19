import type { HeroRoof } from './HeroAssetSpec';
import { roofPoint } from './HeroRoofGeometry';

export type HeroTileDetail='near'|'mid'|'none';
export interface HeroRoofCourse { side:number; cross:number; startT:number; points:[number,number,number][] }

/** Parallel drainage lines: front/back keep world X, hip ends keep world Z. */
export function heroRoofCourses(r:HeroRoof,detail:HeroTileDetail='near'):HeroRoofCourse[]{
  if(detail==='none')return [];
  const courses:HeroRoofCourse[]=[],spacing=detail==='near'?.43:.68,maxSegments=detail==='near'?30:10;
  for(let side=0;side<4;side++){
    const front=side%2===0,half=front?r.width/2:r.depth/2,initialHalf=front?r.ridgeHalf:.06;
    const count=Math.ceil(half*2/spacing);
    for(let i=0;i<count;i++){
      const cross=-half+(i+.5)*half*2/count,startT=Math.max(.012,(Math.abs(cross)-initialHalf)/(half-initialHalf));
      const segments=Math.max(1,Math.ceil((1-startT)*maxSegments)),points:[number,number,number][]=[];
      for(let j=0;j<=segments;j++){
        const t=startT+(1-startT)*j/segments,w=r.ridgeHalf+(r.width/2-r.ridgeHalf)*t,d=.06+(r.depth/2-.06)*t;
        const f=side===0?(cross+w)/(2*w):side===1?(cross+d)/(2*d):side===2?(w-cross)/(2*w):(d-cross)/(2*d);
        points.push(roofPoint(r,t,side,Math.max(0,Math.min(1,f))));
      }
      courses.push({side,cross,startT,points});
    }
  }
  return courses;
}
