import { useEffect, useLayoutEffect, useRef } from 'react';
import { InstancedMesh, Object3D } from 'three';
import type { BufferGeometry, Material } from 'three';
export type Part={position:[number,number,number];scale:[number,number,number];rotation?:[number,number,number]};
export function Parts({parts,geometry,material,shadows=true}:{parts:Part[];geometry:BufferGeometry;material:Material;shadows?:boolean}){
  const ref=useRef<InstancedMesh>(null);
  useLayoutEffect(()=>{const o=new Object3D();ref.current!.count=parts.length;parts.forEach((p,i)=>{o.position.set(...p.position);o.scale.set(...p.scale);o.rotation.set(...(p.rotation??[0,0,0]));o.updateMatrix();ref.current!.setMatrixAt(i,o.matrix);});ref.current!.instanceMatrix.needsUpdate=true;if(parts.length)ref.current!.computeBoundingSphere();},[parts]);
  useEffect(()=>{const mesh=ref.current;return()=>{mesh?.dispose();};},[parts.length,geometry,material]);
  return <instancedMesh ref={ref} args={[geometry,material,Math.max(1,parts.length)]} castShadow={shadows} receiveShadow dispose={null}/>;
}
