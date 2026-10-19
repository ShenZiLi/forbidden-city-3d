import { describe, expect, it } from 'vitest';
import { buildings } from '../data/worldManifest';
import { getReviewCameraPreset, reviewCameraPresets } from '../art/reviewCameras';

describe('固定美术审查机位', () => {
  it('所有机位引用已有建筑、世界坐标有限，摄影机和目标不重合', () => {
    expect(new Set(reviewCameraPresets.map(p => p.id)).size).toBe(reviewCameraPresets.length);
    for (const p of reviewCameraPresets) {
      expect(buildings.some(b => b.id === p.focusBuildingId)).toBe(true);
      expect([...p.position, ...p.target, p.fov].every(Number.isFinite)).toBe(true);
      expect(Math.hypot(...p.position.map((v, i) => v - p.target[i]))).toBeGreaterThan(0.1);
      expect(p.fov).toBeGreaterThanOrEqual(25); expect(p.fov).toBeLessThanOrEqual(70);
      expect(p.purpose.length).toBeGreaterThan(10);
      expect(getReviewCameraPreset(p.id)).toEqual(p);
    }
    expect(getReviewCameraPreset('not-a-preset')).toBeUndefined();
  });

  it('正面人眼机位在真实太和殿前90–120米，保留1.65米眼高', () => {
    const b = buildings.find(b => b.id === 'taihedian')!;
    const p = getReviewCameraPreset('taihe-front-eye')!;
    expect(Math.hypot(p.position[0] - b.x, p.position[2] - b.z)).toBeGreaterThanOrEqual(90);
    expect(Math.hypot(p.position[0] - b.x, p.position[2] - b.z)).toBeLessThanOrEqual(120);
    expect(p.position[1]).toBe(1.65);
    expect(p.position[2]).toBeGreaterThan(b.z);
  });

  it('太和殿具备完整12类比较视图，入口全景另列，不把抬高机位当角色眼高', () => {
    const taihe = reviewCameraPresets.filter(p => p.focusBuildingId === 'taihedian');
    for (const suffix of ['front-eye', 'front-mid', '45', 'east', 'west', 'rear', 'eaves', 'column-base', 'door', 'tile-edge', 'terrace', 'distant']) {
      expect(taihe.some(p => p.id === `taihe-${suffix}`)).toBe(true);
    }
    expect(getReviewCameraPreset('entrance-panorama')?.focusBuildingId).toBe('wumen');
    expect(getReviewCameraPreset('taihe-45')!.position[1]).toBeGreaterThan(1.65);
  });
});
