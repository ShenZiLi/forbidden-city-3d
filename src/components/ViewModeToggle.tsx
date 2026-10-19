import { PersonStanding, ScanEye } from 'lucide-react';
import { useGame } from '../app/GameContext';
export function ViewModeToggle(){const {mode,setMode}=useGame();return <div className="view-toggle" aria-label="漫游视角"><button className={mode==='first'?'active':''} aria-pressed={mode==='first'} onClick={()=>setMode('first')}><ScanEye size={15}/>第一人称</button><button className={mode==='third'?'active':''} aria-pressed={mode==='third'} onClick={()=>{document.exitPointerLock();setMode('third');}}><PersonStanding size={15}/>第三人称</button><kbd>V</kbd></div>;}
