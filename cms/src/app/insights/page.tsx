'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Insight, InsightStatus } from '@/lib/types';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function InsightsListPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<Insight[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | InsightStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchInsights();
  }, []);

  async function fetchInsights() {
    setLoading(true);
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setInsights(data);
    } else {
      // Seed fallback mock list if database empty
      const initialMock: Insight[] = [
        {
          id: '1',
          slug: 'high-impact-ai-criteria',
          title: '고영향 AI 사업자, 하위법령이 요구하는 세부 관리 기준',
          category: 'AI기본법',
          summary: '2026년 1월 시행된 AI기본법 하위법령에 따른 고영향 인공지능 사업자의 위험관리계획 수립 및 안전성 확보 조치 가이드라인.',
          body_md: '# 고영향 AI 사업자...',
          read_minutes: 6,
          status: 'published',
          published_at: new Date().toISOString(),
          author_name: 'Quanternity AI',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          slug: 'gpai-document-checklist',
          title: '생성형 AI (GPAI) 거버넌스 구축 시 필수 작성 문서 5종',
          category: 'EU AI Act',
          summary: '범용 인공지능(GPAI) 모델 및 애플리케이션 도입 시 필수 작성 증적 5종 체크리스트.',
          body_md: '# 생성형 AI (GPAI)...',
          read_minutes: 8,
          status: 'published',
          published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          author_name: 'Quanternity AI',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          slug: 'iso42001-dpia-integration',
          title: 'ISO/IEC 42001과 개인정보 영향평가(DPIA)의 통합 연계 방안',
          category: 'ISO 42001',
          summary: 'ISO 27001 및 ISMS-P 위에 ISO/IEC 42001 통제를 효율적으로 확장하는 이중 프레임워크 설계법.',
          body_md: '# ISO/IEC 42001...',
          read_minutes: 7,
          status: 'published',
          published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          author_name: 'Quanternity AI',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setInsights(initialMock);
    }
    setLoading(false);
  }

  useEffect(() => {
    let result = [...insights];

    if (activeTab !== 'all') {
      result = result.filter((item) => item.status === activeTab);
    }

    if (categoryFilter !== 'all') {
      result = result.filter((item) => item.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) => item.title.toLowerCase().includes(q) || item.summary?.toLowerCase().includes(q)
      );
    }

    setFilteredInsights(result);
  }, [insights, activeTab, categoryFilter, searchQuery]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`정말로 '${title}' 아티클을 삭제하시겠습니까?`)) return;

    const { error } = await supabase.from('insights').delete().eq('id', id);
    if (error) {
      alert(`삭제 오류: ${error.message}`);
    } else {
      setInsights((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleStatusChange = async (id: string, newStatus: InsightStatus) => {
    const { error } = await supabase
      .from('insights')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (error) {
      alert(`상태 변경 오류: ${error.message}`);
    } else {
      setInsights((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & New Article Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0B1220] tracking-tight">인사이트 관리</h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            규제 브리핑 및 거버넌스 칼럼 아티클 작성·편집·발행
          </p>
        </div>
        <Link
          href="/insights/new"
          className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-black font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>새 인사이트 작성</span>
        </Link>
      </div>

      {/* Filter Toolbar: Status Tabs + Search + Category */}
      <div className="bg-white border border-[#E5E3DA] p-4 rounded-xl shadow-sm space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: '전체' },
              { id: 'published', label: '발행됨 (Published)' },
              { id: 'draft', label: '초안 (Draft)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0B1220] text-white font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-gray-500">
            총 <span className="font-bold text-[#0B1220]">{filteredInsights.length}</span> 건 표시 중
          </div>
        </div>

        {/* Search & Category Filter Input */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목 또는 요약 검색..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-[#0B1220] focus:outline-none focus:border-[#10B981]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-[#0B1220] focus:outline-none focus:border-[#10B981]"
            >
              <option value="all">전체 카테고리</option>
              <option value="AI기본법">AI기본법</option>
              <option value="EU AI Act">EU AI Act</option>
              <option value="ISO 42001">ISO 42001</option>
              <option value="ISO 27001">ISO 27001</option>
              <option value="ISMS-P">ISMS-P</option>
              <option value="현장노트">현장노트</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table List (High Density 44px rows) */}
      <div className="bg-white border border-[#E5E3DA] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F9F8F5] border-b border-[#E5E3DA] text-gray-500 font-mono">
                <th className="p-3 pl-4">상태</th>
                <th className="p-3">카테고리</th>
                <th className="p-3">제목 / Slug</th>
                <th className="p-3">예상 시간</th>
                <th className="p-3">발행일</th>
                <th className="p-3 text-right pr-4">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E3DA]">
              {filteredInsights.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 font-mono text-xs">
                    조건에 해당하는 인사이트 아티클이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredInsights.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors h-12">
                    <td className="p-3 pl-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          item.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-medium text-gray-700">
                      <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 max-w-lg">
                      <div className="font-semibold text-[#0B1220] truncate">{item.title}</div>
                      <div className="text-[11px] text-gray-400 font-mono truncate">
                        /insights/{item.slug}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-gray-600">{item.read_minutes}분</td>
                    <td className="p-3 font-mono text-gray-500">
                      {item.published_at ? item.published_at.substring(0, 10) : '-'}
                    </td>
                    <td className="p-3 text-right pr-4 space-x-1">
                      <Link
                        href={`/insights/${item.id}`}
                        className="px-2 py-1 bg-gray-100 hover:bg-[#0B1220] hover:text-white rounded text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>편집</span>
                      </Link>

                      <a
                        href={`https://quanternity.kr/insights/post.html?slug=${encodeURIComponent(item.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-800 hover:text-white rounded text-xs transition-colors inline-flex items-center gap-1 text-gray-700"
                      >
                        <Eye className="w-3 h-3" />
                        <span>보기</span>
                      </a>

                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="px-2 py-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
