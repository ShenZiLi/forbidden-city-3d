import { describe, expect, it } from 'vitest';
import { heroRoofCourses } from '../architecture/hero/HeroRoofCourses';
import { taiheAssetSpec } from '../architecture/hero/HeroAssetSpec';
import { roofPoint } from '../architecture/hero/HeroRoofGeometry';
import { buildHeroParts } from '../architecture/hero/HeroParts';

describe('太和殿平行瓦陇与几何细节档位',()=>{
  it('檐口插值超过1一个浮点ULP时仍有限，并严格落到t=1边界',()=>{
    for(const r of taiheAssetSpec.roofs)for(let side=0;side<4;side++)for(const f of [0,.23,.5,.91,1]){
      const endpoint=roofPoint(r,1+Number.EPSILON,side,f);
      expect(endpoint.every(Number.isFinite)).toBe(true);
      expect(endpoint).toEqual(roofPoint(r,1,side,f));
    }
  });
  it('前后坡固定x，端坡固定z，不再从正脊放射到檐口',()=>{
    for(const roof of taiheAssetSpec.roofs)for(const c of heroRoofCourses(roof,'near')){
      const axis=c.side%2===0?0:2;
      expect(c.points.length).toBeGreaterThan(1);
      for(const point of c.points)expect(point[axis]).toBeCloseTo(c.cross,8);
    }
  });
  it('每条瓦陇从正脊或斜脊边界开始，所有采样点都在同一闭合屋壳曲面上',()=>{
    for(const r of taiheAssetSpec.roofs)for(const c of heroRoofCourses(r,'near')){
      const initialHalf=c.side%2===0?r.ridgeHalf:.06,finalHalf=c.side%2===0?r.width/2:r.depth/2;
      expect(c.startT).toBeCloseTo(Math.max(.012,(Math.abs(c.cross)-initialHalf)/(finalHalf-initialHalf)),8);
      c.points.forEach((p,i)=>{
        const t=c.startT+(1-c.startT)*i/(c.points.length-1),w=r.ridgeHalf+(r.width/2-r.ridgeHalf)*t,d=.06+(r.depth/2-.06)*t;
        const f=c.side===0?(p[0]+w)/(2*w):c.side===1?(p[2]+d)/(2*d):c.side===2?(w-p[0])/(2*w):(d-p[2])/(2*d);
        expect(f).toBeGreaterThanOrEqual(-1e-10);expect(f).toBeLessThanOrEqual(1+1e-10);
        expect(p[1]).toBeCloseTo(roofPoint(r,t,c.side,f)[1],8);
      });
    }
  });
  it('中景保留平行轮廓与端头而显著减少瓦件实例，远景可关闭细瓦',()=>{
    const near=buildHeroParts({tileDetail:'near'}),mid=buildHeroParts({tileDetail:'mid'}),far=buildHeroParts({tileDetail:'none'});
    expect(mid.tiles.length).toBeLessThan(near.tiles.length*.4);
    expect(mid.tiles.length).toBeGreaterThan(1000);
    expect(near.tileCaps.length).toBeGreaterThan(600);
    expect(mid.tileCaps.length).toBeGreaterThan(400);
    expect(far.tiles).toHaveLength(0);expect(far.tileCaps).toHaveLength(0);
    expect(far.rafters.length).toBe(near.rafters.length);
  });
  it('主坡中部保持下坡到檐口，角部起翘不高于既有规格',()=>{
    for(const r of taiheAssetSpec.roofs){
      let previous=r.y+r.rise;
      for(let i=0;i<=100;i++){
        const p=roofPoint(r,i/100,0,.5);
        expect(p[1]).toBeLessThanOrEqual(previous+1e-9);previous=p[1];
      }
      expect(roofPoint(r,1,0,0)[1]-r.y).toBeLessThanOrEqual(.9+1e-9);
    }
  });
});
