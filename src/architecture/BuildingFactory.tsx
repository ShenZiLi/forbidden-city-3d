import { useEffect, useMemo, useState } from 'react';
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier';
import { buildings } from '../data/worldManifest';
import { buildingColliders, platformSize } from '../navigation/CollisionSystem';
import { useRegions } from '../streaming/RegionStreamer';
import { runtime, useGame } from '../app/GameContext';
import { PalaceBuilding } from './PalaceBuilding';
import { Gate } from './Gate';
import { Parts } from './Instances';
import type { Part } from './Instances';
import { materials, unitBox } from './materials';
import { roofGeometry } from './RoofSystem';
import { Staircase } from './Staircase';
import type { RoofType } from '../data/types';
import { HeroPalace } from './hero/HeroPalace';
import { HeroSilhouette } from './hero/HeroSilhouette';
const roofKinds=['hip','gable','gable-hip','pavilion','truncated-hip'] as const;
type FarRoof=(typeof roofKinds)[number];
const roofGeometries=Object.fromEntries(roofKinds.map(k=>[k,roofGeometry(1,1,1,k,6)])) as Record<FarRoof,ReturnType<typeof roofGeometry>>;
const farRoof=(type:RoofType):FarRoof=>type==='double-hip'?'hip':type==='double-gable-hip'?'gable-hip':type;
function FarBuildings({exclude}:{exclude:Set<string>}){
  const {bodies,roofs,bases,posts,beams,windows}=useMemo(()=>{
    const bodies:Part[]=[],bases:Part[]=[],posts:Part[]=[],beams:Part[]=[],windows:Part[]=[];
    const roofs:Record<FarRoof,Part[]>={hip:[],gable:[],'gable-hip':[],pavilion:[],'truncated-hip':[]};
    for(const b of buildings){if(b.id==='taihedian'||exclude.has(b.id)||b.collision==='passage')continue;
      const rotation:[number,number,number]=[0,b.rotation,0];
      if(b.parts?.length||b.kind==='platform'||b.kind==='wall'){
        const parts=b.parts?.length?b.parts:[{x:0,z:0,width:b.width,depth:b.depth}];
        for(const p of parts){const x=b.x+p.x*Math.cos(b.rotation)+p.z*Math.sin(b.rotation),z=b.z-p.x*Math.sin(b.rotation)+p.z*Math.cos(b.rotation),h=b.base+b.height*.6;
          (b.kind==='platform'?bases:bodies).push({position:[x,h/2,z],scale:[p.width,h,p.depth],rotation});
          if(b.kind!=='platform'&&b.kind!=='wall')roofs.gable.push({position:[x,h,z],scale:[p.width+.5,b.height*.3,p.depth+.5],rotation});
        }continue;
      }
      const [pw,pd]=platformSize(b);
      bases.push({position:[b.x,b.base/2,b.z],scale:[pw,b.base,pd],rotation});
      bodies.push({position:[b.x,b.base+b.height*.3,b.z],scale:[b.width*.86,b.height*.6,b.depth*.8],rotation});
      roofs[farRoof(b.roof)].push({position:[b.x,b.base+b.height*.59,b.z],scale:[b.width+3,b.height*.4,b.depth+3],rotation});
      if(b.roof.startsWith('double'))roofs[farRoof(b.roof)].push({position:[b.x,b.base+b.height*.47,b.z],scale:[b.width+5,b.height*.16,b.depth+5],rotation});
      const c=Math.cos(b.rotation),s=Math.sin(b.rotation),count=Math.min(7,b.bays),h=b.height*.59;
      for(const side of [-1,1]){
        const z=side*b.depth*.408;
        beams.push({position:[b.x+z*s,b.base+h-.25,b.z+z*c],scale:[b.width*.94,.5,.3],rotation});
        for(let i=0;i<count;i++){
          const x=-b.width*.43+(i+.5)*b.width*.86/count;
          windows.push({position:[b.x+x*c+z*s,b.base+h*.48,b.z-x*s+z*c],scale:[b.width*.7/count,h*.66,.07],rotation});
        }
        for(let i=0;i<=count;i++){
          const x=-b.width*.44+i*b.width*.88/count;
          posts.push({position:[b.x+x*c+z*s,b.base+h/2,b.z-x*s+z*c],scale:[Math.max(.22,b.width*.013),h,.28],rotation});
        }
      }
    }
    return {bodies,roofs,bases,posts,beams,windows};
  },[exclude]);
  return <><Parts geometry={unitBox} material={materials.red} parts={bodies}/>{roofKinds.map(k=><group key={k}><Parts geometry={roofGeometries[k]} material={materials.roof} parts={roofs[k]}/><Parts geometry={roofGeometries[k]} material={materials.soffit} parts={roofs[k]}/></group>)}<Parts geometry={unitBox} material={materials.marble} parts={bases}/><Parts geometry={unitBox} material={materials.dark} parts={windows} shadows={false}/><Parts geometry={unitBox} material={materials.red} parts={posts} shadows={false}/><Parts geometry={unitBox} material={materials.teal} parts={beams} shadows={false}/></>;
}
export function BuildingFactory(){
  const {loaded}=useRegions();const {quality,mode}=useGame();const [location,setLocation]=useState([runtime.position[0],runtime.position[2]]);
  useEffect(()=>{const t=setInterval(()=>setLocation(old=>Math.hypot(old[0]-runtime.position[0],old[1]-runtime.position[2])>12?[runtime.position[0],runtime.position[2]]:old),700);return()=>clearInterval(t);},[]);
  const detailed=useMemo(()=>new Set(buildings.filter(b=>!b.parts?.length&&b.kind!=='platform'&&b.kind!=='wall'&&loaded.has(b.region)&&Math.hypot(b.x-location[0],b.z-location[1])<(mode==='overview'?0:quality==='high'?160:quality==='balanced'?105:55)).map(b=>b.id)),[loaded,location,quality,mode]);
  return <><FarBuildings exclude={detailed}/>{!detailed.has('taihedian')&&<HeroSilhouette building={buildings.find(b=>b.id==='taihedian')!}/>}{buildings.filter(b=>b.collision==='passage').map(b=><Gate key={b.id} building={b} detail={detailed.has(b.id)}/>)}{buildings.filter(b=>detailed.has(b.id)&&b.collision!=='passage').map(b=>b.id==='taihedian'?<HeroPalace key={b.id} building={b} tileDetail={quality==='high'?'near':quality==='balanced'?'mid':'none'} stoneDetail={quality==='high'?'near':'mid'}/>:<PalaceBuilding key={b.id} building={b}/>)}</>;
}
/** Physics is persistent and independent of streamed visual detail. */
export function BuildingCollisions(){return <RigidBody type="fixed" colliders={false}>{buildings.map(b=>{
  const [,pd]=platformSize(b);
  return <group key={b.id} position={[b.x,0,b.z]} rotation={[0,b.rotation,0]}>
    {buildingColliders(b).map((c,i)=><CuboidCollider key={i} position={c.position} args={c.half}/>)}
    {b.id!=='taihedian'&&b.collision==='solid'&&!b.parts?.length&&b.kind!=='platform'&&b.kind!=='wall'&&<><Staircase height={b.base} run={b.base*2.4+1} width={Math.min(10,b.width*.4)} z={pd/2} colliders/>
    {b.id==='taihedian'&&[-1,1].map(s=><group key={s} position={[s*28,0,0]}><Staircase height={b.base} run={b.base*2.4+1} width={8} z={pd/2} colliders/></group>)}
    {b.base>1&&[-1,1].map(s=><CuboidCollider key={s} position={[s*(platformSize(b)[0]/2-.3),b.base+.65,0]} args={[.2,.65,pd/2]}/>)}
    {b.major&&Array.from({length:b.bays+1},(_,i)=>[-1,1].map(s=><CylinderCollider key={`${i}-${s}`} position={[-b.width*.44+i*b.width*.88/b.bays,b.base+b.height*.3,s*b.depth*.43]} args={[b.height*.3,Math.max(.17,b.width*.007)]}/>))}
    </>}
  </group>;
})}</RigidBody>;}
