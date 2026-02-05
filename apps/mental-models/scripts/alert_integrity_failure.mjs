import { readFile } from 'fs/promises';

async function sendAlert(webhookUrl, message) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        username: 'HUMMBL Integrity Bot',
        icon_emoji: ':shield:',
        ...(process.env.GITHUB_RUN_ID && {
          attachments: [
            {
              color: '#ff0000',
              title: 'GitHub Actions Run',
              title_link: `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
              fields: [
                {
                  title: 'Workflow',
                  value: process.env.GITHUB_WORKFLOW || 'Unknown',
                  short: true,
                },
                {
                  title: 'Commit',
                  value: process.env.GITHUB_SHA
                    ? `<https://github.com/${process.env.GITHUB_REPOSITORY}/commit/${process.env.GITHUB_SHA}|${process.env.GITHUB_SHA.slice(0, 7)}>`
                    : 'Unknown',
                  short: true,
                },
              ],
            },
          ],
        }),
      }),
    });

    if (!response.ok) {
      console.error(`Failed to send alert: ${response.status} ${response.statusText}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error sending alert:', error);
    return false;
  }
}

async function main() {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('ALERT_WEBHOOK_URL environment variable is not set');
    process.exit(1);
  }

  try {
    // Try to read the compliance report
    let report;
    try {
      const reportContent = await readFile('compliance-report.json', 'utf8');
      report = JSON.parse(reportContent);
    } catch (error) {
      console.error('Error reading compliance report:', error);
      // Fallback to environment variables if available
      report = {
        metadata: {
          generated_at: new Date().toISOString(),
          commit_sha: process.env.GITHUB_SHA || 'unknown',
        },
        summary: {
          failed: 'Unknown',
          details: 'Failed to generate compliance report',
        },
      };
    }

    const { metadata, summary } = report;
    const failedChecks =
      report.checks?.filter((c) => c.status === '❌ MISMATCH' || c.status === '❌ ERROR') || [];

    const message =
      `🚨 *HUMMBL Integrity Check Failed*\n` +
      `*Environment:* ${metadata?.environment || 'production'}\n` +
      `*Time:* ${metadata?.generated_at || new Date().toISOString()}\n` +
      `*Failed Checks:* ${failedChecks.length}\n\n` +
      `*Failed Files:*\n${failedChecks.map((c) => `• ${c.file}: ${c.details}`).join('\n') || 'None'}\n\n` +
      `*Commit:* ${metadata?.commit_sha?.slice(0, 7) || 'Unknown'}\n`;

    const success = await sendAlert(webhookUrl, message);

    // For GitHub Actions, set an output
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::set-output name=alert_sent::${success}`);
    }

    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Error in alert script:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { sendAlert };
