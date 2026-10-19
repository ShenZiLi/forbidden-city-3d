import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { artAssetManifest, artGateIds, validateArtAssetManifest } from '../art/artAssetManifest';
import type { ArtAsset, ArtEvidence } from '../art/artAssetManifest';
import { buildings, regions } from '../data/worldManifest';

const fileExists = (path: string) => existsSync(resolve(process.cwd(), path));
const sourceEvidence: ArtEvidence = { path: 'docs/ART_PRODUCTION_MASTERPLAN.md', kind: 'source', description: 'Test fixture: existing production brief, not visual approval.' };
const asset = (): ArtAsset => structuredClone(artAssetManifest.find(a => a.id === 'R01')!);

describe('美术生产台账的真实状态', () => {
  it('六个构件包完整纳入计划，不能用覆盖数据冒充实施或验收', () => {
    for (const [prefix, count] of Object.entries({ R: 10, T: 8, J: 7, S: 8, P: 6, V: 7 })) {
      for (let i = 1; i <= count; i++) expect(artAssetManifest.some(a => a.id === `${prefix}${String(i).padStart(2, '0')}`)).toBe(true);
    }
    expect(artAssetManifest.every(a => ['planned', 'prototype'].includes(a.status))).toBe(true);
    for (const a of artAssetManifest) {
      expect(a.buildingIds.every(id => buildings.some(b => b.id === id)), a.id).toBe(true);
      expect(a.regionIds.every(id => regions.some(r => r.id === id)), a.id).toBe(true);
    }
    expect(validateArtAssetManifest(artAssetManifest, { fileExists })).toEqual([]);
  });

  it('缺失来源、重复ID和不存在的依赖会指出具体资产', () => {
    const a = asset();
    a.sources = [];
    a.dependencies = ['does-not-exist'];
    const issues = validateArtAssetManifest([a, asset()], { fileExists });
    expect(issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ assetId: 'R01', code: 'missing-source' }),
      expect.objectContaining({ assetId: 'R01', code: 'duplicate-id' }),
      expect.objectContaining({ assetId: 'R01', code: 'missing-dependency' }),
    ]));
  });

  it('实施状态必须有真正存在的实现证据，不能借用方案文件', () => {
    const a = asset(); a.dependencies = []; a.status = 'implemented'; a.evidence = [sourceEvidence];
    expect(validateArtAssetManifest([a], { fileExists })).toContainEqual(expect.objectContaining({ code: 'missing-implementation-evidence' }));
    a.evidence = [{ ...sourceEvidence, kind: 'model', path: 'public/assets/not-produced.glb' }];
    expect(validateArtAssetManifest([a], { fileExists })).toContainEqual(expect.objectContaining({ code: 'missing-evidence-file' }));
  });

  it('实现证据存在时允许实施，但仍不代表视觉验收', () => {
    const a = asset(); a.dependencies = []; a.status = 'implemented';
    // The fixture is this real test file; existence permits implementation bookkeeping only.
    a.evidence = [{ path: 'src/tests/artManifest.test.ts', kind: 'implementation', description: 'Existing test fixture implementation.' }];
    expect(validateArtAssetManifest([a], { fileExists })).toEqual([]);
    expect(Object.values(a.gates).every(g => g.status === 'pending')).toBe(true);
    expect(validateArtAssetManifest([a])).toContainEqual(expect.objectContaining({ code: 'unverified-evidence-file' }));
  });

  it('accepted不能只改状态或把门禁设为passed', () => {
    const a = asset(); a.dependencies = []; a.status = 'accepted';
    expect(validateArtAssetManifest([a], { fileExists })).toContainEqual(expect.objectContaining({ code: 'incomplete-gate' }));
    for (const id of artGateIds) a.gates[id] = { status: 'passed', evidence: [], reviewer: 'test', reviewedAt: '2026-10-20' };
    expect(validateArtAssetManifest([a], { fileExists })).toContainEqual(expect.objectContaining({ code: 'missing-gate-evidence' }));
  });

  it('测试报告不能代替G1–G4的视觉证据，未验收依赖也阻止accepted', () => {
    const a = asset(); const dep = asset(); dep.id = 'TEST-DEP'; dep.dependencies = [];
    a.status = 'accepted'; a.dependencies = [dep.id];
    for (const id of artGateIds) a.gates[id] = { status: 'passed', evidence: [{ ...sourceEvidence, kind: 'route-test' }], reviewer: 'test', reviewedAt: '2026-10-20' };
    const issues = validateArtAssetManifest([a, dep], { fileExists });
    expect(issues).toContainEqual(expect.objectContaining({ code: 'missing-visual-evidence', gateId: 'G3' }));
    expect(issues).toContainEqual(expect.objectContaining({ code: 'unaccepted-dependency' }));
  });

  it('资源依赖不能自引用或形成环', () => {
    const a = asset(); const b = asset(); b.id = 'TEST-DEP';
    a.dependencies = [b.id]; b.dependencies = [a.id];
    expect(validateArtAssetManifest([a, b], { fileExists })).toContainEqual(expect.objectContaining({ code: 'dependency-cycle' }));
  });

  it('各类门禁需要对应证据，全部具备后才允许accepted', () => {
    const a = asset(); a.dependencies = []; a.status = 'accepted';
    a.evidence = [{ path: 'src/tests/artManifest.test.ts', kind: 'implementation', description: 'Existing implementation fixture only.' }];
    const kinds = { G0: 'source', G1: 'screenshot', G2: 'screenshot', G3: 'screenshot', G4: 'screenshot', G5: 'route-test', G6: 'performance-report', G7: 'delivery-package' } as const;
    for (const id of artGateIds) a.gates[id] = { status: 'passed', evidence: [{ ...sourceEvidence, kind: kinds[id] }], reviewer: 'fixture-reviewer', reviewedAt: '2026-10-20' };
    // This tests bookkeeping. A validator cannot infer image content or reviewer honesty.
    expect(validateArtAssetManifest([a], { fileExists })).toEqual([]);
    a.gates.G6.evidence[0].kind = 'route-test';
    expect(validateArtAssetManifest([a], { fileExists })).toContainEqual(expect.objectContaining({ code: 'wrong-gate-evidence', gateId: 'G6' }));
  });
});
