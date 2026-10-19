import { useMemo } from 'react';
import { RigidBody, CylinderCollider, CuboidCollider } from '@react-three/rapier';
import { Parts } from '../architecture/Instances';
import type { Part } from '../architecture/Instances';
import { materials, unitColumn, unitSphere, unitBox } from '../architecture/materials';
import { RoofSystem } from '../architecture/RoofSystem';
// Ornamental planting only. These are not surveyed locations of heritage trees.
const treePositions:[number,number][]=[[-58,-402],[-48,-427],[-60,-451],[-32,-447],[40,-444],[53,-415],[57,-453],[27,-391],[-36,-389],[-64,-435],[62,-431],[32,-458],[-52,-392],[52,-396]];
export function Environment(){
  const {trunks,crowns,stones}=useMemo(()=>{
    const trunks:Part[]=[],crowns:Part[]=[],stones:Part[]=[];
    treePositions.forEach(([x,z],i)=>{const h=7+i%4;trunks.push({position:[x,h/2,z],scale:[.35,h,.35]});for(let j=0;j<3;j++)crowns.push({position:[x+Math.sin(i+j)*1.2,h-1+j*1.6,z+Math.cos(i+j)*1.2],scale:[2.7-j*.3,2.5,2.8-j*.3]});});
    for(let i=0;i<12;i++)stones.push({position:[-62+i*1.2,.8+i%3*.4,-418+Math.sin(i)*3],scale:[1.5,1.6+i%3*.8,1.5],rotation:[i*.3,i*.7,0]});
    return {trunks,crowns,stones};
  },[]);
  return <>
    <Parts parts={trunks} geometry={unitColumn} material={materials.dark}/><Parts parts={crowns} geometry={unitSphere} material={materials.foliage}/><Parts parts={stones} geometry={unitSphere} material={materials.stone}/>
    <RigidBody type="fixed" colliders={false}>{treePositions.map(([x,z],i)=><CylinderCollider key={i} position={[x,3,z]} args={[3,.45]}/>)}<CuboidCollider position={[-56,1.4,-418]} args={[8,1.4,4]}/></RigidBody>
    {[[-376,-480],[376,-480],[-376,480],[376,480]].map(([x,z],i)=><group key={i} position={[x,10,z]}><mesh material={materials.red} position={[0,3,0]} castShadow><boxGeometry args={[11,6,11]}/></mesh><RoofSystem width={14} depth={14} height={5} type="double-gable-hip" y={6} detail={false}/></group>)}
    {/* Meridian Gate wings are explicitly approximate volumes, entered in one place here. */}
    {[-1,1].map(s=><group key={s} position={[20+s*68,0,501]}><mesh material={materials.plaster} geometry={unitBox} position={[0,6,0]} scale={[17,12,66]} castShadow dispose={null}/><mesh material={materials.red} geometry={unitBox} position={[0,15,0]} scale={[13,6,66]} castShadow dispose={null}/><group rotation={[0,Math.PI/2,0]}><RoofSystem width={68} depth={15} height={4.5} type="gable" y={18} detail={false}/></group><RigidBody type="fixed" colliders={false}><CuboidCollider position={[0,9,0]} args={[8.5,9,33]}/></RigidBody></group>)}
    {/* The moat lies below grade; the outer lawn is not included in the walkable palace tour. */}
    {[-1,1].flatMap(s=>[<mesh key={`moat-v${s}`} position={[s*409,-.04,0]}><boxGeometry args={[52,.1,1070]}/><meshStandardMaterial color="#5d7b76" roughness={.28}/></mesh>,<mesh key={`moat-h${s}`} position={[0,-.04,s*513]}><boxGeometry args={[780,.1,52]}/><meshStandardMaterial color="#5d7b76" roughness={.28}/></mesh>])}
  </>;
}
