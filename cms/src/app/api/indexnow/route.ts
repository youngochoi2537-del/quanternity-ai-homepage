import { NextResponse } from 'next/server';
import { sendIndexNow } from '@/lib/indexnow';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const urls = body.urls || body.urlList || [];

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload: "urls" must be a non-empty array' },
        { status: 400 }
      );
    }

    const result = await sendIndexNow(urls);
    return NextResponse.json(result, { status: result.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
