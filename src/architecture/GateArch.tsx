import { useEffect, useMemo } from 'react';
import { ExtrudeGeometry, Shape } from 'three';
import { materials, unitBox } from './materials';
/** Masonry reveal above the traversable door; no collision or opening width is changed. */
export function GateArch({opening,clear,depth}:{opening:number;clear:number;depth:number}){
  const {corner,band}=useMemo(()=>{
    const r=opening/2,spring=clear-r;
    const shape=new Shape();shape.moveTo(r,spring);shape.lineTo(r,clear);shape.lineTo(0,clear);shape.absarc(0,spring,r,Math.PI/2,0,true);shape.closePath();
    const corner=new ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24});corner.translate(0,0,-depth/2);
    const ring=new Shape();ring.moveTo(r+.28,spring);ring.absarc(0,spring,r+.28,0,Math.PI,false);ring.lineTo(-r,spring);ring.absarc(0,spring,r,Math.PI,0,true);ring.closePath();
    const band=new ExtrudeGeometry(ring,{depth:.25,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:24});
    return {corner,band};
  },[opening,clear,depth]);
  useEffect(()=>()=>{corner.dispose();band.dispose();},[corner,band]);
  const spring=clear-opening/2;
  return <><mesh geometry={corner} material={materials.plaster} castShadow receiveShadow dispose={null}/><mesh geometry={corner} material={materials.plaster} scale={[-1,1,1]} castShadow receiveShadow dispose={null}/>{[-1,1].map(s=><group key={s}><mesh geometry={band} material={materials.stone} position={[0,0,s>0?depth/2+.025:-depth/2-.275]} castShadow receiveShadow dispose={null}/>{[-1,1].map(x=><mesh key={x} geometry={unitBox} material={materials.stone} position={[x*(opening/2+.14),spring/2,s*(depth/2+.13)]} scale={[.28,spring,.26]} receiveShadow dispose={null}/>)}</group>)}</>;
}
