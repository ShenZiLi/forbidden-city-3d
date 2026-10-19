import { describe, expect, it } from 'vitest';
import { buildHeroParts } from '../architecture/hero/HeroParts';
import { taiheAssetSpec } from '../architecture/hero/HeroAssetSpec';

describe('太和殿实例化构造',()=>{
  it('实例构件包含柱廊、分扇门窗、层级斗拱与逐陇瓦件',()=>{
    const p=buildHeroParts();
    expect(p.columns.length).toBeGreaterThan(40);
    expect(p.windowLattice.length).toBeGreaterThan(600);
    expect(p.brackets.length).toBeGreaterThan(800);
    expect(p.tiles.length).toBeGreaterThan(2000);
    expect(p.rafters.length).toBeGreaterThan(300);
    for(const list of Object.values(p))for(const part of list){
      expect([...part.position,...part.scale,...(part.rotation??[])].every(Number.isFinite)).toBe(true);
      expect(part.scale.every((v:number)=>v>0)).toBe(true);
    }
  });
  it('所有台基前缘栏板避开对应台阶净宽，阶梯终点到内缩立面仍有廊前空间',()=>{
    const p=buildHeroParts();
    for(const t of taiheAssetSpec.terraces){
      for(const rail of p.railPanels.filter(r=>Math.abs(r.position[2]-(t.depth/2-.35))<.01)){
        const left=rail.position[0]-rail.scale[0]/2,right=rail.position[0]+rail.scale[0]/2;
        for(const f of taiheAssetSpec.stairs.filter(f=>f.top===t.top))expect(right<=f.x-f.width/2-.2||left>=f.x+f.width/2+.2).toBe(true);
      }
    }
    expect(taiheAssetSpec.terraces.at(-1)!.depth/2-taiheAssetSpec.body.depth/2).toBeGreaterThan(5);
  });
});
