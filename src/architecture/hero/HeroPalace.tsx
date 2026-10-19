import { useEffect, useMemo } from 'react';
import { CylinderGeometry } from 'three';
import type { Building } from '../../data/types';
import { Parts } from '../Instances';
import { materials, unitBox } from '../materials';
import { taiheAssetSpec as spec } from './HeroAssetSpec';
import { buildHeroParts } from './HeroParts';
import { heroRoofGeometry } from './HeroRoofGeometry';
import type { HeroTileDetail } from './HeroRoofCourses';
import { heroStoneGeometries } from './HeroStoneGeometry';
import type { HeroStoneDetail } from './HeroStoneGeometry';

// Shared local primitives: tapered lacquer columns and low-sided individual barrel tiles.
const columnGeometry=new CylinderGeometry(.88,1,1,20);
const tileGeometry=new CylinderGeometry(1,1,1,6,1,true);
const tileCapGeometry=new CylinderGeometry(1,1,1,8,1,false);

/** Taihedian-specific first geometry production pass. S3 construction details await measured reference and visual acceptance. */
export function HeroPalace({building,tileDetail='near',stoneDetail='near'}:{building:Building;tileDetail?:HeroTileDetail;stoneDetail?:HeroStoneDetail}){
  const parts=useMemo(()=>buildHeroParts({tileDetail}),[tileDetail]);
  const roofs=useMemo(()=>spec.roofs.map(r=>heroRoofGeometry(r)),[]);
  const stone=useMemo(()=>heroStoneGeometries(stoneDetail),[stoneDetail]);
  useEffect(()=>()=>roofs.forEach(r=>r.dispose()),[roofs]);
  useEffect(()=>()=>Object.values(stone).forEach(g=>g.dispose()),[stone]);
  if(building.id!=='taihedian')return null;
  const base=spec.dimensions.terraceHeight;
  return <group position={[building.x,0,building.z]} rotation={[0,building.rotation,0]} userData={{asset:'taihedian-hero-geometry-v1',status:'model',accuracy:'S3 components; published envelope',totalHeight:35.05}}>
    <Parts parts={parts.stone} geometry={unitBox} material={materials.marble}/>
    <Parts parts={parts.railPanels} geometry={stone.railPanel} material={materials.marble}/>
    <Parts parts={parts.railFrames} geometry={unitBox} material={materials.marble}/>
    <Parts parts={parts.stonePosts} geometry={stone.postShaft} material={materials.marble}/>
    <Parts parts={parts.stoneCaps} geometry={stone.postCap} material={materials.marble}/>
    <Parts parts={parts.columnBases} geometry={stone.columnBase} material={materials.columnStone}/>
    {/* Closed hall: this dark inner volume is intentionally behind the recessed leaves, not an asserted interior reconstruction. */}
    <mesh position={[0,base+spec.body.height/2,0]} scale={[spec.body.width-.5,spec.body.height,spec.body.depth-.45]} geometry={unitBox} material={materials.dark} castShadow receiveShadow dispose={null}/>
    <mesh position={[0,22.55,0]} scale={[47.7,4.2,23.4]} geometry={unitBox} material={materials.dark} castShadow receiveShadow dispose={null}/>
    <Parts parts={parts.columns} geometry={columnGeometry} material={materials.red}/>
    <Parts parts={parts.wallPanels} geometry={unitBox} material={materials.red}/>
    <Parts parts={parts.doorFrames} geometry={unitBox} material={materials.red}/>
    <Parts parts={parts.windowLattice} geometry={unitBox} material={materials.red}/>
    <Parts parts={parts.beams} geometry={unitBox} material={materials.teal}/>
    <Parts parts={parts.brackets} geometry={unitBox} material={materials.teal}/>
    <Parts parts={parts.bracketBlocks} geometry={unitBox} material={materials.red}/>
    <Parts parts={parts.rafters} geometry={unitBox} material={materials.teal}/>
    {roofs.map((g,i)=><mesh key={i} geometry={g} material={[materials.heroGlaze,materials.dark]} castShadow receiveShadow dispose={null}/>)}
    <Parts parts={parts.tiles} geometry={tileGeometry} material={materials.heroGlaze}/>
    <Parts parts={parts.tileCaps} geometry={tileCapGeometry} material={materials.heroGlaze}/>
    <Parts parts={parts.ridges} geometry={unitBox} material={materials.heroGlaze}/>
  </group>;
}
