import { readFile } from 'fs/promises';
import { createHash } from 'crypto';

async function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function generateReport() {
  const now = new Date().toISOString();
  const nextCheck = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(); // Default to 6 hours

  try {
    // Read the verification log if it exists
    let verificationResults = [];
    try {
      const logContent = await readFile('verification.log', 'utf8');
      verificationResults = logContent
        .split('\n')
        .filter((line) => line.includes('│'))
        .slice(2, -1) // Remove header and footer
        .map((line) => {
          const parts = line.split('│').map((p) => p.trim());
          return {
            file: parts[1].replace(/'/g, ''),
            status: parts[2],
            localHash: parts[3],
            prodHash: parts[4],
            size: parseInt(parts[5]) || 0,
            details: parts[6] || 'OK',
          };
        });
    } catch (error) {
      console.error('Error parsing verification log:', error.message);
    }

    // Generate the report
    const report = {
      metadata: {
        generated_at: now,
        next_check: nextCheck,
        environment: process.env.NODE_ENV || 'production',
        commit_sha: process.env.GITHUB_SHA || 'local',
        run_id: process.env.GITHUB_RUN_ID || 'manual',
      },
      summary: {
        total_checks: verificationResults.length,
        passed: verificationResults.filter((r) => r.status === '✅ MATCH').length,
        failed: verificationResults.filter(
          (r) => r.status === '❌ MISMATCH' || r.status === '❌ ERROR'
        ).length,
        success_rate:
          verificationResults.length > 0
            ? (
                (verificationResults.filter((r) => r.status === '✅ MATCH').length /
                  verificationResults.length) *
                100
              ).toFixed(2) + '%'
            : 'N/A',
      },
      checks: verificationResults,
      system: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    console.log(JSON.stringify(report, null, 2));
    return report;
  } catch (error) {
    console.error('Error generating compliance report:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateReport().catch(console.error);
}

export { generateReport };
