import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier, useBeforePhysicsStep, useAfterPhysicsStep } from '@react-three/rapier';
import type { RapierRigidBody, RapierCollider } from '@react-three/rapier';
import type { KinematicCharacterController } from '@dimforge/rapier3d-compat';
import { Euler, Quaternion, Vector3, PerspectiveCamera } from 'three';
import type { Group } from 'three';
import { runtime, useGame } from '../app/GameContext';
import { PLAYER, isSafeSpawn } from './CollisionSystem';
import { Avatar } from './Avatar';
import { activeReviewPreset } from '../art/ArtReviewMode';
export function PlayerController(){
  const {world,rapier}=useRapier(),{camera,gl}=useThree(),game=useGame();
  const body=useRef<RapierRigidBody>(null),capsule=useRef<RapierCollider>(null),controller=useRef<KinematicCharacterController|null>(null);
  const avatar=useRef<Group>(null);
  const keys=useRef(new Set<string>()),drag=useRef(false),velocity=useRef({x:0,y:0,z:0});
  const vectors=useRef({eye:new Vector3(),target:new Vector3(),direction:new Vector3(),up:new Vector3(0,1,0),euler:new Euler(0,0,0,'YXZ'),rotation:new Quaternion()});
  const current=useRef(game);current.current=game;
  useEffect(()=>{
    const c=world.createCharacterController(.025);c.enableAutostep(PLAYER.stepHeight,.1,true);c.enableSnapToGround(.3);c.setMaxSlopeClimbAngle(Math.PI/4);c.setMinSlopeSlideAngle(Math.PI*.28);c.setSlideEnabled(true);controller.current=c;
    return()=>{controller.current=null;world.removeCharacterController(c);};
  },[world]);
  useEffect(()=>{
    const reset=()=>{keys.current.clear();drag.current=false;velocity.current.x=velocity.current.z=0;runtime.moving=false;};
    const down=(e:KeyboardEvent)=>{const g=current.current;if(!g.started||g.paused||g.settings||g.selected||g.mode==='overview'||e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement)return;if(['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();keys.current.add(e.code);}};
    const up=(e:KeyboardEvent)=>keys.current.delete(e.code);
    const move=(e:MouseEvent)=>{const g=current.current;if(!g.started||g.paused||g.settings||g.mode==='overview')return;if(document.pointerLockElement!==gl.domElement&&!drag.current)return;runtime.yaw-=e.movementX*.0017*g.sensitivity;runtime.pitch=Math.max(-1.15,Math.min(1.2,runtime.pitch+e.movementY*.0017*g.sensitivity));};
    const pointer=(e:PointerEvent)=>{const g=current.current;if(!g.started||g.paused||g.settings||g.selected)return;if(g.mode==='first'&&e.button===0){gl.domElement.requestPointerLock()?.catch(()=>{});}else if(g.mode==='third')drag.current=true;};
    const pointerup=()=>{drag.current=false;};
    const lock=()=>{if(!document.pointerLockElement){reset();if(current.current.started&&current.current.mode==='first')current.current.setPaused(true);}};
    const blur=()=>{reset();if(current.current.started)current.current.setPaused(true);};
    const visibility=()=>{if(document.hidden)blur();};
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('mousemove',move);window.addEventListener('pointerup',pointerup);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);document.addEventListener('pointerlockchange',lock);gl.domElement.addEventListener('pointerdown',pointer);
    return()=>{reset();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('mousemove',move);window.removeEventListener('pointerup',pointerup);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('pointerlockchange',lock);gl.domElement.removeEventListener('pointerdown',pointer);};
  },[gl]);
  useEffect(()=>{keys.current.clear();runtime.moving=false;velocity.current.x=velocity.current.z=0;},[game.paused,game.settings,game.selected,game.mode]);
  useBeforePhysicsStep(()=>{
    if(!body.current||!capsule.current||!controller.current)return;
    const dt=world.timestep,p=body.current.translation(),v=velocity.current,g=current.current;
    if(runtime.teleport){const next=runtime.teleport;runtime.teleport=null;if(isSafeSpawn(next)){body.current.setTranslation({x:next[0],y:next[1],z:next[2]},true);body.current.setNextKinematicTranslation({x:next[0],y:next[1],z:next[2]});runtime.position=[...next];runtime.yaw=runtime.teleportYaw;v.x=v.y=v.z=0;keys.current.clear();}return;}
    const active=g.started&&!g.paused&&!g.settings&&!g.selected&&g.mode!=='overview';
    let f=active?(Number(keys.current.has('KeyW'))-Number(keys.current.has('KeyS'))):0;
    let s=active?(Number(keys.current.has('KeyD'))-Number(keys.current.has('KeyA'))):0;
    const len=Math.hypot(f,s);if(len>0){f/=len;s/=len;}
    runtime.running=keys.current.has('ShiftLeft')||keys.current.has('ShiftRight');
    const speed=runtime.running?PLAYER.runSpeed:PLAYER.speed;
    const blend=1-Math.exp(-14*dt),yaw=runtime.yaw;
    v.x+=((-Math.sin(yaw)*f+Math.cos(yaw)*s)*speed-v.x)*blend;
    v.z+=((-Math.cos(yaw)*f-Math.sin(yaw)*s)*speed-v.z)*blend;
    v.y=controller.current.computedGrounded()?-1:Math.max(-25,v.y-9.81*dt);
    controller.current.computeColliderMovement(capsule.current,{x:v.x*dt,y:v.y*dt,z:v.z*dt},undefined,undefined,c=>c.parent()?.handle!==body.current?.handle);
    const m=controller.current.computedMovement();body.current.setNextKinematicTranslation({x:p.x+m.x,y:p.y+m.y,z:p.z+m.z});
    if(import.meta.env.DEV&&runtime.frames%30===0){const shape=capsule.current.shape as unknown as {halfHeight:number;radius:number};const ray=new rapier.Ray({x:p.x,y:10,z:p.z},{x:0,y:-1,z:0});const hit=world.castRayAndGetNormal(ray,20,true,undefined,undefined,capsule.current,body.current);runtime.physics={halfHeight:shape.halfHeight,radius:shape.radius,colliderY:capsule.current.translation().y,moveY:m.y,dt,rotation:capsule.current.rotation(),floor:hit?{distance:hit.timeOfImpact,normal:hit.normal}:null};}
    runtime.moving=Math.hypot(m.x,m.z)>.001;runtime.grounded=controller.current.computedGrounded();
    if(p.y< -5){runtime.teleport=[20,1.1,537];runtime.teleportYaw=0;}
  });
  useAfterPhysicsStep(()=>{if(!body.current)return;const p=body.current.translation();runtime.position[0]=p.x;runtime.position[1]=p.y;runtime.position[2]=p.z;});
  useFrame((_,delta)=>{
    if(!body.current)return;
    const p=body.current.translation(),v=vectors.current;
    if(avatar.current)avatar.current.rotation.y=runtime.yaw;
    if(activeReviewPreset){
      camera.position.fromArray(activeReviewPreset.position);camera.lookAt(...activeReviewPreset.target);
      if(camera instanceof PerspectiveCamera&&camera.fov!==activeReviewPreset.fov){camera.fov=activeReviewPreset.fov;camera.updateProjectionMatrix();}
      gl.toneMappingExposure=activeReviewPreset.exposure;
    }else if(!game.started&&game.mode!=='overview'){
      camera.position.set(165,92,650);camera.lookAt(8,12,355);
    }else if(game.mode==='overview'){
      camera.position.set(0,1050,480);camera.lookAt(0,0,0);
    }else{
      v.eye.set(p.x,p.y+PLAYER.eye-PLAYER.center,p.z);
      v.euler.set(-runtime.pitch,runtime.yaw,0,'YXZ');v.rotation.setFromEuler(v.euler);
      if(game.mode==='first'){camera.position.copy(v.eye);camera.quaternion.copy(v.rotation);}
      else{
        v.direction.set(0,1.5,5.8).applyAxisAngle(v.up,runtime.yaw);v.direction.y+=runtime.pitch*3;
        const distance=v.direction.length();v.direction.normalize();
        // Multi-ray clearance includes the near-plane corners, not only the camera centre.
        let safe=distance;
        for(const dx of [-.2,0,.2]){
          const ray=new rapier.Ray({x:v.eye.x+dx,y:v.eye.y,z:v.eye.z},v.direction);
          const hit=world.castRay(ray,distance,true,undefined,undefined,capsule.current??undefined,body.current??undefined);
          if(hit)safe=Math.min(safe,Math.max(.18,hit.timeOfImpact-.25));
        }
        v.target.copy(v.eye).addScaledVector(v.direction,safe);camera.position.copy(v.target);camera.lookAt(v.eye.x,v.eye.y-.1,v.eye.z);
      }
    }
    runtime.frames++;runtime.frameMs.push(delta*1000);if(runtime.frameMs.length>1200)runtime.frameMs.shift();
    if(runtime.frames%30===0){const n=runtime.frameMs.slice(-60);runtime.fps=1000/(n.reduce((a,b)=>a+b,0)/n.length);runtime.drawCalls=gl.info.render.calls;runtime.triangles=gl.info.render.triangles;runtime.geometryCount=gl.info.memory.geometries;runtime.textureCount=gl.info.memory.textures;}
  });
  return <RigidBody ref={body} type="kinematicPosition" position={runtime.position} colliders={false} enabledRotations={[false,false,false]} name="player"><CapsuleCollider ref={capsule} args={[PLAYER.halfHeight,PLAYER.radius]} friction={0}/><group ref={avatar}><Avatar visible={game.started&&game.mode==='third'}/></group></RigidBody>;
}
