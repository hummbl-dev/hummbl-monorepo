import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createServer } from '../server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../..');

const packageJson = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf-8'));
const packageVersion: string = packageJson.version;

const getServerVersion = (): string => {
  const server = createServer();
  const internalServer = server.server as unknown as { _serverInfo: { version: string } };
  return internalServer._serverInfo.version;
};

describe('Server version contract', () => {
  it('ensures createServer metadata matches package.json version', () => {
    expect(getServerVersion()).toBe(packageVersion);
  });

  it('ensures index banner string stays in sync with package.json version', () => {
    const indexSource = readFileSync(resolve(projectRoot, 'src/index.ts'), 'utf-8');
    const expectedBanner = `HUMMBL MCP Server v${packageVersion} running on stdio`;
    expect(indexSource.includes(expectedBanner)).toBe(true);
  });
});
