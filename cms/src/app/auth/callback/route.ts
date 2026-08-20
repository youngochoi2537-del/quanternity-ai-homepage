import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description') || '';
  const next = searchParams.get('next') ?? '/';

  // 1. Check direct OAuth errors passed via URL
  if (errorParam || errorDescription) {
    if (
      errorDescription.includes('ALLOWLIST_DENIED') ||
      errorDescription.includes('Database error saving new user')
    ) {
      return NextResponse.redirect(`${origin}/auth/error?reason=not_allowed`);
    }
    return NextResponse.redirect(`${origin}/auth/error?reason=oauth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?reason=no_code`);
  }

  const supabase = await createClient();

  // 2. Exchange authorization code for user session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const desc = exchangeError.message || '';
    if (
      desc.includes('ALLOWLIST_DENIED') ||
      desc.includes('Database error saving new user')
    ) {
      return NextResponse.redirect(`${origin}/auth/error?reason=not_allowed`);
    }
    return NextResponse.redirect(`${origin}/auth/error?reason=exchange_failed`);
  }

  // 3. Verify user authentication & admin role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: role, error: rpcError } = await supabase.rpc('current_admin_role');

  const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || 'scoc0505@gmail.com,hludenss@gmail.com,lee.minho0222@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase());

  const isAllowedEmail = user?.email && allowedEmails.includes(user.email.toLowerCase());

  if ((rpcError || !role) && !isAllowedEmail) {
    // If user is not in admin allowlist nor in ALLOWED_ADMIN_EMAILS, sign out and redirect to not_allowed
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth/error?reason=not_allowed`);
  }

  // 4. Record login in admin_audit_log
  if (user) {
    try {
      await supabase.from('admin_audit_log').insert([
        {
          actor_email: user.email,
          action: 'LOGIN',
          entity_type: 'auth',
          entity_id: user.id,
        },
      ]);
    } catch {
      // Ignore if audit log schema differs slightly
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
