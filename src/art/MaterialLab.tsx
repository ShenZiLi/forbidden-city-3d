import { Suspense,useMemo,useEffect } from 'react';
import { Canvas,useLoader } from '@react-three/fiber';
import { Environment,OrbitControls,Html,useProgress } from '@react-three/drei';
import { ACESFilmicToneMapping,MeshStandardMaterial,TextureLoader } from 'three';
import { useImperialMaterials } from '../hooks/useImperialMaterials';
import { configureScannedMaterial,materials,groundMaterial } from '../architecture/materials';
import production from '../../public/assets/materials/production-v3/manifest.json';
import environment from '../../public/assets/environment/production-v3/manifest.json';
import { environmentRotationForSun } from '../world/EnvironmentCalibration';
const stone=production.materials.courtyardStone;
const sampleUrls=[stone.channels.baseColor.path,stone.channels.normal.path,stone.channels.roughness.path,stone.channels.ao.path];
function LabStatus(){const {active,loaded,total}=useProgress();return active?<p role="status">正在加载材质通道：{loaded} / {total}</p>:null;}
function Samples(){
  useImperialMaterials();
  const textures=useLoader(TextureLoader,sampleUrls);
  const scan=useMemo(()=>{const m=new MeshStandardMaterial();configureScannedMaterial(m,textures,[1.5,1.5],'#ffffff');return m;},[textures]);
  useEffect(()=>()=>scan.dispose(),[scan]);
  const samples=[['琉璃釉色 · 生成色图/解析微表面',materials.roof],['漆木 · 生成色图/解析微表面',materials.red],['矿物灰泥 · 实拍PBR/艺术着色',materials.plaster],['汉白玉参考 · 生成色图/解析微表面',materials.marble],['地面原型 · 生成色图/解析微表面',groundMaterial],['小块石面样本 · 实拍PBR/原始1.5m',scan]] as const;
  return <>{samples.map(([label,material],i)=>{const x=(i%3-1)*3.6,z=Math.floor(i/3)*4-2;return <group key={label} position={[x,0,z]}><mesh material={material} position={[0,1.05,0]} castShadow receiveShadow><sphereGeometry args={[1,64,48]}/></mesh><mesh material={material} rotation={[-Math.PI/2,0,0]} position={[0,.01,0]} receiveShadow><planeGeometry args={[3.2,3.2]}/></mesh><Html center position={[0,.1,1.7]} style={{whiteSpace:'nowrap',fontSize:10,background:'#13221cdd',padding:'5px 9px',color:'#fff'}}>{label}</Html></group>;})}<gridHelper args={[20,20,'#657164','#adb3a7']} position={[0,-.01,0]}/></>;
}
export function MaterialLab(){return <main className="experience"><Canvas shadows dpr={[1,1.5]} camera={{position:[10,8,12],fov:48,near:.1,far:100}} gl={{antialias:true,toneMapping:ACESFilmicToneMapping}}><color attach="background" args={['#b9c3c5']}/><Suspense fallback={null}><Environment files={environment.environments.daylight.channels.environment.path} environmentIntensity={.5} environmentRotation={environmentRotationForSun([-6,9,4])}/><directionalLight position={[-6,9,4]} intensity={2.4} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-.0002}/><Samples/></Suspense><OrbitControls target={[0,1,0]} minDistance={3} maxDistance={25}/></Canvas><aside className="art-review-overlay"><strong>材质检查场 · 一格一米</strong><LabStatus/><p>同一日光、固定曝光，比较球面与地面。鼠标拖动环绕，滚轮缩放。实拍样本并非故宫实物采样；其余表面仍是制作原型。</p><a href="/">返回自由漫游</a></aside></main>;}
