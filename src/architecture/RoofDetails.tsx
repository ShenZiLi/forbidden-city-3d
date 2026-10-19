import { useMemo } from 'react';
import { CylinderGeometry, CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import { Parts } from './Instances';
import type { Part } from './Instances';
import { materials } from './materials';
const tileEnd=new CylinderGeometry(.105,.105,.52,8,1,true,Math.PI/2,Math.PI);
const curledFinial=new TubeGeometry(new CatmullRomCurve3([
  new Vector3(0,0,0),new Vector3(.12,.45,0),new Vector3(.35,.92,0),new Vector3(.32,1.27,0),new Vector3(-.05,1.43,0),new Vector3(-.28,1.22,0),
]),16,.19,8,false);
/** Repeated open ceramic tile ends at the eaves; batched in a single draw call per roof tier. */
export function EaveTiles({width,depth,height}:{width:number;depth:number;height:number}){
  const parts=useMemo(()=>{
    const p:Part[]=[];
    for(const side of [-1,1]){
      const count=Math.max(3,Math.floor(width/.29));
      for(let i=0;i<count;i++){const x=-width/2+(i+.5)*width/count,edge=Math.pow(Math.abs(x/(width/2)),7)*Math.min(1.1,height*.16);p.push({position:[x,edge+.03,side*(depth/2-.15)],scale:[1,1,1],rotation:[Math.PI/2,0,0]});}
      const ends=Math.max(3,Math.floor(depth/.29));
      for(let i=0;i<ends;i++){const z=-depth/2+(i+.5)*depth/ends,edge=Math.pow(Math.abs(z/(depth/2)),7)*Math.min(1.1,height*.16);p.push({position:[side*(width/2-.15),edge+.03,z],scale:[1,1,1],rotation:[Math.PI/2,0,Math.PI/2]});}
    }return p;
  },[width,depth,height]);
  return <Parts geometry={tileEnd} material={materials.roof} parts={parts} shadows={false}/>;
}
export function RidgeFinial({x,y,side}:{x:number;y:number;side:number}){
  return <group position={[x,y,0]} scale={[side,1,1]}><mesh geometry={curledFinial} material={materials.roof} castShadow dispose={null}/><mesh position={[.06,.18,0]} material={materials.roof}><sphereGeometry args={[.31,12,8]}/></mesh></group>;
}
