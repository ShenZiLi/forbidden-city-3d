import { describe, expect, it } from 'vitest';
import { NavigationGrid } from '../navigation/TraversalRules';
import { buildings, destinations, regions, walls } from '../data/worldManifest';
import { footprintBounds, insideBounds, toLocal } from '../world/WorldCoordinates';
import fs from 'node:fs';
describe('宫城空间审计',()=>{
  it('分区资源存在，数据引用确实覆盖对应建筑',()=>{
    for(const r of regions){const a=JSON.parse(fs.readFileSync(`public${r.asset}`,'utf8'));expect(a.id).toBe(r.id);expect(new Set(a.buildingIds)).toEqual(new Set(buildings.filter(b=>b.region===r.id).map(b=>b.id)));}
  });
  it('主要殿宇位于南北中轴走廊，顺序正确',()=>{
    const sequence=['wumen','taihemen','taihedian','zhonghedian','baohedian','qianqinggong','jiaotaidian','kunninggong','qinandian','shenwumen'].map(id=>buildings.find(b=>b.id===id)!);
    for(let i=0;i<sequence.length;i++){expect(Math.abs(sequence[i].x)).toBeLessThan(25);if(i)expect(sequence[i].z).toBeLessThan(sequence[i-1].z);}
  });
  it('核心殿身互不重叠，新增院墙不穿过主殿',()=>{
    const core=buildings.filter(b=>b.major&&b.kind==='palace');
    for(let i=0;i<core.length;i++)for(let j=i+1;j<core.length;j++){
      const a=footprintBounds(core[i]),b=footprintBounds(core[j]);expect(a.minX<b.maxX&&a.maxX>b.minX&&a.minZ<b.maxZ&&a.maxZ>b.minZ,`${core[i].name} / ${core[j].name}`).toBe(false);
    }
    for(const w of walls)for(const b of core){const p=toLocal(b,w);expect(Math.abs(p.z)<b.depth/2+w.thickness/2&&Math.abs(p.x)<w.length/2&&(!w.opening||Math.abs(p.x)+b.width/2>w.opening/2),`${w.id} / ${b.name}`).toBe(false);}
  });
  it('建筑中心位于标注区域或区域边界容差内',()=>{
    for(const b of buildings){const r=regions.find(r=>r.id===b.region)!;expect(insideBounds(b,{minX:r.bounds.minX-35,maxX:r.bounds.maxX+35,minZ:r.bounds.minZ-35,maxZ:r.bounds.maxZ+35}),b.name).toBe(true);}
  });
  it('A / B / C / D 外部游览路线在保守导航网格内连续可达',()=>{
    const grid=new NavigationGrid();
    const p=(id:string)=>{const d=destinations.find(d=>d.id===id)!;return{x:d.position[0],z:d.position[2]};};
    const east=buildings.find(b=>b.name==='景仁宫')!,west=buildings.find(b=>b.name==='永寿宫')!;
    const routes=[['wumen','taihemen','taihedian','zhonghedian','baohedian'],['baohedian','qianqinggong','jiaotaidian','kunninggong'],['kunninggong','qinandian','shenwumen']];
    for(const route of routes)for(let i=1;i<route.length;i++)expect(grid.findPath(p(route[i-1]),p(route[i])).length,`${route[i-1]} → ${route[i]}`).toBeGreaterThan(1);
    for(const b of [east,west])expect(grid.findPath(p('qianqinggong'),{x:b.x,z:b.z+b.depth/2+10}).length,`内廷 → ${b.name}`).toBeGreaterThan(1);
  });
});
