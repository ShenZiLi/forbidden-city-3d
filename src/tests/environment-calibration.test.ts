import { describe,it,expect } from 'vitest';
import { Euler,Matrix4,Vector3 } from 'three';
import { environmentRotationForSun,sunPositions } from '../world/EnvironmentCalibration';
import calibration from '../../public/assets/environment/production-v3/lighting-calibration.json';
describe('HDRI and shadow sun alignment',()=>{
  it('matches the source bright-cluster direction under r183 PMREM sampling convention for all light presets',()=>{
    const source=new Vector3(...calibration.sourceDirection as [number,number,number]);
    for(const target of Object.values(sunPositions)){
      const rotation=environmentRotationForSun(target);
      const shaderRotation=new Matrix4().makeRotationFromEuler(new Euler(-rotation[0],-rotation[1],-rotation[2],'XYZ'));
      expect(new Vector3(...target).normalize().applyMatrix4(shaderRotation).distanceTo(source)).toBeLessThan(1e-7);
    }
    expect(calibration.sourceElevationDegrees).toBeGreaterThan(47);expect(calibration.sourceElevationDegrees).toBeLessThan(49);
  });
});
