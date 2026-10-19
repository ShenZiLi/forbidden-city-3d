/** Production records are plans, never a count of rendered world records. */
export const artGateIds = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'] as const;
export type ArtGateId = typeof artGateIds[number];
export type ArtAssetStatus = 'planned' | 'in-progress' | 'prototype' | 'implemented' | 'visual-review' | 'accepted';
export type ArtPackage = 'R' | 'T' | 'J' | 'S' | 'P' | 'V' | 'pipeline';
export type ArtTier = 'A' | 'B' | 'C' | 'E' | 'shared';
export type SourceConfidence = 'S0' | 'S1' | 'S2' | 'S3';
export interface ArtSource {
  id: string;
  title: string;
  reference: string;
  confidence: SourceConfidence;
  scope: string;
  verification: 'brief-only' | 'candidate' | 'field-verified';
  licenseUse: 'reference-only' | 'project-source' | 'redistribution-verified';
}
export interface ArtEvidence {
  path: string;
  kind: 'source' | 'implementation' | 'model' | 'material' | 'screenshot' | 'route-test' | 'performance-report' | 'delivery-package';
  description: string;
}
export interface ArtGate {
  status: 'pending' | 'failed' | 'passed';
  evidence: ArtEvidence[];
  reviewer?: string;
  reviewedAt?: string;
}
export interface ArtAsset {
  id: string;
  name: string;
  package: ArtPackage;
  priority: 'P0' | 'P1' | 'P2';
  tier: ArtTier;
  buildingIds: string[];
  regionIds: string[];
  status: ArtAssetStatus;
  sources: ArtSource[];
  evidence: ArtEvidence[];
  gates: Record<ArtGateId, ArtGate>;
  dependencies: string[];
  limitation: string;
}

const productionBrief: ArtSource = {
  id: 'production-brief', title: '写实美术制作总方案', reference: 'docs/ART_PRODUCTION_MASTERPLAN.md',
  confidence: 'S3', scope: '制作需求、工作范围与验收标准；不是构件尺寸或位置的历史证据。',
  verification: 'brief-only', licenseUse: 'project-source',
};
const taiheReference: ArtSource = {
  id: 'dpm-taihe-candidate', title: '故宫博物院太和殿概述（总方案记录）',
  reference: 'https://www.dpm.org.cn/explore/building/236465.html', confidence: 'S1',
  scope: '总方案记录十一间、五间进深、重檐庑殿与主体高度；不支持各个瓦件、斗拱、彩画或雕刻尺寸。逐构件引用待整理。',
  verification: 'candidate', licenseUse: 'reference-only',
};
const allRegions = ['entry', 'outer', 'inner', 'garden', 'east-inner', 'west-inner', 'east-outer', 'west-outer'];
const mainBuildings = ['taihedian', 'taihemen', 'wumen', 'qianqinggong', 'shenwumen'];
type AssetSeed = [id: string, name: string, priority: ArtAsset['priority'], tier: ArtTier, buildingIds: string[], regionIds: string[], dependencies: string[]];
const taihe = ['taihedian'];
const outer = ['outer'];
const entry = ['entry'];
const garden = ['garden'];
const seeds: AssetSeed[] = [
  ['R01', '庑殿曲面', 'P0', 'A', taihe, outer, ['REF01']],
  ['R02', '歇山山花', 'P1', 'A', ['taihemen', 'baohedian'], ['entry', 'outer'], ['REF01', 'R01']],
  ['R03', '硬山/悬山端部', 'P1', 'C', [], allRegions, ['REF01']],
  ['R04', '攒尖与宝顶', 'P1', 'B', ['zhonghedian'], outer, ['REF01']],
  ['R05', '盝顶', 'P2', 'B', [], ['east-inner', 'west-inner'], ['REF01']],
  ['R06', '正脊/垂脊/戗脊', 'P0', 'A', mainBuildings, allRegions, ['R01']],
  ['R07', '筒瓦/板瓦/勾头/滴水', 'P0', 'A', mainBuildings, allRegions, ['R01', 'PBR01']],
  ['R08', '吻兽/仙人走兽', 'P1', 'A', mainBuildings, allRegions, ['REF01', 'R06']],
  ['R09', '椽望/飞椽/封檐板', 'P0', 'A', mainBuildings, allRegions, ['T02']],
  ['R10', '上下檐独立衔接', 'P0', 'A', ['taihedian', 'taihemen', 'wumen'], ['outer', 'entry'], ['R01', 'T03', 'T05', 'R09']],
  ['T01', '收分立柱/柱础', 'P0', 'A', mainBuildings, allRegions, ['REF01', 'S01']],
  ['T02', '大额枋/小额枋/平板枋', 'P0', 'A', mainBuildings, allRegions, ['T01']],
  ['T03', '柱头科', 'P0', 'A', taihe, outer, ['REF01', 'T02', 'T06']],
  ['T04', '补间科', 'P0', 'A', taihe, outer, ['REF01', 'T02', 'T06']],
  ['T05', '转角科', 'P0', 'A', taihe, outer, ['REF01', 'T02', 'T06']],
  ['T06', '昂/翘/斗/升', 'P0', 'A', taihe, outer, ['REF01']],
  ['T07', '侧墙与廊柱', 'P1', 'C', [], allRegions, ['T01', 'T02']],
  ['T08', '檐下天花与梁底', 'P0', 'A', taihe, outer, ['T02', 'T03']],
  ['J01', '槅扇门', 'P0', 'A', mainBuildings, allRegions, ['REF01', 'T01', 'J02', 'J03']],
  ['J02', '裙板/绦环板/夹堂板', 'P0', 'A', taihe, outer, ['REF01', 'PBR01']],
  ['J03', '菱花格', 'P0', 'A', taihe, outer, ['REF01']],
  ['J04', '直棂窗', 'P1', 'B', [], allRegions, ['REF01', 'T01']],
  ['J05', '门钉/抱叶/门环', 'P1', 'A', ['wumen', 'taihemen', 'shenwumen'], ['entry', 'garden'], ['REF01', 'PBR01']],
  ['J06', '匾额与金边', 'P1', 'A', mainBuildings, allRegions, ['REF01', 'PBR01']],
  ['J07', '门洞砖券/门枕/门槛', 'P0', 'A', ['wumen', 'taihemen', 'shenwumen'], ['entry', 'garden'], ['REF01', 'S03']],
  ['S01', '三层台基', 'P0', 'A', ['taihedian', 'zhonghedian', 'baohedian'], outer, ['REF01']],
  ['S02', '须弥座线脚', 'P0', 'A', taihe, outer, ['REF01', 'S01']],
  ['S03', '踏跺/御路', 'P0', 'A', mainBuildings, allRegions, ['REF01', 'S01']],
  ['S04', '望柱/柱头', 'P0', 'A', taihe, outer, ['REF01', 'S01']],
  ['S05', '栏板/扶手/抱鼓', 'P0', 'A', taihe, outer, ['S04']],
  ['S06', '螭首排水', 'P1', 'A', taihe, outer, ['REF01', 'S01']],
  ['S07', '地面砖/边石/排水沟', 'P1', 'shared', [], allRegions, ['REF01', 'PBR01']],
  ['S08', '石桥构件', 'P1', 'E', ['taihemen'], entry, ['REF01', 'S04', 'S05']],
  ['P01', '铜缸', 'P1', 'A', mainBuildings, allRegions, ['REF01', 'PBR01']],
  ['P02', '铜鼎', 'P1', 'A', taihe, outer, ['REF01', 'PBR01']],
  ['P03', '日晷/嘉量', 'P1', 'A', taihe, outer, ['REF01', 'PBR01']],
  ['P04', '石狮/铜狮', 'P1', 'A', ['taihemen'], entry, ['REF01', 'PBR01']],
  ['P05', '铜龟/铜鹤', 'P1', 'A', taihe, outer, ['REF01', 'PBR01']],
  ['P06', '门灯/遮护类物件', 'P2', 'shared', [], allRegions, ['REF01', 'PBR01']],
  ['V01', '侧柏/古柏/油松', 'P1', 'E', [], garden, ['REF01', 'V02']],
  ['V02', '叶簇与枝干', 'P1', 'E', [], garden, ['REF01', 'PBR01']],
  ['V03', '竹/低灌', 'P2', 'E', [], ['garden', 'east-inner', 'west-inner'], ['REF01', 'V02']],
  ['V04', '太湖石/叠石', 'P1', 'E', [], garden, ['REF01', 'PBR01']],
  ['V05', '水池/河岸', 'P1', 'E', [], ['entry', 'garden'], ['REF01', 'PBR01']],
  ['V06', '园林路', 'P1', 'E', [], garden, ['REF01', 'S07']],
  ['V07', '土壤与落叶少量覆盖', 'P2', 'E', [], garden, ['REF01', 'V01', 'S07']],
  ['REF01', '分建筑参考视图、尺寸出处与许可记录', 'P0', 'shared', mainBuildings, allRegions, []],
  ['PBR01', '独立PBR通道与米制材质检验小样', 'P0', 'shared', [], allRegions, ['REF01']],
  ['LIGHT01', '固定曝光、三种审查光照与本地授权环境', 'P0', 'shared', [], allRegions, ['PBR01']],
  ['LOD01', '分建筑LOD、压缩、前台性能与长时间内存证据', 'P1', 'shared', mainBuildings, allRegions, ['R01', 'PBR01', 'LIGHT01']],
];

// Partial, Taihedian-only implementation evidence. None of these packages is accepted.
const heroPrototypeIds=new Set(['R01','R06','R07','R09','R10','T01','T02','T03','T04','T05','T06','T08','J01','J02','J03','S01','S02','S03','S04','S05']);
const pipelineEvidence:Record<string,ArtEvidence[]>={
  REF01:[{path:'docs/ART_PRODUCTION_MASTERPLAN.md',kind:'source',description:'Production scope and reference hierarchy; component measurements remain unverified.'},{path:'src/art/reviewCameras.ts',kind:'implementation',description:'Fixed inspection cameras at mapped anchors.'}],
  PBR01:[{path:'src/hooks/useImperialMaterials.ts',kind:'implementation',description:'Independent material channel loading.'},{path:'src/art/MaterialLab.tsx',kind:'implementation',description:'Metre-grid comparison scene; not material approval.'},{path:'public/assets/materials/production-v3/manifest.json',kind:'material',description:'Matched licensed source maps and hashes.'}],
  LIGHT01:[{path:'src/world/Lighting.tsx',kind:'implementation',description:'Local daylight HDRI; sun azimuth calibration pending.'},{path:'src/world/RenderPipeline.tsx',kind:'implementation',description:'Linear beauty, GTAO and single output transform.'}],
  LOD01:[{path:'src/architecture/hero/HeroSilhouette.tsx',kind:'model',description:'Shared terrace/roof envelope at distance; performance gates pending.'},{path:'src/architecture/hero/HeroRoofCourses.ts',kind:'implementation',description:'Near/mid/none tile detail; compression and residency pending.'}],
};

export const artAssetManifest: ArtAsset[] = seeds.map(([id, name, priority, tier, buildingIds, regionIds, dependencies]) => ({
  id, name, package: /^[RTJSPV]\d\d$/.test(id) ? id[0] as ArtPackage : 'pipeline', priority, tier,
  buildingIds: [...buildingIds], regionIds: [...regionIds], dependencies: [...dependencies], status: heroPrototypeIds.has(id)||pipelineEvidence[id]?'prototype':'planned',
  sources: [productionBrief, ...(buildingIds.includes('taihedian') ? [taiheReference] : [])], evidence: pipelineEvidence[id]??(heroPrototypeIds.has(id)?[{path:'src/architecture/hero/HeroParts.ts',kind:'model',description:'Taihedian partial procedural construction; not all named components or buildings in this package.'},{path:'src/architecture/hero/HeroAssetSpec.ts',kind:'implementation',description:'Envelope and explicitly S3 construction parameters.'}]:[]),
  gates: artGateIds.reduce((gates, id) => { gates[id] = { status: 'pending', evidence: [] }; return gates; }, {} as Record<ArtGateId, ArtGate>),
  limitation: heroPrototypeIds.has(id)?'仅太和殿首轮部分构件原型；包名所含御路/雕刻/斗口制/彩画等未全部实现。S3构件未测绘，其他适用建筑未制作，G0–G7均待验收。':pipelineEvidence[id]?'管线原型可运行，逐构件来源、材质小样审核、日光校准、压缩与长期性能仍待补齐。':'待制作与逐项取证；区域为适用范围，不代表摆放位置或数量已核实。现有通用程序化外观不作为本资源包的完成证据。',
}));

export interface ArtValidationIssue {
  assetId: string;
  code: 'duplicate-id' | 'missing-source' | 'missing-dependency' | 'dependency-cycle' | 'missing-implementation-evidence' |
    'missing-evidence-file' | 'unverified-evidence-file' | 'incomplete-gate' | 'missing-gate-evidence' |
    'missing-gate-review' | 'missing-visual-evidence' | 'wrong-gate-evidence' | 'unaccepted-dependency';
  message: string;
  gateId?: ArtGateId;
}
/** Supply a repository-relative file existence check in CI; URLs are sources, never delivery evidence. */
export function validateArtAssetManifest(assets: readonly ArtAsset[], options: { fileExists?: (path: string) => boolean } = {}): ArtValidationIssue[] {
  const issues: ArtValidationIssue[] = [];
  const byId = new Map<string, ArtAsset>();
  const add = (assetId: string, code: ArtValidationIssue['code'], message: string, gateId?: ArtGateId) => issues.push({ assetId, code, message, ...(gateId ? { gateId } : {}) });
  for (const a of assets) {
    if (byId.has(a.id)) add(a.id, 'duplicate-id', `资源ID重复：${a.id}`);
    byId.set(a.id, a);
  }
  for (const a of assets) {
    if (!a.sources.length || a.sources.some(s => !s.reference.trim() || !s.scope.trim() || !s.confidence)) add(a.id, 'missing-source', '来源及其支持范围不能为空。');
    for (const dependency of a.dependencies) {
      if (!byId.has(dependency)) add(a.id, 'missing-dependency', `依赖不存在：${dependency}`);
      else if (a.status === 'accepted' && byId.get(dependency)!.status !== 'accepted') add(a.id, 'unaccepted-dependency', `依赖尚未验收：${dependency}`);
    }
    const verifyFiles = (evidence: ArtEvidence[], gateId?: ArtGateId) => {
      for (const e of evidence) {
        if (!e.path.trim() || /^(?:https?:|\/|\\|[A-Za-z]:)/.test(e.path) || e.path.split(/[\\/]/).includes('..')) {
          add(a.id, 'missing-evidence-file', '证据必须指向仓库内实际文件。', gateId);
        } else if (!options.fileExists) add(a.id, 'unverified-evidence-file', `没有文件检查器，无法验证证据：${e.path}`, gateId);
        else if (!options.fileExists(e.path)) add(a.id, 'missing-evidence-file', `证据文件不存在：${e.path}`, gateId);
      }
    };
    verifyFiles(a.evidence);
    if (['prototype', 'implemented', 'visual-review', 'accepted'].includes(a.status) &&
        !a.evidence.some(e => ['implementation', 'model', 'material'].includes(e.kind))) {
      add(a.id, 'missing-implementation-evidence', '原型或实施状态必须有实现、模型或材质文件；方案与测试报告不能替代。');
    }
    for (const id of artGateIds) {
      const gate = a.gates[id];
      if (!gate) { add(a.id, 'incomplete-gate', `缺少${id}记录。`, id); continue; }
      verifyFiles(gate.evidence, id);
      if (a.status === 'accepted' && gate.status !== 'passed') add(a.id, 'incomplete-gate', `accepted要求${id}通过。`, id);
      if (gate.status === 'passed') {
        if (!gate.evidence.length) add(a.id, 'missing-gate-evidence', '通过门禁必须附实际文件证据。', id);
        if (!gate.reviewer?.trim() || !gate.reviewedAt || !Number.isFinite(Date.parse(gate.reviewedAt))) add(a.id, 'missing-gate-review', '通过门禁必须记录审核人及有效日期。', id);
        if (['G1', 'G2', 'G3', 'G4'].includes(id) && !gate.evidence.some(e => e.kind === 'screenshot')) add(a.id, 'missing-visual-evidence', '形体、材质和环境门禁必须含视觉证据，功能测试不能替代。', id);
        const requiredKind = ({ G0: 'source', G5: 'route-test', G6: 'performance-report', G7: 'delivery-package' } as Partial<Record<ArtGateId, ArtEvidence['kind']>>)[id];
        if (requiredKind && !gate.evidence.some(e => e.kind === requiredKind)) add(a.id, 'wrong-gate-evidence', `${id}必须包含${requiredKind}类证据。`, id);
      }
    }
  }
  const visited = new Set<string>(); const visiting = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) { add(id, 'dependency-cycle', `依赖成环：${[...visiting, id].join(' → ')}`); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id)?.dependencies ?? []) if (byId.has(dependency)) visit(dependency);
    visiting.delete(id); visited.add(id);
  };
  for (const id of byId.keys()) visit(id);
  return issues;
}
