import type { BoxCollider } from '../navigation/CollisionSystem';
// Huge single cuboids lose GJK precision against a metre-scale capsule in Rapier f32.
// Contiguous 100 m slabs keep the numerical range local without altering world coordinates.
export function groundColliders():BoxCollider[]{
  const boxes:BoxCollider[]=[];
  for(let x=-750;x<800;x+=100)for(let z=-800;z<850;z+=100)boxes.push({position:[x,-.25,z],half:[50,.25,50]});
  return boxes;
}
