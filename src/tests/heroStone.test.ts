import { describe, expect, it } from 'vitest';
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { heroStoneGeometries } from '../architecture/hero/HeroStoneGeometry';
import { buildHeroParts } from '../architecture/hero/HeroParts';
import { taiheAssetSpec } from '../architecture/hero/HeroAssetSpec';

describe('S3程序化石作截面',()=>{
  it('近/中档的柱础、八角柱头和栏板几何有有限单位法线与受控包围盒',()=>{
    for(const detail of ['near','mid'] as const){
      const geos=heroStoneGeometries(detail);
      for(const g of Object.values(geos)){
        g.computeBoundingBox();const box=g.boundingBox!,n=g.getAttribute('normal'),p=g.getAttribute('position');
        expect(box.min.y).toBeCloseTo(-.5);expect(box.max.y).toBeCloseTo(.5);
        expect(box.min.x).toBeGreaterThanOrEqual(-.501);expect(box.max.x).toBeLessThanOrEqual(.501);
        expect(box.min.z).toBeGreaterThanOrEqual(-.501);expect(box.max.z).toBeLessThanOrEqual(.501);
        for(let i=0;i<n.count;i++){
          expect([n.getX(i),n.getY(i),n.getZ(i),p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite)).toBe(true);
          expect(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))).toBeCloseTo(1,4);
        }
        g.dispose();
      }
    }
  });
  it('栏板前后边框突出，中央实心板内凹；面朝外可正常射线命中',()=>{
    const geos=heroStoneGeometries('near'),mesh=new Mesh(geos.railPanel,new MeshBasicMaterial());
    const hit=(x:number,z:number,direction:number)=>new Raycaster(new Vector3(x,0,z),new Vector3(0,0,direction)).intersectObject(mesh)[0];
    expect(hit(0,2,-1).point.z).toBeCloseTo(.20);
    expect(hit(.45,2,-1).point.z).toBeCloseTo(.50);
    expect(hit(0,-2,1).point.z).toBeCloseTo(-.20);
    expect(hit(.45,-2,1).point.z).toBeCloseTo(-.50);
    for(const g of Object.values(geos))g.dispose();
  });
  it('柱础截面有盘足、鼓腹和颈部，中档保持同一轮廓包络但降低三角形',()=>{
    const near=heroStoneGeometries('near'),mid=heroStoneGeometries('mid');
    const rings=new Map<number,number>(),p=near.columnBase.getAttribute('position');
    for(let i=0;i<p.count;i++){const y=+p.getY(i).toFixed(3);rings.set(y,Math.max(rings.get(y)??0,Math.hypot(p.getX(i),p.getZ(i))));}
    expect(rings.size).toBeGreaterThan(9);expect(rings.get(-.28)).toBeGreaterThan(rings.get(.4)!);
    for(const key of ['columnBase','postCap','railPanel'] as const){
      const count=(g:typeof near.columnBase)=>g.index?.count??g.getAttribute('position').count;
      expect(count(mid[key])).toBeLessThan(count(near[key]));
    }
    for(const g of [...Object.values(near),...Object.values(mid)])g.dispose();
  });
  it('新柱帽和边框实例不含非数值，栏板仍避开三路台阶既有通行净宽',()=>{
    const p=buildHeroParts({tileDetail:'none'});
    expect(p.stoneCaps.length).toBe(p.stonePosts.length);
    expect(p.columnBases.length).toBe(p.columns.length);
    for(const list of [p.columnBases,p.stonePosts,p.stoneCaps,p.railPanels,p.railFrames])for(const part of list){
      expect([...part.position,...part.scale,...(part.rotation??[])].every(Number.isFinite)).toBe(true);
      expect(part.scale.every(v=>v>0)).toBe(true);
    }
    for(const t of taiheAssetSpec.terraces)for(const r of [...p.railPanels,...p.railFrames].filter(v=>!v.rotation&&Math.abs(v.position[2]-(t.depth/2-.35))<.01)){
      const left=r.position[0]-r.scale[0]/2,right=r.position[0]+r.scale[0]/2;
      for(const f of taiheAssetSpec.stairs.filter(v=>v.top===t.top))expect(right<=f.x-f.width/2-.2||left>=f.x+f.width/2+.2).toBe(true);
    }
  });
  it('石作实例三角形预算受控，中档保留构件但明显降低截面细分',()=>{
    const parts=buildHeroParts({tileDetail:'none'}),counts={columnBase:parts.columnBases.length,postShaft:parts.stonePosts.length,postCap:parts.stoneCaps.length,railPanel:parts.railPanels.length};
    const total=(detail:'near'|'mid')=>{
      const geos=heroStoneGeometries(detail);let triangles=parts.railFrames.length*12;
      for(const key of Object.keys(geos) as (keyof typeof geos)[]){
        const g=geos[key];triangles+=(g.index?.count??g.getAttribute('position').count)/3*counts[key];g.dispose();
      }
      return triangles;
    };
    expect(total('near')).toBeLessThanOrEqual(165000);expect(total('mid')).toBeLessThanOrEqual(85000);
    expect(total('mid')).toBeLessThan(total('near')*.55);
  });
});
