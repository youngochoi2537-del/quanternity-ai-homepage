import { NextResponse } from 'next/server';

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

    const record = {
      id: 'guide-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
      email,
      industry: body.industry || '기타',
      maturity_score: body.maturityScore || null
    };

    // Forward to Supabase leads table
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
          industry: body.industry || '기타',
          contact_email: email,
          current_certs: [],
          lead_type: '가이드북 다운로드 신청',
          utm_source: `가이드북 신청 | 성숙도: ${body.maturityScore || '미측정'}점`,
          created_at: record.created_at
        }])
      });
    } catch (dbErr) {
      console.error('Guidebook record sync failed:', dbErr);
    }

    return NextResponse.json(
      { success: true, message: 'Guidebook request received' },
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
