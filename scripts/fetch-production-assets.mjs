/** Limited, reproducible Poly Haven acquisition. No keys, website scraping or guessed file URLs. */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'ForbiddenCity3DArtProduction/0.2';
const budget = 35_000_000;
const materialFile = 'public/assets/materials/production-v3/manifest.json';
const environmentFile = 'public/assets/environment/production-v3/manifest.json';
const license = {
  name: 'CC0-1.0',
  url: 'https://creativecommons.org/publicdomain/zero/1.0/',
  providerLicenseUrl: 'https://polyhaven.com/license',
  apiTermsUrl: 'https://github.com/Poly-Haven/Public-API/blob/master/ToS.md',
  checkedDate: '2026-10-20',
  note: 'CC0 assets may be redistributed. Website previews and copy are separate. API requests identify this project; production uses self-hosted files, not a live API browser.',
};
const plans = [
  { key: 'courtyardStone', id: 'pavement_01', kind: 'material',
    note: 'Gray-brown square roughhewn paving. Physical surface reference and art reconstruction, not Forbidden City sampling or a historically verified paving layout.' },
  { key: 'mineralPlaster', id: 'white_plaster_02', kind: 'material',
    note: 'Fine-grained white plaster, intended for runtime mineral-red tint. Physical surface reference, not Forbidden City sampling. Pigment and binder chemistry are not verified.' },
  { key: 'daylight', id: 'kloofendal_48d_partly_cloudy_puresky', kind: 'environment',
    note: 'Edited sky-only midday HDRI. No buildings or trees in the source sky. Neutral daylight source; sun rotation/intensity must be calibrated against the runtime directional light.' },
];
const channels = [
  { key: 'baseColor', api: 'Diffuse', resolution: '2k', format: 'jpg', colorSpace: 'srgb', component: 'RGB', expected: [2048, 2048] },
  { key: 'normal', api: 'nor_gl', resolution: '1k', format: 'png', colorSpace: 'linear-data', component: 'RGB', convention: 'OpenGL tangent-space +Y', expected: [1024, 1024] },
  { key: 'roughness', api: 'Rough', resolution: '1k', format: 'png', colorSpace: 'linear-data', component: 'G (grayscale RGB)', expected: [1024, 1024] },
  { key: 'ao', api: 'AO', resolution: '1k', format: 'png', colorSpace: 'linear-data', component: 'R (grayscale RGB)', expected: [1024, 1024] },
];
const digest = (buffer, algorithm = 'sha256') => createHash(algorithm).update(buffer).digest('hex');
const localPath = (path) => resolve(root, 'public', path.replace(/^\//, ''));
const failures = [];
let downloadBytes = 0;
const started = Date.now();

function dimensions(buffer, format) {
  if (format === 'png') {
    if (buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Invalid PNG signature');
    return { resolution: [buffer.readUInt32BE(16), buffer.readUInt32BE(20)], bitDepth: buffer[24], pngColorType: buffer[25] };
  }
  if (format === 'hdr') {
    const header = buffer.subarray(0, 4096).toString('ascii');
    const match = header.match(/-Y\s+(\d+)\s+\+X\s+(\d+)/);
    if (!header.startsWith('#?') || !match || !header.includes('FORMAT=32-bit_rle_rgbe')) throw new Error('Invalid Radiance RGBE header');
    return { resolution: [Number(match[2]), Number(match[1])], encoding: 'Radiance RGBE, scene-linear radiance' };
  }
  if (buffer[0] !== 255 || buffer[1] !== 216) throw new Error('Invalid JPEG signature');
  let i = 2;
  while (i + 9 < buffer.length) {
    if (buffer[i++] !== 255) continue;
    while (buffer[i] === 255) i++;
    const marker = buffer[i++];
    if (marker === 216 || marker === 217 || marker === 0) continue;
    const length = buffer.readUInt16BE(i);
    if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker)) {
      return { resolution: [buffer.readUInt16BE(i + 5), buffer.readUInt16BE(i + 3)], bitDepth: buffer[i + 2] };
    }
    i += length;
  }
  throw new Error('JPEG size not found');
}

async function api(endpoint) {
  const response = await fetch(`https://api.polyhaven.com/${endpoint}`, {
    headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`API ${endpoint}: HTTP ${response.status}`);
  return response.json();
}

async function obtain(entry) {
  let buffer;
  try {
    const existing = await readFile(localPath(entry.path));
    if (existing.length === entry.sourceBytes && digest(existing, 'md5') === entry.sourceMd5) buffer = existing;
  } catch { /* Missing cache: fetch the one known API-provided URL below. */ }
  if (!buffer) {
    if (downloadBytes + entry.sourceBytes > budget) throw new Error('35 MB download budget exceeded');
    const response = await fetch(entry.url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(90_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${entry.url}`);
    const chunks = [];
    let bytes = 0;
    for await (const chunk of response.body) {
      bytes += chunk.length;
      downloadBytes += chunk.length;
      if (downloadBytes > budget || bytes > entry.sourceBytes) throw new Error('Response exceeded declared byte count or budget');
      chunks.push(chunk);
    }
    buffer = Buffer.concat(chunks);
  }
  if (buffer.length !== entry.sourceBytes || digest(buffer, 'md5') !== entry.sourceMd5) throw new Error(`Source checksum mismatch: ${entry.path}`);
  const inspected = dimensions(buffer, entry.format);
  if (inspected.resolution.some((n, i) => n !== entry.expectedResolution[i])) throw new Error(`Resolution mismatch: ${entry.path}`);
  await mkdir(dirname(localPath(entry.path)), { recursive: true });
  await writeFile(localPath(entry.path), buffer);
  return { ...entry, ...inspected, bytes: buffer.length, sha256: digest(buffer), status: 'downloaded-and-verified' };
}

async function verify() {
  let total = 0;
  let count = 0;
  for (const manifestPath of [materialFile, environmentFile]) {
    const manifest = JSON.parse(await readFile(resolve(root, manifestPath), 'utf8'));
    if (manifest.failures?.length) throw new Error(`Manifest records acquisition failures: ${manifestPath}`);
    const isMaterial = manifestPath === materialFile;
    const assets = manifest.materials ?? manifest.environments;
    for (const plan of plans.filter((item) => (item.kind === 'material') === isMaterial)) {
      const asset = assets?.[plan.key];
      if (!asset || asset.sourceAssetId !== plan.id) throw new Error(`Required source asset missing: ${plan.id}`);
      const required = isMaterial ? channels.map((entry) => entry.key) : ['environment'];
      for (const key of required) if (!asset.channels?.[key]) throw new Error(`Required channel missing: ${plan.id}/${key}`);
    }
    for (const asset of Object.values(assets)) {
      for (const entry of Object.values(asset.channels)) {
        if (entry.status !== 'downloaded-and-verified') throw new Error(`Incomplete channel: ${entry.path}`);
        const buffer = await readFile(localPath(entry.path));
        if (buffer.length !== entry.bytes || digest(buffer) !== entry.sha256 || digest(buffer, 'md5') !== entry.sourceMd5) throw new Error(`Integrity failure: ${entry.path}`);
        const inspected = dimensions(buffer, entry.format);
        if (JSON.stringify(inspected.resolution) !== JSON.stringify(entry.resolution)) throw new Error(`Header mismatch: ${entry.path}`);
        count++; total += buffer.length;
      }
    }
  }
  if (count !== 9) throw new Error(`Expected exactly 9 source files, found ${count}`);
  if (total > budget) throw new Error(`Stored source asset budget exceeded: ${total}`);
  console.log(JSON.stringify({ verifiedFiles: count, totalBytes: total, totalMiB: +(total / 1048576).toFixed(3), budgetBytes: budget, elapsedMs: Date.now() - started }));
}

async function restorePinned() {
  const manifests = [];
  for (const path of [materialFile, environmentFile]) {
    try { manifests.push(JSON.parse(await readFile(resolve(root, path), 'utf8'))); }
    catch (error) { if (error.code === 'ENOENT') return false; throw error; }
  }
  // Saved manifests pin the actual files and source hashes. Do not silently replace them with future API revisions.
  for (const manifest of manifests) {
    for (const asset of Object.values(manifest.materials ?? manifest.environments)) {
      for (const entry of Object.values(asset.channels)) {
        try { await obtain(entry); }
        catch (error) { failures.push({ assetId: asset.sourceAssetId, path: entry.path, message: error.message }); }
      }
    }
  }
  if (failures.length) throw new Error(JSON.stringify(failures));
  await verify();
  console.log(JSON.stringify({ mode: 'pinned-restore', downloadedBytesThisRun: downloadBytes }));
  return true;
}

if (process.argv.includes('--verify')) {
  await verify();
} else if (!process.argv.includes('--refresh') && await restorePinned()) {
  // Valid existing files cost no network requests. Missing/damaged files use only pinned source URLs.
} else {
  const materials = {};
  const environments = {};
  for (const plan of plans) {
    try {
      // Only three selected asset IDs; file URLs are always read from their official API manifests.
      const info = await api(`info/${plan.id}`);
      const files = await api(`files/${plan.id}`);
      const asset = {
        sourceAssetId: plan.id, name: info.name, authors: info.authors,
        sourceUrl: `https://polyhaven.com/a/${plan.id}`,
        infoApiUrl: `https://api.polyhaven.com/info/${plan.id}`,
        filesApiUrl: `https://api.polyhaven.com/files/${plan.id}`,
        sourceFilesHash: info.files_hash, license,
        sourceDescription: info.description,
        sourceDimensionsMillimeters: info.dimensions ?? null,
        sourceLegacyScale: info.scale ?? null,
        tileSizeMeters: info.dimensions?.map((n) => n / 1000) ?? null,
        scaleAuthority: info.dimensions ? 'Provider API dimensions in millimeters; not independently measured and not a Forbidden City measurement.' : 'Not provided; do not infer physical dimensions.',
        scaleConflict: plan.id === 'white_plaster_02' ? 'Current API dimensions are 1000×1000 mm; legacy scale string says 1.5M x 1.5M. Current dimensions used provisionally; discrepancy unresolved.' : null,
        captureMethod: plan.kind === 'material' ? 'Provider photo-based PBR material. Exact per-asset acquisition/baking workflow not supplied by API; not an AI-derived normal map.' : 'Photographed HDRI with provider sky-only edits.',
        whiteBalanceKelvin: info.whitebalance ?? null,
        sourceSunElevationDegrees: plan.kind === 'environment' ? 48 : null,
        sunElevationAuthority: plan.kind === 'environment' ? '48d in provider asset name; angular direction/azimuth not calibrated in this project.' : null,
        metallic: plan.kind === 'material' ? 0 : undefined,
        useNote: plan.note, channels: {},
      };
      const selected = plan.kind === 'material' ? channels : [
        { key: 'environment', api: 'hdri', resolution: '2k', format: 'hdr', colorSpace: 'scene-linear', component: 'RGB radiance', expected: [2048, 1024] },
      ];
      for (const selection of selected) {
        const source = files[selection.api]?.[selection.resolution]?.[selection.format];
        if (!source) { failures.push({ assetId: plan.id, channel: selection.key, message: 'Requested channel absent from source API.' }); continue; }
        const folder = plan.kind === 'material' ? 'materials' : 'environment';
        const filename = new URL(source.url).pathname.split('/').pop();
        const entry = {
          path: `/assets/${folder}/production-v3/${plan.id}/${filename}`,
          url: source.url, sourceBytes: source.size, sourceMd5: source.md5,
          sourceChannel: selection.api, format: selection.format,
          resolutionLabel: selection.resolution, expectedResolution: selection.expected,
          colorSpace: selection.colorSpace, component: selection.component,
          normalConvention: selection.convention ?? null,
          derivative: false,
        };
        try {
          asset.channels[selection.key] = await obtain(entry);
          console.log(`${plan.id}/${selection.key}: ${asset.channels[selection.key].bytes} bytes verified`);
        } catch (error) {
          asset.channels[selection.key] = { ...entry, status: 'failed', error: error.message };
          failures.push({ assetId: plan.id, channel: selection.key, message: error.message });
        }
      }
      (plan.kind === 'material' ? materials : environments)[plan.key] = asset;
    } catch (error) { failures.push({ assetId: plan.id, message: error.message }); }
  }
  const base = { schemaVersion: 1, productionVersion: 'production-v3', acquiredAt: new Date().toISOString(), provider: 'Poly Haven', userAgent: UA, license, budgetBytes: budget, downloadedBytesThisRun: downloadBytes, failures };
  for (const [path, content] of [[materialFile, { ...base, materials }], [environmentFile, { ...base, environments }]]) {
    await mkdir(dirname(resolve(root, path)), { recursive: true });
    await writeFile(resolve(root, path), JSON.stringify(content, null, 2) + '\n');
  }
  console.log(JSON.stringify({ downloadedBytesThisRun: downloadBytes, failures, elapsedMs: Date.now() - started }));
  if (failures.length) process.exitCode = 1;
  else await verify();
}
