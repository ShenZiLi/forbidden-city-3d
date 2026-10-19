import { beforeAll, expect, it } from 'vitest';
import R from '@dimforge/rapier3d-compat';
import { buildings, destinations, walls } from '../data/worldManifest';
import { buildingColliders, PLAYER, platformSize } from '../navigation/CollisionSystem';
import { groundColliders } from '../world/GroundColliders';
import { NavigationGrid } from '../navigation/TraversalRules';
beforeAll(async()=>{await R.init();});
it('在真实 Rapier 世界中沿 A/B/C/D 外部路径逐步行走，无穿墙传送',()=>{
  const world=new R.World({x:0,y:-9.81,z:0});world.timestep=1/60;
  const add=(x:number,y:number,z:number,hx:number,hy:number,hz:number,angle=0)=>{
    if(hy<=0)return;
    world.createCollider(R.ColliderDesc.cuboid(hx,hy,hz).setTranslation(x,y,z).setRotation({x:0,y:Math.sin(angle/2),z:0,w:Math.cos(angle/2)}));
  };
  for(const c of groundColliders())add(...c.position,...c.half);
  for(const b of buildings){
    const c=Math.cos(b.rotation),s=Math.sin(b.rotation);
    for(const box of buildingColliders(b))add(b.x+box.position[0]*c+box.position[2]*s,box.position[1],b.z-box.position[0]*s+box.position[2]*c,...box.half,b.rotation);
    if(b.id!=='taihedian'&&b.collision==='solid'&&!b.parts?.length&&b.kind!=='platform'&&b.kind!=='wall'){
      const [,d]=platformSize(b),count=Math.ceil(b.base/.17),run=b.base*2.4+1;
      for(let i=0;i<count;i++){const z=d/2+run-(i+.5)*run/count,h=b.base*(i+1)/count;add(b.x+z*s,h/2,b.z+z*c,(b.id==='taihedian'?16:Math.min(10,b.width*.4))/2,h/2,run/count/2+.0075,b.rotation);}
    }
  }
  for(const w of walls){const side=(w.length-(w.opening??0))/2;for(const x of w.opening?[-(w.length+w.opening)/4,(w.length+w.opening)/4]:[0])add(w.x+x*Math.cos(w.rotation),w.height/2,w.z-x*Math.sin(w.rotation),w.opening?side/2:w.length/2,w.height/2,w.thickness/2,w.rotation);}
  const grid=new NavigationGrid();
  const point=(id:string)=>{const d=destinations.find(d=>d.id===id)!;return{x:d.position[0],z:d.position[2]};};
  const east=buildings.find(b=>b.name==='景仁宫')!,west=buildings.find(b=>b.name==='永寿宫')!;
  const routes=[['wumen','taihemen','taihedian','zhonghedian','baohedian'].map(point),['baohedian','qianqinggong','jiaotaidian','kunninggong'].map(point),[point('qianqinggong'),{x:east.x,z:east.z+east.depth/2+10},{x:west.x,z:west.z+west.depth/2+10}],['kunninggong','qinandian','shenwumen'].map(point)];
  const body=world.createRigidBody(R.RigidBodyDesc.kinematicPositionBased()),shape=world.createCollider(R.ColliderDesc.capsule(PLAYER.halfHeight,PLAYER.radius),body),controller=world.createCharacterController(.025);controller.enableAutostep(.24,.1,true);controller.enableSnapToGround(.3);controller.setMaxSlopeClimbAngle(Math.PI/4);
  try{
    for(let route=0;route<routes.length;route++){
      const points=routes[route];let first=true;
      for(let segment=1;segment<points.length;segment++){
        const path=grid.findPath(points[segment-1],points[segment]);expect(path.length).toBeGreaterThan(0);
        if(first){body.setTranslation({x:path[0].x,y:1.1,z:path[0].z},true);body.setNextKinematicTranslation({x:path[0].x,y:1.1,z:path[0].z});world.step();first=false;}
        for(const target of path.slice(1)){
          let step=0;
          for(;step<150;step++){
            const p=body.translation(),dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);if(d<.22)break;
            const speed=Math.min(.10,d);
            controller.computeColliderMovement(shape,{x:dx/d*speed,y:-1/60,z:dz/d*speed},undefined,undefined,c=>c.parent()?.handle!==body.handle);
            const m=controller.computedMovement();body.setNextKinematicTranslation({x:p.x+m.x,y:p.y+m.y,z:p.z+m.z});world.step();
          }
          expect(step,`Route ${route+1}: blocked at ${JSON.stringify(body.translation())}, target ${JSON.stringify(target)}`).toBeLessThan(150);
          expect(body.translation().y).toBeGreaterThan(.5);
        }
      }
    }
  }finally{world.free();}
},60000);
