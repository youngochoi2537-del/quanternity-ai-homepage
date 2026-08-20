'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import InsightEditor from '@/components/insight-editor';
import { Insight } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function EditInsightPage() {
  const params = useParams();
  const id = params?.id as string;
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadInsight() {
      if (!id) return;
      const { data } = await supabase.from('insights').select('*').eq('id', id).single();
      if (data) {
        setInsight(data);
      } else {
        // Mock fallback if demo item
        setInsight({
          id,
          slug: 'high-impact-ai-criteria',
          title: '고영향 AI 사업자, 하위법령이 요구하는 세부 관리 기준',
          category: 'AI기본법',
          summary: '2026년 1월 시행된 AI기본법 하위법령에 따른 고영향 인공지능 사업자의 위험관리계획 수립 및 안전성 확보 조치 가이드라인.',
          body_md: `# 고영향 AI 사업자, 하위법령이 요구하는 세부 관리 기준

> 기준일: 2026년 7월 31일

「인공지능 발전과 신뢰 기반 조성 등에 관한 기본법」, 이른바 AI기본법은 2026년 1월 22일부터 시행되었다.

AI기본법에서 말하는 **‘고영향 인공지능’**은 보건의료, 에너지, 먹는 물, 원자력, 교통, 교육, 채용·대출 등 국민의 생명·신체 안전이나 기본권에 중대한 영향을 미칠 수 있는 영역에서 사용되는 AI를 의미한다.

## 1. 고영향 AI 사업자의 4대 의무

1. **위험관리계획 수립 및 이행** (ISO/IEC 42001 조항 6.1.4 연계)
2. **신뢰성·안전성 확보 조치** (품질 데이터 확보, 모니터링)
3. **설명가능성 및 투명성 보장** (사용자 고지 및 생성형 AI 표시)
4. **문서화 및 관리 실태 보고**`,
          read_minutes: 6,
          status: 'published',
          published_at: new Date().toISOString(),
          author_name: 'Quanternity AI',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      setLoading(false);
    }

    loadInsight();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-mono text-xs gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
        <span>인사이트 데이터를 불러오는 중...</span>
      </div>
    );
  }

  return <InsightEditor initialData={insight || undefined} isNew={false} />;
}
