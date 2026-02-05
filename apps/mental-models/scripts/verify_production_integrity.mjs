import { createHash } from 'crypto';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

const PRODUCTION_BASE_URL = 'https://www.hummbl.io';
const LOCAL_DATA_DIR = new URL('../public/data', import.meta.url).pathname;

async function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function verifyFile(relativePath) {
  try {
    const localPath = join(LOCAL_DATA_DIR, relativePath);
    const localContent = await readFile(localPath, 'utf8');
    const localHash = await sha256(localContent);

    const prodUrl = `${PRODUCTION_BASE_URL}/data/${relativePath}`;
    const prodContent = await fetchWithRetry(prodUrl);
    const prodHash = await sha256(prodContent);

    return {
      file: relativePath,
      status: localHash === prodHash ? '✅ MATCH' : '❌ MISMATCH',
      localHash: localHash.slice(0, 8),
      prodHash: prodHash.slice(0, 8),
      size: localContent.length,
      details: localHash === prodHash ? 'OK' : 'Content hash mismatch',
    };
  } catch (error) {
    return {
      file: relativePath,
      status: '❌ ERROR',
      details: error.message,
    };
  }
}

async function verifyAll() {
  console.log('🔍 Starting HUMMBL Production Integrity Audit\n');

  // Verify JSON files in root data directory
  const rootFiles = ['narratives.json', 'network.json', 'integrity_report.json'];
  const results = [];

  // Check each file
  for (const file of rootFiles) {
    console.log(`Verifying ${file}...`);
    results.push(await verifyFile(file));
  }

  // Check subdirectories
  const subdirs = ['ledger', 'qdm', 'sitrep', 'visualization'];

  for (const dir of subdirs) {
    const files = (await readdir(join(LOCAL_DATA_DIR, dir))).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const relPath = `${dir}/${file}`;
      console.log(`Verifying ${relPath}...`);
      results.push(await verifyFile(relPath));
    }
  }

  // Display results
  console.log('\n📊 Integrity Audit Results:');
  console.table(results, ['file', 'status', 'localHash', 'prodHash', 'size', 'details']);

  // Summary
  const total = results.length;
  const passed = results.filter((r) => r.status === '✅ MATCH').length;
  const failed = total - passed;

  console.log(`\n🎯 Summary: ${passed}/${total} files passed integrity check`);
  if (failed > 0) {
    console.error('❌ Integrity check failed - mismatches detected in production data');
    process.exit(1);
  } else {
    console.log('✅ All files match between local build and production');
  }
}

verifyAll().catch(console.error);
