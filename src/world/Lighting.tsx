import { useRef,useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Environment } from '@react-three/drei';
import { DirectionalLight, Object3D } from 'three';
import { runtime, useGame } from '../app/GameContext';
import environment from '../../public/assets/environment/production-v3/manifest.json';
import { sunPositions,environmentRotationForSun } from './EnvironmentCalibration';
import { syncShadowResolution } from './ShadowResolution';
export function Lighting(){
  const {time,quality}=useGame();const sun=useRef<DirectionalLight>(null);const target=useRef(new Object3D());
  const p=sunPositions[time];
  useLayoutEffect(()=>{if(sun.current)syncShadowResolution(sun.current,quality==='high'?4096:2048,quality!=='performance');},[quality]);
  useFrame(()=>{if(!sun.current)return;const [x,,z]=runtime.position;sun.current.position.set(x+p[0],p[1],z+p[2]);target.current.position.set(x,0,z);target.current.updateMatrixWorld();sun.current.target=target.current;const map=sun.current.shadow.map;runtime.shadowResolution[0]=map?.width??0;runtime.shadowResolution[1]=map?.height??0;});
  return <>
    <Sky distance={450000} sunPosition={p} turbidity={2.8} rayleigh={1.7} mieCoefficient={0.006}/>
    <Environment files={environment.environments.daylight.channels.environment.path} environmentIntensity={time==='evening'?.22:.42} environmentRotation={environmentRotationForSun(p)}/>
    <hemisphereLight args={['#c1d6e1','#655746',0.22]}/>
    <directionalLight ref={sun} castShadow={quality!=='performance'} intensity={time==='evening'?2:2.4} color={time==='evening'?'#ffdab1':'#fff6e8'} shadow-mapSize-width={quality==='high'?4096:2048} shadow-mapSize-height={quality==='high'?4096:2048} shadow-camera-left={-95} shadow-camera-right={95} shadow-camera-top={95} shadow-camera-bottom={-95} shadow-camera-near={1} shadow-camera-far={500} shadow-bias={-0.00012} shadow-normalBias={0.035} shadow-radius={2}/>
    <fog attach="fog" args={[time==='evening'?'#c3b198':'#bdcbc9',380,1700]}/>
  </>;
}
