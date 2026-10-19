import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { walls } from '../data/worldManifest';
import { materials, unitBox } from './materials';
export function WallSystem(){return <>{walls.map(w=>{
  const sections=w.opening?[{x:-(w.length+w.opening)/4,len:(w.length-w.opening)/2},{x:(w.length+w.opening)/4,len:(w.length-w.opening)/2}]:[{x:0,len:w.length}];
  return <group key={w.id} position={[w.x,0,w.z]} rotation={[0,w.rotation,0]}>{sections.map((s,i)=><group key={i} position={[s.x,0,0]}>
    <mesh position={[0,w.height/2,0]} scale={[s.len,w.height,w.thickness]} geometry={unitBox} material={materials.plaster} castShadow receiveShadow dispose={null}/>
    <mesh position={[0,.65,0]} scale={[s.len,1.3,w.thickness+.1]} geometry={unitBox} material={materials.stone} receiveShadow dispose={null}/>
    <mesh position={[0,w.height+.1,0]} scale={[s.len,.4,w.thickness+.5]} geometry={unitBox} material={materials.roof} castShadow dispose={null}/>
    <RigidBody type="fixed" colliders={false}><CuboidCollider position={[0,w.height/2,0]} args={[s.len/2,w.height/2,w.thickness/2]}/></RigidBody>
  </group>)}</group>;
})}</>;}
