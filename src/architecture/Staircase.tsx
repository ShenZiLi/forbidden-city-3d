import { useMemo } from 'react';
import { CuboidCollider } from '@react-three/rapier';
import { Parts } from './Instances';
import type { Part } from './Instances';
import { materials, unitBox } from './materials';
export function stairParts(height:number,run:number,width:number):Part[]{
  const count=Math.ceil(height/.17);
  return Array.from({length:count},(_,i)=>{const rise=height*(i+1)/count;return {position:[0,rise/2,run-(i+.5)*run/count] as [number,number,number],scale:[width,rise,run/count+.015] as [number,number,number]};});
}
export function Staircase({height,run,width,z,colliders=false}:{height:number;run:number;width:number;z:number;colliders?:boolean}){
  const parts=useMemo(()=>stairParts(height,run,width),[height,run,width]);
  return <group position={[0,0,z]}>{colliders?parts.map((p,i)=><CuboidCollider key={i} position={p.position} args={[p.scale[0]/2,p.scale[1]/2,p.scale[2]/2]}/>):<Parts parts={parts} geometry={unitBox} material={materials.marble}/>}</group>;
}
