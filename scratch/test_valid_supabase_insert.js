const SUPABASE_URL = 'https://mogpgiejwsjdludkomee.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ3BnaWVqd3NqZGx1ZGtvbWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mjk4NTgsImV4cCI6MjEwMTIwNTg1OH0.td_dAhulUFWCG7lyUZu-qf8Rj4aBOG3O85FeG7llIY4';

async function testInsert() {
  const payload = {
    company_name: '테스트확인기업',
    industry: '의료/바이오 AI',
    contact_email: 'test@quanternity.kr',
    current_certs: ['ISO/IEC 27001'],
    lead_type: '고영향 AI, 한국 AI 기본법',
    utm_source: '연락처: 010-1234-5678 | 구글 검색',
    created_at: new Date().toISOString()
  };

  console.log("=== Testing Supabase Insert Payload ===");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify([payload])
  });

  console.log("Status:", res.status);
  const json = await res.json();
  console.log("Response:", json);
}

testInsert();
