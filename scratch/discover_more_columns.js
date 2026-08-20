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
    'contact', 'tel', 'telephone', 'phone_number', 'user_phone', 'hp', 'mobile_phone', 'contact_number', 'contact_phone_number',
    'certs', 'certifications', 'target', 'standards', 'specs', 'target_standards', 'target_standard',
    'type', 'category', 'details', 'content', 'message', 'memo', 'note', 'body'
  ];

  console.log("=== Testing More Candidate Columns ===");
  for (const col of candidateCols) {
    const result = await testColumn(col, 'test');
    const isValid = !(result.json && result.json.code === 'PGRST204');
    if (isValid) {
      console.log(`✔ VALID COLUMN: '${col}' (${result.json.message || result.status})`);
    }
  }
}

discover();
