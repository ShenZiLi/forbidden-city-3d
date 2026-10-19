import { Euler,Quaternion,Vector3 } from 'three';
import calibration from '../../public/assets/environment/production-v3/lighting-calibration.json';
export const sunPositions={morning:[150,135,85],noon:[50,250,-50],evening:[-180,70,60]} as const;
/** r183 WebGLMaterials negates scene.environmentRotation's XYZ Euler components before sampling PMREM. */
export function environmentRotationForSun(target:readonly[number,number,number]):[number,number,number]{
  const worldDirection=new Vector3(...target).normalize(),sourceDirection=new Vector3(...calibration.sourceDirection as [number,number,number]);
  const sampleRotation=new Quaternion().setFromUnitVectors(worldDirection,sourceDirection);
  const euler=new Euler().setFromQuaternion(sampleRotation,'XYZ');
  return [-euler.x,-euler.y,-euler.z];
}
