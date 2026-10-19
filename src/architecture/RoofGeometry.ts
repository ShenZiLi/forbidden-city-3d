import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { RoofType } from '../data/types';
export function roofGeometry(width:number,depth:number,height:number,roof:RoofType,segments=20) {
  const vertices:number[]=[],uvs:number[]=[],indices:number[]=[];
  const rings=12,steps=segments*4;
  const isPavilion=roof==='pavilion',isGable=roof==='gable',truncated=roof==='truncated-hip';
  for(let j=0;j<=rings;j++){
    const t=j/rings;
    const ridgeW=isPavilion?0.04:isGable?width*.49:width*.28;
    const gableHip=roof.includes('gable-hip');
    const halfW=gableHip?width*.34+Math.max(0,t-.55)/.45*width*.16:ridgeW+(width/2-ridgeW)*t;
    const halfD=(truncated?depth*.2:depth*.005)+(depth/2-(truncated?depth*.2:depth*.005))*t;
    for(let i=0;i<=steps;i++){
      const side=Math.min(3,Math.floor(i/segments)),f=(i-side*segments)/segments;
      const corners=[[-halfW,-halfD],[halfW,-halfD],[halfW,halfD],[-halfW,halfD],[-halfW,-halfD]];
      const a=corners[side],b=corners[side+1];
      const x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f;
      const curl=Math.pow(Math.abs(f-.5)*2,7)*Math.pow(t,5)*Math.min(1.1,height*.16);
      const y=height*Math.pow(1-t,1.65)+curl;
      vertices.push(x,y,z);uvs.push(x/3,z/3);
      if(j<rings&&i<steps){const a=j*(steps+1)+i,b=a+steps+1;indices.push(a,a+1,b,a+1,b+1,b);}
    }
  }
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));g.setAttribute('uv',new Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
