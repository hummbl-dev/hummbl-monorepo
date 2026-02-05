// Data loader utility - bridges build outputs to React app

/**
 * Loads data from build output directory or API endpoints
 * Supports both static JSON files and dynamic API calls
 */

export const config = {
  get useStatic() {
    // Always use static in production, allow override for development
    return import.meta.env.VITE_USE_STATIC_DATA !== 'false';
  },
  get baseDir() {
    return import.meta.env.VITE_BUILD_OUTPUT_DIR || '/data';
  },
};

async function fetchData(url: string, label: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${label}: ${res.status}`);
  return res.json();
}

export async function loadNarratives() {
  const path = config.useStatic ? `${config.baseDir}/narratives.json` : '/api/narratives';
  return fetchData(path, 'narratives');
}

export async function loadNetwork() {
  const path = config.useStatic ? `${config.baseDir}/network.json` : '/api/network';
  return fetchData(path, 'network data');
}

export async function loadQDM() {
  const path = config.useStatic ? `${config.baseDir}/qdm.json` : '/api/qdm';
  return fetchData(path, 'QDM data');
}

export async function loadLedger() {
  const path = config.useStatic ? `${config.baseDir}/ledger.json` : '/api/ledger';
  return fetchData(path, 'ledger data');
}

export async function loadSITREP() {
  const path = config.useStatic ? `${config.baseDir}/sitrep.json` : '/api/sitrep';
  return fetchData(path, 'SITREP data');
}
