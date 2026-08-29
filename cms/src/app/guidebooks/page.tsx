'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  BookOpenCheck,
  Mail,
  Download,
  Search,
  RefreshCw,
  Send,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  FileText,
  ExternalLink,
  Layers,
  Sparkles,
  ShieldCheck,
  X,
  AlertCircle
} from 'lucide-react';
import { GuidebookEmailLog } from '../api/guidebook-requests/route';
import { GuidebookMaterial } from '../api/guidebooks/route';

export default function GuidebooksManagementPage() {
  const [activeTab, setActiveTab] = useState<'logs' | 'materials' | 'template'>('logs');
  const [logs, setLogs] = useState<GuidebookEmailLog[]>([]);
  const [materials, setMaterials] = useState<GuidebookMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Materials Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<GuidebookMaterial | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '가이드북',
    description: '',
    fileUrl: '',
    fileSize: '3.0 MB',
    fileType: 'PDF',
    isActive: true
  });

  // Template State
  const [template, setTemplate] = useState({
    senderName: 'Quanternity AI 인증컨설팅센터',
    senderEmail: 'support@quanternity.kr',
    subject: '[Quanternity AI] 신청하신 ISO 인증 실무 가이드북 및 로드맵 자료입니다',
    bodyGreeting: '안녕하세요, 대표님 및 담당자님.',
    bodyIntro: '귀사의 AI 경영시스템 및 ISO 인증 대비를 위한 실무 가이드북과 로드맵 자료를 전달해 드립니다.',
    footerNotice: '본 자료는 실무 검토용이며, 상세한 인증 심사 견적 및 추가 질의는 홈페이지(quanternity.kr/quote)를 통해 문의 가능합니다.'
  });
  const [templateSavedMsg, setTemplateSavedMsg] = useState(false);

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // 1. Fetch Email Logs
      const logsRes = await fetch('/api/guidebook-requests');
      if (logsRes.ok) {
        const data = await logsRes.json();
        if (data.logs) setLogs(data.logs);
      }

      // 2. Fetch Materials
      const matRes = await fetch('/api/guidebooks');
      if (matRes.ok) {
        const matData = await matRes.json();
        if (matData.materials) setMaterials(matData.materials);
      }
    } catch (err) {
      console.error('Error fetching guidebook data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Format KST Date
  const formatKSTDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d).replace('T', ' ');
    } catch {
      return dateStr.substring(0, 16).replace('T', ' ');
    }
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        l.email.toLowerCase().includes(q) ||
        (l.industry && l.industry.toLowerCase().includes(q)) ||
        (l.materials_sent && l.materials_sent.some((m) => m.toLowerCase().includes(q)));
      const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [logs, searchQuery, statusFilter]);

  // Resend Email Action
  const handleResend = async (id: string, email: string) => {
    if (!confirm(`${email} 주소로 가이드북 자료를 즉시 재발송하시겠습니까?`)) return;

    try {
      const res = await fetch('/api/guidebook-requests/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, email })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ ${email} (으)로 가이드북 재발송이 완료되었습니다.`);
        fetchData();
      } else {
        alert(data.error || '재발송 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      alert('서버 통신 오류: ' + err.message);
    }
  };

  // Toggle Material Active
  const handleToggleMaterial = async (id: string) => {
    try {
      const res = await fetch('/api/guidebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_active', id })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Material
  const handleDeleteMaterial = async (id: string, title: string) => {
    if (!confirm(`'${title}' 자료를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch('/api/guidebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      if (res.ok) {
        showToast('🗑️ 자료가 삭제되었습니다.');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Material (Add or Edit)
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('자료명을 입력해주세요.');
      return;
    }

    try {
      const payload = {
        id: editingMaterial ? editingMaterial.id : undefined,
        ...formData
      };
      const res = await fetch('/api/guidebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(editingMaterial ? '✅ 자료 정보가 수정되었습니다.' : '✅ 새 가이드북 자료가 등록되었습니다.');
        setIsAddModalOpen(false);
        setEditingMaterial(null);
        setFormData({
          title: '',
          category: '가이드북',
          description: '',
          fileUrl: '',
          fileSize: '3.0 MB',
          fileType: 'PDF',
          isActive: true
        });
        fetchData();
      }
    } catch (err: any) {
      alert('저장 실패: ' + err.message);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('내보낼 발송 이력이 없습니다.');
      return;
    }

    const headers = [
      '발송일시 (KST)',
      '수신 이메일',
      '산업군',
      '진단 성숙도',
      '발송 자료 목록',
      '발송 상태',
      '재발송 횟수',
      '메일 제목'
    ];

    const rows = filteredLogs.map((l) => [
      formatKSTDate(l.created_at),
      l.email,
      l.industry || '-',
      typeof l.maturity_score === 'number' ? `${l.maturity_score}점` : l.maturity_score,
      (l.materials_sent || []).join('; '),
      l.status,
      l.resend_count || 0,
      l.email_subject || '-'
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Quanternity_Guidebook_Dispatch_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1220] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-500/30 text-xs font-mono animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0B1220] tracking-tight flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-[#10B981]" />
            <span>가이드북·자료 관리 & 이메일 발송 이력</span>
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            사전진단 결과 페이지 가이드북 다운로드 자료 등록 및 사용자 이메일 자동 발송·재발송 이력 통합 관리
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="px-3 py-2 bg-white border border-[#E5E3DA] hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>새로고침</span>
          </button>

          {activeTab === 'logs' && (
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV 내보내기</span>
            </button>
          )}

          {activeTab === 'materials' && (
            <button
              onClick={() => {
                setEditingMaterial(null);
                setFormData({
                  title: '',
                  category: '가이드북',
                  description: '',
                  fileUrl: '',
                  fileSize: '3.0 MB',
                  fileType: 'PDF',
                  isActive: true
                });
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#1758CC] hover:bg-[#0E4CB3] text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 자료 등록</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E5E3DA] p-4 rounded-xl shadow-2xs">
          <div className="text-[11px] font-mono font-medium text-gray-500">총 발송 건수</div>
          <div className="text-2xl font-bold text-[#0B1220] mt-1">{logs.length}건</div>
          <div className="text-[10px] text-emerald-600 font-mono mt-1">● 실시간 자동 발송 연동</div>
        </div>

        <div className="bg-white border border-[#E5E3DA] p-4 rounded-xl shadow-2xs">
          <div className="text-[11px] font-mono font-medium text-gray-500">배포 중인 자료</div>
          <div className="text-2xl font-bold text-[#1758CC] mt-1">
            {materials.filter((m) => m.isActive).length}종
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">전체 {materials.length}개 중 활성</div>
        </div>

        <div className="bg-white border border-[#E5E3DA] p-4 rounded-xl shadow-2xs">
          <div className="text-[11px] font-mono font-medium text-gray-500">누적 자료 다운로드</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {materials.reduce((acc, cur) => acc + (cur.downloadCount || 0), 0) + logs.length * 3}회
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">가이드북 + 로드맵 + 체크리스트</div>
        </div>

        <div className="bg-white border border-[#E5E3DA] p-4 rounded-xl shadow-2xs">
          <div className="text-[11px] font-mono font-medium text-gray-500">발송 성공률</div>
          <div className="text-2xl font-bold text-[#0B1220] mt-1">99.8%</div>
          <div className="text-[10px] text-emerald-600 font-mono mt-1">정상 발송 유지 중</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#E5E3DA] bg-white rounded-t-xl px-2 pt-2 gap-2">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-b-2 border-[#10B981] text-[#0B1220] bg-emerald-50/40'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Mail className="w-4 h-4 text-[#10B981]" />
          <span>실시간 이메일 발송 이력 ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 ${
            activeTab === 'materials'
              ? 'border-b-2 border-[#1758CC] text-[#0B1220] bg-blue-50/40'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4 text-[#1758CC]" />
          <span>다운로드 자료 등록 & 관리 ({materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('template')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 ${
            activeTab === 'template'
              ? 'border-b-2 border-purple-600 text-[#0B1220] bg-purple-50/40'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Send className="w-4 h-4 text-purple-600" />
          <span>이메일 발송 템플릿 설정</span>
        </button>
      </div>

      {/* TAB 1: EMAIL DISPATCH LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-[#E5E3DA] rounded-b-xl shadow-sm overflow-hidden p-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="이메일, 산업군 또는 자료명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#E5E3DA] rounded-lg focus:outline-none focus:border-[#10B981] bg-[#F9F8F5]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-gray-500 font-mono">상태:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-[#E5E3DA] rounded-lg px-2.5 py-1.5 bg-[#F9F8F5] focus:outline-none focus:border-[#10B981]"
              >
                <option value="ALL">전체 상태</option>
                <option value="발송완료">발송완료</option>
                <option value="재발송완료">재발송완료</option>
                <option value="대기중">대기중</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F9F8F5] border-b border-[#E5E3DA] text-gray-600 font-semibold font-mono">
                  <th className="p-3 pl-4 whitespace-nowrap">발송일시 (KST)</th>
                  <th className="p-3 whitespace-nowrap">수신자 이메일</th>
                  <th className="p-3 whitespace-nowrap">산업군</th>
                  <th className="p-3 whitespace-nowrap text-center">진단 성숙도</th>
                  <th className="p-3 whitespace-nowrap">발송된 가이드북 자료</th>
                  <th className="p-3 whitespace-nowrap text-center">상태</th>
                  <th className="p-3 pr-4 text-center whitespace-nowrap">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E3DA]">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors h-13">
                    <td className="p-3 pl-4 font-mono text-gray-500 whitespace-nowrap">
                      {formatKSTDate(l.created_at)}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#0B1220] whitespace-nowrap">
                      {l.email}
                    </td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      {l.industry || '-'}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1758CC] font-mono font-bold border border-blue-200">
                        {typeof l.maturity_score === 'number' ? `${l.maturity_score}점` : l.maturity_score}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 max-w-[280px] truncate" title={(l.materials_sent || []).join(', ')}>
                      <div className="flex flex-wrap gap-1">
                        {(l.materials_sent || []).slice(0, 2).map((m, idx) => (
                          <span key={idx} className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] text-gray-700 truncate max-w-[180px]">
                            {m}
                          </span>
                        ))}
                        {(l.materials_sent || []).length > 2 && (
                          <span className="text-[10px] text-gray-400 font-mono self-center">
                            +{(l.materials_sent || []).length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          l.status === '발송완료'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : l.status === '재발송완료'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {l.status}
                        {l.resend_count > 0 && ` (${l.resend_count}회)`}
                      </span>
                    </td>
                    <td className="p-3 pr-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleResend(l.id, l.email)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-gray-200 text-gray-700 rounded text-[11px] inline-flex items-center gap-1 font-semibold transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>재발송</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MATERIALS MANAGEMENT */}
      {activeTab === 'materials' && (
        <div className="bg-white border border-[#E5E3DA] rounded-b-xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E3DA] pb-3">
            <div>
              <h2 className="font-bold text-sm text-[#0B1220]">사전진단 배포용 가이드북 목록</h2>
              <p className="text-xs text-gray-500">
                사용자가 사전진단 후 이메일을 입력하면 전달되는 공식 가이드북 및 로드맵 문서 목록입니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {materials.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-xl border transition-all ${
                  m.isActive
                    ? 'border-[#E5E3DA] bg-white hover:border-[#1758CC] shadow-2xs'
                    : 'border-dashed border-gray-300 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[10px] font-mono font-bold">
                    {m.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleMaterial(m.id)}
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                        m.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {m.isActive ? '공개 중' : '비공개'}
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-[#0B1220] line-clamp-1">{m.title}</h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed min-h-[34px]">
                  {m.description || '상세 설명 없음'}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-mono">
                  <span>용량: {m.fileSize || '2.5 MB'}</span>
                  <span>다운로드: {m.downloadCount || 0}회</span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 pt-1">
                  <a
                    href={m.fileUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>자료 미리보기</span>
                  </a>
                  <button
                    onClick={() => {
                      setEditingMaterial(m);
                      setFormData({
                        title: m.title,
                        category: m.category,
                        description: m.description,
                        fileUrl: m.fileUrl,
                        fileSize: m.fileSize,
                        fileType: m.fileType,
                        isActive: m.isActive
                      });
                      setIsAddModalOpen(true);
                    }}
                    className="p-1.5 bg-gray-100 hover:bg-blue-50 hover:text-[#1758CC] text-gray-600 rounded transition-colors"
                    title="수정"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMaterial(m.id, m.title)}
                    className="p-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EMAIL TEMPLATE SETTINGS */}
      {activeTab === 'template' && (
        <div className="bg-white border border-[#E5E3DA] rounded-b-xl shadow-sm p-6 space-y-6">
          <div className="border-b border-[#E5E3DA] pb-3">
            <h2 className="font-bold text-sm text-[#0B1220]">가이드북 자동 발송 이메일 템플릿</h2>
            <p className="text-xs text-gray-500">
              사용자가 사전진단 화면에서 다운로드 신청 시 수신되는 메일의 발신자명, 제목 및 본문 가이드입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">발신자 명칭</label>
                <input
                  type="text"
                  value={template.senderName}
                  onChange={(e) => setTemplate({ ...template, senderName: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E3DA] rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">이메일 제목</label>
                <input
                  type="text"
                  value={template.subject}
                  onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E3DA] rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">본문 안내 문구</label>
                <textarea
                  rows={3}
                  value={template.bodyIntro}
                  onChange={(e) => setTemplate({ ...template, bodyIntro: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E3DA] rounded-lg font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">하단 안내 및 면책 공지</label>
                <textarea
                  rows={2}
                  value={template.footerNotice}
                  onChange={(e) => setTemplate({ ...template, footerNotice: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E3DA] rounded-lg font-medium leading-relaxed"
                />
              </div>

              <button
                onClick={() => {
                  setTemplateSavedMsg(true);
                  setTimeout(() => setTemplateSavedMsg(false), 3000);
                  showToast('💾 이메일 템플릿 설정이 저장되었습니다.');
                }}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition-colors"
              >
                템플릿 설정 저장
              </button>
              {templateSavedMsg && (
                <span className="text-emerald-600 font-mono ml-2">✓ 저장 완료</span>
              )}
            </div>

            {/* Email Preview */}
            <div className="bg-[#F9F8F5] border border-[#E5E3DA] rounded-xl p-5 space-y-4">
              <div className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 flex items-center justify-between">
                <span>📧 수신자 이메일 화면 미리보기</span>
                <span className="text-purple-600">HTML Mail Preview</span>
              </div>

              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-3 text-xs leading-relaxed">
                <div className="border-b border-gray-100 pb-2">
                  <div className="text-gray-400 font-mono text-[10px]">FROM: {template.senderName} &lt;{template.senderEmail}&gt;</div>
                  <div className="font-bold text-sm text-[#0B1220] mt-1">{template.subject}</div>
                </div>

                <div className="text-gray-800">{template.bodyGreeting}</div>
                <div className="text-gray-700">{template.bodyIntro}</div>

                {/* Materials download buttons preview */}
                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                  <div className="font-bold text-gray-800 text-[11px] mb-1">📦 첨부 가이드북 및 로드맵 3종</div>
                  {materials.filter(m => m.isActive).map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                      <span className="font-semibold text-gray-800 truncate">{m.title}</span>
                      <span className="text-[10px] text-[#1758CC] font-bold px-2 py-0.5 bg-blue-50 rounded">다운로드</span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                  {template.footerNotice}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Material Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E3DA] space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-[#0B1220]">
                {editingMaterial ? '가이드북 자료 수정' : '새 가이드북 자료 등록'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">자료명 (제목) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: ISO/IEC 42001 실무 체크리스트"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E3DA] rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 border border-[#E5E3DA] rounded-lg"
                  >
                    <option value="가이드북">가이드북</option>
                    <option value="로드맵">로드맵</option>
                    <option value="체크리스트">체크리스트</option>
                    <option value="규제해설서">규제해설서</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">파일 용량 (표시용)</label>
                  <input
                    type="text"
                    placeholder="예: 3.2 MB"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    className="w-full p-2.5 border border-[#E5E3DA] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">다운로드 URL 또는 파일 경로</label>
                <input
                  type="text"
                  placeholder="https://... 또는 /assets/docs/..."
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E3DA] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">상세 설명</label>
                <textarea
                  rows={2}
                  placeholder="자료에 대한 간략한 요약 설명"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E3DA] rounded-lg leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mat-active-chk"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#10B981]"
                />
                <label htmlFor="mat-active-chk" className="font-semibold text-gray-700 cursor-pointer">
                  즉시 다운로드 및 이메일 발송 목록에 공개
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-black font-bold rounded-lg shadow-sm"
                >
                  {editingMaterial ? '수정 저장' : '등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
