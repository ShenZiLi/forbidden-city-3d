import { useEffect } from 'react';
import { Physics } from '@react-three/rapier';
import { useGame, runtime } from '../app/GameContext';
import { Terrain } from './Terrain';
import { Lighting } from './Lighting';
import { GroundSurface } from './GroundSurface';
import { Environment } from './Environment';
import { BuildingFactory, BuildingCollisions } from '../architecture/BuildingFactory';
import { WallSystem } from '../architecture/WallSystem';
import { PlayerController } from '../navigation/PlayerController';
import { useImperialMaterials } from '../hooks/useImperialMaterials';
import { RenderPipeline } from './RenderPipeline';
function Ready(){const {setReady}=useGame();useEffect(()=>{runtime.ready=true;runtime.loadedAt=performance.now();setReady(true);},[setReady]);return null;}
export function ForbiddenCityWorld(){useImperialMaterials();const {debug}=useGame();return <><Lighting/><Physics gravity={[0,-9.81,0]} timeStep={1/60} debug={debug}><Terrain/><GroundSurface/><Environment/><BuildingFactory/><BuildingCollisions/><WallSystem/><PlayerController/><Ready/></Physics><RenderPipeline/></>;}
