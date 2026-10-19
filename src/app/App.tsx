import { Component, Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import { GameProvider, useGame, runtime } from './GameContext';
import { RegionStreamer } from '../streaming/RegionStreamer';
import { ForbiddenCityWorld } from '../world/ForbiddenCityWorld';
import { LoadingScreen } from '../components/LoadingScreen';
import { GameHUD } from '../components/GameHUD';
import { AudioEnvironment } from '../world/AudioEnvironment';
import { useRegions } from '../streaming/RegionStreamer';
import { activeReviewPreset,reviewAnchor } from '../art/ArtReviewMode';
import { ArtReviewOverlay } from '../art/ArtReviewOverlay';
import { MaterialLab } from '../art/MaterialLab';
class WorldError extends Component<{children:ReactNode},{error:string}> {
  state={error:''};static getDerivedStateFromError(error:Error){return {error:error.message};}
  render(){return this.state.error?<div className="loading-screen"><h1>三维世界暂时无法打开</h1><p>{this.state.error}</p><button onClick={()=>location.reload()}>重新初始化</button></div>:this.props.children;}
}
function Experience(){const {quality,ready}=useGame();const {loaded}=useRegions();const [booted,setBooted]=useState(false);useEffect(()=>{if(ready&&loaded.has(reviewAnchor?.region??'entry')&&!booted){runtime.bootedAt=performance.now();setBooted(true);}},[ready,loaded,booted]);return <main className="experience"><WorldError><Canvas shadows={quality!=='performance'} dpr={quality==='high'?[1,1.75]:quality==='balanced'?[1,1.25]:0.8} camera={{position:[20,2.5,537],fov:65,near:0.1,far:2000}} gl={{antialias:true,powerPreference:'high-performance',toneMapping:ACESFilmicToneMapping,outputColorSpace:SRGBColorSpace}} onCreated={({camera})=>camera.lookAt(20,8,477)}><Suspense fallback={null}><ForbiddenCityWorld/></Suspense></Canvas>{!booted?<LoadingScreen/>:activeReviewPreset?<ArtReviewOverlay/>:<GameHUD/>}<AudioEnvironment/></WorldError></main>;}
export default function App(){return new URLSearchParams(location.search).has('materialLab')?<WorldError><MaterialLab/></WorldError>:<GameProvider><RegionStreamer><Experience/></RegionStreamer></GameProvider>;}
