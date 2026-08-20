'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SiteBanner, BannerPlacement } from '@/lib/types';
import { Megaphone, Plus, Trash2, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';

export default function BannersManagerPage() {
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [activeTab, setActiveTab] = useState<BannerPlacement>('notice_bar');
  const [loading, setLoading] = useState(true);

  // Form State
  const [headline, setHeadline] = useState('');
  const [eyebrow, setEyebrow] = useState('');
  const [body, setBody] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaTarget, setCtaTarget] = useState('');
  const [isActive, setIsActive] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    setLoading(true);
    const { data } = await supabase.from('site_banners').select('*').order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setBanners(data);
    } else {
      // Auto-insert initial default banners into Supabase DB so they persist permanently
      const initialSeed = [
        {
          placement: 'notice_bar' as BannerPlacement,
          headline: '2026년 AI기본법 시행 확정 — ISO/IEC 42001·27001 통합 구축 무료 진단 진행 중',
          body: '지난 7월 14일 국무회의를 통과한 AI기본법 시행령 개정안이 7월 21일부터 시행되었습니다. 핵심 5가지: 1. 공공조달 시 AI 제품·서비스 우선 고려 2. AI 제품·서비스 확인제 신설 3. AI 취약계층 범위 확대 4. AI연구소 설립·운영 근거 5. 모태펀드 활용 AI 창업 지원 근거 마련.',
          cta_label: '진단하기 ➔',
          cta_target: '#assessment-modal',
          sort_order: 1,
          is_active: true,
        },
        {
          placement: 'hero_slide' as BannerPlacement,
          eyebrow: '두 개의 인증',
          headline: '두 개의 인증, 한 번의 구축으로 준비합니다.',
          body: 'ISO/IEC 42001과 27001은 정책·위험관리·내부심사·경영검토 등 경영시스템 구조를 공유합니다. 통합 구축은 같은 문서를 두 번 만드는 일을 없애고, 준비 기간과 심사 대응 부담을 줄입니다.',
          cta_label: '3분 자가진단 ➔',
          cta_target: '#assessment-modal',
          sort_order: 1,
          is_active: true,
        },
        {
          placement: 'hero_slide' as BannerPlacement,
          eyebrow: '통합 구축 & 현장 증적',
          headline: '문서가 아니라 증적으로 증명합니다.',
          body: 'ISO/IEC 42001·27001 통합 구축, 현장 증적 관리, 고영향 AI 규제 요건 분석까지. 선임심사원이 설계하고, 증적으로 증명합니다.',
          cta_label: '무료 진단 신청 ➔',
          cta_target: '#assessment-modal',
          sort_order: 2,
          is_active: true,
        },
        {
          placement: 'hero_slide' as BannerPlacement,
          eyebrow: '공공 AI 사업 제안서',
          headline: '공공 AI 사업, 수주는 하셨습니다. 다음 제안서는 준비되셨습니까?',
          body: '2026년 상반기 AI 관련 공공 낙찰사들중 ISO42001 보유 기업이 확인된 사례가 많지 않았습니다. 평가 항목에 AI 거버넌스가 반영되기 시작한 지금이 격차를 만들 시점입니다.',
          cta_label: '무료 진단 신청 ➔',
          cta_target: '#assessment-modal',
          sort_order: 3,
          is_active: true,
        },
        {
          placement: 'hero_slide' as BannerPlacement,
          eyebrow: '메인-스폰서 실사 · 병원 심의 · 투자 실사',
          headline: '같은 자료를 매번 다시 만들고 계십니까.',
          body: '임상수탁 조직은 이미 감사받는 일을 업으로 합니다. 운영 중인 SOP와 데이터 관리 절차는 ISO/IEC 27001·42001 요구사항의 상당 부분을 이미 충족하고 있습니다.',
          cta_label: 'SOP → 27001·42001 매핑 진단 ➔',
          cta_target: '#assessment-modal',
          sort_order: 4,
          is_active: true,
        },
      ];

      const { data: inserted } = await supabase.from('site_banners').insert(initialSeed).select();
      if (inserted && inserted.length > 0) {
        setBanners(inserted);
      } else {
        setBanners(initialSeed.map((item, idx) => ({
          id: `seed-${idx}`,
          ...item,
          created_at: new Date().toISOString(),
        })));
      }
    }
    setLoading(false);
  }

  // §5.5 Single-Active Enforcement Rule for Notice Bar
  const handleToggleActive = async (banner: SiteBanner) => {
    const nextActiveState = !banner.is_active;

    if (banner.placement === 'notice_bar' && nextActiveState) {
      // Deactivate all existing active notice bars in DB
      await supabase
        .from('site_banners')
        .update({ is_active: false })
        .eq('placement', 'notice_bar');

      // Activate target notice bar in DB
      await supabase
        .from('site_banners')
        .update({ is_active: true })
        .eq('id', banner.id);

      setBanners((prev) =>
        prev.map((b) =>
          b.placement === 'notice_bar' ? { ...b, is_active: b.id === banner.id } : b
        )
      );

      alert('NOTICE 바 단일 활성 규정에 따라 선택한 NOTICE 바가 활성화되고 기존 NOTICE 바는 비활성화되었습니다.');
    } else {
      await supabase
        .from('site_banners')
        .update({ is_active: nextActiveState })
        .eq('id', banner.id);

      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: nextActiveState } : b))
      );
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) return;

    if (activeTab === 'notice_bar' && isActive) {
      // Deactivate existing notice bars in DB first
      await supabase
        .from('site_banners')
        .update({ is_active: false })
        .eq('placement', 'notice_bar');

      setBanners((prev) =>
        prev.map((b) => (b.placement === 'notice_bar' ? { ...b, is_active: false } : b))
      );
    }

    const newBanner: Partial<SiteBanner> = {
      placement: activeTab,
      eyebrow: activeTab === 'hero_slide' ? eyebrow : undefined,
      headline,
      body,
      cta_label: ctaLabel,
      cta_target: ctaTarget,
      is_active: isActive,
      sort_order: banners.length + 1,
    };

    const { data } = await supabase.from('site_banners').insert([newBanner]).select().single();

    if (data) {
      setBanners([...banners, data]);
    } else {
      setBanners([
        ...banners,
        {
          id: `temp-${Date.now()}`,
          placement: activeTab,
          eyebrow,
          headline,
          body,
          cta_label: ctaLabel,
          cta_target: ctaTarget,
          is_active: isActive,
          sort_order: banners.length + 1,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    setHeadline('');
    setEyebrow('');
    setBody('');
    setCtaLabel('');
    setCtaTarget('');
    setIsActive(false);
    alert('새 배너/슬라이드가 정상 등록되었습니다.');
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('이 배너 항목을 삭제하시겠습니까?')) return;
    await supabase.from('site_banners').delete().eq('id', id);
    setBanners(banners.filter((b) => b.id !== id));
  };

  const filteredBanners = banners.filter((b) => b.placement === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0B1220] tracking-tight">배너 & 히어로 관리</h1>
        <p className="text-xs text-gray-500 font-mono mt-0.5">
          상단 NOTICE 바 및 히어로 롤링 슬라이드 문구 관리
        </p>
      </div>

      {/* Tabs: NOTICE 바 / 히어로 슬라이드 */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('notice_bar')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'notice_bar'
              ? 'border-[#10B981] text-[#0B1220]'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          📢 NOTICE 바 (상단 단일 고정)
        </button>
        <button
          onClick={() => setActiveTab('hero_slide')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'hero_slide'
              ? 'border-[#10B981] text-[#0B1220]'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          🖼️ 히어로 슬라이드 (다중 롤링)
        </button>
      </div>

      {/* Form & List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: New Item Form */}
        <form onSubmit={handleAddBanner} className="lg:col-span-5 bg-white border border-[#E5E3DA] p-4 rounded-xl shadow-sm space-y-3">
          <div className="font-mono text-xs font-bold text-gray-700">
            {activeTab === 'notice_bar' ? '신규 NOTICE 바 등록' : '신규 히어로 슬라이드 등록'}
          </div>

          {activeTab === 'hero_slide' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">상단 Eyebrow 소제목</label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                placeholder="예: AI기본법 2026.01 시행"
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">메인 헤드라인 (Headline) *</label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="예: 2026년 공공 AI 사업 ISO/IEC 42001 컨설팅 접수"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">본문 설명 (Body)</label>
            <textarea
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="추가 설명 문구 (선택사항)"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CTA 라벨</label>
              <input
                type="text"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="무료 진단 신청 →"
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CTA 타겟 URL/앵커</label>
              <input
                type="text"
                value={ctaTarget}
                onChange={(e) => setCtaTarget(e.target.value)}
                placeholder="#contact 또는 /about"
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-[#10B981] rounded border-gray-300"
            />
            <label htmlFor="is_active" className="text-xs font-medium text-gray-700">
              즉시 활성화(Active) 적용
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>등록하기</span>
          </button>
        </form>

        {/* Right 7 Cols: Registered Banner Items List */}
        <div className="lg:col-span-7 space-y-3">
          {activeTab === 'notice_bar' && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>NOTICE 바는 <strong>동시 활성 1건만 허용</strong>되며, 새 배너 활성화 시 기존 배너는 자동 비활성화됩니다.</span>
            </div>
          )}

          <div className="space-y-3">
            {filteredBanners.length === 0 ? (
              <div className="bg-white border border-[#E5E3DA] p-8 rounded-xl text-center text-xs text-gray-400 font-mono">
                등록된 {activeTab === 'notice_bar' ? 'NOTICE 바' : '히어로 슬라이드'} 항목이 없습니다.
              </div>
            ) : (
              filteredBanners.map((b) => (
                <div
                  key={b.id}
                  className={`bg-white border rounded-xl p-4 shadow-sm flex items-start justify-between gap-4 transition-all ${
                    b.is_active ? 'border-[#10B981] ring-1 ring-[#10B981]/20' : 'border-[#E5E3DA]'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          b.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {b.is_active ? 'ACTIVE (노출 중)' : 'INACTIVE'}
                      </span>
                      {b.eyebrow && <span className="text-xs text-gray-500 font-mono">{b.eyebrow}</span>}
                    </div>

                    <div className="font-bold text-sm text-[#0B1220]">{b.headline}</div>
                    {b.body && <div className="text-xs text-gray-600">{b.body}</div>}

                    {b.cta_label && (
                      <div className="text-xs text-[#059669] font-medium pt-1">
                        CTA: {b.cta_label} ({b.cta_target || '#'})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(b)}
                      className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                        b.is_active
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {b.is_active ? '비활성화' : '활성화'}
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(b.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
