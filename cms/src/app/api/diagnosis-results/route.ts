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
    const step1 = body.step1 || {};
    const result = body.result || {};

    const record = {
      id: 'diag-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
      industry: step1.industry || '',
      org_type: step1.orgType || '',
      employee_size: step1.employeeSize || '',
      business_age: step1.businessAge || '',
      maturity_score: result.maturityScore || 0,
      tier: result.tier || 'MID',
      estimated_period: result.summary?.estimatedPeriod || '3~5개월'
    };

    return NextResponse.json(
      { success: true, message: 'Diagnosis result recorded', recordId: record.id },
      { headers: corsHeaders(), status: 200 }
    );
  } catch (err: any) {
    console.error('Error handling diagnosis record:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { headers: corsHeaders(), status: 500 }
    );
  }
}
