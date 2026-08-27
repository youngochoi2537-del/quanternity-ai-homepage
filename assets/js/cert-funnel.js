// =============================================================
// Quanternity AI — Certification Recommendation, Diagnosis & Quote Engine
// Core constants, scoring matrices, condition checkers & validators
// =============================================================

// 1. ISO 6 Standards Definition (Strict Fixed Display Order: 27001 -> 42001 -> 13485 -> 9001 -> 14001 -> 45001)
const ISO_STANDARDS = [
  {
    code: '27001',
    order: 1,
    nameKo: '정보보안경영시스템',
    nameEn: 'Information Security Management Systems',
    summary: '정보 자산의 기밀성·무결성·가용성을 유지하기 위한 정보보안경영시스템 국제표준',
    industries: ['IT·소프트웨어·AI', '금융·보험', '정보통신·데이터센터', '공공조달', '의료·헬스케어'],
    reason: '공공조달·대기업 공급자 보안심사·글로벌 SaaS 진출 시 사실상 필수 요건. 정보보호 관리체계를 문서와 증적으로 제시할 수 있게 됩니다.',
    conditional: false
  },
  {
    code: '42001',
    order: 2,
    nameKo: 'AI 경영시스템',
    nameEn: 'Artificial Intelligence Management System',
    summary: 'AI 시스템의 책임성·위험관리·영향평가를 위한 세계 최초의 AI 경영시스템 국제표준',
    industries: ['AI 서비스', 'IT·소프트웨어', '금융·보험', '의료·헬스케어', '교육·에듀테크', '공공조달'],
    reason: 'AI 기본법 시행과 공공 AI 사업 확대에 따라 AI 책임성·영향평가 증적 요구가 증가. ISO 27001과 공통 구조(Annex SL)를 공유해 통합 구축 시 중복 작업을 줄일 수 있습니다.',
    conditional: false
  },
  {
    code: '13485',
    order: 3,
    nameKo: '의료기기 품질경영시스템',
    nameEn: 'Medical devices — Quality management systems',
    summary: '의료기기·체외진단기기의 설계·생산·유통 전 주기 품질경영시스템 국제표준',
    industries: ['의료기기·체외진단(IVD)', '제약·바이오', '의료·헬스케어'],
    reason: '의료기기 인허가(MDR/IVDR, FDA, MFDS)와 해외 수출 시 기본 요건. 품질경영 기반이 확보되면 ISO 9001과 통합 운영이 가능합니다.',
    conditional: true // Exposed only when conditions are met
  },
  {
    code: '9001',
    order: 4,
    nameKo: '품질경영시스템',
    nameEn: 'Quality management systems',
    summary: '고객 만족과 품질 보증을 위한 기본 경영시스템 국제표준',
    industries: ['제조업', '서비스업', '건설업', 'IT업', '유통업', '전 산업'],
    reason: '가장 널리 사용되는 경영시스템 표준으로 입찰 기본 요구사항인 경우가 많음. 문서관리·내부심사·경영검토 등 다른 ISO 규격의 공통 기반이 됩니다.',
    conditional: false
  },
  {
    code: '14001',
    order: 5,
    nameKo: '환경경영시스템',
    nameEn: 'Environmental Management Systems',
    summary: '조직이 환경성과를 개선하고 환경적 지속가능성을 달성하기 위한 환경경영시스템 국제표준',
    industries: ['제조업', '화학·소재', '건설업', '에너지·환경', '운송·물류'],
    reason: '환경 리스크 관리 및 법규 준수, ESG 공시 대응, 브랜드 가치 향상. 자원 효율 개선을 통한 비용 절감 효과가 있습니다.',
    conditional: false
  },
  {
    code: '45001',
    order: 6,
    nameKo: '안전보건경영시스템',
    nameEn: 'Occupational health and safety management systems',
    summary: '근로자 건강과 안전을 보호하기 위한 안전보건경영시스템 국제표준',
    industries: ['제조업', '화학·소재', '건설업', '에너지·환경', '운송·물류'],
    reason: '산업재해 예방 및 중대재해처벌법 대응, 안전한 작업환경 구축을 통한 생산성 향상.',
    conditional: false
  }
];

// 2. MECE Taxonomies (Axes A, B, C)
const TAXONOMY_AXIS_A_INDUSTRIES = [
  '제조업 (일반)',
  '화학·소재',
  '의료기기·체외진단(IVD)',
  '제약·바이오',
  '식품·농수산',
  'IT·소프트웨어·AI·플랫폼',
  '정보통신·네트워크·데이터센터',
  '금융·보험·핀테크',
  '의료·헬스케어 서비스',
  '교육·에듀테크',
  '연구·시험·엔지니어링(TIC)',
  '건설·부동산·시설관리',
  '운송·물류',
  '유통·도소매·이커머스',
  '에너지·환경·폐기물',
  '전문서비스 (법무·회계·컨설팅·마케팅)',
  '기타'
];

const TAXONOMY_AXIS_B_ORG_TYPES = [
  { id: 'sme', name: '민간기업 (중소·중견)', desc: '일반 민간 중소/중견기업' },
  { id: 'large', name: '대기업·계열사', desc: '대기업 및 계열 법인' },
  { id: 'public', name: '공공기관·공기업·출연기관', desc: '공기업, 정부출연 및 지자체 산하기관' },
  { id: 'startup', name: '스타트업·벤처 (투자유치·IPO 준비)', desc: '초기/성장기 벤처 및 상장 준비 조직' },
  { id: 'nonprofit', name: '비영리·협회·재단', desc: '협회, 재단법인, 공익단체' }
];

const TAXONOMY_AXIS_C_TRAITS = [
  {
    id: 'procurement',
    label: '공공조달(나라장터·공공기관) 사업에 참여하거나 준비 중이다',
    bonus: { '27001': 15, '42001': 15, '9001': 10, '14001': 0, '45001': 0, '13485': 0 }
  },
  {
    id: 'ai_system',
    label: 'AI·생성형 AI·자동화 알고리즘을 제품이나 업무에 활용한다',
    bonus: { '42001': 25, '27001': 0, '9001': 0, '14001': 0, '45001': 0, '13485': 0 }
  },
  {
    id: 'privacy_data',
    label: '개인정보·의료정보·금융정보 등 중요정보를 처리한다',
    bonus: { '27001': 20, '42001': 5, '9001': 0, '14001': 0, '45001': 0, '13485': 0 }
  }
];

// 3. Recommendation Base Scores Matrix (0 ~ 40)
const INDUSTRY_BASE_SCORE = {
  '제조업 (일반)': { '27001': 30, '42001': 20, '13485': 0, '9001': 40, '14001': 35, '45001': 40 },
  '화학·소재': { '27001': 25, '42001': 15, '13485': 0, '9001': 40, '14001': 40, '45001': 40 },
  '의료기기·체외진단(IVD)': { '27001': 40, '42001': 25, '13485': 40, '9001': 35, '14001': 25, '45001': 30 },
  '제약·바이오': { '27001': 40, '42001': 30, '13485': 25, '9001': 35, '14001': 30, '45001': 35 },
  '식품·농수산': { '27001': 20, '42001': 15, '13485': 0, '9001': 40, '14001': 35, '45001': 35 },
  'IT·소프트웨어·AI·플랫폼': { '27001': 40, '42001': 40, '13485': 0, '9001': 30, '14001': 15, '45001': 15 },
  '정보통신·네트워크·데이터센터': { '27001': 40, '42001': 30, '13485': 0, '9001': 30, '14001': 25, '45001': 30 },
  '금융·보험·핀테크': { '27001': 40, '42001': 40, '13485': 0, '9001': 30, '14001': 15, '45001': 15 },
  '의료·헬스케어 서비스': { '27001': 40, '42001': 35, '13485': 25, '9001': 30, '14001': 20, '45001': 30 },
  '교육·에듀테크': { '27001': 30, '42001': 35, '13485': 0, '9001': 35, '14001': 15, '45001': 20 },
  '연구·시험·엔지니어링(TIC)': { '27001': 35, '42001': 30, '13485': 0, '9001': 40, '14001': 25, '45001': 30 },
  '건설·부동산·시설관리': { '27001': 25, '42001': 15, '13485': 0, '9001': 40, '14001': 40, '45001': 40 },
  '운송·물류': { '27001': 25, '42001': 20, '13485': 0, '9001': 40, '14001': 35, '45001': 40 },
  '유통·도소매·이커머스': { '27001': 35, '42001': 25, '13485': 0, '9001': 35, '14001': 25, '45001': 25 },
  '에너지·환경·폐기물': { '27001': 30, '42001': 20, '13485': 0, '9001': 40, '14001': 40, '45001': 40 },
  '전문서비스 (법무·회계·컨설팅·마케팅)': { '27001': 35, '42001': 30, '13485': 0, '9001': 35, '14001': 15, '45001': 15 },
  '전문서비스': { '27001': 35, '42001': 30, '13485': 0, '9001': 35, '14001': 15, '45001': 15 },
  '기타': { '27001': 30, '42001': 25, '13485': 0, '9001': 35, '14001': 25, '45001': 25 }
};

const ORG_TYPE_BONUS = {
  '민간기업 (중소·중견)': { '27001': 0, '42001': 0, '13485': 0, '9001': 0, '14001': 0, '45001': 0 },
  '대기업·계열사': { '27001': 0, '42001': 0, '13485': 0, '9001': 5, '14001': 0, '45001': 0 },
  '공공기관·공기업·출연기관': { '27001': 15, '42001': 10, '13485': 0, '9001': 0, '14001': 0, '45001': 0 },
  '스타트업·벤처 (투자유치·IPO 준비)': { '27001': 10, '42001': 10, '13485': 0, '9001': 0, '14001': 0, '45001': 0 },
  '비영리·협회·재단': { '27001': 0, '42001': 0, '13485': 0, '9001': 5, '14001': 0, '45001': 0 }
};

// 4. ISO 13485 Exposure Eligibility Engine (§2.1)
const ISO_13485_KEYWORDS = [
  '의료기기', '체외진단', 'ivd', '진단키트', '시약', 'pcr',
  'medical device', '헬스케어 기기', '임플란트', '필러'
];

function shouldShow13485(industry, productText = '', forceShow = false) {
  if (forceShow) return true;

  const validIndustries = ['의료기기·체외진단(IVD)', '제약·바이오', '의료·헬스케어 서비스'];
  if (validIndustries.includes(industry)) return true;

  if (productText) {
    const text = productText.toLowerCase();
    return ISO_13485_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
  }

  return false;
}

// 5. Score Calculation Engine (§3.3 & §2.2)
function calculateRecommendationScores(industry, orgType, selectedTraits = [], productText = '', forceShow13485 = false) {
  const baseScores = INDUSTRY_BASE_SCORE[industry] || INDUSTRY_BASE_SCORE['기타'];
  const orgBonus = ORG_TYPE_BONUS[orgType] || { '27001': 0, '42001': 0, '13485': 0, '9001': 0, '14001': 0, '45001': 0 };

  const show13485 = shouldShow13485(industry, productText, forceShow13485);

  const results = ISO_STANDARDS
    .filter(std => std.code !== '13485' || show13485)
    .map(std => {
      let total = (baseScores[std.code] || 0) + (orgBonus[std.code] || 0);

      selectedTraits.forEach(traitId => {
        const traitObj = TAXONOMY_AXIS_C_TRAITS.find(t => t.id === traitId);
        if (traitObj && traitObj.bonus && traitObj.bonus[std.code]) {
          total += traitObj.bonus[std.code];
        }
      });

      // Clamp 0 ~ 100
      total = Math.max(0, Math.min(100, total));

      let badge = '선택';
      let badgeClass = 'badge-optional';
      if (total >= 70) {
        badge = '필수';
        badgeClass = 'badge-essential';
      } else if (total >= 40) {
        badge = '권장';
        badgeClass = 'badge-recommended';
      }

      return {
        ...std,
        score: total,
        badge,
        badgeClass,
        isPreChecked: total >= 70
      };
    });

  // Strict Fixed Order Guaranteed
  return results.sort((a, b) => a.order - b.order);
}

// 6. Maturity Score Engine for Diagnosis Wizard (§7.4)
const SIZE_WEIGHTS = {
  '5명 미만': 0,
  '5-10명': 2,
  '10-20명': 4,
  '20-50명': 6,
  '50-100명': 8,
  '100명 이상': 10
};

const YEAR_WEIGHTS = {
  '6개월 미만': 0,
  '6개월-1년': 4,
  '1-3년': 8,
  '3-5년': 12,
  '5-10년': 16,
  '10년 이상': 20
};

const DIAGNOSIS_SYSTEM_ITEMS = [
  { id: 1, text: '문서화된 품질·정보보호 절차가 있다', gap: '경영 시스템 기본 문서 체계 구축 필요' },
  { id: 2, text: '내부심사 프로세스가 운영되고 있다', gap: '내부심사 및 기록 관리 프로세스 신규 구축 필요' },
  { id: 3, text: '경영 목표 및 KPI가 설정되어 있다', gap: '경영 목표 및 성과 지표 설정 필요' },
  { id: 4, text: '고객 불만·사고 처리 시스템이 있다', gap: '고객 불만·사고 대응 절차 정립 필요' },
  { id: 5, text: '지속적 개선 활동(PDCA)을 실행하고 있다', gap: '지속적 개선(PDCA) 활동 체계화 필요' },
  { id: 6, text: '위험평가(리스크 어세스먼트)를 정기적으로 수행한다', gap: '정기 위험평가 체계 수립 필요' },
  { id: 7, text: '개인정보·중요정보 목록과 접근권한을 관리한다', gap: '정보자산 목록 및 접근권한 관리체계 구축 필요' },
  { id: 8, text: 'AI 시스템·모델 목록을 관리하고 있다', gap: 'AI 시스템 인벤토리 및 AI 위험관리 체계 구축 필요' }
];

const DIAGNOSIS_PURPOSE_MAPPINGS = {
  '입찰 참여 자격 확보': '공공조달 입찰에서는 ISO 인증이 자격요건 또는 가점 항목인 경우가 많습니다.',
  '대기업 납품 요구사항 충족': '대기업 납품을 위해서는 ISO 인증이 필수인 경우가 많습니다.',
  '내부 품질·보안 시스템 개선': '인증 준비 과정 자체가 내부 프로세스를 정비하는 계기가 됩니다.',
  '기업 신뢰도 및 브랜드 이미지 향상': '객관적인 제3자 인증은 고객·파트너에게 제시할 수 있는 신뢰 지표가 됩니다.',
  '투자유치·IPO 실사 대응': '투자 실사와 상장 심사에서 정보보호·AI 거버넌스 체계 확보 여부가 확인 항목이 되고 있습니다.',
  '규제·법규 대응(AI 기본법·개인정보보호법 등)': 'AI 기본법 시행 등 규제 환경 변화에 대응할 관리체계 근거가 필요합니다.',
  '기타': '귀사의 비즈니스 환경에 최적화된 인증 로드맵을 설계합니다.'
};

function calculateMaturityResult(checkedItemIds, employeeSize, businessAge, selectedPurposes = [], industry = '기타', orgType = '민간기업 (중소·중견)', traits = []) {
  const isNoneChecked = checkedItemIds.includes(9) || checkedItemIds.length === 0;
  const validCheckedCount = isNoneChecked ? 0 : checkedItemIds.filter(id => id >= 1 && id <= 8).length;

  const base = (validCheckedCount / 8) * 60;
  const sizeW = SIZE_WEIGHTS[employeeSize] || 0;
  const yearW = YEAR_WEIGHTS[businessAge] || 0;
  const maturityScore = Math.round(base + sizeW + yearW); // 0 ~ 90

  let tier = 'MID';
  let badge = '부분 구축 · 보완 필요';
  let signal = '🟡';
  let headline = '📋 일부 체계가 갖춰진 단계입니다.';
  let summary = {
    maturity: '보통',
    docLevel: '부분 문서화',
    auditActivity: '일부 운영',
    estimatedPeriod: '3~5개월'
  };

  if (maturityScore <= 30) {
    tier = 'LOW';
    badge = '내부 프로세스 구축 필요';
    signal = '🔴';
    headline = '⚠️ 기초 시스템 구축이 필요한 단계입니다.';
    summary = {
      maturity: '낮음',
      docLevel: '미흡',
      auditActivity: '거의 없음',
      estimatedPeriod: '4~6개월'
    };
  } else if (maturityScore >= 61) {
    tier = 'HIGH';
    badge = '심사 준비 가능 단계';
    signal = '🟢';
    headline = '✅ 인증 심사 준비가 가능한 단계입니다.';
    summary = {
      maturity: '높음',
      docLevel: '체계화',
      auditActivity: '정기 운영',
      estimatedPeriod: '2~3개월'
    };
  }

  // Identify identified gaps
  const gaps = [];
  DIAGNOSIS_SYSTEM_ITEMS.forEach(item => {
    if (!checkedItemIds.includes(item.id)) {
      gaps.push(item.gap);
    }
  });

  if (tier === 'LOW') {
    gaps.push('전 직원 ISO 표준 교육 필요 / 전문 컨설팅을 통한 단계별 접근 권장');
  }

  // Purpose Analysis
  const purposeAnalysis = selectedPurposes.map(p => ({
    purpose: p,
    analysis: DIAGNOSIS_PURPOSE_MAPPINGS[p] || DIAGNOSIS_PURPOSE_MAPPINGS['기타']
  }));

  // Recommended Certs for Diagnosis (Ordered, with badge)
  const recommendedCerts = calculateRecommendationScores(industry, orgType, traits);

  return {
    maturityScore,
    tier,
    badge,
    signal,
    headline,
    summary,
    gaps,
    purposeAnalysis,
    recommendedCerts
  };
}

// 7. National Tax Service Business Registration Number Checksum Validator (§5.2 & §11)
function validateBizRegNo(bizNoStr) {
  if (!bizNoStr) return false;
  const clean = String(bizNoStr).replace(/[^0-9]/g, '');
  if (clean.length !== 10) return false;

  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i], 10) * weights[i];
  }

  sum += Math.floor((parseInt(clean[8], 10) * 5) / 10);
  const remainder = (10 - (sum % 10)) % 10;

  return remainder === parseInt(clean[9], 10);
}

function formatBizRegNo(value) {
  const clean = String(value || '').replace(/[^0-9]/g, '').slice(0, 10);
  if (clean.length <= 3) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return `${clean.slice(0, 3)}-${clean.slice(3, 5)}-${clean.slice(5)}`;
}

function formatPhoneNumber(value) {
  const clean = String(value || '').replace(/[^0-9]/g, '').slice(0, 11);
  if (clean.length <= 3) return clean;
  if (clean.length <= 7) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  if (clean.length <= 10) {
    if (clean.startsWith('02')) {
      return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6)}`;
    }
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`;
}

// Export for window browser global or node module
if (typeof window !== 'undefined') {
  window.ISO_STANDARDS = ISO_STANDARDS;
  window.TAXONOMY_AXIS_A_INDUSTRIES = TAXONOMY_AXIS_A_INDUSTRIES;
  window.TAXONOMY_AXIS_B_ORG_TYPES = TAXONOMY_AXIS_B_ORG_TYPES;
  window.TAXONOMY_AXIS_C_TRAITS = TAXONOMY_AXIS_C_TRAITS;
  window.INDUSTRY_BASE_SCORE = INDUSTRY_BASE_SCORE;
  window.ORG_TYPE_BONUS = ORG_TYPE_BONUS;
  window.calculateRecommendationScores = calculateRecommendationScores;
  window.shouldShow13485 = shouldShow13485;
  window.calculateMaturityResult = calculateMaturityResult;
  window.validateBizRegNo = validateBizRegNo;
  window.formatBizRegNo = formatBizRegNo;
  window.formatPhoneNumber = formatPhoneNumber;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ISO_STANDARDS,
    TAXONOMY_AXIS_A_INDUSTRIES,
    TAXONOMY_AXIS_B_ORG_TYPES,
    TAXONOMY_AXIS_C_TRAITS,
    INDUSTRY_BASE_SCORE,
    ORG_TYPE_BONUS,
    calculateRecommendationScores,
    shouldShow13485,
    calculateMaturityResult,
    validateBizRegNo,
    formatBizRegNo,
    formatPhoneNumber
  };
}
