import raw from './buildings.generated.json';
import type { Building, Destination, Region, Wall } from './types';
import { footprintBounds, insideBounds, toLocal } from '../world/WorldCoordinates';
export const buildings = raw as Building[];
export const regions: Region[] = [
  { id: 'entry', name: '午门 · 太和门', bounds: { minX:-130,maxX:130,minZ:220,maxZ:555 }, priority: 0 },
  { id: 'outer', name: '前朝 · 三大殿', bounds: { minX:-125,maxX:125,minZ:-110,maxZ:220 }, priority: 1 },
  { id: 'inner', name: '内廷 · 后三宫', bounds: { minX:-60,maxX:60,minZ:-380,maxZ:-110 }, priority: 1 },
  { id: 'garden', name: '御花园 · 神武门', bounds: { minX:-85,maxX:85,minZ:-510,maxZ:-380 }, priority: 1 },
  { id: 'east-inner', name: '东六宫 · 宁寿宫', bounds: { minX:60,maxX:368,minZ:-465,maxZ:-110 }, priority: 2 },
  { id: 'west-inner', name: '西六宫 · 慈宁宫', bounds: { minX:-368,maxX:-60,minZ:-465,maxZ:-110 }, priority: 2 },
  { id: 'east-outer', name: '文华殿 · 东华门', bounds: { minX:125,maxX:410,minZ:-110,maxZ:470 }, priority: 2 },
  { id: 'west-outer', name: '武英殿 · 西路', bounds: { minX:-410,maxX:-125,minZ:-110,maxZ:470 }, priority: 2 },
].map(r => ({ ...r, asset: `/data/regions/${r.id}.json`, status:'程序化外部结构 · 未测绘验收' }));
export function getRegion(x: number, z: number) {
  return regions.find(r=>insideBounds({x,z},r.bounds)) ?? regions[0];
}
export const walls: Wall[] = [
  {id:'south',x:0,z:480,length:753,height:10,thickness:8,rotation:0,opening:52},
  {id:'north',x:0,z:-480.5,length:753,height:10,thickness:8,rotation:0,opening:52},
  {id:'east',x:376.5,z:0,length:961,height:10,thickness:8,rotation:Math.PI/2,opening:0},
  {id:'west',x:-376.5,z:0,length:961,height:10,thickness:8,rotation:Math.PI/2,opening:0},
  {id:'taihe-court',x:12,z:293,length:244,height:5,thickness:1.8,rotation:0,opening:64},
  {id:'qianqing-court',x:-5,z:-153,length:210,height:4.5,thickness:1.4,rotation:0,opening:60},
  {id:'garden-south',x:-9,z:-375,length:140,height:3.5,thickness:1.2,rotation:0,opening:14},
];
// East / west gates in perimeter leave the opening at the mapped gate, rather than at the centre.
walls.splice(2,2,
  {id:'east-n',x:376.5,z:-100,length:761,height:10,thickness:8,rotation:Math.PI/2},
  {id:'east-s',x:376.5,z:417,length:127,height:10,thickness:8,rotation:Math.PI/2},
  {id:'west-n',x:-376.5,z:-100,length:761,height:10,thickness:8,rotation:Math.PI/2},
  {id:'west-s',x:-376.5,z:417,length:127,height:10,thickness:8,rotation:Math.PI/2},
);
const important = ['wumen','taihemen','taihedian','zhonghedian','baohedian','qianqinggong','jiaotaidian','kunninggong','qinandian','shenwumen'];
export const destinations: Destination[] = important.map(id => {
  const b=buildings.find(b=>b.id===id)!;
  const extra=id==='taihedian'?62:id==='wumen'?60:id==='shenwumen'?28:Math.max(b.depth/2+16,26);
  return {id,name:id==='qinandian'?'御花园':b.name,buildingId:id,position:[b.x,1.1,b.z+extra],yaw:0,region:b.region};
});
// Find an unobstructed external standing point in a deterministic south-facing search.
for (const d of destinations) {
  const b=buildings.find(b=>b.id===d.buildingId)!;
  const initialZ=d.position[2];
  search: for(let row=0;row<20;row++) for(let col=0;col<30;col++) {
    const p={x:b.x+(col===0?0:(col%2===0?1:-1)*Math.ceil(col/2)*5),z:initialZ+row*4};
    const conflict=buildings.some(q=>{
      const l=toLocal(p,q);
      if(q.collision==='passage'&&Math.abs(l.x)<(q.passageWidth??4)/2-0.6)return false;
      return insideBounds(p,footprintBounds({...q,width:q.width+12,depth:q.depth+12}));
    }) || walls.some(w=>{const l=toLocal(p,w);return Math.abs(l.z)<w.thickness/2+1&&Math.abs(l.x)<w.length/2+1&&(!w.opening||Math.abs(l.x)>w.opening/2-1);});
    if(!conflict){d.position=[p.x,1.1,p.z];break search;}
  }
}
export const sources = [
  {id:'dpm-map',title:'故宫博物院 · 导览与建筑资料',url:'https://www.dpm.org.cn/Visit.html',accessed:'2026-10-19',use:'建筑名称、区域关系、部分形制；不作为精确测绘坐标。'},
  {id:'dpm-overview',title:'故宫博物院 · 探索',url:'https://www.dpm.org.cn/Explore.html',accessed:'2026-10-19',use:'宫城南北961米、东西753米、城墙高10米。'},
  {id:'osm-2026-10-19',title:'© OpenStreetMap contributors',url:'https://www.openstreetmap.org/copyright',accessed:'2026-10-19',use:'WGS84 建筑轮廓快照；ODbL 1.0，社区数据，精度未知。'},
];
