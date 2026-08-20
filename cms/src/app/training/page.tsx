'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TrainingProgram, EnrollmentStatus } from '@/lib/types';
import { GraduationCap, Plus, Trash2, Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react';

export default function TrainingManagerPage() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [cohortLabel, setCohortLabel] = useState('2026년 9월 3기');
  const [durationLabel, setDurationLabel] = useState('16시간 (2일)');
  const [location, setLocation] = useState('서울 AI 허브 교육장');
  const [capacity, setCapacity] = useState(20);
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>('open');

  const supabase = createClient();

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    setLoading(true);
    const { data } = await supabase.from('training_programs').select('*').order('sort_order', { ascending: true });

    if (data && data.length > 0) {
      setPrograms(data);
    } else {
      // Seed initial mock training programs
      setPrograms([
        {
          id: 't1',
          title: 'ISO/IEC 42001 AI 경영시스템 내부심사원 과정',
          subtitle: '현직 선임심사원 직강 · 실무 문서 서식 및 심사 기법 실습 2일',
          duration_label: '16시간 (2일)',
          cohort_label: '2026년 9월 3기',
          location: '인천 서구 원당대로 876 희림타워 703-19호',
          capacity: 20,
          enrollment_status: 'open',
          sort_order: 1,
          is_active: true,
        },
        {
          id: 't2',
          title: 'AI기본법 & EU AI Act 컴플라이언스 대응 워크숍',
          subtitle: '고영향 AI 위험관리계획 수립 및 기술문서 작성 세미나',
          duration_label: '8시간 (1일)',
          cohort_label: '2026년 10월 1기',
          location: '온라인 라이브 세미나 (Zoom)',
          capacity: 50,
          enrollment_status: 'upcoming',
          sort_order: 2,
          is_active: true,
        },
      ]);
    }
    setLoading(false);
  }

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProgram: Partial<TrainingProgram> = {
      title,
      subtitle,
      cohort_label: cohortLabel,
      duration_label: durationLabel,
      location,
      capacity,
      enrollment_status: enrollmentStatus,
      sort_order: programs.length + 1,
      is_active: true,
    };

    const { data } = await supabase.from('training_programs').insert([newProgram]).select().single();

    if (data) {
      setPrograms([...programs, data]);
    } else {
      setPrograms([
        ...programs,
        {
          id: `temp-${Date.now()}`,
          title,
          subtitle,
          cohort_label: cohortLabel,
          duration_label: durationLabel,
          location,
          capacity,
          enrollment_status: enrollmentStatus,
          sort_order: programs.length + 1,
          is_active: true,
        },
      ]);
    }

    setTitle('');
    setSubtitle('');
    alert('새 교육 과정이 등록되었습니다.');
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('이 교육 과정을 삭제하시겠습니까?')) return;
    await supabase.from('training_programs').delete().eq('id', id);
    setPrograms(programs.filter((p) => p.id !== id));
  };

  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">모집 중 (OPEN)</span>;
      case 'upcoming':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">모집 예정 (UPCOMING)</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">모집 마감 (CLOSED)</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-mono font-bold">종료 (COMPLETED)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0B1220] tracking-tight">교육 일정 관리</h1>
        <p className="text-xs text-gray-500 font-mono mt-0.5">
          ISO 42001 내부심사원 및 AI 거버넌스 실무 교육 트랙 관리
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Add Form */}
        <form onSubmit={handleAddProgram} className="lg:col-span-5 bg-white border border-[#E5E3DA] p-4 rounded-xl shadow-sm space-y-3">
          <div className="font-mono text-xs font-bold text-gray-700">신규 교육 과정 등록</div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">과정명 (Title) *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: ISO/IEC 42001 내부심사원 양성과정"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">부제 및 과정 특징 (Subtitle)</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="예: 실무자 중심 사례 기반 2일 실습"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-gray-600 mb-1">기수 라벨</label>
              <input
                type="text"
                value={cohortLabel}
                onChange={(e) => setCohortLabel(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-600 mb-1">시수 / 기간</label>
              <input
                type="text"
                value={durationLabel}
                onChange={(e) => setDurationLabel(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-gray-600 mb-1">교육 장소</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-600 mb-1">모집 정원 (명)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">모집 상태</label>
            <select
              value={enrollmentStatus}
              onChange={(e) => setEnrollmentStatus(e.target.value as EnrollmentStatus)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold"
            >
              <option value="upcoming">모집 예정 (UPCOMING)</option>
              <option value="open">모집 중 (OPEN)</option>
              <option value="closed">모집 마감 (CLOSED)</option>
              <option value="completed">교육 종료 (COMPLETED)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>교육 과정 등록</span>
          </button>
        </form>

        {/* Right 7 Cols: Program Cards List */}
        <div className="lg:col-span-7 space-y-3">
          {programs.map((prog) => (
            <div key={prog.id} className="bg-white border border-[#E5E3DA] p-4 rounded-xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                {getStatusBadge(prog.enrollment_status)}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">{prog.cohort_label}</span>
                  <button
                    onClick={() => handleDeleteProgram(prog.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-base text-[#0B1220]">{prog.title}</h3>
              {prog.subtitle && <p className="text-xs text-gray-600 leading-relaxed">{prog.subtitle}</p>}

              <div className="pt-2 border-t border-gray-100 flex items-center gap-4 text-xs font-mono text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
                  {prog.duration_label}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                  {prog.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#10B981]" />
                  정원 {prog.capacity}명
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
