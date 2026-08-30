'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from '@/lib/supabase/client';
import { checkLegalProhibitions, LegalWarning } from '@/lib/legal-guard';
import { Insight, InsightStatus } from '@/lib/types';
import { sendIndexNow } from '@/lib/indexnow';
import {
  Save,
  Eye,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Image as ImageIcon,
  Clock,
  Sparkles,
  ShieldAlert,
  X
} from 'lucide-react';

interface InsightEditorProps {
  initialData?: Partial<Insight>;
  isNew?: boolean;
}

export default function InsightEditor({ initialData, isNew = false }: InsightEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [id, setId] = useState<string>(initialData?.id || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [category, setCategory] = useState(initialData?.category || 'AI기본법');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [bodyMd, setBodyMd] = useState(initialData?.body_md || '');
  const [readMinutes, setReadMinutes] = useState(initialData?.read_minutes || 5);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || '');
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || '');
  const [status, setStatus] = useState<InsightStatus>(initialData?.status || 'draft');
  const [authorName, setAuthorName] = useState(initialData?.author_name || 'Quanternity AI');

  const [saving, setSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [legalWarnings, setLegalWarnings] = useState<LegalWarning[]>([]);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (isNew && title && !slug) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50);
      setSlug(generated || 'insight-post');
    }
  }, [title, isNew, slug]);

  // Auto-calculate read time from body length
  useEffect(() => {
    if (bodyMd) {
      const words = bodyMd.trim().length;
      const calculated = Math.max(1, Math.ceil(words / 300));
      setReadMinutes(calculated);
    }
  }, [bodyMd]);

  // Check §8 Legal Prohibitions ("인증 발급·부여·보장")
  useEffect(() => {
    const textToCheck = `${title} ${summary} ${bodyMd}`;
    const warnings = checkLegalProhibitions(textToCheck);
    setLegalWarnings(warnings);
  }, [title, summary, bodyMd]);

  // 30-Second Auto Save Timer
  useEffect(() => {
    if (isNew || !id) return;

    const interval = setInterval(() => {
      handleSave(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [id, title, slug, category, summary, bodyMd, status]);

  const handleSave = async (isAutoSave = false, overrideStatus?: InsightStatus) => {
    if (!title.trim() || !slug.trim()) {
      if (!isAutoSave) alert('제목과 Slug는 필수 입력 항목입니다.');
      return;
    }

    setSaving(true);

    const targetStatus = overrideStatus || status;

    const payload = {
      title,
      slug: slug.trim(),
      category,
      summary,
      body_md: bodyMd,
      read_minutes: readMinutes,
      cover_image_url: coverImageUrl,
      seo_title: seoTitle || title,
      seo_description: seoDescription || summary,
      status: targetStatus,
      author_name: authorName,
      published_at: targetStatus === 'published' ? (initialData?.published_at || new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    };

    let error = null;

    if (isNew && !id) {
      const { data, error: err } = await supabase
        .from('insights')
        .insert([payload])
        .select('id')
        .single();
      error = err;
      if (data) setId(data.id);
    } else {
      const { error: err } = await supabase
        .from('insights')
        .update(payload)
        .eq('id', id);
      error = err;
    }

    setSaving(false);

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('Could not find the table') || error.code === 'PGRST205') {
        if (!isAutoSave) {
          alert("DB 테이블 미생성 안내: Supabase 데이터베이스에 'insights' 테이블이 아직 생성되지 않았습니다.\nSupabase 대시보드 -> SQL Editor에서 supabase_schema_v1.sql 스크립트를 실행해 주세요.");
        }
      } else {
        if (!isAutoSave) alert(`저장 오류: ${error.message}`);
      }
    } else {
      setLastSavedTime(new Date().toLocaleTimeString('ko-KR'));
      if (targetStatus === 'published') {
        const articleUrl = `https://quanternity.kr/insights/${slug.trim()}`;
        sendIndexNow([articleUrl, 'https://quanternity.kr/insights'])
          .then((res) => console.log('IndexNow Notification:', res.message))
          .catch((err) => console.error('IndexNow Notification Error:', err));
      }
      if (!isAutoSave) alert('저장 및 IndexNow 자동 통보가 처리되었습니다.');
    }
  };

  const handlePublishClick = () => {
    // Check required fields before published status conversion
    if (!title.trim() || !slug.trim() || !summary.trim() || !bodyMd.trim() || !category) {
      alert('발행(Published) 전환 실패: 필수 항목(제목, Slug, 카테고리, 요약, 본문)을 모두 입력해 주세요.');
      return;
    }
    setShowPublishModal(true);
  };

  const confirmPublish = async () => {
    setStatus('published');
    setShowPublishModal(false);
    await handleSave(false, 'published');
    router.push('/insights');
  };

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#E5E3DA] shadow-sm flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/insights')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-base text-[#0B1220]">
              {isNew ? '새 인사이트 아티클 작성' : '인사이트 아티클 편집'}
            </h1>
            <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
              <span>상태: <strong className="uppercase text-emerald-600">{status}</strong></span>
              {lastSavedTime && <span>· 마지막 저장: {lastSavedTime}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? '저장 중...' : '임시 저장'}</span>
          </button>

          <button
            onClick={handlePublishClick}
            className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-black text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>발행하기 (Publish)</span>
          </button>
        </div>
      </div>

      {/* §8 Legal Prohibition Warning Notice */}
      {legalWarnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>§8 컴플라이언스 금지 사항 경고</span>
          </div>
          {legalWarnings.map((warn, idx) => (
            <div key={idx} className="text-xs text-red-800 leading-relaxed bg-white p-2.5 rounded border border-red-100">
              {warn.message}
            </div>
          ))}
        </div>
      )}

      {/* Main 2-Column Split: Left Editor + Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Markdown Editor & Metadata Form */}
        <div className="space-y-4">
          {/* Metadata Accordion Box */}
          <div className="bg-white border border-[#E5E3DA] p-4 rounded-xl space-y-3">
            <div className="font-bold text-xs text-gray-700 font-mono">기본 메타 데이터</div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">제목 (Title)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 고영향 AI 사업자, 하위법령 세부 기준"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-[#0B1220] focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="high-impact-ai-criteria"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-[#0B1220]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-medium text-[#0B1220]"
                  >
                    <option value="AI기본법">AI기본법</option>
                    <option value="EU AI Act">EU AI Act</option>
                    <option value="ISO 42001">ISO 42001</option>
                    <option value="ISO 27001">ISO 27001</option>
                    <option value="ISMS-P">ISMS-P</option>
                    <option value="현장노트">현장노트</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">요약 (Summary - 카드 노출용)</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="목록 카드 및 검색엔진에 노출되는 2~3문장 요약"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-[#0B1220]"
                />
              </div>
            </div>
          </div>

          {/* Markdown Editor Box */}
          <div className="bg-white border border-[#E5E3DA] rounded-xl overflow-hidden flex flex-col h-[560px]">
            <div className="p-3 bg-[#F9F8F5] border-b border-[#E5E3DA] flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-gray-700">본문 Markdown 에디터</span>
              <span className="font-mono text-[11px] text-gray-500">예상 읽기 시간: {readMinutes}분</span>
            </div>
            <textarea
              value={bodyMd}
              onChange={(e) => setBodyMd(e.target.value)}
              placeholder="# 본문 제목을 작성하세요..."
              className="flex-1 w-full p-4 font-mono text-xs text-[#0B1220] bg-white resize-none focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: Live Render Preview */}
        <div className="bg-white border border-[#E5E3DA] rounded-xl overflow-hidden flex flex-col h-[740px]">
          <div className="p-3 bg-[#0B1220] text-white flex items-center justify-between">
            <span className="font-mono text-xs font-bold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#10B981]" />
              실시간 미리보기 (공개 사이트 렌더링)
            </span>
            <span className="text-[11px] text-gray-400 font-mono">quanternity.kr/insights/{slug}</span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-[#FBFAF7] space-y-4">
            <div className="inline-block px-2.5 py-1 rounded bg-[#10B981]/10 border border-[#10B981]/30 text-[#059669] text-xs font-mono font-bold">
              {category}
            </div>
            <h1 className="text-2xl font-bold text-[#0B1220] leading-tight">{title || '제목 없음'}</h1>
            <p className="text-xs text-gray-600 italic border-l-2 border-[#10B981] pl-3 py-1">{summary}</p>
            <hr className="border-gray-200" />
            <div className="prose prose-sm max-w-none text-[#2D3748] leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyMd || '_본문 내용을 입력하시면 실시간 미리보기가 렌더링됩니다._'}</ReactMarkdown>
            </div>

            {/* Bottom Direct Pre-Diagnosis CTA in Preview */}
            <div className="mt-8 bg-gradient-to-br from-[#0B1220] to-[#172554] text-white p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded-full border border-[#10B981]/30">
                  ● 3분 무료 자가진단
                </span>
                <span className="text-[10px] font-mono text-gray-400">ISO 42001 · 27001 · AI기본법 대응</span>
              </div>
              <h4 className="font-bold text-sm text-white">우리 기업에 꼭 필요한 AI 거버넌스 & ISO 인증은?</h4>
              <p className="text-[11px] text-gray-300">
                3분 간단 진단으로 현재 관리체계 수준을 점검하고, 추천 인증 규격과 실무 가이드북(PDF)을 무료로 받아보세요.
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-[#10B981] text-black text-xs font-bold rounded-lg inline-flex items-center gap-1 shadow-sm">
                  <span>사전진단(무료진단) 바로 시작하기</span>
                  <span>➔</span>
                </span>
                <span className="px-3 py-1.5 border border-white/20 text-gray-200 text-xs font-medium rounded-lg">
                  맞춤 견적 문의
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Published Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
                <CheckCircle className="w-5 h-5" />
                <span>발행 승인 확인</span>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              이 아티클을 <strong className="text-emerald-600">발행(Published)</strong> 상태로 전환하시겠습니까?<br />
              발행 즉시 공개 사이트(<code className="bg-gray-100 px-1 font-mono">quanternity.kr/insights/{slug}</code>)에 라이브 노출됩니다.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-lg"
              >
                취소
              </button>
              <button
                onClick={confirmPublish}
                className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-black text-xs font-bold rounded-lg shadow-sm"
              >
                즉시 라이브 발행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
