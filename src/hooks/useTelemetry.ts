import { useEffect, useState } from 'react';
import { runtime } from '../app/GameContext';
import { buildings, getRegion } from '../data/worldManifest';
export function useTelemetry(){
  const read=()=>{
    const [x,y,z]=runtime.position;
    const nearest=buildings.filter(b=>b.major||!b.name.includes('待核')).reduce<{id:string;distance:number}|null>((best,b)=>{const d=Math.hypot(x-b.x,z-b.z)-Math.max(b.width,b.depth)/2;return !best||d<best.distance?{id:b.id,distance:d}:best;},null);
    return {x,y,z,yaw:runtime.yaw,region:getRegion(x,z),nearest:nearest&&nearest.distance<45?nearest:null,fps:runtime.fps,calls:runtime.drawCalls,triangles:runtime.triangles,grounded:runtime.grounded};
  };
  const [data,setData]=useState(read);
  useEffect(()=>{const t=setInterval(()=>setData(read()),200);return()=>clearInterval(t);},[]);
  return data;
}
