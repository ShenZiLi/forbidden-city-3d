import { buildings } from '../data/worldManifest';
export const ArchitectureRegistry=new Map(buildings.map(b=>[b.id,b]));
