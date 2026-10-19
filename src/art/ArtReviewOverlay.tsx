import { activeReviewPreset } from './ArtReviewMode';
import { reviewCameraPresets } from './reviewCameras';
import { useEffect } from 'react';
import { runtime } from '../app/GameContext';
export function ArtReviewOverlay(){
  useEffect(()=>{if(!import.meta.env.DEV)return;const w=window as unknown as Record<string,unknown>;w.__CITY_ART__=runtime;return()=>{delete w.__CITY_ART__;};},[]);
  const p=activeReviewPreset;if(!p)return null;
  return <aside className="art-review-overlay"><strong>美术检查 · {p.label}</strong><p>{p.purpose}</p><label>固定机位 <select aria-label="美术检查机位" value={p.id} onChange={e=>{location.search=`?artReview=${encodeURIComponent(e.target.value)}`;}}>{reviewCameraPresets.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label><small>结构原型 · 推测构件尚未通过写实验收</small><a href={location.pathname}>返回自由漫游</a></aside>;
}
