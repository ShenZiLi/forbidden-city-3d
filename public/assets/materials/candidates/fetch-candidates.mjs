// Offline-pinned, two-file visual selection batch. Never modifies production-v3 manifests.
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(dir, '../../../..');
const sourcePath = resolve(dir, 'sources.json');
const manifest = JSON.parse(await readFile(sourcePath, 'utf8'));
const hash = (buffer, algorithm = 'sha256') => createHash(algorithm).update(buffer).digest('hex');
let productionBytes = 0;
for (const path of ['public/assets/materials/production-v3/manifest.json', 'public/assets/environment/production-v3/manifest.json']) {
  const production = JSON.parse(await readFile(resolve(root, path), 'utf8'));
  for (const asset of Object.values(production.materials ?? production.environments)) {
    for (const channel of Object.values(asset.channels)) productionBytes += channel.bytes;
  }
}
const candidateBytes = manifest.assets.reduce((sum, asset) => sum + asset.baseColor.sourceBytes, 0);
if (candidateBytes + productionBytes > manifest.combinedOriginalBudgetBytes) throw new Error('Combined original-source budget exceeds 35 MiB');
const failures = [];
const started = Date.now();
let downloadedBytes = 0;
for (const asset of manifest.assets) {
  const entry = asset.baseColor;
  const path = resolve(root, 'public', entry.path.replace(/^\//, ''));
  try {
    let buffer;
    try { buffer = await readFile(path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (!buffer || buffer.length !== entry.sourceBytes || hash(buffer, 'md5') !== entry.sourceMd5) {
      if (process.argv.includes('--verify')) throw new Error('File absent or invalid');
      const response = await fetch(entry.url, {
        headers: { 'User-Agent': 'ForbiddenCity3DArtProduction/0.2' },
        signal: AbortSignal.timeout(90_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const chunks = [];
      let size = 0;
      for await (const chunk of response.body) {
        size += chunk.length;
        downloadedBytes += chunk.length;
        if (size > entry.sourceBytes || downloadedBytes > candidateBytes) throw new Error('Response exceeds declared original-source budget');
        chunks.push(chunk);
      }
      buffer = Buffer.concat(chunks);
    }
    if (buffer.length !== entry.sourceBytes || hash(buffer, 'md5') !== entry.sourceMd5) throw new Error('Original-source MD5 or byte count mismatch');
    if (buffer[0] !== 255 || buffer[1] !== 216) throw new Error('Not JPEG');
    let foundSize = null;
    for (let i = 2; i + 9 < buffer.length;) {
      if (buffer[i++] !== 255) continue;
      while (buffer[i] === 255) i++;
      const marker = buffer[i++];
      if ([216, 217, 0].includes(marker)) continue;
      if ([192, 193, 194].includes(marker)) { foundSize = [buffer.readUInt16BE(i + 5), buffer.readUInt16BE(i + 3)]; break; }
      i += buffer.readUInt16BE(i);
    }
    if (JSON.stringify(foundSize) !== JSON.stringify(entry.resolution)) throw new Error('Expected official 2048x2048 source');
    if (process.argv.includes('--verify') && entry.sha256 !== hash(buffer)) throw new Error('Pinned SHA-256 mismatch');
    if (!process.argv.includes('--verify')) {
      await writeFile(path, buffer);
      Object.assign(entry, { bytes: buffer.length, sha256: hash(buffer), bitDepth: 8, status: 'downloaded-and-verified' });
    }
    console.log(`${asset.sourceAssetId}: ${buffer.length} bytes, SHA-256 ${hash(buffer)}`);
  } catch (error) { failures.push({ id: asset.sourceAssetId, error: error.message }); }
}
if (!process.argv.includes('--verify')) {
  manifest.acquiredAt = new Date().toISOString();
  manifest.failures = failures;
  manifest.totals = { productionOriginalBytes: productionBytes, candidateOriginalBytes: candidateBytes, combinedOriginalBytes: productionBytes + candidateBytes };
  await writeFile(sourcePath, JSON.stringify(manifest, null, 2) + '\n');
}
console.log(JSON.stringify({ downloadedBytes, candidateBytes, combinedOriginalBytes: productionBytes + candidateBytes, combinedMiB: (productionBytes + candidateBytes) / 1048576, elapsedMs: Date.now() - started, failures }));
if (failures.length) process.exitCode = 1;
