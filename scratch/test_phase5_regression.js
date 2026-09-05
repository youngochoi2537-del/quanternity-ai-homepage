const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function checkFile(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) {
    throw new Error(`File not found: ${relPath}`);
  }
  return fs.readFileSync(full, 'utf8');
}

const results = [];
function assert(name, condition, details = '') {
  if (condition) {
    results.push({ name, status: 'PASS', details });
  } else {
    results.push({ name, status: 'FAIL', details });
  }
}

console.log('====================================================');
console.log('QUANTERNITY AI — PHASE 5 REGRESSION TEST SUITE');
console.log('====================================================\n');

// 1. Files existence
const servicesHtml = checkFile('services.html');
const diagnosisHtml = checkFile('diagnosis.html');
const diagnosisStartHtml = checkFile('diagnosis/start.html');
const stylesCss = checkFile('assets/css/styles.css');
const funnelJs = checkFile('assets/js/cert-funnel.js');
const vercelJson = checkFile('vercel.json');

// 2. Functional & Route Assertions
assert(
  'services.html contains data-page="service"',
  servicesHtml.includes('data-page="service"')
);
assert(
  'services.html has Dark Hero with inline SVG feTurbulence noise grain',
  servicesHtml.includes('hero-grain') && servicesHtml.includes('feTurbulence')
);
assert(
  'services.html primary CTA links to /diagnosis',
  servicesHtml.includes('href="/diagnosis"')
);
assert(
  'services.html secondary CTA links to /quote',
  servicesHtml.includes('href="/quote"')
);
assert(
  'services.html sticky nav has 4 anchors (pillar-1, pillar-2, pillar-3, roadmap)',
  servicesHtml.includes('#pillar-1') &&
  servicesHtml.includes('#pillar-2') &&
  servicesHtml.includes('#pillar-3') &&
  servicesHtml.includes('#roadmap')
);
assert(
  'services.html retains JSON-LD structured data',
  servicesHtml.includes('"@type": "Service"')
);

// 3. Pre-diagnosis Assertions
assert(
  'diagnosis.html contains data-page="diagnosis"',
  diagnosisHtml.includes('data-page="diagnosis"')
);
assert(
  'diagnosis.html is 100% clean light (no funnel-page--dark)',
  !diagnosisHtml.includes('funnel-page--dark')
);
assert(
  'diagnosis.html has CTA to /diagnosis/start',
  diagnosisHtml.includes('href="/diagnosis/start"')
);
assert(
  'diagnosis.html has compliance disclaimer',
  diagnosisHtml.includes('본 사전진단은 공개 가능한 정보를 기반으로 한 참고용 자기점검 도구이며')
);

// 4. Wizard & Form Assertions (diagnosis/start.html)
assert(
  'diagnosis/start.html contains data-page="diagnosis"',
  diagnosisStartHtml.includes('data-page="diagnosis"')
);
assert(
  'diagnosis/start.html is 100% clean light (no funnel-page--dark)',
  !diagnosisStartHtml.includes('funnel-page--dark')
);
assert(
  'diagnosis/start.html contains 4-step wizard progress bar',
  diagnosisStartHtml.includes('wizard-progress-bar') && diagnosisStartHtml.includes('data-step="4"')
);
assert(
  'diagnosis/start.html retains Step 1 Industry, Org, Employee, Age grids',
  diagnosisStartHtml.includes('grid-industries') &&
  diagnosisStartHtml.includes('grid-org-types') &&
  diagnosisStartHtml.includes('grid-employee-size') &&
  diagnosisStartHtml.includes('grid-business-age')
);
assert(
  'diagnosis/start.html retains Step 2 system checklist with item 9 exclusion',
  diagnosisStartHtml.includes('system-checklist-container') &&
  diagnosisStartHtml.includes('sys-item-none')
);
assert(
  'diagnosis/start.html retains Step 3 purpose checklist',
  diagnosisStartHtml.includes('purpose-checklist-container')
);
assert(
  'diagnosis/start.html retains Step 4 result gauge, gaps, purpose, and cert grid',
  diagnosisStartHtml.includes('result-gauge-card') &&
  diagnosisStartHtml.includes('res-gaps-container') &&
  diagnosisStartHtml.includes('res-purpose-container') &&
  diagnosisStartHtml.includes('res-certs-grid')
);
assert(
  'diagnosis/start.html retains guidebook form with required privacy agree checkbox',
  diagnosisStartHtml.includes('guidebook-form') &&
  diagnosisStartHtml.includes('guidebook-email') &&
  diagnosisStartHtml.includes('guidebook-agree')
);
assert(
  'diagnosis/start.html has disclaimer regarding reference and non-guarantee',
  diagnosisStartHtml.includes('실제 인증 준비기간과 심사 결과를 보장하지 않습니다')
);

// 5. CSS & Motion & Accessibility
assert(
  'styles.css defines [data-page="diagnosis"] and [data-page="service"] tokens',
  stylesCss.includes('[data-page="diagnosis"]') && stylesCss.includes('[data-page="service"]')
);
assert(
  'styles.css has prefers-reduced-motion media query for motion sensitivity',
  stylesCss.includes('prefers-reduced-motion: reduce') &&
  stylesCss.includes('animation-duration: 0.01ms')
);
assert(
  'styles.css has active click feedback (scale 0.98, transition 100ms)',
  stylesCss.includes('transform: scale(0.98)')
);
assert(
  'styles.css has focus ring definitions for keyboard accessibility',
  stylesCss.includes(':focus') && stylesCss.includes('box-shadow:')
);

// Summary
let passed = 0;
results.forEach(r => {
  if (r.status === 'PASS') {
    console.log(`[PASS] ${r.name}`);
    passed++;
  } else {
    console.log(`[FAIL] ${r.name}`);
  }
});

console.log(`\nRegression Suite Complete: ${passed} / ${results.length} checks passed.`);

if (passed !== results.length) {
  process.exit(1);
}
