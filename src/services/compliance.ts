/**
 * FreeAppStore Compliance Checking Engine (fas check)
 * Implements the 6 platform compliance checks defined in the official specification
 */

import { ComplianceAuditReport, ComplianceViolation } from '../types/fas';

export interface CodeProjectInput {
  appName: string;
  indexHtml: string;
  globalCss: string;
  manifestJson: string;
  appCode: string;
  bundleSizeKb: number;
}

const BANNED_TRACKERS = [
  { name: 'Google Analytics (gtag.js)', pattern: /(googletagmanager\.com\/gtag\/js|ga\('create'|gtag\('config')/i },
  { name: 'Segment Analytics', pattern: /(cdn\.segment\.com\/analytics\.js|analytics\.load\()/i },
  { name: 'Hotjar Recording', pattern: /(static\.hotjar\.com|hjid|hjsv)/i },
  { name: 'Facebook / Meta Pixel', pattern: /(connect\.facebook\.net|fbq\('init')/i },
  { name: 'Mixpanel Analytics', pattern: /(cdn\.mxpnl\.com|mixpanel\.init\()/i },
  { name: 'Amplitude Tracking', pattern: /(cdn\.amplitude\.com|amplitude\.init\()/i },
  { name: 'Heap Analytics', pattern: /(cdn\.heapanalytics\.com|heap\.load\()/i },
  { name: 'PostHog Analytics', pattern: /(app\.posthog\.com|posthog\.init\()/i }
];

export function runComplianceAudit(project: CodeProjectInput): ComplianceAuditReport {
  const violations: ComplianceViolation[] = [];

  // Check 1: No template placeholders
  let noPlaceholders = true;
  const placeholderRegex = /APPNAME|my-cool-app-placeholder|TODO_APP_NAME/g;
  if (placeholderRegex.test(project.indexHtml) || placeholderRegex.test(project.appCode) || placeholderRegex.test(project.manifestJson)) {
    noPlaceholders = false;
    violations.push({
      id: 'v_placeholder',
      ruleName: 'No Template Placeholders',
      description: 'Found unreplaced APPNAME or placeholder strings in code or manifest.',
      severity: 'error',
      file: 'index.html / App.tsx',
      fixable: true,
      remediation: `Replace all occurrences of 'APPNAME' with your actual app id (e.g., "${project.appName}").`
    });
  }

  // Check 2: No tracking SDKs
  let noTrackingSdk = true;
  const combinedCode = `${project.indexHtml}\n${project.appCode}\n${project.globalCss}`;
  for (const tracker of BANNED_TRACKERS) {
    if (tracker.pattern.test(combinedCode)) {
      noTrackingSdk = false;
      violations.push({
        id: `v_tracker_${tracker.name.replace(/\s+/g, '_').toLowerCase()}`,
        ruleName: 'No Tracking SDKs',
        description: `Prohibited tracking script detected: ${tracker.name}. FAS protects user privacy and strictly bans trackers.`,
        severity: 'error',
        file: 'index.html',
        fixable: true,
        remediation: `Remove third-party analytics tag: ${tracker.name}. Use built-in fas.log or platform analytics instead.`
      });
    }
  }

  // Check 3: Brand fonts present (Manrope + Fraunces referenced)
  let brandFontsPresent = true;
  const hasManrope = /Manrope/i.test(project.indexHtml) || /Manrope/i.test(project.globalCss);
  const hasFraunces = /Fraunces/i.test(project.indexHtml) || /Fraunces/i.test(project.globalCss);
  if (!hasManrope || !hasFraunces) {
    brandFontsPresent = false;
    const missing: string[] = [];
    if (!hasManrope) missing.push('Manrope (sans-serif body)');
    if (!hasFraunces) missing.push('Fraunces (serif display)');
    violations.push({
      id: 'v_brand_fonts',
      ruleName: 'Brand Fonts Present',
      description: `Missing required FreeAppStore brand fonts: ${missing.join(' and ')}.`,
      severity: 'error',
      file: 'index.html / index.css',
      fixable: true,
      remediation: 'Include Google Fonts link for Manrope & Fraunces in index.html, or load FasShell.'
    });
  }

  // Check 4: No brand overrides
  let noBrandOverrides = true;
  // Overriding platform tokens destructively without CSS custom properties, or redefining core platform classes
  if (/--ink:\s*(#ff00ff|red|magenta)/i.test(project.globalCss) || /--ink-strong:\s*yellow/i.test(project.globalCss)) {
    noBrandOverrides = false;
    violations.push({
      id: 'v_brand_override',
      ruleName: 'No Brand Token Overrides',
      description: 'Destructive color override detected on platform design tokens (--ink, --ink-strong). Only --accent is customizable.',
      severity: 'warning',
      file: 'index.css',
      fixable: true,
      remediation: 'Do not redefine --ink or core platform typography tokens. Only customize :root { --accent: #hex; }.'
    });
  }

  // Check 5: PWA manifest valid
  let pwaManifestValid = true;
  try {
    const manifest = JSON.parse(project.manifestJson);
    const missingFields: string[] = [];
    if (!manifest.name) missingFields.push('name');
    if (!manifest.display) missingFields.push('display');
    if (!manifest.start_url) missingFields.push('start_url');

    if (missingFields.length > 0) {
      pwaManifestValid = false;
      violations.push({
        id: 'v_manifest_fields',
        ruleName: 'PWA Manifest Valid',
        description: `Manifest is missing mandatory PWA fields: ${missingFields.join(', ')}.`,
        severity: 'error',
        file: 'manifest.json',
        fixable: true,
        remediation: 'Ensure manifest.json includes name, display ("standalone"), and start_url ("/").'
      });
    }
  } catch (err) {
    pwaManifestValid = false;
    violations.push({
      id: 'v_manifest_json',
      ruleName: 'PWA Manifest Valid',
      description: 'manifest.json is missing or contains invalid JSON syntax.',
      severity: 'error',
      file: 'manifest.json',
      fixable: true,
      remediation: 'Fix JSON syntax in manifest.json.'
    });
  }

  // Check 6: Bundle size under 300KB gzipped
  let bundleUnder300kb = true;
  if (project.bundleSizeKb > 300) {
    bundleUnder300kb = false;
    violations.push({
      id: 'v_bundle_size',
      ruleName: 'Bundle Size Under 300KB',
      description: `Gzipped bundle size is ${project.bundleSizeKb.toFixed(1)}KB, exceeding the 300KB threshold.`,
      severity: 'error',
      file: 'web/dist/',
      fixable: false,
      remediation: 'Remove heavy client libraries or use dynamic import() code-splitting to keep gzip < 300KB.'
    });
  }

  const checks = [noPlaceholders, noTrackingSdk, brandFontsPresent, noBrandOverrides, pwaManifestValid, bundleUnder300kb];
  const checksPassed = checks.filter(Boolean).length;
  const score = Math.round((checksPassed / checks.length) * 100);

  return {
    timestamp: new Date().toLocaleTimeString(),
    appName: project.appName,
    passed: violations.filter(v => v.severity === 'error').length === 0,
    score,
    checksTotal: checks.length,
    checksPassed,
    violations,
    details: {
      noPlaceholders,
      noTrackingSdk,
      brandFontsPresent,
      noBrandOverrides,
      pwaManifestValid,
      bundleUnder300kb
    }
  };
}
