import type { Part } from '../Instances';

export type HeroBox = { position:[number,number,number]; half:[number,number,number] };
export interface HeroTerrace { width:number; depth:number; bottom:number; top:number }
export interface HeroStair { x:number; width:number; bottom:number; top:number; startZ:number; run:number; steps:number }
export interface HeroRoof { width:number; depth:number; y:number; rise:number; thickness:number; cornerLift:number; ridgeHalf:number }
export interface HeroAssetSpec {
  id:'taihedian';
  dimensions:{width:number;depth:number;hallHeight:number;terraceHeight:number;totalHeight:number};
  terraces:HeroTerrace[]; stairs:HeroStair[]; platformColliders:HeroBox[];
  body:{width:number;depth:number;height:number}; bodyCollider:HeroBox;
  roofs:[HeroRoof,HeroRoof]; ridgeCrestHeight:number;
  reconstruction:string[];
}

const terraces:HeroTerrace[]=[
  {width:100,depth:70,bottom:0,top:2.71},
  {width:92,depth:58,bottom:2.71,top:5.42},
  {width:84,depth:46,bottom:5.42,top:8.13},
];

/** Coordinates are local to the Building transform; dimensions other than the documented envelope are S3 art reconstruction. */
export const taiheAssetSpec:HeroAssetSpec={
  id:'taihedian',
  dimensions:{width:63.96,depth:37,hallHeight:26.92,terraceHeight:8.13,totalHeight:35.05},
  terraces,
  stairs:[-29,0,29].flatMap(x=>terraces.map(t=>({x,width:x===0?16:8,bottom:t.bottom,top:t.top,startZ:t.depth/2+6,run:6,steps:16}))),
  platformColliders:terraces.map(t=>({position:[0,(t.bottom+t.top)/2,0],half:[t.width/2,(t.top-t.bottom)/2,t.depth/2]})),
  body:{width:54.6,depth:28.6,height:10.4},
  bodyCollider:{position:[0,8.13+10.4/2,0],half:[54.6/2,10.4/2,28.6/2]},
  roofs:[
    {width:73,depth:45,y:19.15,rise:4.8,thickness:.46,cornerLift:.8,ridgeHalf:20.8},
    {width:67,depth:38,y:25.0,rise:9.4,thickness:.5,cornerLift:.9,ridgeHalf:18.1},
  ],
  ridgeCrestHeight:.65,
  reconstruction:[
    'S3: 三层台基各层高、退台、须弥座线脚和栏杆节距是美术重构，非测绘。',
    'S3: 开间宽度序列、柱高、内缩门窗与上下檐落点依包络控制重构。',
    'S3: 斗拱为柱头/补间/角部的构造示意，未完成特定斗口制校准。',
    'S3: 椽望、瓦陇和门窗分扇有实体尺度，未认定为历史精确复原。',
    'S3: 三路正面台阶采用连续可行走规格；御路、石雕、彩画尚待参考校核。',
  ],
};

export function heroStairParts(f:HeroStair):Part[]{
  return Array.from({length:f.steps},(_,i)=>{
    const rise=(f.top-f.bottom)*(i+1)/f.steps;
    return {position:[f.x,f.bottom+rise/2,f.startZ-(i+.5)*f.run/f.steps],scale:[f.width,rise,f.run/f.steps+.008]};
  });
}

/** Eleven unequal bays; only the count and published exterior envelope are factual. */
export function heroColumnGrid():{x:number[];z:number[]}{
  const weights=[4.4,5.1,5.9,6.1,6.7,7.56,6.7,6.1,5.9,5.1,4.4];
  const sum=weights.reduce((a,b)=>a+b,0),x=[-31.98];
  for(const w of weights)x.push(x.at(-1)!+w/sum*63.96);
  return {x,z:[-18.5,-11.8,-4.1,4.1,11.8,18.5]};
}
