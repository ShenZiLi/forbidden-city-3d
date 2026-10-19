import { BufferGeometry, Float32BufferAttribute } from 'three';

export type HeroStoneDetail='near'|'mid';
type Profile=readonly (readonly [radius:number,y:number])[];
export interface HeroStoneGeometries { columnBase:BufferGeometry; postShaft:BufferGeometry; postCap:BufferGeometry; railPanel:BufferGeometry }

/** Original S3 section reconstruction. No historic relief motif or measured component proportion is asserted. */
export const stoneReconstruction={
  columnBase:'S3: 盘足、鼓腹、颈部的旋转截面；轮廓比例是原创美术重构。',
  postCap:'S3: 八角中性层级柱头，无龙纹、莲花或文物精雕复原声明。',
  railPanel:'S3: 双面内凹素面栏板与倒角边框，没有添加未经核实纹样。',
};

/** Closed revolved section with explicit single cap vertices: no degenerate axis triangles. */
function revolve(profile:Profile,segments:number,faceted=false):BufferGeometry{
  const vertices:number[]=[],uv:number[]=[],indices:number[]=[],start=faceted?Math.PI/8:0;
  for(const [radius,y] of profile)for(let i=0;i<segments;i++){
    const theta=start+i/segments*Math.PI*2;
    vertices.push(Math.sin(theta)*radius,y,Math.cos(theta)*radius);uv.push(i/segments,y+.5);
  }
  for(let j=0;j<profile.length-1;j++)for(let i=0;i<segments;i++){
    const a=j*segments+i,b=j*segments+(i+1)%segments,c=a+segments,d=b+segments;
    indices.push(a,b,c,b,d,c);
  }
  const bottom=vertices.length/3,top=bottom+1,last=(profile.length-1)*segments;
  vertices.push(0,profile[0][1],0,0,profile.at(-1)![1],0);uv.push(.5,.5,.5,.5);
  for(let i=0;i<segments;i++){
    const next=(i+1)%segments;
    indices.push(bottom,next,i,top,last+i,last+next);
  }
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  if(!faceted)return g;
  const flat=g.toNonIndexed();g.dispose();flat.computeVertexNormals();return flat;
}

/** One closed solid panel, including both recessed fields, moulded rims, outer bevels and connecting edge. */
function railPanel(detail:HeroStoneDetail):BufferGeometry{
  const near=[
    [.365,.315,.20],[.385,.335,.24],[.405,.355,.47],[.425,.375,.50],[.48,.48,.50],[.5,.5,.40],
    [.5,.5,-.40],[.48,.48,-.50],[.425,.375,-.50],[.405,.355,-.47],[.385,.335,-.24],[.365,.315,-.20],
  ],mid=[
    [.365,.315,.20],[.405,.355,.50],[.48,.48,.50],[.5,.5,.40],
    [.5,.5,-.40],[.48,.48,-.50],[.405,.355,-.50],[.365,.315,-.20],
  ];
  const rings=detail==='near'?near:mid,vertices:number[]=[],uv:number[]=[],indices:number[]=[];
  for(const [w,h,z] of rings)for(const [x,y] of [[-w,-h],[w,-h],[w,h],[-w,h]]){vertices.push(x,y,z);uv.push(x+.5,y+.5);}
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<4;i++){
    const a=j*4+i,b=j*4+(i+1)%4,c=a+4,d=b+4;
    indices.push(a,c,b,b,c,d);
  }
  const front=vertices.length/3,back=front+1,last=(rings.length-1)*4;
  vertices.push(0,0,rings[0][2],0,0,rings.at(-1)![2]);uv.push(.5,.5,.5,.5);
  for(let i=0;i<4;i++)indices.push(front,i,(i+1)%4,back,last+(i+1)%4,last+i);
  const indexed=new BufferGeometry();indexed.setAttribute('position',new Float32BufferAttribute(vertices,3));indexed.setAttribute('uv',new Float32BufferAttribute(uv,2));indexed.setIndex(indices);
  const g=indexed.toNonIndexed();indexed.dispose();g.computeVertexNormals();return g;
}

/** Unit envelopes, centred on the origin. Instances provide physical dimensions, so the two detail levels do not move walkways. */
export function heroStoneGeometries(detail:HeroStoneDetail='near'):HeroStoneGeometries{
  const base:Profile=detail==='near'?[
    [.46,-.5],[.49,-.46],[.5,-.37],[.5,-.28],[.46,-.22],[.42,-.16],[.45,-.08],
    [.47,.03],[.45,.16],[.4,.32],[.38,.4],[.39,.46],[.39,.5],
  ]:[
    [.46,-.5],[.5,-.37],[.5,-.28],[.42,-.16],[.47,.03],[.4,.32],[.39,.5],
  ];
  const cap:Profile=detail==='near'?[
    [.28,-.5],[.28,-.35],[.42,-.25],[.5,-.05],[.5,.10],[.44,.28],[.32,.40],[.18,.5],
  ]:[
    [.28,-.5],[.5,-.05],[.5,.1],[.32,.40],[.18,.5],
  ];
  const octagon=(p:Profile):Profile=>p.map(([r,y])=>[r/Math.cos(Math.PI/8),y]);
  return {
    columnBase:revolve(base,detail==='near'?32:12),
    postShaft:revolve(octagon([[.5,-.5],[.5,.5]]),8,true),
    postCap:revolve(octagon(cap),8,true),
    railPanel:railPanel(detail),
  };
}
