import fs from 'node:fs';
import crypto from 'node:crypto';
import { FloatType } from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
const manifest=JSON.parse(fs.readFileSync('public/assets/environment/production-v3/manifest.json','utf8'));
const source=manifest.environments.daylight.channels.environment;
const bytes=fs.readFileSync(`public${source.path}`),array=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
const {width,height,data}=new HDRLoader().setDataType(FloatType).parse(array);
let peak=0;const luminance=i=>data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;
for(let i=0;i<data.length;i+=4)peak=Math.max(peak,luminance(i));
let x=0,y=0,z=0,weight=0,count=0;
for(let row=0;row<height;row++)for(let col=0;col<width;col++){
  const l=luminance((row*width+col)*4);if(l<peak*.8)continue;
  const longitude=((col+.5)/width-.5)*Math.PI*2,latitude=(.5-(row+.5)/height)*Math.PI;
  const w=l*Math.cos(latitude);x+=Math.cos(latitude)*Math.cos(longitude)*w;y+=Math.sin(latitude)*w;z+=Math.cos(latitude)*Math.sin(longitude)*w;weight+=w;count++;
}
const length=Math.hypot(x,y,z),direction=[x/length,y/length,z/length];
const output={version:1,sourcePath:source.path,sourceSha256:crypto.createHash('sha256').update(bytes).digest('hex'),method:'Radiance luminance-weighted centroid of pixels >= 80% of peak; HDRLoader flipY and Three equirectUv convention.',resolution:[width,height],peakRadianceLuminance:peak,selectedPixelCount:count,sourceDirection:direction,sourceElevationDegrees:Math.asin(direction[1])*180/Math.PI,note:'Aligns the brightest source cluster to the art directional light. Not a geographic solar-time or photometric exposure calibration; morning/evening still recolour one daylight sky.'};
if(!Number.isFinite(weight)||count===0||direction[1]<0)throw new Error('Invalid sun cluster; manual source review required.');
fs.writeFileSync('public/assets/environment/production-v3/lighting-calibration.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
