import { beforeAll, describe, expect, it } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { gateSegments, PLAYER } from '../navigation/CollisionSystem';
import { roofGeometry } from '../architecture/RoofGeometry';
import { groundColliders } from '../world/GroundColliders';
beforeAll(async()=>{await RAPIER.init();});
describe('真实 Rapier 运动学控制器',()=>{
  it('大场景地面在出生点保持完整胶囊高度，无数值陷地',()=>{
    const w=new RAPIER.World({x:0,y:-9.81,z:0});
    for(const c of groundColliders())w.createCollider(RAPIER.ColliderDesc.cuboid(...c.half).setTranslation(...c.position));
    const body=w.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(20,1.1,537));const shape=w.createCollider(RAPIER.ColliderDesc.capsule(.55,.32),body),c=w.createCharacterController(.025);c.enableAutostep(.24,.1,true);c.enableSnapToGround(.3);w.step();
    for(let i=0;i<120;i++){c.computeColliderMovement(shape,{x:0,y:-1/60,z:0},undefined,undefined,q=>q.parent()?.handle!==body.handle);const p=body.translation(),m=c.computedMovement();body.setNextKinematicTranslation({x:p.x+m.x,y:p.y+m.y,z:p.z+m.z});w.step();}
    expect(body.translation().y).toBeGreaterThan(.86);expect(body.translation().y).toBeLessThan(.94);w.free();
  });
  function scene(start:[number,number,number]){
    const w=new RAPIER.World({x:0,y:-9.81,z:0});w.timestep=1/60;
    w.createCollider(RAPIER.ColliderDesc.cuboid(100,.25,100).setTranslation(0,-.25,0));
    const body=w.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(...start));
    const capsule=w.createCollider(RAPIER.ColliderDesc.capsule(PLAYER.halfHeight,PLAYER.radius),body);
    const c=w.createCharacterController(.025);c.enableAutostep(.24,.1,true);c.enableSnapToGround(.3);c.setMaxSlopeClimbAngle(Math.PI/4);
    const step=(dx:number,dz:number,count:number)=>{for(let i=0;i<count;i++){c.computeColliderMovement(capsule,{x:dx,y:-1/60,z:dz},undefined,undefined,other=>other.parent()?.handle!==body.handle);const p=body.translation(),m=c.computedMovement();body.setNextKinematicTranslation({x:p.x+m.x,y:p.y+m.y,z:p.z+m.z});w.step();}return body.translation();};
    return {w,body,c,step};
  }
  it('开放门洞可以穿过，侧墙不能穿过',()=>{
    for(const x of [0,5]){
      const s=scene([x,1,8]);for(const b of gateSegments(20,2,10,6,7))s.w.createCollider(RAPIER.ColliderDesc.cuboid(...b.half).setTranslation(...b.position));s.w.step();
      const p=s.step(0,-.1,180);
      if(x===0)expect(p.z).toBeLessThan(-7);else expect(p.z).toBeGreaterThan(1.3);
      expect(p.y).toBeGreaterThan(.86);s.w.free();
    }
  });
  it('真实17厘米台阶可上行，停步后不会陷地',()=>{
    const s=scene([0,1,5]);
    for(let i=0;i<8;i++){const h=(i+1)*.17;s.w.createCollider(RAPIER.ColliderDesc.cuboid(2,h/2,.35).setTranslation(0,h/2,3.5-i*.7));}
    s.w.step();const p=s.step(0,-.04,150);expect(p.y).toBeGreaterThan(1.8);s.step(0,0,60);expect(s.body.translation().y).toBeGreaterThan(1.8);s.w.free();
  });
  it('奔跑每步扫掠阻止穿过10厘米薄墙',()=>{
    const s=scene([0,1,5]);s.w.createCollider(RAPIER.ColliderDesc.cuboid(10,5,.05).setTranslation(0,5,0));s.w.step();
    expect(s.step(0,-PLAYER.runSpeed/60,200).z).toBeGreaterThan(.36);s.w.free();
  });
});
describe('屋顶几何质量',()=>{
  it('屋面三角形朝外，俯视不会丢失屋面',()=>{
    const g=roofGeometry(60,37,8,'double-hip');const n=g.getAttribute('normal');let y=0;for(let i=0;i<n.count;i++)y+=n.getY(i);expect(y/n.count).toBeGreaterThan(.2);g.dispose();
  });
  it('攒尖、庑殿与硬山具有不同的脊线',()=>{
    const a=roofGeometry(30,20,8,'pavilion'),b=roofGeometry(30,20,8,'hip'),c=roofGeometry(30,20,8,'gable');
    expect(a.getAttribute('position').getX(0)).not.toBe(b.getAttribute('position').getX(0));expect(b.getAttribute('position').getX(0)).not.toBe(c.getAttribute('position').getX(0));a.dispose();b.dispose();c.dispose();
  });
});
