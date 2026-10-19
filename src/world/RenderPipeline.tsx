import { useEffect, useMemo } from 'react';
import { useFrame,useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { useGame,runtime } from '../app/GameContext';

/** Linear HDR beauty → restrained contact AO → one tone-mapping/output transform. */
export function RenderPipeline(){
  const {gl,scene,camera,size}=useThree(),{quality}=useGame();
  const pipeline=useMemo(()=>{
    if(quality==='performance')return null;
    const composer=new EffectComposer(gl),beauty=new RenderPass(scene,camera),ao=new GTAOPass(scene,camera),output=new OutputPass();
    ao.blendIntensity=.48;
    ao.updateGtaoMaterial({radius:.85,thickness:.35,distanceExponent:1,distanceFallOff:1,scale:1,samples:quality==='high'?16:8});
    ao.updatePdMaterial({radius:5,rings:2,samples:8,lumaPhi:8,depthPhi:2,normalPhi:3});
    composer.addPass(beauty);composer.addPass(ao);composer.addPass(output);
    return {composer,beauty,ao,output};
  },[gl,scene,camera,quality]);
  useEffect(()=>{
    if(!pipeline)return;
    const ratio=gl.getPixelRatio();pipeline.composer.setPixelRatio(ratio);pipeline.composer.setSize(size.width,size.height);
    const scale=quality==='high'?.75:.5;
    pipeline.ao.setSize(Math.max(1,Math.floor(size.width*ratio*scale)),Math.max(1,Math.floor(size.height*ratio*scale)));
  },[pipeline,size.width,size.height,gl,quality]);
  useEffect(()=>()=>{if(pipeline){
    // r183 GTAOPass.dispose omits these two materials; release them explicitly on a quality switch.
    pipeline.ao.gtaoMaterial.dispose();pipeline.ao.blendMaterial.dispose();
    pipeline.ao.dispose();pipeline.beauty.dispose();pipeline.output.dispose();pipeline.composer.dispose();
  }},[pipeline]);
  useEffect(()=>{const previous=gl.info.autoReset;gl.info.autoReset=false;return()=>{gl.info.autoReset=previous;};},[gl]);
  useEffect(()=>{
    // GTAO renders the scene a second time for its G-buffer. Reuse the beauty pass shadow map.
    const previous=gl.shadowMap.autoUpdate;gl.shadowMap.autoUpdate=false;
    return()=>{gl.shadowMap.autoUpdate=previous;gl.shadowMap.needsUpdate=true;};
  },[gl]);
  useFrame((_,delta)=>{
    gl.info.reset();
    gl.shadowMap.needsUpdate=quality!=='performance';
    if(pipeline)pipeline.composer.render(delta);else gl.render(scene,camera);
    runtime.drawCalls=gl.info.render.calls;runtime.triangles=gl.info.render.triangles;
    runtime.geometryCount=gl.info.memory.geometries;runtime.textureCount=gl.info.memory.textures;
  },1);
  return null;
}
