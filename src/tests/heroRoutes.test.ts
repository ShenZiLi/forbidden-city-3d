import { beforeAll, describe, expect, it } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { heroStairParts, taiheAssetSpec } from '../architecture/hero/HeroAssetSpec';
import { PLAYER } from '../navigation/CollisionSystem';

beforeAll(async()=>{await RAPIER.init();});
describe('太和殿退台共用规格的真实角色路径',()=>{
  for(const x of [-29,0,29])it(`x=${x} 从地面连续上三层台基，到达廊前而不进入殿身`,()=>{
    const w=new RAPIER.World({x:0,y:-9.81,z:0});w.timestep=1/60;
    w.createCollider(RAPIER.ColliderDesc.cuboid(100,.25,100).setTranslation(0,-.25,0));
    for(const c of [...taiheAssetSpec.platformColliders,taiheAssetSpec.bodyCollider])w.createCollider(RAPIER.ColliderDesc.cuboid(...c.half).setTranslation(...c.position));
    for(const f of taiheAssetSpec.stairs)for(const s of heroStairParts(f))w.createCollider(RAPIER.ColliderDesc.cuboid(s.scale[0]/2,s.scale[1]/2,s.scale[2]/2).setTranslation(...s.position));
    const body=w.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x,1,44));
    const shape=w.createCollider(RAPIER.ColliderDesc.capsule(PLAYER.halfHeight,PLAYER.radius),body);
    const controller=w.createCharacterController(.025);controller.enableAutostep(PLAYER.stepHeight,.1,true);controller.enableSnapToGround(.3);controller.setMaxSlopeClimbAngle(Math.PI/4);w.step();
    for(let i=0;i<1500&&body.translation().z>20;i++){
      controller.computeColliderMovement(shape,{x:0,y:-1/60,z:-.035},undefined,undefined,q=>q.parent()?.handle!==body.handle);
      const pos=body.translation(),delta=controller.computedMovement();
      body.setNextKinematicTranslation({x:pos.x+delta.x,y:pos.y+delta.y,z:pos.z+delta.z});w.step();
    }
    const reached=body.translation();
    expect(reached.z).toBeLessThan(21);expect(reached.z).toBeGreaterThan(taiheAssetSpec.body.depth/2+PLAYER.radius);
    expect(reached.y).toBeGreaterThan(8.13+PLAYER.center-.05);expect(reached.y).toBeLessThan(8.13+PLAYER.center+.15);
    w.free();
  });
});
