import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ViewMode } from '../navigation/ViewModeController';
import { destinations } from '../data/worldManifest';
import { activeReviewPreset,reviewAnchor } from '../art/ArtReviewMode';
export type Quality = 'high' | 'balanced' | 'performance';
export type TimeOfDay = 'morning' | 'noon' | 'evening';
export const runtime = {
  position:[...(reviewAnchor?.position??[20,1.1,537])] as [number,number,number], yaw:0, pitch:0.08, moving:false, running:false,
  teleport:null as [number,number,number]|null, teleportYaw:0,
  fps:0, frameMs:[] as number[], drawCalls:0, triangles:0, ready:false, grounded:false,
  loadedAt:0, startedAt:performance.now(), frames:0,
  physics:{} as Record<string,unknown>,
  geometryCount:0, textureCount:0, bootedAt:0,
  shadowResolution:[0,0] as [number,number],
};
interface GameValue {
  mode:ViewMode; setMode:(m:ViewMode)=>void;
  quality:Quality; setQuality:(q:Quality)=>void;
  time:TimeOfDay; setTime:(t:TimeOfDay)=>void;
  sensitivity:number; setSensitivity:(s:number)=>void;
  volume:number; setVolume:(v:number)=>void;
  paused:boolean; setPaused:(p:boolean)=>void;
  started:boolean; setStarted:(s:boolean)=>void;
  debug:boolean; setDebug:(d:boolean)=>void;
  selected:string|null; setSelected:(s:string|null)=>void;
  settings:boolean; setSettings:(s:boolean)=>void;
  ready:boolean; setReady:(r:boolean)=>void;
  travel:(id:string)=>void;
}
const GameContext=createContext<GameValue>(null!);
export function GameProvider({children}:{children:ReactNode}) {
  const [mode,setMode]=useState<ViewMode>('first'),[quality,setQuality]=useState<Quality>(activeReviewPreset?.quality??'balanced');
  const [time,setTime]=useState<TimeOfDay>(activeReviewPreset?.time??'morning'),[sensitivity,setSensitivity]=useState(1);
  const [volume,setVolume]=useState(0),[paused,setPaused]=useState(false),[started,setStarted]=useState(false);
  const [debug,setDebug]=useState(false),[selected,setSelected]=useState<string|null>(null),[settings,setSettings]=useState(false);
  const [ready,setReady]=useState(false);
  const travel=(id:string)=>{const d=destinations.find(d=>d.id===id);if(!d)return; runtime.teleport=[...d.position];runtime.teleportYaw=d.yaw;setSelected(null);setStarted(true);setPaused(false);setMode(mode==='overview'?'first':mode);};
  return <GameContext.Provider value={{mode,setMode,quality,setQuality,time,setTime,sensitivity,setSensitivity,volume,setVolume,paused,setPaused,started,setStarted,debug,setDebug,selected,setSelected,settings,setSettings,ready,setReady,travel}}>{children}</GameContext.Provider>;
}
export const useGame=()=>useContext(GameContext);
