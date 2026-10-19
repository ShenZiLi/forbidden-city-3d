import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { HeroRoof } from './HeroAssetSpec';

export function roofPoint(r:HeroRoof,t:number,side:number,f:number):[number,number,number]{
  // Course interpolation can overshoot the endpoint by a floating-point ULP.
  // Clamp before the fractional roof power to keep the eave finite.
  t=Math.max(0,Math.min(1,t));f=Math.max(0,Math.min(1,f));
  const w=r.ridgeHalf+(r.width/2-r.ridgeHalf)*t,d=.06+(r.depth/2-.06)*t;
  const corners=[[-w,-d],[w,-d],[w,d],[-w,d],[-w,-d]];
  const a=corners[side],b=corners[side+1];
  const y=r.y+r.rise*Math.pow(1-t,1.55)+r.cornerLift*Math.pow(Math.abs(2*f-1),8)*Math.pow(t,4);
  return [a[0]+(b[0]-a[0])*f,y,a[1]+(b[1]-a[1])*f];
}

/** Closed roof shell: separate outer skin, inner soffit, thick fascia and a narrow closed ridge. */
export function heroRoofGeometry(r:HeroRoof,rings=18,segments=18):BufferGeometry{
  const vertices:number[]=[],uv:number[]=[],indices:number[]=[],n=segments*4,layer=(rings+1)*n;
  for(let skin=0;skin<2;skin++)for(let j=0;j<=rings;j++)for(let i=0;i<n;i++){
    const p=roofPoint(r,j/rings,Math.floor(i/segments),(i%segments)/segments);
    vertices.push(p[0],p[1]-skin*r.thickness,p[2]);uv.push(p[0]/2,p[2]/2);
  }
  for(let skin=0;skin<2;skin++)for(let j=0;j<rings;j++)for(let i=0;i<n;i++){
    const a=skin*layer+j*n+i,b=skin*layer+j*n+(i+1)%n,c=a+n,d=b+n;
    if(skin===0)indices.push(a,b,c,b,d,c);else indices.push(a,c,b,b,c,d);
  }
  for(const j of [0,rings])for(let i=0;i<n;i++){
    const a=j*n+i,b=j*n+(i+1)%n,c=a+layer,d=b+layer;
    if(j===rings)indices.push(a,c,b,b,c,d);else indices.push(a,b,c,b,d,c);
  }
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(indices);
  const outerCount=rings*n*6;
  g.addGroup(0,outerCount,0);g.addGroup(outerCount,indices.length-outerCount,1);
  g.computeVertexNormals();return g;
}
