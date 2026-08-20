const SUPABASE_URL = 'https://mogpgiejwsjdludkomee.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ3BnaWVqd3NqZGx1ZGtvbWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mjk4NTgsImV4cCI6MjEwMTIwNTg1OH0.td_dAhulUFWCG7lyUZu-qf8Rj4aBOG3O85FeG7llIY4';

async function testSupabaseRest() {
  console.log("=== Testing Supabase REST API with clean schema payload ===");

  const cleanLead = {
    company_name: '(주)한국인공지능솔루션',
    industry: '의료/바이오 AI',
    contact_email: 'contact@ai-korea.co.kr',
    phone: '010-5555-7777',
    current_certifications: ['ISO/IEC 27001'],
    target_standards: ['ISO/IEC 42001', '한국 AI 기본법'],
    inquiry_type: '고영향 AI 진단 및 42001 통합 구축 컨설팅',
    referral_source: '구글 검색',
    created_at: new Date().toISOString()
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([cleanLead])
    });

    console.log("POST /rest/v1/leads status:", res.status);
    const result = await res.json();
    console.log("POST result:", result);
  } catch (e) {
    console.error("POST error:", e);
  }

  // Fetch all leads after insert
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leads?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const json = await res.json();
    console.log("\nFetched leads count:", Array.isArray(json) ? json.length : json);
    if (Array.isArray(json)) {
      json.forEach(l => console.log(`  - [${l.created_at}] ${l.company_name} | ${l.contact_email} | ${l.phone}`));
    }
  } catch (e) {
    console.error("GET error:", e);
  }
}

testSupabaseRest();
