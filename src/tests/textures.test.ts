import { expect, it } from 'vitest';
import fs from 'node:fs';
import { textureAssets } from '../architecture/TextureLibrary';
it('六张生成材质均是随项目交付的真实高分辨率 PNG，而非失效地址',()=>{
  expect(textureAssets).toHaveLength(6);
  for(const asset of textureAssets){
    const image=fs.readFileSync(`public${asset.url}`);
    expect(image.subarray(1,4).toString()).toBe('PNG');
    expect(image.readUInt32BE(16),asset.id).toBeGreaterThanOrEqual(1024);
    expect(image.readUInt32BE(20),asset.id).toBeGreaterThanOrEqual(asset.id==='beam'?512:1024);
    expect(image.length,asset.id).toBeGreaterThan(100000);
  }
});
