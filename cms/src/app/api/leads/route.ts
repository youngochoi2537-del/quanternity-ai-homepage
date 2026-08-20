import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'tmp_data');
const DATA_FILE = path.join(DATA_DIR, 'submitted_leads.json');

// Global server-side process memory store (Guarantees memory persistence across serverless invocations)
declare global {
  var __leadStore: any[] | undefined;
}

function getMemoryStore(): any[] {
  if (!globalThis.__leadStore) {
    globalThis.__leadStore = [];
  }
  return globalThis.__leadStore;
}

function ensureStoreExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
    }
  } catch (e) {
    // Ephemeral fs on serverless
  }
}

export function isTestOrIncompleteLead(lead: any): boolean {
  const co = String(lead.company_name || lead.company || '').trim().toLowerCase();
  const email = String(lead.contact_email || lead.email || '').trim().toLowerCase();
  const phone = String(lead.contact_phone || lead.phone || '').trim().toLowerCase();

  // Exclude if company name is 'test', '미입력', empty, or test variant
  if (!co || co === '미입력' || co === 'test' || co.startsWith('test') || co === 'test_company') {
    return true;
  }
  // Exclude if email is 'test', empty, or dummy test domain
  if (!email || email === 'test' || email.includes('@test.com') || email.includes('@example.com')) {
    return true;
  }
  // Exclude if phone is empty or dummy
  if (!phone || phone === 'test' || phone === '010-0000-0000') {
    return true;
  }
  return false;
}

function readStoredLeads(): any[] {
  const mem = getMemoryStore();
  let fileLeads: any[] = [];
  try {
    ensureStoreExists();
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        fileLeads = parsed;
      }
    }
  } catch (err) {
    // Ignore read error on read-only serverless fs
  }

  // Combine memory and file leads without duplicates
  const map = new Map<string, any>();
  [...mem, ...fileLeads].forEach((l) => {
    if (l && l.id && !isTestOrIncompleteLead(l)) {
      map.set(l.id, l);
    }
  });

  const combined = Array.from(map.values());
  combined.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  return combined;
}

function writeStoredLeads(lead: any) {
  const mem = getMemoryStore();
  mem.unshift(lead);
  try {
    ensureStoreExists();
    fs.writeFileSync(DATA_FILE, JSON.stringify(mem, null, 2), 'utf-8');
  } catch (err) {
    // Ignore write error on read-only serverless fs
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
  const leads = readStoredLeads();
  return NextResponse.json({ leads }, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const company_name = String(body.company_name || body.company || '').trim();
    const industry = String(body.industry || '').trim();
    const contact_email = String(body.contact_email || body.email || '').trim();
    const contact_phone = String(body.contact_phone || body.phone || '').trim();

    // Reject test or incomplete submissions
    if (isTestOrIncompleteLead({ company_name, industry, contact_email, contact_phone })) {
      return NextResponse.json(
        {
          success: false,
          error: '테스트 및 미입력 문의는 CMS에 기록되지 않습니다. 모든 항목을 올바르게 기입해 주세요.',
        },
        { headers: corsHeaders(), status: 400 }
      );
    }

    const current_certifications = Array.isArray(body.current_certifications) && body.current_certifications.length > 0
      ? body.current_certifications
      : typeof body.current_certifications === 'string' && body.current_certifications.trim()
      ? [body.current_certifications.trim()]
      : Array.isArray(body.current_certs) && body.current_certs.length > 0
      ? body.current_certs
      : ['없음'];

    const target_standards = Array.isArray(body.target_standards) && body.target_standards.length > 0
      ? body.target_standards
      : typeof body.target_standards === 'string' && body.target_standards.trim()
      ? [body.target_standards.trim()]
      : Array.isArray(body.target_specs) && body.target_specs.length > 0
      ? body.target_specs
      : ['ISO/IEC 42001'];

    const inquiry_type = String(body.inquiry_type || body.lead_type || '고영향 AI').trim();
    const referral_source = String(body.referral_source || body.source || body.utm_source || '구글 검색').trim();

    const newLead = {
      id: 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      created_at: body.created_at || new Date().toISOString(),
      company_name,
      industry,
      contact_email,
      contact_phone,
      phone: contact_phone,
      current_certifications,
      current_certs: current_certifications,
      target_standards,
      target_specs: target_standards,
      inquiry_type,
      lead_type: inquiry_type,
      referral_source,
      utm_source: referral_source,
      diagnosis_step1: body.diagnosis_step1 || '',
      diagnosis_step2: body.diagnosis_step2 || '',
      diagnosis_step3: body.diagnosis_step3 || '',
      diagnosis_score: body.diagnosis_score || '',
    };

    writeStoredLeads(newLead);

    // Also background sync valid fields to Supabase DB
    try {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mogpgiejwsjdludkomee.supabase.co';
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ3BnaWVqd3NqZGx1ZGtvbWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mjk4NTgsImV4cCI6MjEwMTIwNTg1OH0.td_dAhulUFWCG7lyUZu-qf8Rj4aBOG3O85FeG7llIY4';

      const enrichedUtmSource = contact_phone
        ? `${referral_source} | 연락처: ${contact_phone}`
        : referral_source;

      const dbPayload = {
        company_name,
        industry,
        contact_email,
        current_certs: current_certifications,
        lead_type: inquiry_type,
        utm_source: enrichedUtmSource,
        created_at: newLead.created_at
      };

      const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify([dbPayload])
      });

      if (!dbRes.ok) {
        const dbErrText = await dbRes.text();
        console.error('Supabase DB background sync failed:', dbRes.status, dbErrText);
      }
    } catch (dbErr) {
      console.error('Supabase DB background sync exception:', dbErr);
    }

    return NextResponse.json(
      { success: true, message: 'Inquiry recorded successfully', lead: newLead },
      { headers: corsHeaders(), status: 200 }
    );
  } catch (error: any) {
    console.error('Error handling lead submission:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { headers: corsHeaders(), status: 500 }
    );
  }
}
