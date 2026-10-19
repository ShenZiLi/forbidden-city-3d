import { useMemo,useEffect } from 'react';
import { CylinderGeometry } from 'three';
import type { Building } from '../../data/types';
import { Parts } from '../Instances';
import type { Part } from '../Instances';
import { materials,unitBox } from '../materials';
import { heroColumnGrid,heroStairParts,taiheAssetSpec as spec } from './HeroAssetSpec';
import { heroRoofGeometry } from './HeroRoofGeometry';
const columnsGeometry=new CylinderGeometry(.88,1,1,8);
/** Distant geometry preserves the authored roof and stepped terrace envelope, including the walkable stair surface. */
export function HeroSilhouette({building:b}:{building:Building}){
  const roofs=useMemo(()=>spec.roofs.map(r=>heroRoofGeometry(r,8,8)),[]);
  useEffect(()=>()=>roofs.forEach(g=>g.dispose()),[roofs]);
  const {stone,columns,doors,ridges}=useMemo(()=>{
    const stone:Part[]=spec.terraces.map(t=>({position:[0,(t.bottom+t.top)/2,0],scale:[t.width,t.top-t.bottom,t.depth]}));
    for(const f of spec.stairs)stone.push(...heroStairParts(f));
    const grid=heroColumnGrid(),columns:Part[]=[],doors:Part[]=[];
    for(const x of grid.x)for(const side of [-1,1])columns.push({position:[x,8.51+10.12/2,side*18.5],scale:[.46,10.12,.46]});
    for(const z of grid.z.slice(1,-1))for(const side of [-1,1])columns.push({position:[side*31.98,8.51+10.12/2,z],scale:[.46,10.12,.46]});
    for(let i=0;i<grid.x.length-1;i++)for(const side of [-1,1])doors.push({position:[(grid.x[i]+grid.x[i+1])*.83/2,12.5,side*14.36],scale:[(grid.x[i+1]-grid.x[i])*.76,6,.06]});
    const ridges:Part[]=[];
    for(const r of spec.roofs){
      ridges.push({position:[0,r.y+r.rise+.15,0],scale:[r.ridgeHalf*2+.6,.3,.52]},{position:[0,r.y+r.rise+.37,0],scale:[r.ridgeHalf*2,.14,.32]});
      for(const side of [-1,1])ridges.push({position:[side*r.ridgeHalf,r.y+r.rise+.325,0],scale:[.5,.65,.65]});
    }
    return {stone,columns,doors,ridges};
  },[]);
  return <group position={[b.x,0,b.z]} rotation={[0,b.rotation,0]}><Parts parts={stone} geometry={unitBox} material={materials.marble}/><mesh geometry={unitBox} material={materials.red} position={[0,8.13+10.4/2,0]} scale={[54.6,10.4,28.6]} castShadow receiveShadow dispose={null}/><mesh geometry={unitBox} material={materials.red} position={[0,22.55,0]} scale={[47.7,4.2,23.4]} castShadow receiveShadow dispose={null}/><Parts parts={columns} geometry={columnsGeometry} material={materials.red}/><Parts parts={doors} geometry={unitBox} material={materials.dark}/><Parts parts={ridges} geometry={unitBox} material={materials.heroGlaze}/>{roofs.map((g,i)=><mesh key={i} geometry={g} material={[materials.heroGlaze,materials.dark]} castShadow receiveShadow dispose={null}/>)}</group>;
}
