import { buildings } from '../data/worldManifest';

export interface ReviewCameraPreset {
  id: string;
  label: string;
  focusBuildingId: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  time: 'morning' | 'noon' | 'evening';
  quality: 'high' | 'balanced' | 'performance';
  purpose: string;
  exposure: number;
  version: string;
}

/** Inspection cameras use current mapped building anchors; they never relocate geometry or players. */
function camera(id: string, label: string, focusBuildingId: string, position: [number, number, number], target: [number, number, number], fov: number, purpose: string): ReviewCameraPreset {
  const b = buildings.find(b => b.id === focusBuildingId);
  if (!b) throw new Error(`摄影机引用不存在的建筑：${focusBuildingId}`);
  // Same Y rotation as BuildingFactory: east +X, south +Z, Y is absolute world elevation.
  const world = ([x, y, z]: [number, number, number]): [number, number, number] => [
    b.x + x * Math.cos(b.rotation) + z * Math.sin(b.rotation), y,
    b.z - x * Math.sin(b.rotation) + z * Math.cos(b.rotation),
  ];
  return { id, label, focusBuildingId, position: world(position), target: world(target), fov,
    time: 'morning', quality: 'high', exposure: 1, version: 'm0-2026-10-20', purpose };
}

// Elevated close-ups are inspection views, not reachable standing points or surveyed component coordinates.
export const reviewCameraPresets: ReviewCameraPreset[] = [
  camera('taihe-front-eye', '太和殿 · 正面人眼', 'taihedian', [0, 1.65, 105], [0, 17, 0], 50, '从前院成人眼高审查整体比例、台基压迫感与屋面轮廓。'),
  camera('taihe-front-mid', '太和殿 · 正面中景', 'taihedian', [0, 12, 85], [0, 18, 0], 48, '抬高的审查机位：比较十一间柱网、上下檐与三层台基关系。'),
  camera('taihe-45', '太和殿 · 东南45度', 'taihedian', [76, 26, 76], [0, 17, 0], 52, '抬高的审查机位：同时检查正侧面、完整台基和上下屋顶体量。'),
  camera('taihe-east', '太和殿 · 东侧', 'taihedian', [85, 14, 0], [0, 18, 0], 50, '比较侧面进深、庑殿坡面与柱列衔接，保留邻近环境遮挡。'),
  camera('taihe-west', '太和殿 · 西侧', 'taihedian', [-85, 14, 0], [0, 18, 0], 50, '与东侧配对检查轮廓、材质方向、端部和檐口厚度。'),
  camera('taihe-rear', '太和殿 · 背面', 'taihedian', [0, 18, -64], [0, 18, 0], 56, '保留真实相邻建筑遮挡，检查背面完整性；遮挡不能算作本门禁通过。'),
  camera('taihe-eaves', '太和殿 · 檐下', 'taihedian', [12, 13, 28], [12, 21, 15], 52, '抬高的近景审查：检查柱头、补间、转角斗拱和梁底受光。'),
  camera('taihe-column-base', '太和殿 · 柱础', 'taihedian', [20, 10.4, 24], [20, 8.7, 16], 40, '检查柱础倒角、柱身收分、木石接触与近距离材质尺度。'),
  camera('taihe-door', '太和殿 · 门窗', 'taihedian', [0, 11.5, 29], [0, 12.5, 15], 45, '检查槅扇分扇、格芯、绦环板、裙板及关闭建筑内侧暗部。'),
  camera('taihe-tile-edge', '太和殿 · 瓦口', 'taihedian', [24, 25, 32], [20, 23, 20], 40, '抬高的近景审查：检查筒板瓦重叠、勾头滴水截面与封檐厚度。'),
  camera('taihe-terrace', '太和殿 · 台基栏杆', 'taihedian', [42, 6, 42], [28, 6, 24], 48, '检查三层退台、须弥座线脚、栏杆与台阶接触；不改现有高程。'),
  camera('taihe-distant', '太和殿 · 前院远景', 'taihedian', [0, 1.65, 174], [0, 15, 0], 52, '在真实前院距离检查远景轮廓、材质分区、院落统一性与LOD过渡。'),
  camera('entrance-panorama', '午门 · 南入口全景', 'wumen', [0, 1.65, 106], [0, 16, 0], 66, '成人眼高检查午门城台、雁翅楼、门洞与入口环境的整体关系。'),
];

export function getReviewCameraPreset(id: string): ReviewCameraPreset | undefined {
  return reviewCameraPresets.find(preset => preset.id === id);
}
