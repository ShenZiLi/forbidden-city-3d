import type { DirectionalLight } from 'three';
export function syncShadowResolution(light:DirectionalLight,size:number,enabled:boolean){
  const shadow=light.shadow;
  const resized=!!shadow.map&&(shadow.map.width!==size||shadow.map.height!==size);
  if(!enabled||resized){
    shadow.map?.dispose();shadow.mapPass?.dispose();shadow.map=null;shadow.mapPass=null;
  }
  shadow.mapSize.set(size,size);shadow.needsUpdate=enabled;
}
