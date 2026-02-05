import type { HummblPacket, ValidationResult } from '../../types';
import { emitTelemetry } from '../../utils/telemetry';

/**
 * Validates the context of a HUMMBL packet
 * @param packet The HUMMBL packet to validate
 * @param options Optional configuration including timeout
 */
export async function validateContext(
  packet: HummblPacket,
  options: { timeout?: number } = {}
): Promise<ValidationResult> {
  const startTime = Date.now();
  const { timeout = 5000 } = options;

  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    // Check for timeout before starting
    if (timeout > 0 && Date.now() - startTime > timeout) {
      throw new Error(`Validation timed out after ${timeout}ms`);
    }

    // Required fields validation
    if (!packet.id) {
      result.errors.push('Packet is missing required field: id');
    }

    if (!packet.timestamp) {
      result.errors.push('Packet is missing required field: timestamp');
    } else if (typeof packet.timestamp !== 'number' || isNaN(packet.timestamp)) {
      result.errors.push('Invalid timestamp: must be a valid number');
    }

    // Type validation
    if (packet.id && typeof packet.id !== 'string') {
      result.errors.push('Invalid id type: must be a string');
    }

    if (packet.timestamp && typeof packet.timestamp !== 'number') {
      result.errors.push('Invalid timestamp type: must be a number');
    }

    // Context validation
    if (!packet.context) {
      result.errors.push('Packet is missing required field: context');
    } else {
      const { context } = packet;

      if (!context.userId) {
        result.errors.push('Context is missing required field: userId');
      } else if (typeof context.userId !== 'string') {
        result.errors.push('Invalid userId type: must be a string');
      }

      if (!context.sessionId) {
        result.errors.push('Context is missing required field: sessionId');
      } else if (typeof context.sessionId !== 'string') {
        result.errors.push('Invalid sessionId type: must be a string');
      }

      // Check for deprecated fields
      if ('deprecatedField' in context) {
        result.warnings.push('Deprecated field detected: deprecatedField');
      }
    }

    // Payload validation
    if (!packet.payload) {
      result.errors.push('Packet is missing required field: payload');
    } else if (typeof packet.payload !== 'object' || packet.payload === null) {
      result.errors.push('Invalid payload: must be an object');
    }

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Check for timeout again after processing
    const duration = Date.now() - startTime;
    if (timeout > 0 && duration > timeout) {
      throw new Error(`Validation timed out after ${timeout}ms`);
    }

    // Update validity based on errors
    result.isValid = result.errors.length === 0;

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';

    // Update the result with the error
    const errorResult = {
      isValid: false,
      errors: [errorMessage],
      warnings: result.warnings,
    };

    return errorResult;
  } finally {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Only emit telemetry if we have a valid packet ID
    if (packet?.id) {
      emitTelemetry('context_validation', {
        packetId: packet.id,
        status: result.isValid ? 'success' : 'error',
        duration,
        validationChecks: result.errors.length + result.warnings.length,
        ...(result.errors.length > 0 && { error: result.errors[0] }),
      });
    }
  }
}

// Export for testing
export const __test__ = {
  validateContext,
};
