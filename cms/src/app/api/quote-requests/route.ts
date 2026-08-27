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

    const quoteRecord = {
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
      source_funnel: quoteInfo.sourceFunnel || 'direct'
    };

    // Forward to Supabase leads table for unified CMS management
    try {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mogpgiejwsjdludkomee.supabase.co';
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ3BnaWVqd3NqZGx1ZGtvbWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mjk4NTgsImV4cCI6MjEwMTIwNTg1OH0.td_dAhulUFWCG7lyUZu-qf8Rj4aBOG3O85FeG7llIY4';

      const enrichedUtm = `[견적요청] 희망인증: ${formattedCerts.join(', ')} | 대표자: ${ceoName} | 사업자번호: ${bizRegNo} | 연락처: ${contactPhone} | 유입경로: ${contact.referralSource || '직접'}`;

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
