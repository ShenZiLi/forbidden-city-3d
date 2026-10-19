import type { Building } from '../data/types';
import { gateSegments } from '../navigation/CollisionSystem';
import { RoofSystem } from './RoofSystem';
import { materials, unitBox, unitColumn } from './materials';
import { Parts } from './Instances';
import { FacadeDetails } from './FacadeDetails';
import { GateArch } from './GateArch';
export function Gate({building:b,detail=true}:{building:Building;detail?:boolean}){
  const h=b.base+b.height*.6,clear=Math.max(4.5,b.base*.75);
  const segments=gateSegments(b.width*.88,b.depth*.8,b.base>5?b.base:h,b.passageWidth??4,clear);
  return <group position={[b.x,0,b.z]} rotation={[0,b.rotation,0]}>
    {segments.map((c,i)=><mesh key={i} position={c.position} scale={c.half.map(v=>v*2) as [number,number,number]} material={b.base>5?materials.plaster:materials.red} geometry={unitBox} castShadow receiveShadow dispose={null}/>)}
    {b.base>5&&<GateArch opening={b.passageWidth??4} clear={clear} depth={b.depth*.8}/>}
    {b.base>5&&<><mesh geometry={unitBox} material={materials.red} position={[0,(b.base+h)/2,0]} scale={[b.width*.88,h-b.base,b.depth*.8]} castShadow dispose={null}/><Parts geometry={unitBox} material={materials.teal} parts={[-1,1].map(s=>({position:[0,h-.5,s*b.depth*.41],scale:[b.width*.94,.7,.4]}))}/>{detail&&<Parts geometry={unitBox} material={materials.gold} shadows={false} parts={Array.from({length:b.bays*6},(_,i)=>[-1,1].map(s=>({position:[-b.width*.42+i*b.width*.84/(b.bays*6-1),(h+b.base)/2,s*b.depth*.405] as [number,number,number],scale:[.065,(h-b.base)*.7,.08] as [number,number,number]}))).flat()}/>}</>}
    {detail&&<Parts geometry={unitColumn} material={materials.red} parts={[-1,1].flatMap(x=>[-1,1].map(z=>({position:[x*((b.passageWidth??4)/2+.4),clear/2,z*b.depth*.41] as [number,number,number],scale:[.32,clear,.32] as [number,number,number]})))}/>}
    {detail&&b.base>5&&<FacadeDetails width={b.width} depth={b.depth} height={h-b.base} base={b.base} bays={b.bays}/>}
    <RoofSystem width={b.width} depth={b.depth} height={b.height*.4} type={b.roof} y={h} detail={detail}/>
  </group>;
}
