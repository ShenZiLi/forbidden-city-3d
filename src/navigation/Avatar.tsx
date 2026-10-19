import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { runtime } from '../app/GameContext';
export function Avatar({visible}:{visible:boolean}){
  const left=useRef<Group>(null),right=useRef<Group>(null),arms=useRef<Group>(null);const phase=useRef(0);
  useFrame((_,dt)=>{phase.current+=dt*(runtime.running?12:7);const swing=runtime.moving?Math.sin(phase.current)*.55:0;if(left.current)left.current.rotation.x=swing;if(right.current)right.current.rotation.x=-swing;if(arms.current)arms.current.rotation.x=-swing*.35;});
  return <group visible={visible} position={[0,-.87,0]}>
    <mesh position={[0,1.55,0]} castShadow><sphereGeometry args={[.15,12,10]}/><meshStandardMaterial color="#c9ad91" roughness={.9}/></mesh>
    <mesh position={[0,1.15,0]} castShadow><capsuleGeometry args={[.22,.4,4,8]}/><meshStandardMaterial color="#c9c3ad" roughness={.95}/></mesh>
    {[{ref:left,x:-.12},{ref:right,x:.12}].map(({ref,x},i)=><group key={i} ref={ref} position={[x,.83,0]}><mesh position={[0,-.32,0]} castShadow><capsuleGeometry args={[.09,.45,3,8]}/><meshStandardMaterial color="#394745" roughness={.9}/></mesh><mesh position={[0,-.72,-.045]} castShadow><boxGeometry args={[.16,.13,.27]}/><meshStandardMaterial color="#39372f"/></mesh></group>)}
    <group ref={arms}>{[-1,1].map(s=><mesh key={s} position={[s*.3,1.11,0]} castShadow><capsuleGeometry args={[.075,.4,3,8]}/><meshStandardMaterial color="#b7b6a4" roughness={.95}/></mesh>)}</group>
  </group>;
}
