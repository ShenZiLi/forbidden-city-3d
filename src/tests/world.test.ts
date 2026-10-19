import { describe, it, expect } from 'vitest';
import { geoToWorld, worldToGeo, footprintBounds, insideBounds } from '../world/WorldCoordinates';
import { buildings, regions, destinations, walls } from '../data/worldManifest';
import { validateWorld, isSafeSpawn, gateSegments } from '../navigation/CollisionSystem';
import { toggleView } from '../navigation/ViewModeController';
import { AssetManager } from '../streaming/AssetManager';

describe('米制世界坐标', () => {
  it('经纬度往返，东为正 X、北为负 Z', () => {
    const g = { lat: 39.918, lon: 116.398 };
    const p = geoToWorld(g);
    const result = worldToGeo(p);
    expect(result.lat).toBeCloseTo(g.lat, 8);
    expect(result.lon).toBeCloseTo(g.lon, 8);
    expect(geoToWorld({ lat: 39.916, lon: 116.4 }).x).toBeGreaterThan(0);
    expect(geoToWorld({ lat: 39.92, lon: 116.397 }).z).toBeLessThan(0);
  });
  it('旋转占地仍计算正确包围盒', () => {
    const b = footprintBounds({ x: 10, z: 20, width: 20, depth: 10, rotation: Math.PI / 2 });
    expect(b.minX).toBeCloseTo(5); expect(b.maxZ).toBeCloseTo(30);
    expect(insideBounds({ x: 10, z: 20 }, b)).toBe(true);
    expect(insideBounds({ x: 0, z: 0 }, b)).toBe(false);
  });
});
describe('宫城数据完整性', () => {
  it('建筑无重复，区域、来源、尺寸、实体和路径全部有效', () => {
    expect(buildings.length).toBeGreaterThanOrEqual(40);
    expect(validateWorld()).toEqual([]);
    expect(regions.length).toBeGreaterThanOrEqual(7);
    expect(buildings.every(b => b.sources.length && ['estimated','map-traced'].includes(b.accuracy.position))).toBe(true);
  });
  it('主要传送点均在宫城内且不与任何实体相交', () => {
    expect(destinations.length).toBeGreaterThanOrEqual(10);
    for (const d of destinations) expect(isSafeSpawn(d.position), d.name).toBe(true);
  });
  it('门洞拆分碰撞，中央通道保持开口', () => {
    const boxes = gateSegments(30, 5, 10, 6, 7);
    expect(boxes.length).toBe(3);
    expect(boxes.filter(b => b.position[1] < 7).every(b => Math.abs(b.position[0]) - b.half[0] >= 3)).toBe(true);
    expect(walls.every(w => w.length > 0)).toBe(true);
  });
  it('视角切换不会变更位置与朝向', () => {
    const s = { mode: 'first' as const, position: [1, 2, 3] as [number, number, number], yaw: 1.2 };
    expect(toggleView(s)).toEqual({ ...s, mode: 'third' });
    expect(toggleView(toggleView(s))).toEqual(s);
  });
});
describe('真实异步资源状态与引用', () => {
  it('合并并发请求，保留共享引用，在最后一次释放时回收', async () => {
    const m = new AssetManager<{ value: number }>(); let loads = 0; let disposals = 0;
    const loader = async () => { loads++; return { value: 42 }; };
    const [a, b] = await Promise.all([m.acquire('shared', loader, () => disposals++), m.acquire('shared', loader)]);
    expect(a).toBe(b); expect(loads).toBe(1); expect(m.refs('shared')).toBe(2);
    m.release('shared'); expect(disposals).toBe(0);
    m.release('shared'); expect(disposals).toBe(1); expect(m.size).toBe(0);
  });
  it('失败不会伪装成功且可重试', async () => {
    const m = new AssetManager<number>();
    await expect(m.acquire('bad', async () => { throw Error('offline'); })).rejects.toThrow('offline');
    expect(m.status('bad')).toBe('error');
    expect(await m.acquire('bad', async () => 7)).toBe(7);
    expect(m.status('bad')).toBe('ready'); m.release('bad');
  });
  it('加载中释放会取消请求，旧请求不会覆盖新一代', async () => {
    const m = new AssetManager<number>();
    const p = m.acquire('cancel', signal => new Promise((_, reject) => signal.addEventListener('abort', () => reject(Error('aborted')))));
    m.release('cancel'); await expect(p).rejects.toThrow('aborted');
    expect(await m.acquire('cancel', async () => 9)).toBe(9); m.release('cancel');
  });
});
