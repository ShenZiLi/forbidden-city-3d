import { useMemo } from 'react';
import { Parts } from './Instances';
import type { Part } from './Instances';
import { materials, unitBox } from './materials';
export function DougongSystem({width,depth,y,bays}:{width:number;depth:number;y:number;bays:number}){
  const parts=useMemo(()=>{
    const p:Part[]=[];
    for(let i=0;i<=bays;i++)for(const side of [-1,1])for(let layer=0;layer<3;layer++){
      const x=-width*.44+i*width*.88/bays,z=side*depth*.42;
      p.push({position:[x,y+layer*.22,z],scale:[.6+layer*.3,.18,.65+layer*.24]});
      p.push({position:[x,y+layer*.22+.1,z],scale:[.22,.2,1+layer*.34]});
    }
    return p;
  },[width,depth,y,bays]);
  return <Parts parts={parts} geometry={unitBox} material={materials.teal}/>;
}
