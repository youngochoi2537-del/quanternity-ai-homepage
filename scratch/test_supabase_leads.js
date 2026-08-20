const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mogpgiejwsjdludkomee.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ3BnaWVqd3NqZGx1ZGtvbWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mjk4NTgsImV4cCI6MjEwMTIwNTg1OH0.td_dAhulUFWCG7lyUZu-qf8Rj4aBOG3O85FeG7llIY4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkLeadsTable() {
  console.log("=== Testing Supabase DB 'leads' table ===");

  // 1. Fetch leads
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

  if (error) {
    console.error("❌ Error fetching leads from Supabase:", error);
  } else {
    console.log(`✔ Successfully fetched ${data.length} leads from Supabase DB:`);
    data.forEach(l => console.log(`  - [${l.created_at}] ${l.company_name} | ${l.contact_email} | ${l.phone || l.contact_phone}`));
  }

  // 2. Test inserting a lead into Supabase DB
  const testLead = {
    company_name: '테스트검증기업',
    industry: '의료/바이오 AI',
    contact_email: 'verifier@testdomain.com',
    contact_phone: '010-8888-9999',
    phone: '010-8888-9999',
    current_certifications: ['ISO/IEC 27001'],
    target_standards: ['ISO/IEC 42001', '한국 AI 기본법'],
    inquiry_type: '고영향 AI 진단 및 42001 통합 구축 컨설팅',
    referral_source: '구글 검색',
    created_at: new Date().toISOString()
  };

  const { data: inserted, error: insertErr } = await supabase.from('leads').insert([testLead]).select();
  if (insertErr) {
    console.error("❌ Error inserting into Supabase DB:", insertErr);
  } else {
    console.log("✔ Successfully inserted test lead into Supabase DB:", inserted);
  }
}

checkLeadsTable();
