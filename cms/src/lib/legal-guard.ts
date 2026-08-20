// =============================================================
// Quanternity AI Legal Guard Helper (§8 Rule 1)
// Checks for prohibited legal certification claims
// =============================================================

export interface LegalWarning {
  keyword: string;
  message: string;
}

export const PROHIBITED_KEYWORDS = ['인증 발급', '인증 부여', '인증 보장', '인증을 보장', '인증 발급해'];

export function checkLegalProhibitions(text: string): LegalWarning[] {
  if (!text) return [];

  const warnings: LegalWarning[] = [];

  PROHIBITED_KEYWORDS.forEach((keyword) => {
    if (text.includes(keyword)) {
      warnings.push({
        keyword,
        message: `경고: '${keyword}' 표현이 포함되어 있습니다. ISO 컴플라이언스 관리상 인증기관을 오인하게 만드는 표현(발급·부여·보장)은 자제하고 '인증 심사 준비 지원' 또는 '거버넌스 체계 수립' 표현을 권장합니다.`
      });
    }
  });

  return warnings;
}
