import { useState } from 'react';
import { Expand, X, Navigation, MapPin, ArrowUpRight } from 'lucide-react';
import { buildings, destinations, regions } from '../data/worldManifest';
import { useTelemetry } from '../hooks/useTelemetry';
import { useRegions } from '../streaming/RegionStreamer';
import { useGame } from '../app/GameContext';
export function Minimap(){
  const [expanded,setExpanded]=useState(false),[collapsed,setCollapsed]=useState(false);const t=useTelemetry();const {loaded}=useRegions();const {travel,setPaused}=useGame();
  const open=()=>{document.exitPointerLock();setPaused(true);setExpanded(true);};
  const map=<svg viewBox="-440 -560 880 1160" className="palace-map" role="img" aria-label="宫城地图，北向上，与三维场景共用米制坐标">
    <path d="M-411 -514H411V514H-411Z" fill="none" stroke="#66857a" strokeWidth="38" opacity=".3"/>
    {regions.map(r=><rect key={r.id} x={r.bounds.minX} y={r.bounds.minZ} width={r.bounds.maxX-r.bounds.minX} height={r.bounds.maxZ-r.bounds.minZ} fill={loaded.has(r.id)?'#b39a64':'#728078'} opacity={loaded.has(r.id)?.09:.025}/>)}
    <rect x="-376.5" y="-480.5" width="753" height="961" fill="none" stroke="#8a8c72" strokeWidth="10"/>
    <path d="M20 548L20 420L12 340L12 220L70 170L70 -95L-5 -130L-5 -185L38 -210L38 -345L-9 -375L-9 -390L25 -400L25 -455L-15 -460" fill="none" stroke="#d8c08b" strokeWidth="4" strokeDasharray="10 9" opacity=".55"/>
    {buildings.map(b=><rect key={b.id} x={-b.width/2} y={-b.depth/2} width={b.width} height={b.depth} transform={`translate(${b.x} ${b.z}) rotate(${-b.rotation*180/Math.PI})`} rx="1" fill={b.major?'#d1b77d':loaded.has(b.region)?'#8d8c70':'#626a59'} opacity={b.major?.95:.6}/>)}
    {expanded&&destinations.map(d=><g key={d.id} onClick={()=>{travel(d.id);setExpanded(false);}} className="map-destination" tabIndex={0} role="button" aria-label={`地图前往${d.name}`} onKeyDown={e=>{if(e.key==='Enter'){travel(d.id);setExpanded(false);}}}><circle cx={d.position[0]} cy={d.position[2]} r="9" fill="#ead1a0"/><text x={d.position[0]+22} y={d.position[2]+7} fill="#f3e6c9" fontSize="23">{d.name}</text></g>)}
    <g transform={`translate(${t.x} ${t.z}) rotate(${-t.yaw*180/Math.PI})`}><circle r="21" fill="#e6dcc0" opacity=".15"/><path d="M0 -17L10 10L0 5L-10 10Z" fill="#fff4d6" stroke="#635d48" strokeWidth="2"/></g>
  </svg>;
  return <>
    <aside className={`minimap ${collapsed?'collapsed':''}`}><div className="map-heading"><span><Navigation size={12}/>宫城舆图</span><div><button title={collapsed?'展开小地图':'收起小地图'} aria-label={collapsed?'展开小地图':'收起小地图'} onClick={()=>setCollapsed(!collapsed)}>{collapsed?'+':'−'}</button><button title="展开宫城地图" aria-label="展开宫城地图" onClick={open}><Expand size={13}/></button></div></div>{!collapsed&&<><span className="map-north">N<span>↑</span></span>{map}<div className="map-caption"><span className="live-dot"/>{t.region.name}<button onClick={open}>展开 <ArrowUpRight size={12}/></button></div><div className="map-load">近景已加载 {loaded.size}/{regions.length} · 远景常驻</div></>}</aside>
    {expanded&&<div className="modal-backdrop map-backdrop"><section className="fullmap" role="dialog" aria-modal="true" aria-label="宫城总图"><div className="panel-heading"><div><p className="eyebrow">THE PALACE MAP</p><h2>一城，千重宫阙</h2></div><button className="icon-button" aria-label="关闭宫城地图" onClick={()=>setExpanded(false)}><X size={20}/></button></div><div className="fullmap-body"><div className="fullmap-drawing">{map}<span className="map-north">N ↑</span></div><div className="destination-list"><p>选择一处，启程</p>{destinations.map((d,i)=><button key={d.id} onClick={()=>{travel(d.id);setExpanded(false);}}><span className="number">{String(i+1).padStart(2,'0')}</span><span>{d.name}<small>外部漫游 · 结构复原</small></span><MapPin size={14}/></button>)}<small>轮廓参考 OSM，非测绘成果。虚线为导览方向示意，实际通行请沿开放门洞与台阶。</small></div></div></section></div>}
  </>;
}
