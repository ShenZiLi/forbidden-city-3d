import { describe, expect, it } from 'vitest';
import { taiheAssetSpec, heroStairParts, heroColumnGrid } from '../architecture/hero/HeroAssetSpec';
import { heroRoofGeometry, roofPoint } from '../architecture/hero/HeroRoofGeometry';

describe('太和殿独立米制资产规格', () => {
  it('分开记录已知总尺寸与重构比例，三层退台共同到达8.13米', () => {
    const s = taiheAssetSpec;
    expect(s.dimensions).toEqual({ width:63.96, depth:37, hallHeight:26.92, terraceHeight:8.13, totalHeight:35.05 });
    expect(s.terraces).toHaveLength(3);
    expect(s.terraces[0].width).toBe(100);
    expect(s.terraces[0].depth).toBe(70);
    s.terraces.forEach((t,i)=>{
      expect(t.top).toBeGreaterThan(t.bottom);
      if(i){ expect(t.bottom).toBe(s.terraces[i-1].top); expect(t.width).toBeLessThan(s.terraces[i-1].width); expect(t.depth).toBeLessThan(s.terraces[i-1].depth); }
    });
    expect(s.terraces[2].top).toBe(8.13);
    expect(s.reconstruction.length).toBeGreaterThan(3);
  });
  it('正面与两侧三路台阶逐级连续，各步高低于角色跨阶高度且止于廊前', () => {
    const s=taiheAssetSpec;
    for(const x of [-29,0,29]){
      const flights=s.stairs.filter(f=>f.x===x);
      expect(flights).toHaveLength(3);
      let previousTop=0,previousZ=41;
      for(const f of flights){
        expect(f.bottom).toBeCloseTo(previousTop);
        expect(f.startZ).toBeCloseTo(previousZ);
        const p=heroStairParts(f);
        expect(p[0].position[1]+p[0].scale[1]/2-f.bottom).toBeLessThan(.24);
        expect(p.at(-1)!.position[1]+p.at(-1)!.scale[1]/2).toBeCloseTo(f.top);
        expect(f.run/f.steps).toBeGreaterThan(.3);
        previousTop=f.top;previousZ=f.startZ-f.run;
      }
      expect(previousTop).toBe(8.13);
      expect(previousZ).toBeGreaterThan(s.body.depth/2+1);
    }
  });
  it('碰撞采用同一台基实体，外廊不再由原尺寸整块楼体占据', () => {
    const s=taiheAssetSpec;
    expect(s.platformColliders).toHaveLength(3);
    s.platformColliders.forEach((c,i)=>{
      const t=s.terraces[i];
      expect(c.half).toEqual([t.width/2,(t.top-t.bottom)/2,t.depth/2]);
      expect(c.position[1]+c.half[1]).toBe(t.top);
    });
    expect(s.bodyCollider.half[2]).toBeLessThan(37/2-2);
    expect(heroColumnGrid().x).toHaveLength(12);
    const x=heroColumnGrid().x;
    expect(new Set(x.slice(1).map((v,i)=>(v-x[i]).toFixed(3))).size).toBeGreaterThan(2);
  });
});

describe('有厚度的重檐庑殿屋面',()=>{
  it('上下檐独立，屋顶与脊饰预留共同受35.05米约束',()=>{
    const [lower,upper]=taiheAssetSpec.roofs;
    expect(lower.y+lower.rise).toBeLessThan(upper.y+upper.rise);
    expect(lower.width).toBeGreaterThan(upper.width);
    expect(upper.y+upper.rise+taiheAssetSpec.ridgeCrestHeight).toBeCloseTo(35.05);
    expect(roofPoint(upper,1,1,1)[1]).toBeGreaterThan(upper.y);
  });
  it('屋面闭合且有下表面，所有顶点有限、包围盒不越过总高度',()=>{
    for(const r of taiheAssetSpec.roofs){
      const g=heroRoofGeometry(r),p=g.getAttribute('position');g.computeBoundingBox();
      expect(g.boundingBox!.max.y).toBeLessThanOrEqual(35.05);
      expect(g.boundingBox!.min.y).toBeLessThan(r.y);
      for(let i=0;i<p.count;i++)expect([p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite)).toBe(true);
      // Every undirected edge of the indexed closed shell belongs to two faces.
      const edges=new Map<string,number>(),idx=g.index!;
      for(let i=0;i<idx.count;i+=3)for(const [a,b] of [[0,1],[1,2],[2,0]]){
        const u=idx.getX(i+a),v=idx.getX(i+b),key=u<v?`${u},${v}`:`${v},${u}`;
        edges.set(key,(edges.get(key)??0)+1);
      }
      expect([...edges.values()].every(n=>n===2)).toBe(true);
      g.dispose();
    }
  });
});
