import { useMemo } from 'react';
import type { Building } from '../data/types';
import { RoofSystem } from './RoofSystem';
import { DougongSystem } from './DougongSystem';
import { Parts } from './Instances';
import type { Part } from './Instances';
import { materials, unitBox, unitColumn } from './materials';
import { platformSize } from '../navigation/CollisionSystem';
import { Staircase } from './Staircase';
import { FacadeDetails } from './FacadeDetails';
export function PalaceBuilding({building:b}:{building:Building}){
  const wallHeight=b.height*.59;
  const {columns,lattice,beams,rails}=useMemo(()=>{
    const columns:Part[]=[],lattice:Part[]=[],beams:Part[]=[],rails:Part[]=[];
    for(let i=0;i<=b.bays;i++)for(const side of [-1,1]){
      const x=-b.width*.44+i*b.width*.88/b.bays;
      columns.push({position:[x,b.base+wallHeight/2,side*b.depth*.43],scale:[Math.max(.17,b.width*.007),wallHeight,Math.max(.17,b.width*.007)]});
    }
    for(const side of [-1,1]){
      beams.push({position:[0,b.base+wallHeight,side*b.depth*.43],scale:[b.width*.94,.6,.5]});
      for(let i=0;i<b.bays;i++){
        const x=-b.width*.44+(i+.5)*b.width*.88/b.bays,bay=b.width*.77/b.bays;
        for(let j=0;j<7;j++)lattice.push({position:[x-bay/2+j*bay/6,b.base+wallHeight*.49,side*b.depth*.405],scale:[.065,wallHeight*.73,.12]});
        for(let j=0;j<5;j++)lattice.push({position:[x,b.base+wallHeight*(.19+j*.15),side*b.depth*.405],scale:[bay,.065,.12]});
      }
    }
    const [pw,pd]=platformSize(b);
    if(b.base>1)for(const sx of [-1,1])for(let i=0;i<Math.floor(pd/2.6);i++){
      const z=-pd/2+i*2.6;
      rails.push({position:[sx*(pw/2-.3),b.base+.65,z],scale:[.26,1.3,.26]});
      rails.push({position:[sx*(pw/2-.3),b.base+.9,z+1.25],scale:[.16,.18,2.5]});
      rails.push({position:[sx*(pw/2-.3),b.base+.4,z+1.25],scale:[.13,.16,2.5]});
    }
    return {columns,lattice,beams,rails};
  },[b,wallHeight]);
  const [pw,pd]=platformSize(b);
  if(b.collision==='passage')return null;
  return <group position={[b.x,0,b.z]} rotation={[0,b.rotation,0]}>
    <mesh position={[0,b.base/2,0]} geometry={unitBox} material={materials.marble} scale={[pw,b.base,pd]} castShadow receiveShadow dispose={null}/>
    {b.base>2&&[.33,.66].map(f=><mesh key={f} position={[0,b.base*f,0]} geometry={unitBox} material={materials.marble} scale={[pw+.5,.18,pd+.5]} dispose={null}/>)}
    <mesh position={[0,b.base+wallHeight/2,0]} geometry={unitBox} material={materials.red} scale={[b.width*.86,wallHeight,b.depth*.8]} castShadow receiveShadow dispose={null}/>
    <Parts parts={columns} geometry={unitColumn} material={materials.red}/>
    <FacadeDetails width={b.width} depth={b.depth} height={wallHeight} base={b.base} bays={b.bays}/>
    <Parts parts={beams} geometry={unitBox} material={materials.teal}/>
    <Parts parts={rails} geometry={unitBox} material={materials.marble}/>
    <DougongSystem width={b.width} depth={b.depth} y={b.base+wallHeight-.3} bays={b.bays}/>
    <RoofSystem width={b.width} depth={b.depth} height={b.height*.4} type={b.roof} y={b.base+wallHeight}/>
    <Staircase height={b.base} run={b.base*2.4+1} width={b.id==='taihedian'?16:Math.min(10,b.width*.4)} z={pd/2}/>
    {b.id==='taihedian'&&[-1,1].map(s=><group key={s} position={[s*28,0,0]}><Staircase height={b.base} run={b.base*2.4+1} width={8} z={pd/2}/></group>)}
  </group>;
}
