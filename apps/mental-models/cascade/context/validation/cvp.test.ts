import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateContext } from './cvp';
import type { HummblPacket } from '../../types';

// Mock the telemetry module
const mockEmitTelemetry = vi.fn();

vi.mock('../../utils/telemetry', () => ({
  emitTelemetry: (...args: any[]) => mockEmitTelemetry(...args),
}));

// Import the mock after setting it up
import { emitTelemetry } from '../../utils/telemetry';

describe('Context Validation Pipeline (CVP)', () => {
  const validPacket: HummblPacket = {
    id: 'test-123',
    timestamp: Date.now(),
    context: {
      userId: 'user-123',
      sessionId: 'session-456',
      environment: 'test',
      version: '1.0.0',
    },
    payload: {
      type: 'interaction',
      data: {
        action: 'click',
        target: 'button.submit',
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should validate a well-formed HUMMBL packet', async () => {
    // Reset mock before the test
    mockEmitTelemetry.mockClear();

    const result = await validateContext(validPacket);

    expect(result).toEqual({
      isValid: true,
      errors: [],
      warnings: [],
    });

    // Verify telemetry was emitted
    expect(mockEmitTelemetry).toHaveBeenCalled();

    // Get the first call's arguments
    const call = mockEmitTelemetry.mock.calls[0];
    expect(call[0]).toBe('context_validation');
    expect(call[1]).toMatchObject({
      packetId: 'test-123',
      status: 'success',
      duration: expect.any(Number),
      validationChecks: 0,
    });
  });

  it('should reject packets missing required fields', async () => {
    // Create a packet missing required fields
    const invalidPacket = { ...validPacket } as Partial<HummblPacket>;
    delete invalidPacket.context;

    const result = await validateContext(invalidPacket as any);

    expect(result).toMatchObject({
      isValid: false,
      errors: expect.arrayContaining(['Packet is missing required field: context']),
    });
  });

  it('should validate packet structure and types', async () => {
    const invalidTypePacket = {
      ...validPacket,
      context: {
        ...validPacket.context,
        userId: 123 as any, // Invalid type for userId
      },
    };

    const result = await validateContext(invalidTypePacket as any);

    expect(result).toMatchObject({
      isValid: false,
      errors: expect.arrayContaining(['Invalid userId type: must be a string']),
    });
  });

  it('should handle validation timeouts', async () => {
    // Mock the setTimeout to throw immediately for this test
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = vi.fn((fn) => {
      // Simulate a timeout by throwing immediately
      throw new Error('Validation timed out after 10ms');
    }) as any;

    try {
      const result = await validateContext(validPacket, { timeout: 10 });

      // Verify the result
      expect(result).toEqual({
        isValid: false,
        errors: ['Validation timed out after 10ms'],
        warnings: [],
      });

      // Verify telemetry was called with the correct arguments
      expect(mockEmitTelemetry).toHaveBeenCalled();

      // Get the first call's arguments
      const call = mockEmitTelemetry.mock.calls[0];
      expect(call[0]).toBe('context_validation');

      // Verify the telemetry data structure
      const telemetryData = call[1];
      expect(telemetryData).toMatchObject({
        packetId: 'test-123',
        duration: expect.any(Number),
        validationChecks: expect.any(Number),
      });

      // The error is caught and handled in the result object, not in telemetry
      // So we just need to verify that the result has the expected error
      expect(result.errors[0]).toContain('Validation timed out');
    } finally {
      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;
    }
  });

  it('should generate warnings for deprecated fields', async () => {
    // Reset mock before the test
    mockEmitTelemetry.mockClear();

    const deprecatedPacket = {
      ...validPacket,
      context: {
        ...validPacket.context,
        deprecatedField: 'old-value',
      },
    };

    const result = await validateContext(deprecatedPacket as any);

    expect(result).toMatchObject({
      isValid: true,
      warnings: expect.arrayContaining([
        expect.stringContaining('Deprecated field detected: deprecatedField'),
      ]),
    });

    // Verify telemetry was emitted with the warning
    expect(mockEmitTelemetry).toHaveBeenCalledWith('context_validation', {
      packetId: 'test-123',
      status: 'success',
      validationChecks: 1, // 1 warning
      duration: expect.any(Number),
    });
  });
});
