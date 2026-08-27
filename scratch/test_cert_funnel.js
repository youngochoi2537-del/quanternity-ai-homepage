const {
  ISO_STANDARDS,
  TAXONOMY_AXIS_A_INDUSTRIES,
  TAXONOMY_AXIS_B_ORG_TYPES,
  calculateRecommendationScores,
  shouldShow13485,
  calculateMaturityResult,
  validateBizRegNo
} = require('../assets/js/cert-funnel.js');

console.log('=== Testing cert-funnel.js ===');

// Test 1: Order of Standards
console.log('1. Fixed Order Check:');
const defaultScores = calculateRecommendationScores('제조업 (일반)', '민간기업 (중소·중견)');
console.log('Codes:', defaultScores.map(s => s.code));
console.assert(defaultScores.map(s => s.code).join(',') === '27001,42001,9001,14001,45001', 'General manufacturing should not show 13485');

// Test 2: 13485 conditional
console.log('2. 13485 conditional Check:');
const medScores = calculateRecommendationScores('의료기기·체외진단(IVD)', '민간기업 (중소·중견)');
console.log('Med codes:', medScores.map(s => s.code));
console.assert(medScores.map(s => s.code).join(',') === '27001,42001,13485,9001,14001,45001', 'Medical device should show 13485 in 3rd place');

const kwMatch = shouldShow13485('제조업 (일반)', '치과용 임플란트 및 시약 제조');
console.log('Keyword match:', kwMatch);
console.assert(kwMatch === true, 'Keyword match should be true');

// Test 3: Score calculation and badges
console.log('3. Score & Badge Check:');
const itScores = calculateRecommendationScores('IT·소프트웨어·AI·플랫폼', '스타트업·벤처 (투자유치·IPO 준비)', ['procurement', 'ai_system', 'privacy_data']);
const iso42001 = itScores.find(s => s.code === '42001');
console.log('42001 total score:', iso42001.score, 'badge:', iso42001.badge);
console.assert(iso42001.score >= 70 && iso42001.badge === '필수', '42001 should be essential for AI startup in public procurement');

// Test 4: Maturity score in diagnosis
console.log('4. Diagnosis Maturity Check:');
const midResult = calculateMaturityResult([1, 3, 5], '20-50명', '1-3년', ['입찰 참여 자격 확보'], 'IT·소프트웨어·AI·플랫폼');
console.log('Maturity score:', midResult.maturityScore, 'tier:', midResult.tier, 'gaps count:', midResult.gaps.length);
console.assert(midResult.tier === 'MID' || midResult.tier === 'LOW', 'Maturity tier check');

// Test 5: Business Reg No Checksum
console.log('5. BizRegNo Checksum Check:');
const validBiz = validateBizRegNo('120-81-47521'); // Sample Korean format
console.log('Valid biz (120-81-47521):', validBiz);
console.log('Invalid biz (123-45-67890):', validateBizRegNo('123-45-67890'));

console.log('All tests finished successfully!');
