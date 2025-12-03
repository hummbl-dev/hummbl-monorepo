import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerMethodologyTools } from './methodology.js';
import { getSelfDialecticalMethodology, auditModelCodes } from '../framework/self_dialectical.js';

type ToolHandler = (input?: unknown) => Promise<unknown>;

vi.mock('../framework/self_dialectical.js', () => {
  return {
    getSelfDialecticalMethodology: vi.fn(),
    auditModelCodes: vi.fn(),
  };
});

const mockGetSelfDialecticalMethodology = vi.mocked(getSelfDialecticalMethodology);
const mockAuditModelCodes = vi.mocked(auditModelCodes);

describe('registerMethodologyTools', () => {
  let server: McpServer;
  let registeredHandlers: Record<string, ToolHandler>;

  beforeEach(() => {
    server = new McpServer({ name: 'test', version: '1.0.0' });
    registeredHandlers = {};

    vi.spyOn(server, 'registerTool').mockImplementation((name, _config, handler) => {
      registeredHandlers[name] = handler as unknown as ToolHandler;
      return {} as any;
    });

    mockGetSelfDialecticalMethodology.mockReset();
    mockAuditModelCodes.mockReset();
    registerMethodologyTools(server);
  });

  it('returns methodology payload when source succeeds', async () => {
    const methodology = {
      id: 'meth',
      title: 'Self Dialectical',
      version: '1.0',
      summary: '',
      modelsReferenced: [],
      stages: [],
      metaModels: [],
    };
    mockGetSelfDialecticalMethodology.mockReturnValue({ ok: true, value: methodology });

    const handler = registeredHandlers['get_methodology'];
    const response = (await handler()) as {
      content: Array<{ text: string }>;
    };

    expect(JSON.parse(response.content[0].text)).toEqual(methodology);
  });

  it('returns error content when methodology lookup fails', async () => {
    mockGetSelfDialecticalMethodology.mockReturnValue({
      ok: false,
      error: { type: 'Internal', message: 'boom' },
    });

    const handler = registeredHandlers['get_methodology'];
    const response = (await handler()) as { isError?: boolean };

    expect(response.isError).toBe(true);
  });

  it('audits model references successfully', async () => {
    const auditResult = {
      methodologyId: 'meth',
      documentVersion: '1.0',
      totalReferences: 1,
      validCount: 1,
      invalidCount: 0,
      issues: [],
    };
    mockAuditModelCodes.mockReturnValue({ ok: true, value: auditResult });

    const handler = registeredHandlers['audit_model_references'];
    const response = (await handler({ items: [{ code: 'P1' }] })) as {
      content: Array<{ text: string }>;
    };

    expect(JSON.parse(response.content[0].text)).toEqual(auditResult);
  });

  it('surface audit errors with validation details', async () => {
    mockAuditModelCodes.mockReturnValue({
      ok: false,
      error: { type: 'ValidationError', message: 'bad input' },
    });

    const handler = registeredHandlers['audit_model_references'];
    const response = (await handler({ items: [{ code: 'INVALID' }] })) as {
      isError?: boolean;
      content: Array<{ text: string }>;
    };

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain('bad input');
  });

  it('surfaces audit errors for non-validation failures', async () => {
    mockAuditModelCodes.mockReturnValue({
      ok: false,
      error: { type: 'Internal', message: 'boom' },
    });

    const handler = registeredHandlers['audit_model_references'];
    const response = (await handler({ items: [{ code: 'P1' }] })) as {
      isError?: boolean;
      content: Array<{ text: string }>;
    };

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain('Unable to audit model references');
  });

  it('handles expected transformation validation', async () => {
    mockAuditModelCodes.mockReturnValue({
      ok: true,
      value: {
        methodologyId: 'meth',
        documentVersion: '1.0',
        totalReferences: 1,
        validCount: 0,
        invalidCount: 1,
        issues: [
          {
            code: 'P1',
            issueType: 'WrongTransformation',
            message: 'Mismatch',
            expectedTransformation: 'IN',
            actualTransformation: 'P',
          },
        ],
      },
    });

    const handler = registeredHandlers['audit_model_references'];
    const response = (await handler({ items: [{ code: 'P1', expectedTransformation: 'IN' }] })) as {
      content: Array<{ text: string }>;
    };

    const payload = JSON.parse(response.content[0].text);
    expect(payload.issues[0].expectedTransformation).toBe('IN');
    expect(payload.issues[0].actualTransformation).toBe('P');
  });
});
