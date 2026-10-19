import type { Bounds } from '../world/WorldCoordinates';
export type RoofType = 'double-hip' | 'hip' | 'double-gable-hip' | 'gable-hip' | 'gable' | 'pavilion' | 'truncated-hip';
export interface Building {
  id: string; name: string; english?: string; region: string;
  kind: 'palace' | 'gate' | 'pavilion' | 'annex' | 'platform' | 'wall';
  x: number; z: number; width: number; depth: number; height: number; base: number; rotation: number;
  roof: RoofType; bays: number; major: boolean; enterable: boolean;
  footprint: [number, number][];
  parts?: {x:number;z:number;width:number;depth:number}[];
  model: 'procedural:v1'; collision: 'solid' | 'passage'; passageWidth?: number;
  description: string; sources: string[]; sourceUrl?: string; osmId?: string;
  accuracy: { position: 'map-traced' | 'estimated'; dimensions: 'published-partial' | 'map-envelope'; height: 'published' | 'estimated'; orientation: 'map-traced' | 'estimated'; errorBudget: string };
}
export interface Region { id: string; name: string; bounds: Bounds; priority: number; asset: string; status: string }
export interface Wall { id: string; x: number; z: number; length: number; height: number; thickness: number; rotation: number; opening?: number }
export interface Destination { id: string; name: string; buildingId: string; position: [number, number, number]; yaw: number; region: string }
