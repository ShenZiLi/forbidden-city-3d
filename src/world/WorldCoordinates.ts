export const ORIGIN = { lat: 39.9166, lon: 116.39075 };
const R = 6378137;
const DEG = Math.PI / 180;
export type Point2 = { x: number; z: number };
export type Bounds = { minX: number; maxX: number; minZ: number; maxZ: number };
/** WGS84 local tangent approximation (<2 km); NOT GCJ-02/Baidu coordinates. */
export function geoToWorld(g: { lat: number; lon: number }): Point2 {
  return { x: (g.lon - ORIGIN.lon) * DEG * R * Math.cos(ORIGIN.lat * DEG), z: -(g.lat - ORIGIN.lat) * DEG * R };
}
export function worldToGeo(p: Point2) {
  return { lat: ORIGIN.lat - p.z / (DEG * R), lon: ORIGIN.lon + p.x / (DEG * R * Math.cos(ORIGIN.lat * DEG)) };
}
export function footprintBounds(b: Point2 & { width: number; depth: number; rotation: number }): Bounds {
  const c = Math.abs(Math.cos(b.rotation)), s = Math.abs(Math.sin(b.rotation));
  const x = (b.width * c + b.depth * s) / 2, z = (b.width * s + b.depth * c) / 2;
  return { minX: b.x - x, maxX: b.x + x, minZ: b.z - z, maxZ: b.z + z };
}
export function insideBounds(p: Point2, b: Bounds, margin = 0) {
  return p.x >= b.minX + margin && p.x <= b.maxX - margin && p.z >= b.minZ + margin && p.z <= b.maxZ - margin;
}
export function toLocal(p: Point2, b: Point2 & { rotation: number }): Point2 {
  const dx = p.x - b.x, dz = p.z - b.z, c = Math.cos(b.rotation), s = Math.sin(b.rotation);
  return { x: dx * c - dz * s, z: dx * s + dz * c };
}
