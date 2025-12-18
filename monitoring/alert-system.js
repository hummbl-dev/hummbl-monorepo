#!/usr/bin/env node

import fs from 'fs';

const ALERT_THRESHOLDS = {
  responseTime: 5000, // 5 seconds
  errorRate: 0.1, // 10%
  consecutiveFailures: 3,
};

function checkAlerts() {
  console.log('🚨 HUMMBL Alert System\n');

  const today = new Date().toISOString().split('T')[0];
  const logPath = `monitoring/health-${today}.json`;

  if (!fs.existsSync(logPath)) {
    console.log('⚠️ No health check data found');
    return false;
  }

  const logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
  const recent = logs.slice(-10); // Last 10 checks

  let alerts = [];

  // Check response time
  const avgResponseTime = recent.reduce((sum, log) => sum + log.avgResponseTime, 0) / recent.length;
  if (avgResponseTime > ALERT_THRESHOLDS.responseTime) {
    alerts.push(
      `🐌 High response time: ${avgResponseTime.toFixed(0)}ms (threshold: ${ALERT_THRESHOLDS.responseTime}ms)`
    );
  }

  // Check error rate
  const errorRate = recent.filter(log => !log.healthy).length / recent.length;
  if (errorRate > ALERT_THRESHOLDS.errorRate) {
    alerts.push(
      `💥 High error rate: ${(errorRate * 100).toFixed(1)}% (threshold: ${ALERT_THRESHOLDS.errorRate * 100}%)`
    );
  }

  // Check consecutive failures
  let consecutiveFailures = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    if (!recent[i].healthy) {
      consecutiveFailures++;
    } else {
      break;
    }
  }

  if (consecutiveFailures >= ALERT_THRESHOLDS.consecutiveFailures) {
    alerts.push(
      `🔥 Consecutive failures: ${consecutiveFailures} (threshold: ${ALERT_THRESHOLDS.consecutiveFailures})`
    );
  }

  if (alerts.length > 0) {
    console.log('🚨 ALERTS TRIGGERED:');
    alerts.forEach(alert => console.log(`  ${alert}`));

    // Save alert
    const alertLog = {
      timestamp: new Date().toISOString(),
      alerts,
      severity:
        consecutiveFailures >= ALERT_THRESHOLDS.consecutiveFailures ? 'critical' : 'warning',
    };

    const alertPath = `monitoring/alerts-${today}.json`;
    let alertLogs = [];
    try {
      alertLogs = JSON.parse(fs.readFileSync(alertPath, 'utf8'));
    } catch {}

    alertLogs.push(alertLog);
    fs.writeFileSync(alertPath, JSON.stringify(alertLogs, null, 2));

    return true;
  } else {
    console.log('✅ No alerts - system healthy');
    return false;
  }
}

const hasAlerts = checkAlerts();
process.exit(hasAlerts ? 1 : 0);
