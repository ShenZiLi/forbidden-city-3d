import { groundMaterial, materials } from '../architecture/materials';
import { Parts } from '../architecture/Instances';
import { unitBox } from '../architecture/materials';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { Part } from '../architecture/Instances';
// River path is an approximation of the inner Golden Water River; bridges keep a continuous walking surface.
const riverZ=(x:number)=>368+Math.sin(x/85)*11;
const river:Part[]=Array.from({length:80},(_,i)=>{const x=-118+i*3;return {position:[x,.023,riverZ(x)],scale:[3.2,.03,9]};});
const rails:Part[]=[];
for(const x of [-64,-32,0,32,64])for(const s of [-1,1])for(let j=0;j<10;j++){
  rails.push({position:[x+s*3.3,.75,riverZ(x)-8+j*1.8],scale:[.22,1.4,.22]});
  if(j<9)rails.push({position:[x+s*3.3,1.05,riverZ(x)-7.1+j*1.8],scale:[.2,.16,1.8]});
}
export function GroundSurface(){return <>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.015,0]} receiveShadow material={groundMaterial}><planeGeometry args={[753,961]}/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[6,.02,130]} receiveShadow material={materials.marble}><planeGeometry args={[11,300]}/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.02,-423]} receiveShadow material={groundMaterial}><planeGeometry args={[140,82]}/></mesh>
  <Parts parts={river} geometry={unitBox} material={newWaterMaterial} shadows={false}/>
  <Parts parts={rails} geometry={unitBox} material={materials.marble}/>
  <mesh position={[20,.04,514]} material={materials.stone} receiveShadow><boxGeometry args={[18,.08,68]}/></mesh>
  <RigidBody type="fixed" colliders={false}>
    {[-64,-32,0,32,64].map(x=><group key={x} position={[x,0,riverZ(x)]}><mesh receiveShadow material={materials.marble} position={[0,.06,0]}><boxGeometry args={[6.6,.12,19]}/></mesh><CuboidCollider position={[0,.06,0]} args={[3.3,.06,9.5]}/>{[-1,1].map(s=><CuboidCollider key={s} position={[s*3.3,.75,0]} args={[.15,.7,9]}/>)}</group>)}
    {/* River edges block entry except at five real bridge locations. */}
    {Array.from({length:80},(_,i)=>{const x=-118+i*3;if([-64,-32,0,32,64].some(b=>Math.abs(b-x)<4.8))return null;return <CuboidCollider key={i} position={[x,.35,riverZ(x)]} args={[1.5,.35,4.5]}/>;})}
  </RigidBody>
</>;}
import { MeshStandardMaterial } from 'three';
const newWaterMaterial=new MeshStandardMaterial({color:'#637f76',roughness:.25,metalness:.15});
