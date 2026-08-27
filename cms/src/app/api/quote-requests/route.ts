import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { QuoteRequest } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'tmp_data');
const QUOTES_FILE = path.join(DATA_DIR, 'submitted_quotes.json');

declare global {
  var __quoteStore: QuoteRequest[] | undefined;
}

function getMemoryStore(): QuoteRequest[] {
  if (!globalThis.__quoteStore) {
    globalThis.__quoteStore = [];
  }
  return globalThis.__quoteStore;
}

function ensureStoreExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(QUOTES_FILE)) {
      fs.writeFileSync(QUOTES_FILE, JSON.stringify([]), 'utf-8');
    }
  } catch (e) {
    // Ephemeral fs on serverless
  }
}

function readStoredQuotes(): QuoteRequest[] {
  const mem = getMemoryStore();
  let fileQuotes: QuoteRequest[] = [];
  try {
    ensureStoreExists();
    if (fs.existsSync(QUOTES_FILE)) {
      const data = fs.readFileSync(QUOTES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        fileQuotes = parsed;
      }
    }
  } catch (err) {
    // Ignore read error on read-only serverless fs
  }

  const map = new Map<string, QuoteRequest>();
  [...mem, ...fileQuotes].forEach((q) => {
    if (q && q.id) {
      map.set(q.id, q);
    }
  });

  let combined = Array.from(map.values());

  // Default sample seed quotes if empty so administrator can immediately preview UI
  if (combined.length === 0) {
    combined = [
      {
        id: 'quote-sample-1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        company_name: '(주)메디바이브 AI',
        ceo_name: '홍길동',
        biz_reg_no: '120-81-47521',
        industry: '의료기기·체외진단(IVD)',
        employee_count: 45,
        sites: [
          { id: '1', name: '본사 (R&D)', postcode: '06236', address: '서울특별시 강남구 테헤란로 152', addressDetail: '12층' },
          { id: '2', name: '오송 제1공장 (제조/품질)', postcode: '28160', address: '충청북도 청주시 흥덕구 오송읍 오송생명1로 194', addressDetail: '동관 3층' }
        ],
        main_product: 'AI 기반 폐암 조기 진단 보조 소프트웨어 (SaMD)',
        contact_name: '김민수',
        contact_phone: '010-3849-2810',
        contact_email: 'mskim@medivibe.ai',
        referral_source: '인증 추천 퍼널 (/recommend)',
        note: '2026년 하반기 FDA 510(k) 및 국내 식약처 3등급 허가 심사를 앞두고 ISO 13485와 ISO 42001 통합 구축이 시급합니다. 견적서 및 심사원 파견 일정 회신 부탁드립니다.',
        target_standards: ['ISO 27001', 'ISO 42001', 'ISO 13485'],
        target_date: '3~6개월 이내 (하반기 인증 완료 희망)',
        has_existing_cert: true,
        existing_certs: ['ISO 27001'],
        source_funnel: 'recommend',
        status: '접수완료'
      },
      {
        id: 'quote-sample-2',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        company_name: '(주)넥스트코어 로보틱스',
        ceo_name: '이진우',
        biz_reg_no: '214-88-12345',
        industry: 'IT·소프트웨어·AI·플랫폼',
        employee_count: 120,
        sites: [
          { id: '1', name: '판교 통합 본사', postcode: '13487', address: '경기도 성남시 분당구 대왕판교로 645번길 12', addressDetail: '넥스트타워 7층' }
        ],
        main_product: '물류 자율주행 AGV 로봇 제어 AI 시스템',
        contact_name: '박서연 팀장',
        contact_phone: '010-8293-1049',
        contact_email: 'sypark@nextcore-robotics.com',
        referral_source: '사전진단 퍼널 (/diagnosis)',
        note: '공공 입찰 참여 요건 충족을 위해 ISO/IEC 42001 및 9001 견적이 필요합니다. FieldProof 증적 솔루션 도입 견적도 함께 포함해 주세요.',
        target_standards: ['ISO 42001', 'ISO 9001'],
        target_date: '1~3개월 이내 (신속 심사 희망)',
        has_existing_cert: false,
        existing_certs: [],
        source_funnel: 'diagnosis',
        status: '검토중'
      }
    ];
  }

  combined.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  return combined;
}

function writeStoredQuote(quote: QuoteRequest) {
  const mem = getMemoryStore();
  mem.unshift(quote);
  try {
    ensureStoreExists();
    fs.writeFileSync(QUOTES_FILE, JSON.stringify(mem, null, 2), 'utf-8');
  } catch (err) {
    // Ignore write error on read-only serverless fs
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
  const quotes = readStoredQuotes();
  return NextResponse.json({ quotes }, { headers: corsHeaders() });
}

// Checksum validation on server side (§10 & §11)
function validateBizRegNoServer(bizNo: string): boolean {
  if (!bizNo) return false;
  const clean = String(bizNo).replace(/[^0-9]/g, '');
  if (clean.length !== 10) return false;

  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i], 10) * weights[i];
  }

  sum += Math.floor((parseInt(clean[8], 10) * 5) / 10);
  const remainder = (10 - (sum % 10)) % 10;

  return remainder === parseInt(clean[9], 10);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const company = body.company || {};
    const contact = body.contact || {};
    const quoteInfo = body.quoteInfo || {};

    const companyName = String(company.companyName || '').trim();
    const ceoName = String(company.ceoName || '').trim();
    const bizRegNo = String(company.bizRegNo || '').trim();
    const industry = String(company.industry || '').trim();
    const contactName = String(contact.name || '').trim();
    const contactEmail = String(contact.email || '').trim();
    const contactPhone = String(contact.phone || '').trim();

    // Server-side validation
    if (!companyName || !ceoName || !bizRegNo || !industry || !contactName || !contactEmail || !contactPhone) {
      return NextResponse.json(
        { success: false, error: '필수 입력 항목이 누락되었습니다.' },
        { headers: corsHeaders(), status: 400 }
      );
    }

    if (!validateBizRegNoServer(bizRegNo)) {
      return NextResponse.json(
        { success: false, error: '사업자등록번호가 유효하지 않습니다.' },
        { headers: corsHeaders(), status: 400 }
      );
    }

    const targetCerts = Array.isArray(quoteInfo.targetCerts) ? quoteInfo.targetCerts : [];
    const formattedCerts = targetCerts.map((c: string) => `ISO ${c}`);

    const quoteRecord: QuoteRequest = {
      id: 'quote-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
      company_name: companyName,
      ceo_name: ceoName,
      biz_reg_no: bizRegNo,
      industry: industry,
      employee_count: company.employeeCount || 0,
      sites: company.sites || [],
      main_product: company.mainProduct || '',
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      referral_source: contact.referralSource || '직접 유입',
      note: contact.note || '',
      target_standards: formattedCerts,
      target_date: quoteInfo.targetDate || '미정',
      has_existing_cert: quoteInfo.hasExistingCert || false,
      existing_certs: quoteInfo.existingCerts || [],
      source_funnel: quoteInfo.sourceFunnel || 'direct',
      status: '접수완료'
    };

    writeStoredQuote(quoteRecord);

    // Forward to Supabase leads table for unified CMS management
    try {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mogpgiejwsjdludkomee.supabase.co';
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ3BnaWVqd3NqZGx1ZGtvbWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mjk4NTgsImV4cCI6MjEwMTIwNTg1OH0.td_dAhulUFWCG7lyUZu-qf8Rj4aBOG3O85FeG7llIY4';

      const siteAddresses = (quoteRecord.sites || []).map(s => `${s.name}: ${s.address || ''} ${s.addressDetail || ''}`).join(' / ');
      const enrichedUtm = `[견적요청] 희망인증: ${formattedCerts.join(', ')} | 대표: ${ceoName} | 사업자: ${bizRegNo} | 임직원: ${quoteRecord.employee_count}명 | 연락처: ${contactPhone} | 사업장: ${siteAddresses}`;

      await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify([{
          company_name: companyName,
          industry: industry,
          contact_email: contactEmail,
          current_certs: quoteRecord.existing_certs,
          lead_type: `견적요청 (${formattedCerts.join(', ')})`,
          utm_source: enrichedUtm,
          created_at: quoteRecord.created_at
        }])
      });
    } catch (dbErr) {
      console.error('Quote record sync failed:', dbErr);
    }

    return NextResponse.json(
      { success: true, message: 'Quote request accepted successfully', quoteId: quoteRecord.id },
      { headers: corsHeaders(), status: 200 }
    );
  } catch (err: any) {
    console.error('Error handling quote request:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { headers: corsHeaders(), status: 500 }
    );
  }
}
