import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AssetManager } from './AssetManager';
import { regions } from '../data/worldManifest';
import { runtime } from '../app/GameContext';
export interface RegionAsset {id:string; version:number; buildingIds:string[]; detail:string}
export type RegionState = {id:string; status:'idle'|'loading'|'ready'|'error'; error?:string};
const manager=new AssetManager<RegionAsset>();
const Context=createContext<{states:RegionState[];loaded:Set<string>;retry:()=>void}>({states:[],loaded:new Set(),retry:()=>{}});
export const useRegions=()=>useContext(Context);
export function RegionStreamer({children}:{children:ReactNode}) {
  const [states,setStates]=useState<RegionState[]>(regions.map(r=>({id:r.id,status:'idle'})));
  const current=useRef(states),owned=useRef(new Set<string>()),generation=useRef(0);
  const update=useCallback((id:string,status:RegionState['status'],error?:string)=>{
    current.current=current.current.map(s=>s.id===id?{id,status,error}:s);setStates(current.current);
  },[]);
  const retry=useCallback(()=>{for(const s of current.current)if(s.status==='error'){owned.current.delete(s.id);update(s.id,'idle');}},[update]);
  useEffect(()=>{
    const token=++generation.current;
    const tick=()=>{
      const [x,,z]=runtime.teleport??runtime.position;
      for(const r of regions){
        const dx=Math.max(r.bounds.minX-x,0,x-r.bounds.maxX),dz=Math.max(r.bounds.minZ-z,0,z-r.bounds.maxZ),distance=Math.hypot(dx,dz);
        const state=current.current.find(s=>s.id===r.id)!;
        if(distance<170&&!owned.current.has(r.id)&&state.status!=='error') {
          owned.current.add(r.id);update(r.id,'loading');
          manager.acquire(r.id, async signal=>{
            const response=await fetch(r.asset,{signal});if(!response.ok)throw Error(`HTTP ${response.status}`);
            const asset=await response.json() as RegionAsset;
            if(asset.id!==r.id||asset.version!==1||!Array.isArray(asset.buildingIds))throw Error('分区数据格式错误');
            return asset;
          }).then(()=>{if(generation.current===token&&owned.current.has(r.id))update(r.id,'ready');},e=>{
            if(generation.current===token&&owned.current.has(r.id))update(r.id,'error',String(e));
          });
        } else if(distance>310&&owned.current.has(r.id)){
          owned.current.delete(r.id);manager.release(r.id);update(r.id,'idle');
        }
      }
    };
    tick();const timer=setInterval(tick,600);
    return()=>{generation.current++;clearInterval(timer);for(const id of owned.current)manager.release(id);owned.current.clear();};
  },[update]);
  const loaded=new Set(states.filter(s=>s.status==='ready').map(s=>s.id));
  return <Context.Provider value={{states,loaded,retry}}>{children}</Context.Provider>;
}
