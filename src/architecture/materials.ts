import { MeshStandardMaterial,MeshPhysicalMaterial, BoxGeometry, CylinderGeometry, SphereGeometry, RepeatWrapping, SRGBColorSpace, NoColorSpace, BackSide } from 'three';
import type { Texture } from 'three';
import { applySurfaceMapping } from './SurfaceMaterial';
import { textureAssets } from './TextureLibrary';
import { createMicrostructure } from './MaterialMicrostructure';
export const unitBox=new BoxGeometry(1,1,1);
export const unitColumn=new CylinderGeometry(1,1,1,20);
export const unitSphere=new SphereGeometry(1,16,12);
export const materials={
  plaster:new MeshStandardMaterial({color:'#e0c4b7',roughness:.92,bumpScale:.035}),
  red:new MeshStandardMaterial({color:'#e2c7ba',roughness:.53,bumpScale:.012}),
  roof:new MeshStandardMaterial({color:'#d7c195',roughness:.43,bumpScale:.055,metalness:0}),
  heroGlaze:new MeshPhysicalMaterial({color:'#a9843d',roughness:.36,metalness:0,clearcoat:.22,clearcoatRoughness:.27}),
  stone:new MeshStandardMaterial({color:'#d3cebe',roughness:.94,bumpScale:.04}),
  columnStone:new MeshStandardMaterial({color:'#aaa99f',roughness:.78,metalness:0}),
  marble:new MeshStandardMaterial({color:'#e2ded0',roughness:.78,bumpScale:.014}),
  dark:new MeshStandardMaterial({color:'#28251f',roughness:.86}),
  soffit:new MeshStandardMaterial({color:'#4b3425',roughness:.88,side:BackSide}),
  teal:new MeshStandardMaterial({color:'#c4bd9a',roughness:.72,bumpScale:.008}),
  gold:new MeshStandardMaterial({color:'#9c8248',roughness:.47,metalness:.48}),
  foliage:new MeshStandardMaterial({color:'#3c5135',roughness:1}),
};
export const groundMaterial=new MeshStandardMaterial({color:'#c4c0b4',roughness:.98,bumpScale:.055});
let configured:Texture[]=[];
export function configureImperialMaterials(textures:Texture[]){
  if(configured===textures)return;
  configured=textures;
  textures.forEach(t=>{t.wrapS=t.wrapT=RepeatWrapping;t.colorSpace=SRGBColorSpace;t.anisotropy=8;t.needsUpdate=true;});
  const assignments=[
    [materials.roof,0,true],[materials.plaster,1,false],[materials.stone,2,false],
    [groundMaterial,2,false],[materials.red,3,false],[materials.marble,4,false],[materials.teal,5,false],
  ] as const;
  const micro=[createMicrostructure('glaze'),createMicrostructure('lacquer'),createMicrostructure('stone'),createMicrostructure('paint')];
  materials.heroGlaze.normalMap=micro[0].normal;materials.heroGlaze.normalScale.set(.3,.3);materials.heroGlaze.roughnessMap=micro[0].roughness;materials.heroGlaze.roughness=1;
  applySurfaceMapping(materials.heroGlaze,[.43,1.6],true);materials.heroGlaze.needsUpdate=true;
  materials.columnStone.normalMap=micro[2].normal;materials.columnStone.normalScale.set(.4,.4);materials.columnStone.roughnessMap=micro[2].roughness;materials.columnStone.roughness=1;
  applySurfaceMapping(materials.columnStone,[1,1]);materials.columnStone.needsUpdate=true;
  for(const [material,index,roof] of assignments){
    const finish=micro[index===0?0:index===3?1:index===5?3:2];
    material.map=textures[index];material.bumpMap=null;material.normalMap=finish.normal;
    material.normalScale.set(.45,.45);material.roughnessMap=finish.roughness;material.roughness=1;
    applySurfaceMapping(material,textureAssets[index].period,roof);material.needsUpdate=true;
  }
}

/** A complete matched channel set; never reuse colour images as linear data. */
export function configureScannedMaterial(material:MeshStandardMaterial,textures:readonly Texture[],period:readonly[number,number],tint:string){
  const [baseColor,normal,roughness,ao]=textures;
  textures.forEach((t,i)=>{t.colorSpace=i===0?SRGBColorSpace:NoColorSpace;t.wrapS=t.wrapT=RepeatWrapping;t.anisotropy=8;t.needsUpdate=true;});
  material.color.set(tint);material.map=baseColor;material.bumpMap=null;
  material.normalMap=normal;material.normalScale.set(.55,.55);material.roughnessMap=roughness;material.roughness=1;material.aoMap=ao;material.aoMapIntensity=.7;material.metalness=0;
  applySurfaceMapping(material,period);material.needsUpdate=true;
}
