const SUPABASE_URL = 'https://mogpgiejwsjdludkomee.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ3BnaWVqd3NqZGx1ZGtvbWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mjk4NTgsImV4cCI6MjEwMTIwNTg1OH0.td_dAhulUFWCG7lyUZu-qf8Rj4aBOG3O85FeG7llIY4';

async function testColumn(colName, value) {
  const payload = { [colName]: value };
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
  const json = await res.json();
  return { status: res.status, json };
}

async function discover() {
  const candidateCols = [
    'company_name', 'company',
    'industry',
    'contact_email', 'email',
    'contact_phone', 'phone', 'mobile',
    'current_certifications', 'current_certs',
    'target_standards', 'target_specs',
    'inquiry_type', 'lead_type',
    'referral_source', 'utm_source', 'source',
    'created_at', 'id',
    'diagnosis_step1', 'diagnosis_step2', 'diagnosis_step3', 'diagnosis_score'
  ];

  console.log("=== Testing Candidate Columns on Supabase 'leads' Table ===");
  for (const col of candidateCols) {
    let val = 'test';
    if (col.includes('certs') || col.includes('standards') || col.includes('certifications') || col.includes('specs')) {
      val = ['test'];
    }
    const result = await testColumn(col, val);
    const isValid = !(result.json && result.json.code === 'PGRST204');
    console.log(`Column '${col}': ${isValid ? '✔ VALID COLUMN' : '❌ NOT A COLUMN'} (${result.json.message || result.status})`);
  }
}

discover();
