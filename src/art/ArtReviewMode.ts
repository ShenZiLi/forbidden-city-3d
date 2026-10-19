import { getReviewCameraPreset } from './reviewCameras';
import { destinations } from '../data/worldManifest';
const requested=typeof location==='undefined'?null:new URLSearchParams(location.search).get('artReview');
export const activeReviewPreset=requested?getReviewCameraPreset(requested):undefined;
export const reviewAnchor=destinations.find(d=>d.buildingId===activeReviewPreset?.focusBuildingId);
