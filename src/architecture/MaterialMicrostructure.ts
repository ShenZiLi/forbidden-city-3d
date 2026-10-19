import { DataTexture, NoColorSpace, RepeatWrapping, RGBAFormat, UnsignedByteType,LinearFilter,LinearMipmapLinearFilter } from 'three';

/** Analytic surface finish, not a scan or a normal map inferred from a photograph.
 * Low amplitude periodic derivatives avoid seams. Geometry still carries architectural relief.
 */
export function createMicrostructure(kind:'glaze'|'lacquer'|'stone'|'paint',size=128){
  const normal=new Uint8Array(size*size*4),roughness=new Uint8Array(size*size*4);
  const base={glaze:.36,lacquer:.48,stone:.76,paint:.65}[kind];
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=x/size*Math.PI*2,v=y/size*Math.PI*2,i=(y*size+x)*4;
    const grain=Math.sin(u*19+Math.sin(v*3))*.5+Math.sin(v*23+u*7)*.25;
    const amplitude=kind==='stone'?.085:kind==='glaze'?.025:.04;
    const nx=amplitude*Math.cos(u*19+Math.sin(v*3));
    const ny=amplitude*Math.cos(v*23+u*7)*(kind==='lacquer'?.25:1);
    const nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
    normal.set([Math.round((nx*.5+.5)*255),Math.round((ny*.5+.5)*255),Math.round((nz*.5+.5)*255),255],i);
    const r=Math.round(Math.max(0,Math.min(1,base+grain*.055))*255);roughness.set([r,r,r,255],i);
  }
  const texture=(data:Uint8Array)=>{const t=new DataTexture(data,size,size,RGBAFormat,UnsignedByteType);t.colorSpace=NoColorSpace;t.wrapS=t.wrapT=RepeatWrapping;t.magFilter=LinearFilter;t.minFilter=LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;};
  return {normal:texture(normal),roughness:texture(roughness)};
}
