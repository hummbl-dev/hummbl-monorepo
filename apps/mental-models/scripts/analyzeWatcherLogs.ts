#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { program } from 'commander';
import { table } from 'table';
import { stringify } from 'csv-stringify/sync';

// Get the directory name in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default configuration
const DEFAULT_CONFIG = {
  logFile: path.join('logs', 'watcher-load-test.log'),
  outputFile: 'watcher-metrics',
  windowSize: 300000, // 5 minutes in ms
  csv: false,
  table: false,
};

// Parse command line arguments
function parseArgs() {
  program
    .option('--log-file <path>', 'Path to the log file', DEFAULT_CONFIG.logFile)
    .option('--output <path>', 'Output file path (without extension)', DEFAULT_CONFIG.outputFile)
    .option('--window <ms>', 'Time window in milliseconds', String(DEFAULT_CONFIG.windowSize))
    .option('--csv', 'Export metrics as CSV', DEFAULT_CONFIG.csv)
    .option('--table', 'Show summary table', DEFAULT_CONFIG.table)
    .parse(process.argv);

  const options = program.opts();
  return {
    logFile: options.logFile,
    outputFile: options.output,
    windowSize: parseInt(options.window, 10),
    csv: options.csv,
    table: options.table,
  };
}

// Types
type LogEntry = {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
};

type EventType = 'valid' | 'invalid' | 'error' | 'modification' | 'memory';

interface MetricPoint {
  timestamp: string;
  type: EventType;
  details: any;
}

interface AggregatedMetrics {
  timeWindow: string;
  eventCounts: {
    valid: number;
    invalid: number;
    error: number;
    modification: number;
  };
  memoryStats: {
    initial: number; // MB
    max: number; // MB
    min: number; // MB
    avg: number; // MB
  };
  validationLatency: {
    avg: number; // ms
    max: number; // ms
    min: number; // ms
    p95: number; // ms
  };
}

// Parse log file
function parseLogs(logContent: string): LogEntry[] {
  return logContent
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      // Format: [timestamp] [LEVEL] message
      const match = line.match(/^\[(.*?)\] \[(INFO|WARN|ERROR)\] (.*)$/);
      if (!match) return null;

      const [, timestamp, level, message] = match;
      return { timestamp, level: level as 'INFO' | 'WARN' | 'ERROR', message };
    })
    .filter((entry): entry is LogEntry => entry !== null);
}

// Extract metrics from logs
function extractMetrics(logs: LogEntry[]): MetricPoint[] {
  const metrics: MetricPoint[] = [];
  let lastModificationTime: string | null = null;

  for (const log of logs) {
    if (log.message.includes('Context is valid')) {
      metrics.push({
        timestamp: log.timestamp,
        type: 'valid',
        details: {},
      });

      // Calculate latency if we have a previous modification
      if (lastModificationTime) {
        const modTime = new Date(lastModificationTime).getTime();
        const validTime = new Date(log.timestamp).getTime();
        const latency = validTime - modTime;

        metrics[metrics.length - 1].details.latency = latency;
        lastModificationTime = null; // Reset for next modification
      }
    } else if (log.message.includes('Context validation failed')) {
      metrics.push({
        timestamp: log.timestamp,
        type: 'invalid',
        details: { errors: log.message },
      });
    } else if (log.message.includes('ERROR')) {
      metrics.push({
        timestamp: log.timestamp,
        type: 'error',
        details: { error: log.message },
      });
    } else if (log.message.includes('Modified')) {
      lastModificationTime = log.timestamp;
      metrics.push({
        timestamp: log.timestamp,
        type: 'modification',
        details: { field: log.message.match(/Modified (.*?) at/)?.[1] },
      });
    } else if (log.message.includes('Memory - RSS')) {
      const match = log.message.match(/RSS: (\d+\.\d+)MB, Heap: (\d+\.\d+)\/(\d+\.\d+)MB/);
      if (match) {
        metrics.push({
          timestamp: log.timestamp,
          type: 'memory',
          details: {
            rss: parseFloat(match[1]),
            heapUsed: parseFloat(match[2]),
            heapTotal: parseFloat(match[3]),
          },
        });
      }
    }
  }

  return metrics;
}

// Aggregate metrics into time windows
function aggregateMetrics(metrics: MetricPoint[], windowSizeMs: number): AggregatedMetrics[] {
  if (metrics.length === 0) return [];

  const sortedMetrics = [...metrics].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const startTime = new Date(sortedMetrics[0].timestamp);
  const endTime = new Date(sortedMetrics[sortedMetrics.length - 1].timestamp);
  const windowMs = windowSizeMs;

  const result: AggregatedMetrics[] = [];
  let windowStart = new Date(startTime);

  while (windowStart < endTime) {
    const windowEnd = new Date(windowStart.getTime() + windowMs);

    const windowMetrics = sortedMetrics.filter((metric) => {
      const time = new Date(metric.timestamp);
      return time >= windowStart && time < windowEnd;
    });

    const validEvents = windowMetrics.filter((m) => m.type === 'valid');
    const invalidEvents = windowMetrics.filter((m) => m.type === 'invalid');
    const errorEvents = windowMetrics.filter((m) => m.type === 'error');
    const modificationEvents = windowMetrics.filter((m) => m.type === 'modification');
    const memoryEvents = windowMetrics.filter((m) => m.type === 'memory');

    // Calculate memory stats
    const memoryValues = memoryEvents.map((m) => m.details.rss);
    const memoryStats = {
      initial: memoryValues[0] || 0,
      max: Math.max(...memoryValues, 0),
      min: memoryValues.length > 0 ? Math.min(...memoryValues) : 0,
      avg:
        memoryValues.length > 0 ? memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length : 0,
    };

    // Calculate validation latencies
    const latencies = validEvents
      .map((e) => e.details.latency)
      .filter((l): l is number => typeof l === 'number' && !isNaN(l));

    const sortedLatencies = [...latencies].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);

    const latencyStats = {
      avg: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      max: latencies.length > 0 ? Math.max(...latencies) : 0,
      min: latencies.length > 0 ? Math.min(...latencies) : 0,
      p95:
        latencies.length > 0 ? sortedLatencies[Math.min(p95Index, sortedLatencies.length - 1)] : 0,
    };

    result.push({
      timeWindow: `${windowStart.toISOString()} - ${windowEnd.toISOString()}`,
      eventCounts: {
        valid: validEvents.length,
        invalid: invalidEvents.length,
        error: errorEvents.length,
        modification: modificationEvents.length,
      },
      memoryStats,
      validationLatency: latencyStats,
    });

    windowStart = new Date(windowEnd);
  }

  return result;
}

// Generate CSV content
function generateCSV(aggregated: AggregatedMetrics[]): string {
  if (aggregated.length === 0) return '';

  const headers = [
    'Time Window',
    'Valid',
    'Invalid',
    'Errors',
    'Modifications',
    'Memory (avg MB)',
    'Memory (max MB)',
    'Latency (avg ms)',
    'Latency (p95 ms)',
  ];

  const rows = aggregated.map((window) => [
    window.timeWindow,
    window.eventCounts.valid,
    window.eventCounts.invalid,
    window.eventCounts.error,
    window.eventCounts.modification,
    window.memoryStats.avg.toFixed(2),
    window.memoryStats.max.toFixed(2),
    window.validationLatency.avg.toFixed(2),
    window.validationLatency.p95.toFixed(2),
  ]);

  return stringify([headers, ...rows]);
}

// Generate table output
function generateTable(aggregated: AggregatedMetrics[]): string {
  if (aggregated.length === 0) return 'No data available';

  const headers = ['Time Window', 'Valid', 'Invalid', 'Errors', 'Mods', 'Mem (MB)', 'Latency (ms)'];

  const rows = aggregated.map((window) => [
    window.timeWindow.split(' - ')[0].split('T')[1].split('.')[0], // Just the time part
    window.eventCounts.valid,
    window.eventCounts.invalid,
    window.eventCounts.error,
    window.eventCounts.modification,
    `${window.memoryStats.avg.toFixed(1)} (${window.memoryStats.max.toFixed(1)})`,
    `${window.validationLatency.avg.toFixed(1)} (${window.validationLatency.p95.toFixed(1)})`,
  ]);

  return table([headers, ...rows], {
    columns: [
      { alignment: 'left' }, // Time
      { alignment: 'right' }, // Valid
      { alignment: 'right' }, // Invalid
      { alignment: 'right' }, // Errors
      { alignment: 'right' }, // Mods
      { alignment: 'right' }, // Memory
      { alignment: 'right' }, // Latency
    ],
    drawHorizontalLine: (lineIndex, rowCount) =>
      lineIndex === 0 || lineIndex === 1 || lineIndex === rowCount,
  });
}

// Main function
async function main() {
  const config = parseArgs();

  try {
    // Ensure logs directory exists
    const logDir = path.dirname(config.logFile);
    if (!fs.existsSync(logDir)) {
      console.error(`Log directory not found: ${logDir}`);
      process.exit(1);
    }

    // Read log file
    const logContent = fs.readFileSync(config.logFile, 'utf-8');

    // Process logs
    const logs = parseLogs(logContent);
    const metrics = extractMetrics(logs);
    const aggregated = aggregateMetrics(metrics, config.windowSize);

    // Prepare results
    const output = {
      metadata: {
        analyzedAt: new Date().toISOString(),
        config: {
          logFile: config.logFile,
          windowSize: config.windowSize,
        },
      },
      summary: {
        totalEvents: metrics.length,
        timeRange: {
          start: metrics[0]?.timestamp,
          end: metrics[metrics.length - 1]?.timestamp,
        },
        eventTypes: {
          valid: metrics.filter((m) => m.type === 'valid').length,
          invalid: metrics.filter((m) => m.type === 'invalid').length,
          error: metrics.filter((m) => m.type === 'error').length,
          modification: metrics.filter((m) => m.type === 'modification').length,
          memory: metrics.filter((m) => m.type === 'memory').length,
        },
      },
      aggregatedMetrics: aggregated,
    };

    // Ensure output directory exists
    const outputDir = path.dirname(config.outputFile);
    if (outputDir !== '.') {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save JSON output
    const jsonOutput = `${config.outputFile}.json`;
    fs.writeFileSync(jsonOutput, JSON.stringify(output, null, 2));
    console.log(`\nJSON report saved to: ${path.resolve(jsonOutput)}`);

    // Save CSV output if requested
    if (config.csv) {
      const csvOutput = `${config.outputFile}.csv`;
      const csvContent = generateCSV(aggregated);
      if (csvContent) {
        fs.writeFileSync(csvOutput, csvContent);
        console.log(`CSV report saved to: ${path.resolve(csvOutput)}`);
      }
    }

    // Print summary
    console.log('\n=== Watcher Performance Summary ===');
    console.log(`Time Range: ${output.summary.timeRange.start} to ${output.summary.timeRange.end}`);
    console.log(`Total Events: ${output.summary.totalEvents}`);

    // Print table if requested or if no table flag was set (default to true if not in CI)
    const shouldShowTable = config.table || (process.stdout.isTTY && !process.env.CI);
    if (shouldShowTable && aggregated.length > 0) {
      console.log('\nAggregated Metrics:');
      console.log(generateTable(aggregated));
    }
  } catch (error) {
    console.error('Error analyzing logs:', error);
    process.exit(1);
  }
}

// Run the analysis
main().catch(console.error);
