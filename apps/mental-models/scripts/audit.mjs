#!/usr/bin/env node
// scripts/audit.mjs
// Runs Lighthouse + axe-core (via puppeteer). Thresholds are configurable via ENV.
import fs from 'fs';
import path from 'path';
import chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';
import axeCore from 'axe-core';

const targetUrl = process.env.TARGET_URL || 'https://hummbl.io';
const reportDir = path.join(process.cwd(), 'reports');
fs.mkdirSync(reportDir, { recursive: true });

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
  const options = { port: chrome.port, output: 'json', logLevel: 'info' };
  const result = await lighthouse(url, options);
  await chrome.kill();
  const lighthouseReport = result.report;
  fs.writeFileSync(path.join(reportDir, 'lighthouse.json'), lighthouseReport);
  const scores = result.lhr.categories;
  return {
    performance: scores.performance.score,
    accessibility: scores.accessibility.score,
    bestPractices: scores['best-practices'].score,
    seo: scores.seo.score,
  };
}

async function runAxe(url) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  // inject axe
  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => {
    return await window.axe.run();
  });
  await browser.close();
  fs.writeFileSync(path.join(reportDir, 'axe.json'), JSON.stringify(results, null, 2));
  return results;
}

(async () => {
  console.log('[audit] Starting audit for', targetUrl);
  const lh = await runLighthouse(targetUrl);
  console.log('[audit] Lighthouse scores:', lh);
  const axe = await runAxe(targetUrl);
  console.log('[audit] Axe violations:', axe.violations.length);
  // Thresholds
  const minScore = Number(process.env.LH_MIN || 0.9);
  const maxAxe = Number(process.env.AXE_MAX || 0);
  if (lh.performance < minScore || axe.violations.length > maxAxe) {
    console.error('[audit] Thresholds not met. Failing.');
    process.exit(2);
  }
  console.log('[audit] Audit OK.');
  process.exit(0);
})();
