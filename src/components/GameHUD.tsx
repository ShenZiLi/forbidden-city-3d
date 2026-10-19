import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Settings2, Volume2, VolumeX, Sun, Compass, ChevronDown, MapPin, X, Landmark, Play, RotateCcw } from 'lucide-react';
import { useGame, runtime } from '../app/GameContext';
import { useTelemetry } from '../hooks/useTelemetry';
import { buildings, destinations } from '../data/worldManifest';
import { useRegions } from '../streaming/RegionStreamer';
import { ViewModeToggle } from './ViewModeToggle';
import { Minimap } from './Minimap';
import { BuildingInfoPanel } from './BuildingInfoPanel';
import { SettingsPanel } from './SettingsPanel';
export function GameHUD(){
  const g=useGame(),t=useTelemetry(),{states,retry}=useRegions();const [locations,setLocations]=useState(false),[atlas,setAtlas]=useState(false);
  const near=buildings.find(b=>b.id===t.nearest?.id),current=near??buildings.find(b=>b.id==='wumen')!;
  const release=()=>{if(document.pointerLockElement)document.exitPointerLock();};
  const enter=()=>{g.setStarted(true);g.setPaused(false);g.setSettings(false);document.querySelector('canvas')?.requestPointerLock()?.catch(()=>{});};
  const resume=()=>{g.setPaused(false);if(g.mode==='first')document.querySelector('canvas')?.requestPointerLock()?.catch(()=>{});};
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{
      if(e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement||e.repeat)return;
      if(e.code==='KeyV'){g.setMode(g.mode==='first'?'third':'first');if(g.mode==='first')release();}
      if(e.code==='F3'){e.preventDefault();g.setDebug(!g.debug);}
      if(e.code==='KeyE'&&near&&g.started){release();g.setSelected(near.id);}
      if(e.code==='Escape'&&g.started){if(g.selected)g.setSelected(null);else if(g.settings)g.setSettings(false);else{g.setPaused(true);release();}}
    };
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[g,near]);
  return <>
    <div className="scene-vignette"/>
    <header className="topbar"><a className="brand" href="#" onClick={e=>{e.preventDefault();release();g.travel('wumen');g.setStarted(false);g.setPaused(false);}} aria-label="返回午门入口"><span className="brand-seal">宫</span><span><strong>紫禁漫游</strong><small>FORBIDDEN CITY 3D</small></span></a><nav aria-label="主导航"><button className={!atlas&&g.mode!=='overview'?'active':''} onClick={()=>{g.setMode('first');setAtlas(false);}}>自由漫游</button><button className={atlas?'active':''} onClick={()=>{release();g.setPaused(g.started);setAtlas(!atlas);}}>建筑图鉴 <span>{buildings.filter(b=>!b.name.includes('待核')).length}</span></button><button className={g.mode==='overview'?'active':''} onClick={()=>{release();g.setMode(g.mode==='overview'?'first':'overview');}}>宫城总览 <ArrowUpRight size={12}/></button></nav><div className="header-tools"><span className="time-label"><Sun size={14}/>{g.time==='morning'?'清晨':g.time==='noon'?'正午':'黄昏'} · 北京</span><button className="icon-button" aria-label={g.volume>0?'关闭声音':'开启声音'} onClick={()=>g.setVolume(g.volume>0?0:.4)}>{g.volume>0?<Volume2 size={17}/>:<VolumeX size={17}/>}</button><button className="icon-button" aria-label="打开设置" onClick={()=>{release();g.setSettings(true);}}><Settings2 size={18}/></button></div></header>
    <div className="location-breadcrumb"><span className="live-dot"/>紫禁城 <span>/</span> {t.region.name}<span className="edition">结构复原研究版 · v0.1</span></div>
    <div className="right-controls"><ViewModeToggle/><div className="travel-select"><button onClick={()=>{release();setLocations(!locations);}} aria-expanded={locations}><MapPin size={14}/>前往一处宫殿<ChevronDown size={13}/></button>{locations&&<div className="travel-menu">{destinations.map((d,i)=><button key={d.id} onClick={()=>{g.travel(d.id);setLocations(false);}}><span>{String(i+1).padStart(2,'0')}</span>{d.name}<ArrowUpRight size={12}/></button>)}</div>}</div></div>
    {!g.started&&g.mode!=='overview'&&<section className="intro"><p className="intro-kicker"><span/>循中轴，入深宫</p><h1>六百年宫阙，<br/>一步一重境。</h1><p className="intro-english">A WALK THROUGH TIME.</p><p className="intro-description">越过朱门，走进黄瓦红墙之间。<br/>在真实尺度的三维宫城里，<br/>重新认识一座城的秩序与日常。</p><button className="enter-button" onClick={enter}>进入紫禁城 <ArrowRight size={18}/></button><p className="entry-help"><span className="live-dot"/>浏览器实时渲染 · 点击后锁定鼠标</p></section>}
    {g.mode==='overview'&&<div className="overview-note"><Compass size={18}/><span>宫城空间总览<small>北向上 · 1 世界单位 = 1 米 · 平面轮廓参考 OSM</small></span><button onClick={()=>g.setMode('first')}>回到当前位置 <ArrowRight size={15}/></button></div>}
    <div className="bottom-left"><div className="building-card"><div className="building-card-icon"><Landmark size={29} strokeWidth={1}/></div><div><p className="eyebrow">{g.started?'NEARBY ARCHITECTURE':'YOUR JOURNEY BEGINS HERE'}</p><h3>{current.name}<span>{current.id==='wumen'?'紫禁城正门':'宫城建筑'}</span></h3><p>{current.collision==='passage'?'开放门洞 · 可穿行':'外部漫游 · 内部未复原'}</p></div><button className="round-button" aria-label={`查看${current.name}建筑档案`} onClick={()=>{release();g.setSelected(current.id);}}><ArrowUpRight size={20}/></button></div><div className="controls-help"><div className="keys"><kbd>W</kbd><span><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span></div><span>自由移动</span><i/><span><kbd>Shift</kbd> 奔跑</span><span><kbd>V</kbd> 视角</span><span><kbd>Esc</kbd> 暂停</span></div><p className="source-credit">空间轮廓 © OpenStreetMap contributors · 建筑资料参考故宫博物院 · 非测绘级复原</p></div>
    {g.started&&!g.paused&&g.mode==='first'&&<div className="crosshair" aria-hidden="true"/>}
    {g.started&&near&&!g.paused&&<button className="interact-hint" onClick={()=>{release();g.setSelected(near.id);}}><kbd>E</kbd> 了解{near.name}</button>}
    <Minimap/>
    {g.debug&&<output className="debug-panel">X {t.x.toFixed(2)} · Y {t.y.toFixed(2)} · Z {t.z.toFixed(2)}<br/>朝向 {(t.yaw*180/Math.PI).toFixed(1)}° · {g.mode} · {t.grounded?'着地':'空中'}<br/>{t.fps.toFixed(0)} FPS · {t.calls} draw calls · {(t.triangles/1000).toFixed(0)}k triangles<br/>分区 {states.filter(s=>s.status==='ready').map(s=>s.id).join(', ')}<br/>物理固定步长 1/60 s · 胶囊半径 0.32 m</output>}
    {states.some(s=>s.status==='error')&&<div className="stream-error">近景分区加载失败，远景和碰撞保持可用。<button onClick={retry}>重试</button></div>}
    {g.paused&&g.started&&!g.settings&&!g.selected&&!atlas&&<div className="pause-overlay"><section><p className="eyebrow">TAKE A MOMENT</p><h2>且驻足，听宫城。</h2><p>漫游已暂停</p><button className="enter-button" onClick={resume}><Play size={15}/>继续漫游</button><button onClick={()=>g.setSettings(true)}><Settings2 size={15}/>漫游设置</button><button onClick={()=>{g.travel('wumen');g.setStarted(false);g.setPaused(false);}}><RotateCcw size={15}/>返回午门</button></section></div>}
    {atlas&&<div className="modal-backdrop"><section className="atlas-panel" role="dialog" aria-modal="true" aria-label="宫城建筑图鉴"><div className="panel-heading"><div><p className="eyebrow">ARCHITECTURE COLLECTION</p><h2>宫城建筑图鉴</h2><p>已命名 {buildings.filter(b=>!b.name.includes('待核')).length} · 全部为程序化结构资产</p></div><button className="icon-button" aria-label="关闭建筑图鉴" onClick={()=>setAtlas(false)}><X size={20}/></button></div><div className="atlas-list">{buildings.filter(b=>!b.name.includes('待核')).map(b=><button key={b.id} onClick={()=>{setAtlas(false);g.setSelected(b.id);}}><Landmark size={20}/><span>{b.name}<small>{b.accuracy.position==='map-traced'?'轮廓有来源':'位置待校准'} · 高度{b.accuracy.height==='published'?'有公开依据':'待核实'}</small></span><ArrowUpRight size={14}/></button>)}</div></section></div>}
    <BuildingInfoPanel/><SettingsPanel/>
    {import.meta.env.DEV&&<DevBridge/>}
  </>;
}
function DevBridge(){const g=useGame();useEffect(()=>{const api={runtime,teleport:g.travel,setMode:g.setMode,setPaused:g.setPaused,start:()=>g.setStarted(true)};(window as unknown as {__CITY__:typeof api}).__CITY__=api;return()=>{delete (window as unknown as {__CITY__?:typeof api}).__CITY__;};},[g]);return null;}
