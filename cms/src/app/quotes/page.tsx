'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { QuoteRequest } from '@/lib/types';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Building2,
  MapPin,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  FileText,
  X,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

export default function QuotesManagementPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');
  const [selectedStandard, setSelectedStandard] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchQuotes();
  }, []);

  async function fetchQuotes() {
    setLoading(true);
    let apiQuotes: QuoteRequest[] = [];
    let dbLeads: any[] = [];

    // 1. Fetch from Next.js API store
    try {
      const res = await fetch('/api/quote-requests');
      if (res.ok) {
        const data = await res.json();
        if (data.quotes && Array.isArray(data.quotes)) {
          apiQuotes = data.quotes;
        }
      }
    } catch (err) {
      console.error('Failed to fetch API quotes:', err);
    }

    // 2. Fetch from Supabase DB leads table
    try {
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        dbLeads = data;
      }
    } catch (err) {
      console.error('Failed to fetch DB leads for quotes:', err);
    }

    // Map & Deduplicate
    const quoteMap = new Map<string, QuoteRequest>();

    apiQuotes.forEach((q) => {
      const key = `${(q.company_name || '').trim().toLowerCase()}::${(q.contact_email || '').trim().toLowerCase()}`;
      quoteMap.set(key || q.id, q);
    });

    // Parse any quote records stored in Supabase leads table
    dbLeads.forEach((d) => {
      const isQuote = String(d.lead_type || '').includes('견적') || String(d.utm_source || '').includes('[견적요청]');
      const key = `${(d.company_name || '').trim().toLowerCase()}::${(d.contact_email || '').trim().toLowerCase()}`;

      if (isQuote && !quoteMap.has(key)) {
        // Extract enriched data from utm_source if available
        const utm = String(d.utm_source || '');
        let ceoName = '-';
        let bizRegNo = '-';
        let contactPhone = d.contact_phone || '-';
        let employeeCount = 0;
        let siteStr = '';

        const ceoMatch = utm.match(/대표(?:자)?:\s*([^|]+)/);
        if (ceoMatch) ceoName = ceoMatch[1].trim();

        const bizMatch = utm.match(/사업자(?:번호)?:\s*([0-9-]+)/);
        if (bizMatch) bizRegNo = bizMatch[1].trim();

        const phoneMatch = utm.match(/연락처:\s*([0-9-]+)/);
        if (phoneMatch) contactPhone = phoneMatch[1].trim();

        const empMatch = utm.match(/임직원:\s*([0-9]+)명?/);
        if (empMatch) employeeCount = parseInt(empMatch[1], 10);

        const siteMatch = utm.match(/사업장:\s*([^|]+)/);
        if (siteMatch) siteStr = siteMatch[1].trim();

        const parsedSites = siteStr
          ? siteStr.split(' / ').map((s, idx) => ({ id: String(idx + 1), name: s }))
          : [{ id: '1', name: '본사' }];

        let targetStandards: string[] = [];
        const certMatch = utm.match(/희망인증:\s*([^|]+)/);
        if (certMatch) {
          targetStandards = certMatch[1].split(',').map((s) => s.trim());
        } else if (d.target_standards && Array.isArray(d.target_standards)) {
          targetStandards = d.target_standards;
        } else {
          targetStandards = ['ISO 42001'];
        }

        quoteMap.set(key, {
          id: d.id || 'db-' + Math.random().toString(36).substring(2, 7),
          created_at: d.created_at || new Date().toISOString(),
          company_name: d.company_name || '미입력 기업',
          ceo_name: ceoName,
          biz_reg_no: bizRegNo,
          industry: d.industry || 'IT/소프트웨어',
          employee_count: employeeCount,
          sites: parsedSites,
          main_product: '인증 대상 서비스',
          contact_name: d.company_name ? `${d.company_name} 담당자` : '신청 담당자',
          contact_phone: contactPhone,
          contact_email: d.contact_email || '-',
          referral_source: '홈페이지 견적 요청',
          note: d.inquiry_type || d.diagnosis_step1 || '',
          target_standards: targetStandards,
          target_date: '3~6개월 이내',
          has_existing_cert: Array.isArray(d.current_certs) && d.current_certs.length > 0,
          existing_certs: d.current_certs || [],
          source_funnel: 'quote',
          status: '접수완료',
        });
      }
    });

    let combined = Array.from(quoteMap.values());

    // Fallback seed data if no records
    if (combined.length === 0) {
      combined = [
        {
          id: 'quote-sample-1',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          company_name: '(주)메디바이브 AI',
          ceo_name: '홍길동',
          biz_reg_no: '120-81-47521',
          industry: '의료기기·체외진단(IVD)',
          employee_count: 45,
          sites: [
            { id: '1', name: '본사 (R&D)', postcode: '06236', address: '서울특별시 강남구 테헤란로 152', addressDetail: '12층' },
            { id: '2', name: '오송 제1공장 (제조/품질)', postcode: '28160', address: '충청북도 청주시 흥덕구 오송읍 오송생명1로 194', addressDetail: '동관 3층' }
          ],
          main_product: 'AI 기반 폐암 조기 진단 보조 소프트웨어 (SaMD)',
          contact_name: '김민수 팀장',
          contact_phone: '010-3849-2810',
          contact_email: 'mskim@medivibe.ai',
          referral_source: '인증 추천 퍼널 (/recommend)',
          note: '2026년 하반기 FDA 510(k) 및 국내 식약처 3등급 허가 심사를 앞두고 ISO 13485와 ISO 42001 통합 구축이 시급합니다. 견적서 및 심사원 파견 일정 회신 부탁드립니다.',
          target_standards: ['ISO 27001', 'ISO 42001', 'ISO 13485'],
          target_date: '3~6개월 이내 (하반기 인증 완료 희망)',
          has_existing_cert: true,
          existing_certs: ['ISO 27001'],
          source_funnel: 'recommend',
          status: '접수완료'
        },
        {
          id: 'quote-sample-2',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          company_name: '(주)넥스트코어 로보틱스',
          ceo_name: '이진우',
          biz_reg_no: '214-88-12345',
          industry: 'IT·소프트웨어·AI·플랫폼',
          employee_count: 120,
          sites: [
            { id: '1', name: '판교 통합 본사', postcode: '13487', address: '경기도 성남시 분당구 대왕판교로 645번길 12', addressDetail: '넥스트타워 7층' }
          ],
          main_product: '물류 자율주행 AGV 로봇 제어 AI 시스템',
          contact_name: '박서연 책임',
          contact_phone: '010-8293-1049',
          contact_email: 'sypark@nextcore-robotics.com',
          referral_source: '사전진단 퍼널 (/diagnosis)',
          note: '공공 입찰 참여 요건 충족을 위해 ISO/IEC 42001 및 9001 견적이 필요합니다. FieldProof 증적 솔루션 도입 견적도 함께 포함해 주세요.',
          target_standards: ['ISO 42001', 'ISO 9001'],
          target_date: '1~3개월 이내 (신속 심사 희망)',
          has_existing_cert: false,
          existing_certs: [],
          source_funnel: 'diagnosis',
          status: '검토중'
        }
      ];
    }

    combined.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    setQuotes(combined);
    setLoading(false);
  }

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

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Filtered quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCompany = q.company_name?.toLowerCase().includes(query);
        const matchCeo = q.ceo_name?.toLowerCase().includes(query);
        const matchContact = q.contact_name?.toLowerCase().includes(query);
        const matchEmail = q.contact_email?.toLowerCase().includes(query);
        const matchPhone = q.contact_phone?.toLowerCase().includes(query);
        const matchBizNo = q.biz_reg_no?.toLowerCase().includes(query);
        const matchProduct = q.main_product?.toLowerCase().includes(query);
        if (!matchCompany && !matchCeo && !matchContact && !matchEmail && !matchPhone && !matchBizNo && !matchProduct) {
          return false;
        }
      }

      // Industry Filter
      if (selectedIndustry !== 'ALL' && q.industry !== selectedIndustry) {
        return false;
      }

      // Standard Filter
      if (selectedStandard !== 'ALL') {
        const hasStd = q.target_standards?.some(s => s.includes(selectedStandard));
        if (!hasStd) return false;
      }

      // Status Filter
      if (selectedStatus !== 'ALL') {
        const status = q.status || '접수완료';
        if (status !== selectedStatus) return false;
      }

      return true;
    });
  }, [quotes, searchQuery, selectedIndustry, selectedStandard, selectedStatus]);

  // Export to CSV with UTF-8 BOM
  const exportToCSV = () => {
    if (filteredQuotes.length === 0) {
      alert('내보낼 견적 데이터가 없습니다.');
      return;
    }

    const headers = [
      '신청일시 (KST)',
      '회사명',
      '대표자명',
      '사업자등록번호',
      '산업분류',
      '임직원 수',
      '희망 인증 규격',
      '목표 시기',
      '기보유 인증',
      '주요 제품/서비스',
      '담당자 이름',
      '담당자 연락처',
      '담당자 이메일',
      '사업장 수',
      '사업장 상세 주소',
      '유입 경로',
      '요청 및 비고',
      '진행 상태'
    ];

    const rows = filteredQuotes.map((q) => {
      const siteStr = (q.sites || []).map(s => `[${s.name}] (${s.postcode || ''}) ${s.address || ''} ${s.addressDetail || ''}`).join(' ; ');
      return [
        formatKSTDate(q.created_at),
        q.company_name || '',
        q.ceo_name || '',
        q.biz_reg_no || '',
        q.industry || '',
        `${q.employee_count || 0}명`,
        (q.target_standards || []).join(', '),
        q.target_date || '',
        (q.existing_certs || []).join(', ') || '없음',
        q.main_product || '',
        q.contact_name || '',
        q.contact_phone || '',
        q.contact_email || '',
        `${q.sites?.length || 0}개소`,
        siteStr,
        q.referral_source || '',
        (q.note || '').replace(/\r?\n/g, ' '),
        q.status || '접수완료'
      ];
    });

    const csvContent =
      '\uFEFF' +
      [
        headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
        ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quanternity_quote_requests_${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Status Badge Colors
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case '검토중':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case '견적발송':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case '계약체결':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case '보류':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-purple-50 text-purple-800 border-purple-200';
    }
  };

  // Distinct industries for filter
  const industries = useMemo(() => {
    const set = new Set<string>();
    quotes.forEach((q) => {
      if (q.industry) set.add(q.industry);
    });
    return Array.from(set);
  }, [quotes]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1220] flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-[#2B5CE7]" />
              견적 요청 관리 (Quote Requests)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#2B5CE7]">
              {quotes.length}건
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            홈페이지(/quote) 및 추천·진단 퍼널에서 접수된 ISO 인증 견적 요청 목록과 기업 상세 정보를 실시간으로 확인합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchQuotes}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#2B5CE7] hover:bg-[#1E45B8] rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV 엑셀 다운로드
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>총 견적 요청</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0B1220]">{quotes.length}건</div>
          <div className="text-[11px] text-gray-400 mt-1">전체 누적 접수 건수</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>ISO 42001 (AI) 포함</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {quotes.filter(q => q.target_standards?.some(s => s.includes('42001'))).length}건
          </div>
          <div className="text-[11px] text-gray-400 mt-1">AI 거버넌스 규격 견적 비중</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>검토 및 상담 대기</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">
            {quotes.filter(q => !q.status || q.status === '접수완료' || q.status === '검토중').length}건
          </div>
          <div className="text-[11px] text-gray-400 mt-1">빠른 심사원 견적 산정 필요</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>평균 임직원 규모</span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0B1220]">
            {quotes.length > 0
              ? Math.round(quotes.reduce((acc, q) => acc + (q.employee_count || 0), 0) / quotes.length)
              : 0}명
          </div>
          <div className="text-[11px] text-gray-400 mt-1">신청 기업 평균 사업장 인원</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="회사명, 대표자, 담당자, 이메일, 전화번호, 사업자등록번호 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Industry Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700"
            >
              <option value="ALL">전체 산업군</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>

            {/* Standard Filter */}
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700"
            >
              <option value="ALL">전체 규격</option>
              <option value="27001">ISO 27001 (정보보안)</option>
              <option value="42001">ISO 42001 (AI거버넌스)</option>
              <option value="13485">ISO 13485 (의료기기)</option>
              <option value="9001">ISO 9001 (품질)</option>
              <option value="14001">ISO 14001 (환경)</option>
              <option value="45001">ISO 45001 (안전보건)</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700"
            >
              <option value="ALL">전체 상태</option>
              <option value="접수완료">접수완료</option>
              <option value="검토중">검토중</option>
              <option value="견적발송">견적발송</option>
              <option value="계약체결">계약체결</option>
              <option value="보류">보류</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(searchQuery || selectedIndustry !== 'ALL' || selectedStandard !== 'ALL' || selectedStatus !== 'ALL') && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span>필터 적용 중:</span>
            <span className="font-semibold text-blue-600">{filteredQuotes.length}건 검색됨</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedIndustry('ALL');
                setSelectedStandard('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-[11px] text-gray-400 hover:text-red-500 underline ml-auto"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* Main Quotes Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="py-3 px-4 whitespace-nowrap">신청일시</th>
                <th className="py-3 px-4">기업 정보 (대표자 · 사업자번호)</th>
                <th className="py-3 px-4">산업군 / 규모</th>
                <th className="py-3 px-4">희망 인증 규격</th>
                <th className="py-3 px-4">희망 완료 시기</th>
                <th className="py-3 px-4">담당자 정보</th>
                <th className="py-3 px-4 text-center">상태</th>
                <th className="py-3 px-4 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    견적 요청 데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    조건에 일치하는 견적 요청이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedQuote(q)}
                  >
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap font-mono">
                      {formatKSTDate(q.created_at)}
                    </td>

                    {/* Company info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0B1220] group-hover:text-[#2B5CE7] transition-colors flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>{q.company_name}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                        대표: {q.ceo_name || '-'} · 사업자: {q.biz_reg_no || '-'}
                      </div>
                    </td>

                    {/* Industry & Size */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-gray-800">{q.industry || '-'}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        임직원 {q.employee_count || 0}명 · 사업장 {q.sites?.length || 1}곳
                      </div>
                    </td>

                    {/* Target Standards */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {q.target_standards && q.target_standards.length > 0 ? (
                          q.target_standards.map((std, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                std.includes('42001')
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : std.includes('27001')
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : std.includes('13485')
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                              }`}
                            >
                              {std}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 font-mono">-</span>
                        )}
                      </div>
                    </td>

                    {/* Target Date */}
                    <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {q.target_date || '미정'}
                      </span>
                    </td>

                    {/* Contact Person */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        {q.contact_name}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                        {q.contact_phone}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          q.status
                        )}`}
                      >
                        {q.status || '접수완료'}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQuote(q);
                        }}
                        className="p-1.5 text-gray-500 hover:text-[#2B5CE7] hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 font-medium text-xs"
                      >
                        <Eye className="w-4 h-4" />
                        <span>상세보기</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedQuote(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-[#0B1220] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2B5CE7] flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-base tracking-tight flex items-center gap-2">
                    {selectedQuote.company_name}
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                      견적 접수 상세
                    </span>
                  </h2>
                  <div className="text-xs text-gray-400 font-mono">
                    접수 일시: {formatKSTDate(selectedQuote.created_at)} · ID: {selectedQuote.id}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-700">
              {/* Section 1: Company Profile */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1.5 border-b border-gray-200">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  1. 기업 기본 정보
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div>
                    <span className="text-gray-400 block text-[11px]">회사명</span>
                    <span className="font-bold text-gray-900 text-sm">{selectedQuote.company_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">대표자명</span>
                    <span className="font-semibold text-gray-800">{selectedQuote.ceo_name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">사업자등록번호</span>
                    <div className="flex items-center gap-1 font-mono font-semibold text-blue-700">
                      <span>{selectedQuote.biz_reg_no}</span>
                      <button
                        onClick={() => copyToClipboard(selectedQuote.biz_reg_no, 'bizNo')}
                        className="text-gray-400 hover:text-blue-600"
                        title="사업자번호 복사"
                      >
                        {copiedField === 'bizNo' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">산업분류 (Axis A)</span>
                    <span className="font-medium text-gray-800">{selectedQuote.industry || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">임직원 수</span>
                    <span className="font-semibold text-gray-800">{selectedQuote.employee_count || 0}명</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">주요 제품 / 서비스</span>
                    <span className="font-medium text-gray-800">{selectedQuote.main_product || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Certification Requirements */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1.5 border-b border-gray-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  2. 인증 요구사항 및 일정
                </h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div>
                    <span className="text-gray-400 block text-[11px] mb-1.5">희망 인증 규격</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedQuote.target_standards && selectedQuote.target_standards.length > 0 ? (
                        selectedQuote.target_standards.map((std, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md text-xs font-bold bg-white border border-gray-300 text-[#0B1220] shadow-2xs"
                          >
                            {std}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">지정 안 됨</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                    <div>
                      <span className="text-gray-400 block text-[11px]">희망 완료 시기</span>
                      <span className="font-semibold text-gray-900">{selectedQuote.target_date || '미정'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">기보유 인증</span>
                      <span className="font-medium text-gray-800">
                        {selectedQuote.existing_certs && selectedQuote.existing_certs.length > 0
                          ? selectedQuote.existing_certs.join(', ')
                          : '없음 (신규 구축)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Sites / Locations */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1.5 border-b border-gray-200">
                  <MapPin className="w-4 h-4 text-red-600" />
                  3. 심사 대상 사업장 현황 ({selectedQuote.sites?.length || 0}곳)
                </h3>
                <div className="space-y-2">
                  {selectedQuote.sites && selectedQuote.sites.length > 0 ? (
                    selectedQuote.sites.map((s, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-xs">{s.name}</div>
                          <div className="text-gray-600 mt-0.5">
                            {s.postcode && <span className="font-mono text-gray-400 mr-1">[{s.postcode}]</span>}
                            {s.address} {s.addressDetail}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-400 text-center">
                      등록된 사업장 주소가 없습니다.
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Contact & Memo */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1.5 border-b border-gray-200">
                  <User className="w-4 h-4 text-purple-600" />
                  4. 담당자 정보 및 고객 요청 메모
                </h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-gray-400 block text-[11px]">담당자 성명</span>
                      <span className="font-bold text-gray-900 text-sm">{selectedQuote.contact_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">휴대전화 / 직통연락처</span>
                      <a
                        href={`tel:${selectedQuote.contact_phone}`}
                        className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {selectedQuote.contact_phone}
                      </a>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">이메일 주소</span>
                      <a
                        href={`mailto:${selectedQuote.contact_email}`}
                        className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1 truncate"
                      >
                        <Mail className="w-3 h-3" />
                        {selectedQuote.contact_email}
                      </a>
                    </div>
                  </div>

                  {selectedQuote.note && (
                    <div className="pt-3 border-t border-gray-200">
                      <span className="text-gray-400 block text-[11px] mb-1">고객 요청 및 문의 사항</span>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {selectedQuote.note}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-[11px] text-gray-400 flex items-center justify-between">
                    <span>유입 경로: {selectedQuote.referral_source || '직접 유입'}</span>
                    <span>퍼널 소스: {selectedQuote.source_funnel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="text-xs text-gray-500 font-mono">
                진행 상태: <span className="font-bold text-gray-900">{selectedQuote.status || '접수완료'}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedQuote.contact_email}?subject=[Quanternity AI] ${selectedQuote.company_name} 견적 요청 관련 안내`}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  이메일 회신
                </a>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="px-4 py-2 bg-[#0B1220] hover:bg-gray-800 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
