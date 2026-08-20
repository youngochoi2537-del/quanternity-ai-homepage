const SUPABASE_URL = 'https://mogpgiejwsjdludkomee.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ3BnaWVqd3NqZGx1ZGtvbWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mjk4NTgsImV4cCI6MjEwMTIwNTg1OH0.td_dAhulUFWCG7lyUZu-qf8Rj4aBOG3O85FeG7llIY4';

async function inspectSchema() {
  // 1. Post empty object to trigger PostgREST schema error or OpenAPI schema
  const res = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_ANON_KEY}`);
  const openapi = await res.json();

  if (openapi.definitions && openapi.definitions.leads) {
    console.log("=== Supabase 'leads' Table Schema Properties ===");
    console.log(Object.keys(openapi.definitions.leads.properties));
  } else {
    console.log("OpenAPI definitions:", Object.keys(openapi.definitions || {}));
  }
}

inspectSchema();
