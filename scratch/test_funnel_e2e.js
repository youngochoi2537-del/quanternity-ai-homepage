const fs = require('fs');
const path = require('path');
const {
  ISO_STANDARDS,
  TAXONOMY_AXIS_A_INDUSTRIES,
  calculateRecommendationScores,
  shouldShow13485,
  calculateMaturityResult,
  validateBizRegNo
} = require('../assets/js/cert-funnel.js');

console.log('====================================================');
console.log('QUANTERNITY AI — CERT FUNNEL COMPREHENSIVE E2E CHECK');
console.log('====================================================\n');

let passCount = 0;
let totalChecks = 0;

function assertCheck(desc, condition) {
  totalChecks++;
  if (condition) {
    console.log(`[PASS] ${desc}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${desc}`);
  }
}

// 1. Core Logic Verification
const reqScores = calculateRecommendationScores('의료기기·체외진단(IVD)', '민간기업 (중소·중견)');
assertCheck('13485 included for Medical Device industry', reqScores.some(s => s.code === '13485'));
assertCheck('Fixed order: 27001 -> 42001 -> 13485 -> 9001 -> 14001 -> 45001', reqScores.map(s => s.code).join(',') === '27001,42001,13485,9001,14001,45001');

const itScores = calculateRecommendationScores('IT·소프트웨어·AI·플랫폼', '스타트업·벤처 (투자유치·IPO 준비)', ['ai_system']);
const it42001 = itScores.find(s => s.code === '42001');
assertCheck('AI startup gets essential (score >= 70) for 42001', it42001.score >= 70 && it42001.badge === '필수');

// 2. Business Number Checksum
assertCheck('Valid BizRegNo passes checksum', validateBizRegNo('120-81-47521') === true);
assertCheck('Invalid BizRegNo rejected', validateBizRegNo('111-11-11111') === false);

// 3. File existence checks
const rootDir = path.join(__dirname, '..');
assertCheck('services.html exists', fs.existsSync(path.join(rootDir, 'services.html')));
assertCheck('recommend.html exists', fs.existsSync(path.join(rootDir, 'recommend.html')));
assertCheck('quote.html exists', fs.existsSync(path.join(rootDir, 'quote.html')));
assertCheck('quote/complete.html exists', fs.existsSync(path.join(rootDir, 'quote', 'complete.html')));
assertCheck('diagnosis.html exists', fs.existsSync(path.join(rootDir, 'diagnosis.html')));
assertCheck('diagnosis/start.html exists', fs.existsSync(path.join(rootDir, 'diagnosis', 'start.html')));
assertCheck('cert-funnel.js exists', fs.existsSync(path.join(rootDir, 'assets', 'js', 'cert-funnel.js')));

// 4. index.html GNB & Carousel check
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
assertCheck('index.html contains /services GNB link', indexHtml.includes('/services'));
assertCheck('index.html contains /quote GNB link', indexHtml.includes('/quote'));
assertCheck('index.html contains /recommend CTA', indexHtml.includes('/recommend'));
assertCheck('index.html contains /diagnosis CTA', indexHtml.includes('/diagnosis'));

// 5. vercel.json configuration check
const vercelJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf-8'));
assertCheck('vercel.json has /services rewrite', vercelJson.rewrites.some(r => r.source === '/services'));
assertCheck('vercel.json has /fieldproof -> /quote redirect', vercelJson.redirects.some(r => r.source === '/fieldproof' && r.destination === '/quote'));
assertCheck('vercel.json has /recommend rewrite', vercelJson.rewrites.some(r => r.source === '/recommend'));
assertCheck('vercel.json has /quote rewrite', vercelJson.rewrites.some(r => r.source === '/quote'));
assertCheck('vercel.json has /diagnosis rewrite', vercelJson.rewrites.some(r => r.source === '/diagnosis'));
assertCheck('vercel.json has /diagnosis/start rewrite', vercelJson.rewrites.some(r => r.source === '/diagnosis/start'));

// 6. sitemap.xml check
const sitemap = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf-8');
assertCheck('sitemap.xml contains /services', sitemap.includes('https://quanternity.kr/services'));
assertCheck('sitemap.xml contains /recommend', sitemap.includes('https://quanternity.kr/recommend'));
assertCheck('sitemap.xml contains /quote', sitemap.includes('https://quanternity.kr/quote'));
assertCheck('sitemap.xml contains /diagnosis', sitemap.includes('https://quanternity.kr/diagnosis'));
assertCheck('sitemap.xml contains /diagnosis/start', sitemap.includes('https://quanternity.kr/diagnosis/start'));

console.log(`\nVerification complete: ${passCount} / ${totalChecks} checks passed.`);
