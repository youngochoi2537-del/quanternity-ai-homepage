// =============================================================
// Quanternity AI — Public Site Dynamic CMS Integration (§6.2)
// Fetches dynamic published content from Supabase with static fallback
// =============================================================

(function () {
  const SUPABASE_URL = window.NEXT_PUBLIC_SUPABASE_URL || 'https://mogpgiejwsjdludkomee.supabase.co';
  const SUPABASE_ANON_KEY = window.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ3BnaWVqd3NqZGx1ZGtvbWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mjk4NTgsImV4cCI6MjEwMTIwNTg1OH0.td_dAhulUFWCG7lyUZu-qf8Rj4aBOG3O85FeG7llIY4';

  if (!window.supabase) {
    console.log('[CMS Loader] Using static HTML fallback mode.');
    return;
  }

  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Fetch Dynamic NOTICE Bar Banner
  async function loadNoticeBanner() {
    try {
      const { data: notice } = await sb
        .from('site_banners')
        .select('*')
        .eq('placement', 'notice_bar')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (notice) {
        const announcementText = document.querySelector('.hero-announcement span');
        if (announcementText) {
          announcementText.textContent = notice.headline;
        }
      }
    } catch (e) {
      console.warn('[CMS Loader] Notice banner fallback:', e);
    }
  }

  // 2. Fetch Dynamic Regulation Mappings
  async function loadRegulationMappings(regCode) {
    try {
      const { data: mappings } = await sb
        .from('regulation_mappings')
        .select('*, regulations!inner(code)')
        .eq('regulations.code', regCode || 'ai_basic_act')
        .order('sort_order', { ascending: true });

      if (mappings && mappings.length > 0) {
        const tbody = document.getElementById('reg-table-body');
        if (tbody) {
          tbody.innerHTML = mappings
            .map(
              (m) => `
            <tr>
              <td><strong>${m.standard_name}</strong></td>
              <td><a href="#services" style="color: var(--signal-700); text-decoration: none;">${m.clause_ref}</a></td>
              <td><strong>${m.control_name}</strong></td>
              <td>${m.match_description || '-'}</td>
            </tr>
          `
            )
            .join('');
        }
      }
    } catch (e) {
      console.warn('[CMS Loader] Regulation mappings fallback:', e);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadNoticeBanner();
  });
})();
