import { useEffect, useMemo } from 'react';
import { Vector3, CatmullRomCurve3, TubeGeometry } from 'three';
import { roofGeometry } from './RoofGeometry';
export { roofGeometry } from './RoofGeometry';
import { materials } from './materials';
import type { RoofType } from '../data/types';
import { EaveTiles, RidgeFinial } from './RoofDetails';
function RoofLayer({width,depth,height,type,y,detail}:{width:number;depth:number;height:number;type:RoofType;y:number;detail:boolean}){
  const geo=useMemo(()=>roofGeometry(width,depth,height,type,detail?20:4),[width,depth,height,type,detail]);
  const ribs=useMemo(()=>{
    if(!detail)return [];
    const result:TubeGeometry[]=[];
    const ridge=type==='pavilion'?0.02:width*.28;
    for(const sx of [-1,1])for(const sz of [-1,1]){
      const pts=Array.from({length:13},(_,i)=>{const t=i/12;return new Vector3(sx*(ridge+(width/2-ridge)*t),height*Math.pow(1-t,1.65)+Math.pow(t,5)*Math.min(1.1,height*.16)+.14,sz*depth/2*t);});
      result.push(new TubeGeometry(new CatmullRomCurve3(pts),20,.13,6,false));
    }
    return result;
  },[width,depth,height,type,detail]);
  useEffect(()=>()=>{geo.dispose();ribs.forEach(g=>g.dispose());},[geo,ribs]);
  return <group position={[0,y,0]}><mesh geometry={geo} material={materials.roof} castShadow receiveShadow dispose={null}/><mesh geometry={geo} material={materials.soffit} position={[0,-.12,0]} receiveShadow dispose={null}/>{ribs.map((g,i)=><mesh key={i} geometry={g} material={materials.roof} castShadow dispose={null}/>)}
    {detail&&<><EaveTiles width={width} depth={depth} height={height}/>{type==='pavilion'?<group position={[0,height+.15,0]}><mesh material={materials.gold}><sphereGeometry args={[.34,12,10]}/></mesh><mesh material={materials.roof} position={[0,.32,0]}><coneGeometry args={[.22,.65,12]}/></mesh></group>:<><mesh position={[0,height+.12,0]} material={materials.roof} castShadow><boxGeometry args={[width*.56,.35,.35]}/></mesh>{[-1,1].map(s=><RidgeFinial key={s} x={s*width*.27} y={height+.2} side={s}/>)}</>}</>}
  </group>;
}
export function RoofSystem({width,depth,height,type,y,detail=true}:{width:number;depth:number;height:number;type:RoofType;y:number;detail?:boolean}){
  const double=type.startsWith('double');
  return <>
    {double&&<RoofLayer width={width+4.2} depth={depth+4.2} height={height*.38} type={type} y={y-height*.26} detail={detail}/>}
    <RoofLayer width={width+(double?1.3:3)} depth={depth+(double?1.3:3)} height={height} type={type} y={y} detail={detail}/>
  </>;
}
