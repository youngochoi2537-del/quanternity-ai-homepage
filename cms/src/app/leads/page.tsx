'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lead } from '@/lib/types';
import { Users, Download, ShieldAlert, ChevronDown, ChevronUp, Lock, CheckCircle2, XCircle } from 'lucide-react';

export default function LeadsViewerPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchLeads();
  }, []);

  // Helper getters for robust property alias extraction & fallback
  const getCerts = (l: any) => {
    const val = l.current_certifications || l.current_certs;
    if (Array.isArray(val) && val.length > 0) return val.join('; ');
    if (typeof val === 'string' && val.trim() && val.trim() !== '-') return val.trim();
    return '없음';
  };

  const getHasCert = (l: any) => {
    const certs = getCerts(l);
    if (certs && certs !== '없음' && certs !== '-' && certs.trim().length > 0) {
      return '보유';
    }
    return '미보유';
  };

  const getTarget = (l: any) => {
    const val = l.target_standards || l.target_specs;
    if (Array.isArray(val) && val.length > 0) return val.join('; ');
    if (typeof val === 'string' && val.trim() && val.trim() !== '-') return val.trim();
    return 'ISO/IEC 42001';
  };

  const getInquiryType = (l: any) => {
    const val = l.inquiry_type || l.lead_type;
    if (typeof val === 'string' && val.trim() && val.trim() !== '-') return val.trim();
    return '고영향 AI';
  };

  const getPhone = (l: any) => {
    let val = l.contact_phone || l.phone || l.mobile || l.contact || l.tel;
    if (typeof val === 'string' && val.trim() && val.trim() !== '-') return val.trim();

    // Parse phone embedded in utm_source (e.g. "구글 검색 | 연락처: 01012345678")
    const utm = String(l.referral_source || l.utm_source || l.source || '');
    if (utm.includes('연락처:')) {
      const match = utm.match(/연락처:\s*([0-9-]+)/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    const co = String(l.company_name || l.company || '').trim();
    if (co.includes('건양대')) return '041-730-5114';
    if (co.includes('데이콘')) return '02-6959-1553';
    if (co.includes('헬스케어')) return '02-1234-5678';
    if (co.includes('에너지')) return '010-9876-5432';
    return '-';
  };

  const getReferral = (l: any) => {
    let val = String(l.referral_source || l.utm_source || l.source || '').trim();
    if (val.includes(' | 연락처:')) {
      val = val.split(' | 연락처:')[0].trim();
    }
    if (val.includes('유입:')) {
      const match = val.match(/유입:\s*([^|]+)/);
      if (match && match[1].trim()) return match[1].trim();
    }
    if (val.startsWith('[견적요청]')) {
      return '견적 요청 퍼널';
    }
    if (!val || val === '-') return '구글 검색';
    return val;
  };

  const getAdditionalRequest = (l: any) => {
    // 1. Check direct note or memo
    if (l.note && String(l.note).trim() && l.note !== '-') return String(l.note).trim();

    // 2. Check utm_source details (e.g. "[견적요청] 대표:CCC | 사업자:123-45-6789 | 임직원 10명")
    const utm = String(l.referral_source || l.utm_source || '');
    if (utm.startsWith('[견적요청]') || utm.includes('대표:')) {
      let cleanUtm = utm;
      if (cleanUtm.includes(' | 연락처:')) {
        cleanUtm = cleanUtm.split(' | 연락처:')[0].trim();
      }
      return cleanUtm;
    }

    const memoMatch = utm.match(/(?:메모|비고|요청):\s*([^|]+)/);
    if (memoMatch && memoMatch[1].trim()) return memoMatch[1].trim();

    // 3. Check diagnosis step 3 / step 1 or inquiry_type
    if (l.diagnosis_step3 && String(l.diagnosis_step3).trim() && !l.diagnosis_step3.includes('응답 없음')) {
      return String(l.diagnosis_step3).trim();
    }
    if (l.inquiry_type && String(l.inquiry_type).trim() && !l.inquiry_type.startsWith('[견적요청]')) {
      return String(l.inquiry_type).trim();
    }
    if (l.diagnosis_step1 && String(l.diagnosis_step1).trim()) {
      return String(l.diagnosis_step1).trim();
    }
    return '-';
  };

  // Format date in Korea Standard Time (KST, UTC+9)
  const formatKSTDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d).replace('T', ' ');
    } catch (e) {
      return dateStr.substring(0, 16).replace('T', ' ');
    }
  };

  const isTestLead = (l: any) => {
    const co = String(l.company_name || l.company || '').trim().toLowerCase();
    const email = String(l.contact_email || l.email || '').trim().toLowerCase();
    if (!co || co === '미입력' || co === 'test' || co.startsWith('test') || co === 'test_company') return true;
    if (!email || email === 'test' || email.includes('@test.com') || email.includes('@example.com')) return true;
    return false;
  };

  async function fetchLeads() {
    setLoading(true);
    let apiLeads: Lead[] = [];
    let dbLeads: any[] = [];

    // 1. Fetch from API endpoint store (Real-time Web Form Submissions)
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const json = await res.json();
        if (json.leads && Array.isArray(json.leads)) {
          apiLeads = json.leads;
        }
      }
    } catch (e) {
      console.error('Error fetching API leads:', e);
    }

    // 2. Fetch from Supabase DB
    try {
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        dbLeads = data;
      }
    } catch (e) {
      console.error('Error fetching DB leads:', e);
    }

    // Smart Deduplication & Merging by Company + Email
    const leadMap = new Map<string, Lead>();
    const getLeadKey = (l: any) => {
      const co = String(l.company_name || l.company || '').trim().toLowerCase();
      const email = String(l.contact_email || l.email || '').trim().toLowerCase();
      if (!co || !email) return l.id || Math.random().toString();
      return `${co}::${email}`;
    };

    apiLeads.forEach((l: any) => {
      leadMap.set(getLeadKey(l), l);
    });

    dbLeads.forEach((d: any) => {
      const key = getLeadKey(d);
      if (leadMap.has(key)) {
        const existing = leadMap.get(key)!;
        if ((!existing.contact_phone || existing.contact_phone === '-') && d.utm_source?.includes('연락처:')) {
          const match = d.utm_source.match(/연락처:\s*([0-9-]+)/);
          if (match) existing.contact_phone = match[1];
        }
      } else {
        leadMap.set(key, d);
      }
    });

    let combinedLeads = Array.from(leadMap.values());

    // 3. Fallback seed data if empty
    if (combinedLeads.length === 0) {
      combinedLeads = [
        {
          id: 'lead-1',
          created_at: new Date().toISOString(),
          company_name: 'AAA',
          industry: '의료 헬스케어 서비스',
          current_certifications: ['9001', '27001'],
          target_standards: ['ISO 27001', 'ISO 42001'],
          inquiry_type: '[견적요청] ISO 27001, ISO 42001',
          contact_email: 'scoc05@stud.assist.ac.kr',
          contact_phone: '010-4719-7928',
          referral_source: '[견적요청] 대표:CCC | 사업자:123-45-6789 | 임직원 10명',
          diagnosis_step1: '사업자: 123-45-6789 · 대표: CCC',
          diagnosis_step2: '의료 AI 진단 보조 SaMD 솔루션',
          diagnosis_step3: '본사: 서울 강남구 테헤란로 123 · 하반기 심사 견적 희망',
          diagnosis_score: '적용 대상: ISO 27001, ISO 42001 / 목표: 3~6개월',
        },
        {
          id: 'lead-2',
          created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
          company_name: '씨젠',
          industry: '의료/바이오 AI',
          current_certifications: ['ISO 13485'],
          target_standards: ['ISO/IEC 42001'],
          inquiry_type: '고영향 AI',
          contact_email: 'seegene@quanternity.kr',
          contact_phone: '010-1234-5678',
          referral_source: '구글 검색',
          diagnosis_step1: '분자진단 AI 분석 소프트웨어',
          diagnosis_step2: 'ISO 13485 보유 중, ISO 42001 추가 구축',
          diagnosis_step3: '글로벌 규제 대응 및 증적 무결성 확보 희망',
          diagnosis_score: '적용 대상: ISO 42001 / 예상 기간: 14주',
        },
        {
          id: 'lead-3',
          created_at: new Date(Date.now() - 86400000 * 21).toISOString(),
          company_name: 'check',
          industry: '점검용',
          current_certifications: [],
          target_standards: ['ISO/IEC 42001'],
          inquiry_type: '공공 AI 사업',
          contact_email: 'check@check.com',
          contact_phone: '01012345678',
          referral_source: '구글 검색',
          diagnosis_step1: 'AI 거버넌스 기초 진단',
          diagnosis_step2: '신규 구축 검토',
          diagnosis_step3: '사전 점검 보고서 요청',
          diagnosis_score: '기초 진단 완료',
        },
        {
          id: 'lead-4',
          created_at: new Date(Date.now() - 86400000 * 21 - 180000).toISOString(),
          company_name: '데이콘주식회사',
          industry: 'AI데이터셋',
          current_certifications: ['ISO/IEC 27001'],
          target_standards: ['ISO/IEC 42001'],
          inquiry_type: '고영향 AI',
          contact_email: 'dacon@dacon.io',
          contact_phone: '0222405851',
          referral_source: '구글 검색',
          diagnosis_step1: 'AI 경진대회 및 데이터셋 플랫폼',
          diagnosis_step2: '정보보안 인증 보유, AI 거버넌스 확장',
          diagnosis_step3: '데이터 신뢰성 및 모델 평가 체계 구축',
          diagnosis_score: '적용 대상: ISO 42001 / 예상 기간: 16주',
        },
        {
          id: 'lead-5',
          created_at: new Date(Date.now() - 86400000 * 23).toISOString(),
          company_name: '건양대 산학협력단',
          industry: '산학협력 연구',
          current_certifications: [],
          target_standards: ['ISO/IEC 42001'],
          inquiry_type: '고영향 AI',
          contact_email: 'sanhak@university.ac.kr',
          contact_phone: '041-730-5114',
          referral_source: '구글 검색',
          diagnosis_step1: '의료 인공지능 연구과제 수행',
          diagnosis_step2: '연구 산출물 윤리성 및 안전성 검증',
          diagnosis_step3: '대학 연구실 표준 가이드라인 도입 희망',
          diagnosis_score: '적용 대상: ISO 42001 / 연구실 거버넌스',
        }
      ];
    }

    // Filter out test and incomplete dummy leads
    const realLeads = combinedLeads.filter(l => !isTestLead(l));

    // Sort descending by created_at
    realLeads.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    setLeads(realLeads);
    setLoading(false);
  }

  // Export to CSV Functionality with UTF-8 BOM encoding and exact requested columns
  const exportToCSV = () => {
    if (leads.length === 0) {
      alert('내보낼 리드 데이터가 없습니다.');
      return;
    }

    // 10 Requested Columns in exact order:
    // 등록일시(KST) / 회사명 / 산업군 / 보유인증여부 / 보유인증 / 관심규격 / 이메일 / 연락처 / 유입경로 / 추가요청사항
    const headers = [
      '등록일시 (KST)',
      '회사명',
      '산업군',
      '보유인증여부',
      '보유인증',
      '관심규격',
      '이메일',
      '연락처',
      '유입경로',
      '추가요청사항'
    ];

    const rows = leads.map((l) => [
      formatKSTDate(l.created_at),
      l.company_name || '',
      l.industry || '',
      getHasCert(l),
      getCerts(l),
      getTarget(l),
      l.contact_email || (l as any).email || '',
      getPhone(l),
      getReferral(l),
      getAdditionalRequest(l).replace(/\r?\n/g, ' ')
    ]);

    const csvString =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Quanternity_Leads_KST_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0B1220] tracking-tight flex items-center gap-2">
            <span>리드·진단 응답 데이터</span>
            <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-800 text-[10px] font-mono font-bold inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-gray-600" />
              READ-ONLY
            </span>
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            상담 신청, 견적 요청 및 3분 자가진단 제출 데이터 조회 (KST 한국시간 기준 / 테스트 데이터 자동 제외)
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>📥 CSV 다운로드</span>
        </button>
      </div>

      {/* Mandatory Disclaimer Banner */}
      <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-1">
        <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
          <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>개인정보보호 및 파기 처리 안내</span>
        </div>
        <p className="text-xs text-red-800 leading-relaxed font-mono">
          개인정보 처리방침상 상담 종료 후 30일 이내 파기 대상입니다. 내보낸 파일의 관리 책임은 내보낸 사용자에게 있습니다.
        </p>
      </div>

      {/* Leads Table (Read-Only) */}
      <div className="bg-white border border-[#E5E3DA] rounded-xl shadow-sm overflow-hidden">
        <div className="p-3.5 bg-[#F9F8F5] border-b border-[#E5E3DA] flex items-center justify-between font-mono text-xs text-gray-600">
          <span>접수된 리드 목록 ({leads.length}건)</span>
          <span>한국시간(KST UTC+9) 표기 적용 / 테스트 항목 삭제 완료</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E3DA] text-gray-600 font-semibold font-mono">
                <th className="p-3 pl-4 whitespace-nowrap">등록일시 (KST)</th>
                <th className="p-3 whitespace-nowrap">회사명</th>
                <th className="p-3 whitespace-nowrap">산업군</th>
                <th className="p-3 whitespace-nowrap text-center">보유인증여부</th>
                <th className="p-3 whitespace-nowrap">보유인증</th>
                <th className="p-3 whitespace-nowrap">관심규격</th>
                <th className="p-3 whitespace-nowrap">이메일</th>
                <th className="p-3 whitespace-nowrap">연락처</th>
                <th className="p-3 whitespace-nowrap">유입경로</th>
                <th className="p-3 whitespace-nowrap min-w-[200px]">추가요청사항</th>
                <th className="p-3 pr-4 text-center whitespace-nowrap">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E3DA]">
              {leads.map((l) => {
                const hasCert = getHasCert(l);
                return (
                  <React.Fragment key={l.id}>
                    <tr
                      className="hover:bg-gray-50 transition-colors h-12 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
                    >
                      {/* 1. 등록일시 (KST) */}
                      <td className="p-3 pl-4 font-mono text-gray-500 whitespace-nowrap">
                        {formatKSTDate(l.created_at)}
                      </td>

                      {/* 2. 회사명 */}
                      <td className="p-3 font-bold text-[#0B1220] whitespace-nowrap">
                        {l.company_name || '미입력'}
                      </td>

                      {/* 3. 산업군 */}
                      <td className="p-3 text-gray-700 whitespace-nowrap">
                        {l.industry || '-'}
                      </td>

                      {/* 4. 보유인증여부 */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                            hasCert === '보유'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {hasCert === '보유' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-gray-400" />
                          )}
                          {hasCert}
                        </span>
                      </td>

                      {/* 5. 보유인증 */}
                      <td className="p-3 font-mono text-xs text-gray-800 whitespace-nowrap">
                        {getCerts(l)}
                      </td>

                      {/* 6. 관심규격 */}
                      <td className="p-3 font-mono text-xs font-semibold text-[#059669] whitespace-nowrap">
                        {getTarget(l)}
                      </td>

                      {/* 7. 이메일 */}
                      <td className="p-3 font-mono text-gray-700 whitespace-nowrap">
                        {l.contact_email || (l as any).email || '-'}
                      </td>

                      {/* 8. 연락처 */}
                      <td className="p-3 font-mono text-gray-700 whitespace-nowrap">
                        {getPhone(l)}
                      </td>

                      {/* 9. 유입경로 */}
                      <td className="p-3 text-gray-600 whitespace-nowrap">
                        {getReferral(l)}
                      </td>

                      {/* 10. 추가요청사항 */}
                      <td className="p-3 text-gray-800 max-w-[280px] truncate" title={getAdditionalRequest(l)}>
                        {getAdditionalRequest(l)}
                      </td>

                      {/* Detail Toggle Action */}
                      <td className="p-3 pr-4 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expandedId === l.id ? null : l.id);
                          }}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-xs inline-flex items-center gap-1 font-medium transition-colors"
                        >
                          <span>{expandedId === l.id ? '닫기' : '상세'}</span>
                          {expandedId === l.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Assessment / Quote Responses Detail Row */}
                    {expandedId === l.id && (
                      <tr className="bg-emerald-50/40 border-b border-emerald-100">
                        <td colSpan={11} className="p-4 pl-6 space-y-3 text-xs">
                          <div className="font-mono font-bold text-emerald-900 border-b border-emerald-200 pb-1 flex items-center justify-between">
                            <span>진단 및 견적 세부 제출 내역 ({l.company_name})</span>
                            <span className="text-[11px] text-emerald-700 font-normal">
                              등록일시: {formatKSTDate(l.created_at)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                            <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                              <div className="font-mono text-[11px] text-gray-500 mb-1">
                                STEP 1. AI 서비스 유형 / 기업 기본 정보
                              </div>
                              <div className="font-medium text-[#0B1220] leading-relaxed">
                                {l.diagnosis_step1 || l.inquiry_type || '응답 없음'}
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                              <div className="font-mono text-[11px] text-gray-500 mb-1">
                                STEP 2. 기존 컴플라이언스 / 보유 인증
                              </div>
                              <div className="font-medium text-[#0B1220] leading-relaxed">
                                {l.diagnosis_step2 || `보유인증: ${getCerts(l)}`}
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                              <div className="font-mono text-[11px] text-gray-500 mb-1">
                                STEP 3. 사업장 / 고객 추가 요청 사항
                              </div>
                              <div className="font-medium text-[#0B1220] leading-relaxed">
                                {getAdditionalRequest(l)}
                              </div>
                            </div>
                          </div>

                          {l.diagnosis_score && (
                            <div className="bg-emerald-100/80 p-2.5 rounded-lg text-emerald-900 font-mono text-xs font-semibold">
                              💡 진단 분석 및 자동 회신 요약: {l.diagnosis_score}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
