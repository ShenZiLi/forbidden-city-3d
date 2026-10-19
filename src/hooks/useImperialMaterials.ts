import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { textureAssets } from '../architecture/TextureLibrary';
import { configureImperialMaterials,configureScannedMaterial,materials } from '../architecture/materials';
import production from '../../public/assets/materials/production-v3/manifest.json';
// The mineral scan replaces the generated plaster. Do not download both colour images.
const urls=textureAssets.filter(a=>a.id!=='plaster').map(a=>a.url);
const plaster=production.materials.mineralPlaster;
const plasterUrls=[plaster.channels.baseColor.path,plaster.channels.normal.path,plaster.channels.roughness.path,plaster.channels.ao.path];
export function useImperialMaterials(){
  const textures=useLoader(TextureLoader,urls);
  const plasterTextures=useLoader(TextureLoader,plasterUrls);
  useMemo(()=>{configureImperialMaterials([textures[0],plasterTextures[0],textures[1],textures[2],textures[3],textures[4]]);configureScannedMaterial(materials.plaster,plasterTextures,[1,1],'#943f31');},[textures,plasterTextures]);
}
