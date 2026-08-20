'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Regulation, RegulationMapping } from '@/lib/types';
import { ShieldCheck, Plus, Trash2, Save, MoveUp, MoveDown, CheckCircle2 } from 'lucide-react';

const STANDARD_OPTIONS = [
  'ISO/IEC 42001',
  'ISO/IEC 27001',
  'ISO/IEC 27701',
  'ISO 13485',
  'ISO/IEC 42005',
  'ISMS-P',
];

const MOCK_REGULATIONS: Regulation[] = [
  {
    id: 'ai-basic',
    code: 'ai_basic_act',
    region: 'KR',
    name_ko: 'AI기본법',
    full_name_ko: '「인공지능 발전과 신뢰 기반 조성 등에 관한 기본법」',
    effective_date: '2026-01 시행',
    scope_note: '국내 사업자 · 공공기관',
    description: '고영향 AI를 개발·제공·이용하는 사업자에 대한 위험관리·투명성·안전성 확보 조치 의무를 규정합니다.',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'eu-ai-act',
    code: 'eu_ai_act',
    region: 'EU',
    name_ko: 'EU AI Act',
    full_name_ko: 'Regulation (EU) 2024/1689',
    effective_date: '2026.08.02 (Art.50) / 2027.12.02 (Annex III)',
    scope_note: 'EU 시장 진출 사업자',
    description: '고위험 AI 시스템의 시장 출시 및 사용에 관한 요구사항. EU 시장 진입 기업에 적용됩니다.',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'gdpr',
    code: 'gdpr',
    region: 'EU',
    name_ko: 'GDPR',
    full_name_ko: 'General Data Protection Regulation',
    effective_date: '2018-05 (시행 중)',
    scope_note: 'EU 거주자 개인정보 처리 사업자',
    description: '개인정보의 처리 및 자유로운 이동에 관한 EU 규정. 제32조는 기술적·관리적 보호조치를 요구합니다.',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'cpra',
    code: 'ccpa_cpra',
    region: 'US',
    name_ko: 'CCPA / CPRA',
    full_name_ko: 'California Privacy Rights Act',
    effective_date: '2023-01 (시행 중)',
    scope_note: '캘리포니아 사업자 · 미국 진출 기업',
    description: '캘리포니아 거주자의 프라이버시 권리 및 자동화된 의사결정 기술에 대한 옵트아웃 권리를 부여합니다.',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'hipaa',
    code: 'hipaa',
    region: 'US',
    name_ko: 'HIPAA',
    full_name_ko: 'Health Insurance Portability and Accountability Act',
    effective_date: '2003-04 (시행 중)',
    scope_note: '헬스케어 · IVD · 의료 SaaS',
    description: '보호대상 건강정보(PHI)의 처리·전송·저장에 관한 미국 법. 헬스케어·IVD 기업의 진입 요건입니다.',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'isms-p',
    code: 'isms_p',
    region: 'KR',
    name_ko: 'ISMS-P',
    full_name_ko: '정보보호 및 개인정보보호 관리체계',
    effective_date: '시행 중',
    scope_note: '정보통신서비스 제공자 · 매출·이용자 요건 해당 기업',
    description: '국내 법정 인증. 방송통신망법·개인정보보호법 준수 입증 수단으로 활용됩니다.',
    sort_order: 6,
    is_active: true,
  },
];

const MOCK_MAPPINGS: Record<string, RegulationMapping[]> = {
  'ai-basic': [
    { id: 'm1-1', regulation_id: 'ai-basic', standard_name: 'ISO/IEC 42001', clause_ref: '조항 6.1', control_name: 'AI 관련 위험 및 기회 처리', match_description: '고영향 AI 위험식별·평가 절차', sort_order: 1 },
    { id: 'm1-2', regulation_id: 'ai-basic', standard_name: 'ISO/IEC 42001', clause_ref: '조항 6.1.4', control_name: 'AI 시스템 영향평가', match_description: '이해관계자 영향 문서화 의무', sort_order: 2 },
    { id: 'm1-3', regulation_id: 'ai-basic', standard_name: 'ISO/IEC 42001', clause_ref: '부속서 A.6', control_name: 'AI 시스템 수명주기', match_description: '개발·배포·운영·폐기 통제', sort_order: 3 },
    { id: 'm1-4', regulation_id: 'ai-basic', standard_name: 'ISO/IEC 42001', clause_ref: '조항 9.2', control_name: '내부심사', match_description: '자체 이행 점검 근거', sort_order: 4 },
  ],
  'eu-ai-act': [
    { id: 'm2-1', regulation_id: 'eu-ai-act', standard_name: 'ISO/IEC 42001', clause_ref: '조항 8', control_name: '운영 계획 및 통제', match_description: '고위험 AI 시스템 관리 요구', sort_order: 1 },
    { id: 'm2-2', regulation_id: 'eu-ai-act', standard_name: 'ISO/IEC 42001', clause_ref: '부속서 A.8', control_name: '데이터 거버넌스', match_description: 'Art. 10 데이터 및 데이터 거버넌스', sort_order: 2 },
    { id: 'm2-3', regulation_id: 'eu-ai-act', standard_name: 'ISO/IEC 42001', clause_ref: '부속서 A.9', control_name: '투명성 및 정보 제공', match_description: 'Art. 13 투명성 의무', sort_order: 3 },
    { id: 'm2-4', regulation_id: 'eu-ai-act', standard_name: 'ISO/IEC 42001', clause_ref: '부속서 A.10', control_name: '인간 감독', match_description: 'Art. 14 Human oversight', sort_order: 4 },
    { id: 'm2-5', regulation_id: 'eu-ai-act', standard_name: 'ISO/IEC 42001', clause_ref: '부속서 A.7', control_name: '기술 문서', match_description: 'Art. 11 · Annex IV', sort_order: 5 },
  ],
  'gdpr': [
    { id: 'm3-1', regulation_id: 'gdpr', standard_name: 'ISO/IEC 27001', clause_ref: '부속서 A.5', control_name: '조직적 통제', match_description: '제24조 컨트롤러 책임', sort_order: 1 },
    { id: 'm3-2', regulation_id: 'gdpr', standard_name: 'ISO/IEC 27001', clause_ref: '부속서 A.8', control_name: '기술적 통제', match_description: '제32조 처리의 보안', sort_order: 2 },
    { id: 'm3-3', regulation_id: 'gdpr', standard_name: 'ISO/IEC 27701', clause_ref: '전체', control_name: '개인정보 관리시스템', match_description: 'DPO·DPIA 프로세스', sort_order: 3 },
    { id: 'm3-4', regulation_id: 'gdpr', standard_name: 'ISO/IEC 42001', clause_ref: '부속서 A.6.2', control_name: 'AI 개인정보 처리', match_description: '제22조 자동화된 결정', sort_order: 4 },
  ],
  'cpra': [
    { id: 'm4-1', regulation_id: 'cpra', standard_name: 'ISO/IEC 27001', clause_ref: '부속서 A.5.34', control_name: '개인정보 보호', match_description: '캘리포니아 §1798.150', sort_order: 1 },
    { id: 'm4-2', regulation_id: 'cpra', standard_name: 'ISO/IEC 27701', clause_ref: '조항 6', control_name: 'PII 처리자 통제', match_description: 'CPRA §1798.140(v)', sort_order: 2 },
    { id: 'm4-3', regulation_id: 'cpra', standard_name: 'ISO/IEC 42001', clause_ref: '부속서 A.9', control_name: '투명성 및 정보 제공', match_description: '자동화 의사결정 고지', sort_order: 3 },
  ],
  'hipaa': [
    { id: 'm5-1', regulation_id: 'hipaa', standard_name: 'ISO/IEC 27001', clause_ref: '부속서 A.5', control_name: '조직적 통제', match_description: 'Administrative Safeguards §164.308', sort_order: 1 },
    { id: 'm5-2', regulation_id: 'hipaa', standard_name: 'ISO/IEC 27001', clause_ref: '부속서 A.7', control_name: '물리적 통제', match_description: 'Physical Safeguards §164.310', sort_order: 2 },
    { id: 'm5-3', regulation_id: 'hipaa', standard_name: 'ISO/IEC 27001', clause_ref: '부속서 A.8', control_name: '기술적 통제', match_description: 'Technical Safeguards §164.312', sort_order: 3 },
    { id: 'm5-4', regulation_id: 'hipaa', standard_name: 'ISO 13485', clause_ref: '조항 7.3', control_name: '설계 및 개발', match_description: '의료기기 SaMD 관리', sort_order: 4 },
  ],
  'isms-p': [
    { id: 'm6-1', regulation_id: 'isms-p', standard_name: 'ISO/IEC 27001', clause_ref: '전체', control_name: '정보보호 관리체계', match_description: 'ISMS-P 관리체계 수립·운영', sort_order: 1 },
    { id: 'm6-2', regulation_id: 'isms-p', standard_name: 'ISO/IEC 27701', clause_ref: '전체', control_name: '개인정보 관리체계', match_description: 'ISMS-P 개인정보 도메인', sort_order: 2 },
    { id: 'm6-3', regulation_id: 'isms-p', standard_name: 'ISO/IEC 42001', clause_ref: '부속서 A.6.2', control_name: 'AI 개인정보 처리', match_description: 'AI 기반 서비스의 개인정보 통제', sort_order: 3 },
  ],
};

export default function RegulationsManagerPage() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [selectedReg, setSelectedReg] = useState<Regulation | null>(null);
  const [mappings, setMappings] = useState<RegulationMapping[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchRegulations();
  }, []);

  async function fetchRegulations() {
    setLoading(true);
    const { data } = await supabase.from('regulations').select('*').order('sort_order', { ascending: true });

    if (data && data.length > 0) {
      setRegulations(data);
      setSelectedReg(data[0]);
      fetchMappings(data[0].id);
    } else {
      setRegulations(MOCK_REGULATIONS);
      setSelectedReg(MOCK_REGULATIONS[0]);
      fetchMappings(MOCK_REGULATIONS[0].id);
    }
    setLoading(false);
  }

  async function fetchMappings(regId: string) {
    const { data } = await supabase
      .from('regulation_mappings')
      .select('*')
      .eq('regulation_id', regId)
      .order('sort_order', { ascending: true });

    if (data && data.length > 0) {
      setMappings(data);
    } else {
      setMappings(MOCK_MAPPINGS[regId] || MOCK_MAPPINGS['ai-basic']);
    }
  }

  const handleSelectReg = (reg: Regulation) => {
    setSelectedReg(reg);
    fetchMappings(reg.id);
  };

  const handleAddMappingRow = () => {
    if (!selectedReg) return;
    const newRow: RegulationMapping = {
      id: `temp-${Date.now()}`,
      regulation_id: selectedReg.id,
      standard_name: 'ISO/IEC 42001',
      clause_ref: '',
      control_name: '',
      match_description: '',
      sort_order: mappings.length + 1,
    };
    setMappings([...mappings, newRow]);
  };

  const handleUpdateMappingRow = (index: number, field: keyof RegulationMapping, value: string) => {
    const updated = [...mappings];
    (updated[index] as any)[field] = value;
    setMappings(updated);
  };

  const handleDeleteRow = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (!selectedReg) return;
    setSaving(true);

    // Save regulation meta info
    await supabase
      .from('regulations')
      .update({
        name_ko: selectedReg.name_ko,
        full_name_ko: selectedReg.full_name_ko,
        effective_date: selectedReg.effective_date,
        scope_note: selectedReg.scope_note,
        description: selectedReg.description,
      })
      .eq('id', selectedReg.id);

    // Delete existing mappings & re-insert batch
    await supabase.from('regulation_mappings').delete().eq('regulation_id', selectedReg.id);

    const rowsToInsert = mappings.map((m, idx) => ({
      regulation_id: selectedReg.id,
      standard_name: m.standard_name,
      clause_ref: m.clause_ref,
      control_name: m.control_name,
      match_description: m.match_description,
      sort_order: idx + 1,
    }));

    if (rowsToInsert.length > 0) {
      await supabase.from('regulation_mappings').insert(rowsToInsert);
    }

    setSaving(false);
    alert(`'${selectedReg.name_ko}' 조항 매핑 정보가 정상 저장되었습니다.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0B1220] tracking-tight">규제 → 인증 매핑 관리</h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            국내외 AI·보안 규제별 ISO 부속서 및 통제 조항 매핑 인라인 편집
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-black font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? '저장 중...' : '일괄 저장하기'}</span>
        </button>
      </div>

      {/* 2-Column Layout: Left Regulation List + Right Inline Table Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Regulation Items List */}
        <div className="lg:col-span-4 bg-white border border-[#E5E3DA] rounded-xl shadow-sm overflow-hidden">
          <div className="p-3.5 bg-[#F9F8F5] border-b border-[#E5E3DA] font-mono text-xs font-bold text-gray-700">
            관리 대상 규제 목록 (6종)
          </div>
          <div className="divide-y divide-[#E5E3DA]">
            {regulations.map((reg) => (
              <div
                key={reg.id}
                onClick={() => handleSelectReg(reg)}
                className={`p-3.5 cursor-pointer transition-all ${
                  selectedReg?.id === reg.id
                    ? 'bg-[#0B1220] text-white border-l-4 border-[#10B981]'
                    : 'hover:bg-gray-50 text-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      selectedReg?.id === reg.id
                        ? 'bg-[#10B981] text-black'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {reg.region}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">{reg.effective_date}</span>
                </div>
                <div className="font-bold text-sm mt-1">{reg.name_ko}</div>
                <div
                  className={`text-xs mt-0.5 truncate ${
                    selectedReg?.id === reg.id ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  {reg.full_name_ko}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 8 Cols: Selected Regulation Meta + Clause Mapping Table */}
        <div className="lg:col-span-8 space-y-4">
          {selectedReg && (
            <>
              {/* Selected Regulation Metadata Form */}
              <div className="bg-white border border-[#E5E3DA] p-4 rounded-xl shadow-sm space-y-3">
                <div className="font-mono text-xs font-bold text-gray-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>'{selectedReg.name_ko}' 상세 정보</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">법령명 (표시용)</label>
                    <input
                      type="text"
                      value={selectedReg.name_ko}
                      onChange={(e) => setSelectedReg({ ...selectedReg, name_ko: e.target.value })}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-[#0B1220] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">시행 시점</label>
                    <input
                      type="text"
                      value={selectedReg.effective_date || ''}
                      onChange={(e) => setSelectedReg({ ...selectedReg, effective_date: e.target.value })}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-[#0B1220] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">정식 법령명</label>
                    <input
                      type="text"
                      value={selectedReg.full_name_ko || ''}
                      onChange={(e) => setSelectedReg({ ...selectedReg, full_name_ko: e.target.value })}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-[#0B1220]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">적용 범위</label>
                    <input
                      type="text"
                      value={selectedReg.scope_note || ''}
                      onChange={(e) => setSelectedReg({ ...selectedReg, scope_note: e.target.value })}
                      placeholder="예: 국내 사업자 · 공공기관"
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-[#0B1220] font-medium"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-medium text-gray-600 mb-1">규제 개요 및 설명</label>
                  <textarea
                    rows={2}
                    value={selectedReg.description || ''}
                    onChange={(e) => setSelectedReg({ ...selectedReg, description: e.target.value })}
                    placeholder="고영향 AI를 개발·제공·이용하는 사업자에 대한..."
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-[#0B1220] resize-none"
                  />
                </div>
              </div>

              {/* Clause Mapping Table Editor (Inline Editing Table) */}
              <div className="bg-white border border-[#E5E3DA] rounded-xl shadow-sm overflow-hidden">
                <div className="p-3.5 bg-[#F9F8F5] border-b border-[#E5E3DA] flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gray-700">
                    조항 통제 매핑 테이블 ({mappings.length}개 항목)
                  </span>
                  <button
                    onClick={handleAddMappingRow}
                    className="px-3 py-1 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-md inline-flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>행 추가</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-[#E5E3DA] text-gray-500 font-mono">
                        <th className="p-2.5 pl-3 w-36">규격명 (선택)</th>
                        <th className="p-2.5 w-28">조항 참조</th>
                        <th className="p-2.5 w-36">통제명</th>
                        <th className="p-2.5">규제 매칭 설명</th>
                        <th className="p-2.5 text-center w-12">삭제</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E3DA]">
                      {mappings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-gray-400 font-mono text-xs">
                            매핑된 조항이 없습니다. [행 추가] 버튼을 클릭해 등록하세요.
                          </td>
                        </tr>
                      ) : (
                        mappings.map((m, idx) => (
                          <tr key={m.id || idx} className="hover:bg-gray-50">
                            {/* Standard Name Dropdown (§5.4 requirement) */}
                            <td className="p-2 pl-3">
                              <select
                                value={m.standard_name}
                                onChange={(e) => handleUpdateMappingRow(idx, 'standard_name', e.target.value)}
                                className="w-full p-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-mono font-semibold text-[#0B1220]"
                              >
                                {STANDARD_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </td>
                            {/* Clause Ref */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={m.clause_ref}
                                onChange={(e) => handleUpdateMappingRow(idx, 'clause_ref', e.target.value)}
                                placeholder="예: 조항 6.1.4"
                                className="w-full p-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-mono"
                              />
                            </td>
                            {/* Control Name */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={m.control_name}
                                onChange={(e) => handleUpdateMappingRow(idx, 'control_name', e.target.value)}
                                placeholder="예: AI 영향평가"
                                className="w-full p-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-semibold"
                              />
                            </td>
                            {/* Match Description */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={m.match_description || ''}
                                onChange={(e) => handleUpdateMappingRow(idx, 'match_description', e.target.value)}
                                placeholder="예: 고영향 AI 위험식별·평가 절차"
                                className="w-full p-1.5 bg-gray-50 border border-gray-200 rounded text-xs"
                              />
                            </td>
                            {/* Delete Action */}
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleDeleteRow(idx)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
