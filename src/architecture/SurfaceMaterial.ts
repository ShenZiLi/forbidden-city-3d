import { MeshStandardMaterial, ShaderChunk } from 'three';
/** Metre-based UVs, including scaled InstancedMesh objects. No per-building texture clones. */
export function applySurfaceMapping(material:MeshStandardMaterial,period:readonly[number,number],roof=false){
  material.onBeforeCompile=shader=>{
    const px=period[0].toFixed(4),py=period[1].toFixed(4);
    shader.vertexShader=`varying vec3 vImperialPosition;\nvarying vec3 vImperialNormal;\nvarying vec2 vImperialRoofUv;\n${shader.vertexShader}`;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vec4 imperialWorld = vec4(transformed, 1.0);
      vec3 imperialNormal = objectNormal;
      vec3 imperialRoofPosition = transformed;
      #ifdef USE_INSTANCING
        imperialWorld = instanceMatrix * imperialWorld;
        mat3 imperialInstance = mat3(instanceMatrix);
        // Inverse-transpose for orthogonal TRS columns, matching Three's defaultnormal_vertex.
        imperialNormal = imperialInstance * (imperialNormal / vec3(dot(imperialInstance[0],imperialInstance[0]),dot(imperialInstance[1],imperialInstance[1]),dot(imperialInstance[2],imperialInstance[2])));
        imperialRoofPosition *= vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
      #endif
      vImperialPosition = (modelMatrix * imperialWorld).xyz;
      mat3 imperialModel = mat3(modelMatrix);
      vImperialNormal = normalize(imperialModel * (imperialNormal / vec3(dot(imperialModel[0],imperialModel[0]),dot(imperialModel[1],imperialModel[1]),dot(imperialModel[2],imperialModel[2]))));
      vImperialRoofUv = abs(objectNormal.x) > abs(objectNormal.z) ? imperialRoofPosition.zy / vec2(${px},${py}) : imperialRoofPosition.xz / vec2(${px},${py});
    `);
    const projection=roof?'return vImperialRoofUv;':`
      vec3 n=abs(vImperialNormal);
      vec2 uv=n.y>0.65?vImperialPosition.xz:(n.x>n.z?vImperialPosition.zy:vImperialPosition.xy);
      return uv/vec2(${px},${py});`;
    shader.fragmentShader=`varying vec3 vImperialPosition;\nvarying vec3 vImperialNormal;\nvarying vec2 vImperialRoofUv;\nvec2 imperialSurfaceUv(){${projection}}\n${shader.fragmentShader}`;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',ShaderChunk.map_fragment.replaceAll('vMapUv','imperialSurfaceUv()'));
    shader.fragmentShader=shader.fragmentShader.replace('#include <bumpmap_pars_fragment>',ShaderChunk.bumpmap_pars_fragment.replaceAll('vBumpMapUv','imperialSurfaceUv()'));
    // The derivative tangent frame must use the same metre-based UV as the normal lookup.
    for(const [chunk,uv] of [
      ['normal_fragment_begin','vNormalMapUv'],['normal_fragment_maps','vNormalMapUv'],
      ['roughnessmap_fragment','vRoughnessMapUv'],['aomap_fragment','vAoMapUv'],
    ] as const) shader.fragmentShader=shader.fragmentShader.replace(`#include <${chunk}>`,ShaderChunk[chunk].replaceAll(uv,'imperialSurfaceUv()'));
  };
  material.customProgramCacheKey=()=>`imperial-v3:${period.join(',')}:${roof?'roof':'surface'}`;
}
