import { useMemo } from 'react';
import { Parts } from './Instances';
import type { Part } from './Instances';
import { materials, unitBox, unitColumn, unitSphere } from './materials';
/** Exterior joinery only; interiors and historic paint motifs remain artistic approximations. */
export function FacadeDetails({width,depth,height,base,bays}:{width:number;depth:number;height:number;base:number;bays:number}){
  const pieces=useMemo(()=>{
    const recess:Part[]=[],panels:Part[]=[],frames:Part[]=[],studs:Part[]=[],feet:Part[]=[],trim:Part[]=[];
    const bay=width*.88/bays;
    for(const side of [-1,1]){
      for(let i=0;i<bays;i++){
        const x=-width*.44+(i+.5)*bay,z=side*(depth*.4+.035),w=bay*.82;
        recess.push({position:[x,base+height*.47,z],scale:[w,height*.79,.1]});
        panels.push({position:[x,base+height*.17,z+side*.065],scale:[w*.91,height*.25,.12]});
        for(const dx of [-.5,0,.5])frames.push({position:[x+dx*w,base+height*.47,z+side*.08],scale:[Math.min(.12,w*.06),height*.81,.12]});
        for(let j=0;j<7;j++)frames.push({position:[x,base+height*(.33+j*.075),z+side*.075],scale:[w,.045,.095]});
        for(const dx of [-.25,.25])for(let j=0;j<3;j++)studs.push({position:[x+dx*w,base+height*(.1+j*.06),z+side*.145],scale:[.032,.032,.024]});
      }
      trim.push({position:[0,base+.13,side*depth*.43],scale:[width*.94,.26,.32]});
      for(let i=0;i<=bays;i++){
        const radius=Math.max(.22,width*.008);
        feet.push({position:[-width*.44+i*bay,base+.12,side*depth*.43],scale:[radius,.24,radius]});
      }
    }
    return {recess,panels,frames,studs,feet,trim};
  },[width,depth,height,base,bays]);
  return <><Parts parts={pieces.recess} geometry={unitBox} material={materials.dark} shadows={false}/><Parts parts={pieces.panels} geometry={unitBox} material={materials.red}/><Parts parts={pieces.frames} geometry={unitBox} material={materials.red}/><Parts parts={pieces.studs} geometry={unitSphere} material={materials.gold} shadows={false}/><Parts parts={pieces.feet} geometry={unitColumn} material={materials.marble}/><Parts parts={pieces.trim} geometry={unitBox} material={materials.red}/></>;
}
