import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GuidebookEmailLog } from '../route';

const DATA_DIR = path.join(process.cwd(), 'tmp_data');
const DATA_FILE = path.join(DATA_DIR, 'guidebook_email_logs.json');

declare global {
  var __guidebookEmailLogsStore: GuidebookEmailLog[] | undefined;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;
    const email = body.email;

    if (!id && !email) {
      return NextResponse.json({ success: false, error: '식별자 또는 이메일이 필요합니다.' }, { headers: corsHeaders(), status: 400 });
    }

    const store = globalThis.__guidebookEmailLogsStore || [];
    const item = store.find((l) => (id && l.id === id) || (email && l.email === email));

    if (item) {
      item.status = '재발송완료';
      item.resend_count = (item.resend_count || 0) + 1;
      item.last_sent_at = new Date().toISOString();

      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
      } catch (e) {
        // Ephemeral fs
      }

      return NextResponse.json({
        success: true,
        message: `${item.email} 주소로 가이드북이 성공적으로 재발송되었습니다.`,
        log: item
      }, { headers: corsHeaders() });
    }

    return NextResponse.json({ success: false, error: '해당 발송 이력을 찾을 수 없습니다.' }, { headers: corsHeaders(), status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { headers: corsHeaders(), status: 500 });
  }
}
