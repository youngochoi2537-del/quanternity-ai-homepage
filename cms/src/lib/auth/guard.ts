import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminRole } from '@/lib/types';

/**
 * Ensures the requesting user is authenticated and possesses one of the allowed admin roles.
 * Must strictly use getUser() instead of getSession() as mandated by security guidelines.
 */
export async function requireRole(allowed: AdminRole[]) {
  const supabase = await createClient();

  // 1. Authenticate user securely with getUser()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // 2. Fetch current admin role from DB RPC (current_admin_role)
  const { data: roleData, error: roleError } = await supabase.rpc('current_admin_role');

  const currentRole: AdminRole | null = roleData ? (roleData as AdminRole) : null;

  if (roleError || !currentRole) {
    // If no admin role assigned, sign out and redirect to unauthorized error page
    await supabase.auth.signOut();
    redirect('/auth/error?reason=not_allowed');
  }

  if (allowed.length > 0 && !allowed.includes(currentRole)) {
    redirect('/auth/error?reason=not_allowed');
  }

  return { user, role: currentRole };
}
