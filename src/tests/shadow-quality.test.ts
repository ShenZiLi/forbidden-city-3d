import { describe,it,expect } from 'vitest';
import { DirectionalLight,WebGLRenderTarget } from 'three';
import { syncShadowResolution } from '../world/ShadowResolution';
describe('quality-dependent shadow resources',()=>{
  it('retains matching targets, then disposes and clears old targets before resizing',()=>{
    const light=new DirectionalLight(),map=new WebGLRenderTarget(2048,2048),pass=new WebGLRenderTarget(2048,2048);
    let disposed=0;map.addEventListener('dispose',()=>disposed++);pass.addEventListener('dispose',()=>disposed++);
    light.shadow.map=map;light.shadow.mapPass=pass;
    syncShadowResolution(light,2048,true);expect(light.shadow.map).toBe(map);expect(disposed).toBe(0);
    syncShadowResolution(light,4096,true);expect(disposed).toBe(2);expect(light.shadow.map).toBeNull();expect(light.shadow.mapPass).toBeNull();expect(light.shadow.mapSize.toArray()).toEqual([4096,4096]);
  });
  it('releases retained high-quality targets when shadows are disabled',()=>{
    const light=new DirectionalLight(),map=new WebGLRenderTarget(4096,4096);let disposed=false;
    map.addEventListener('dispose',()=>{disposed=true;});light.shadow.map=map;
    syncShadowResolution(light,2048,false);expect(disposed).toBe(true);expect(light.shadow.map).toBeNull();
  });
});
