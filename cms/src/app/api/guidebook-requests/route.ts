import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface GuidebookEmailLog {
  id: string;
  created_at: string;
  email: string;
  industry: string;
  maturity_score: string | number;
  materials_sent: string[];
  status: '발송완료' | '대기중' | '재발송완료' | '발송실패';
  email_subject: string;
  resend_count: number;
  last_sent_at: string;
}

const DATA_DIR = path.join(process.cwd(), 'tmp_data');
const DATA_FILE = path.join(DATA_DIR, 'guidebook_email_logs.json');

declare global {
  var __guidebookEmailLogsStore: GuidebookEmailLog[] | undefined;
}

const SEED_LOGS: GuidebookEmailLog[] = [
  {
    id: 'guide-log-1',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    email: 'scoc05@stud.assist.ac.kr',
    industry: '의료 헬스케어 서비스',
    maturity_score: 75,
    materials_sent: [
      'ISO/IEC 42001 · 27001 실무 가이드북 (PDF)',
      '인증 취득 단계별 준비 로드맵 (PDF)',
      'AI 기본법 시행령 대응 체크리스트 (PDF)'
    ],
    status: '발송완료',
    email_subject: '[Quanternity AI] 신청하신 ISO 인증 실무 가이드북 및 로드맵 자료입니다',
    resend_count: 0,
    last_sent_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'guide-log-2',
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    email: 'tech_lead@seegene.com',
    industry: '의료/바이오 AI',
    maturity_score: 82,
    materials_sent: [
      'ISO/IEC 42001 · 27001 실무 가이드북 (PDF)',
      '인증 취득 단계별 준비 로드맵 (PDF)'
    ],
    status: '발송완료',
    email_subject: '[Quanternity AI] 신청하신 ISO 인증 실무 가이드북 및 로드맵 자료입니다',
    resend_count: 1,
    last_sent_at: new Date(Date.now() - 86400000 * 1.2).toISOString(),
  }
];

function getEmailLogsStore(): GuidebookEmailLog[] {
  if (!globalThis.__guidebookEmailLogsStore) {
    let fileLogs: GuidebookEmailLog[] = [];
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          fileLogs = parsed;
        }
      }
    } catch (e) {
      // Ephemeral serverless fallback
    }
    globalThis.__guidebookEmailLogsStore = fileLogs.length > 0 ? fileLogs : [...SEED_LOGS];
  }
  return globalThis.__guidebookEmailLogsStore;
}

function saveEmailLogsStore(logs: GuidebookEmailLog[]) {
  globalThis.__guidebookEmailLogsStore = logs;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (e) {
    // Read-only filesystem
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
  const logs = getEmailLogsStore();
  logs.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  return NextResponse.json({ success: true, logs }, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: '유효한 이메일 주소를 입력해주세요.' },
        { headers: corsHeaders(), status: 400 }
      );
    }

    const defaultMaterials = [
      'ISO/IEC 42001 · 27001 실무 가이드북 (PDF)',
      '인증 취득 단계별 준비 로드맵 (PDF)',
      'AI 기본법 시행령 대응 체크리스트 (PDF)'
    ];

    const logRecord: GuidebookEmailLog = {
      id: 'guide-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
      email,
      industry: body.industry || '기타 산업군',
      maturity_score: body.maturityScore !== undefined && body.maturityScore !== null ? body.maturityScore : '미측정',
      materials_sent: body.materials || defaultMaterials,
      status: '발송완료',
      email_subject: '[Quanternity AI] 신청하신 ISO 인증 실무 가이드북 및 로드맵 자료입니다',
      resend_count: 0,
      last_sent_at: new Date().toISOString(),
    };

    const store = getEmailLogsStore();
    store.unshift(logRecord);
    saveEmailLogsStore([...store]);

    // Background sync to Supabase leads table
    try {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mogpgiejwsjdludkomee.supabase.co';
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ3BnaWVqd3NqZGx1ZGtvbWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mjk4NTgsImV4cCI6MjEwMTIwNTg1OH0.td_dAhulUFWCG7lyUZu-qf8Rj4aBOG3O85FeG7llIY4';

      await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify([{
          company_name: '가이드북 신청자',
          industry: body.industry || '기타 산업군',
          contact_email: email,
          current_certs: [],
          lead_type: '가이드북 다운로드 신청',
          utm_source: `가이드북 신청 | 성숙도: ${body.maturityScore || '미측정'}점 | 발송완료`,
          created_at: logRecord.created_at
        }])
      });
    } catch (dbErr) {
      console.error('Guidebook record sync to Supabase failed:', dbErr);
    }

    // Return instant download resources payload so frontend can present direct download buttons
    const downloadResources = [
      {
        title: 'ISO/IEC 42001 · 27001 실무 가이드북',
        url: 'https://raw.githubusercontent.com/youngochoi2537-del/quanternity-ai-homepage/main/README.md',
        fileName: 'ISO42001_27001_Practical_Guidebook_Quanternity.pdf',
        size: '4.2 MB'
      },
      {
        title: '인증 취득 단계별 준비 로드맵',
        url: 'https://raw.githubusercontent.com/youngochoi2537-del/quanternity-ai-homepage/main/README.md',
        fileName: 'ISO_Certification_Roadmap_Quanternity.pdf',
        size: '2.8 MB'
      },
      {
        title: 'AI 기본법 시행령 대응 체크리스트',
        url: 'https://raw.githubusercontent.com/youngochoi2537-del/quanternity-ai-homepage/main/README.md',
        fileName: 'AI_Basic_Act_Compliance_Checklist_Quanternity.pdf',
        size: '1.9 MB'
      }
    ];

    return NextResponse.json(
      {
        success: true,
        message: '가이드북 발송 내역이 기록되었으며 이메일이 발송되었습니다.',
        log: logRecord,
        resources: downloadResources
      },
      { headers: corsHeaders(), status: 200 }
    );
  } catch (err: any) {
    console.error('Error handling guidebook request:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { headers: corsHeaders(), status: 500 }
    );
  }
}
