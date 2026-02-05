type TelemetryData = {
  [key: string]: any;
};

/**
 * Emits telemetry data for monitoring and analytics
 */
export function emitTelemetry(eventName: string, data: TelemetryData): void {
  // In a real implementation, this would send data to a telemetry service
  // For testing, this is a no-op that can be mocked
  if (process.env.NODE_ENV !== 'test') {
    console.debug(`[Telemetry:${eventName}]`, data);
  }
}
