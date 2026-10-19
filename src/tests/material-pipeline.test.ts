import { describe,it,expect } from 'vitest';
import { MeshStandardMaterial,NoColorSpace,SRGBColorSpace,Texture,LinearMipmapLinearFilter,LinearFilter } from 'three';
import { createMicrostructure } from '../architecture/MaterialMicrostructure';
import { configureScannedMaterial } from '../architecture/materials';
describe('independent PBR channels',()=>{
  it('generates tangent normals and scalar roughness in linear data space',()=>{
    const maps=createMicrostructure('glaze',32);
    expect(maps.normal.colorSpace).toBe(NoColorSpace);expect(maps.roughness.colorSpace).toBe(NoColorSpace);
    expect(maps.normal.minFilter).toBe(LinearMipmapLinearFilter);expect(maps.normal.magFilter).toBe(LinearFilter);
    const n=maps.normal.image.data as Uint8Array,r=maps.roughness.image.data as Uint8Array;
    for(let i=0;i<n.length;i+=4){expect(n[i+2]).toBeGreaterThan(250);expect(r[i]).toBe(r[i+1]);expect(r[i+1]).toBe(r[i+2]);}
    maps.normal.dispose();maps.roughness.dispose();
  });
  it('never feeds albedo into bump or data slots',()=>{
    const m=new MeshStandardMaterial(),textures=Array.from({length:4},()=>new Texture());
    configureScannedMaterial(m,textures,[1.5,1.5],'#ffffff');
    expect(m.map).toBe(textures[0]);expect(m.normalMap).toBe(textures[1]);expect(m.roughnessMap).toBe(textures[2]);expect(m.aoMap).toBe(textures[3]);expect(m.bumpMap).toBeNull();
    expect(textures.map(t=>t.colorSpace)).toEqual([SRGBColorSpace,NoColorSpace,NoColorSpace,NoColorSpace]);
  });
});
