import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { groundColliders } from './GroundColliders';
const ground=groundColliders();
export function Terrain(){return <>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.2,0]} receiveShadow><planeGeometry args={[1600,1700]}/><meshStandardMaterial color="#8e9182" roughness={1}/></mesh>
  <RigidBody type="fixed" colliders={false}>{ground.map((c,i)=><CuboidCollider key={i} args={c.half} position={c.position}/>)}</RigidBody>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.012,0]} receiveShadow><planeGeometry args={[753,961]}/><meshStandardMaterial color="#b5ac98" roughness={0.95}/></mesh>
</>;}
