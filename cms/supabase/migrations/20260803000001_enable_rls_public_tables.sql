-- =============================================================
-- Migration: 20260803000001_enable_rls_public_tables.sql
-- Description: Enable RLS and apply cms_read / cms_write policy pattern for all public schema tables
-- Note: DO NOT EXECUTE AUTOMATICALY - MIGRATION FILE CREATION ONLY
-- =============================================================

-- -------------------------------------------------------------
-- 1. INSIGHTS TABLE
-- -------------------------------------------------------------
ALTER TABLE IF EXISTS public.insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published" ON public.insights;
DROP POLICY IF EXISTS "admin_all" ON public.insights;
DROP POLICY IF EXISTS "cms_read" ON public.insights;
DROP POLICY IF EXISTS "cms_write" ON public.insights;

-- READ: Public (Anon) can read published items, Authenticated admins can read all
CREATE POLICY "cms_read" ON public.insights
  FOR SELECT TO anon, authenticated
  USING (
    status = 'published' OR auth.role() = 'authenticated'
  );

-- WRITE: Authenticated admins have full write access
CREATE POLICY "cms_write" ON public.insights
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);


-- -------------------------------------------------------------
-- 2. REGULATIONS TABLE
-- -------------------------------------------------------------
ALTER TABLE IF EXISTS public.regulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read" ON public.regulations;
DROP POLICY IF EXISTS "admin_all" ON public.regulations;
DROP POLICY IF EXISTS "cms_read" ON public.regulations;
DROP POLICY IF EXISTS "cms_write" ON public.regulations;

-- READ: Public (Anon) can read active regulations, Authenticated admins can read all
CREATE POLICY "cms_read" ON public.regulations
  FOR SELECT TO anon, authenticated
  USING (
    is_active = true OR auth.role() = 'authenticated'
  );

-- WRITE: Authenticated admins have full write access
CREATE POLICY "cms_write" ON public.regulations
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);


-- -------------------------------------------------------------
-- 3. REGULATION_MAPPINGS TABLE
-- -------------------------------------------------------------
ALTER TABLE IF EXISTS public.regulation_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read" ON public.regulation_mappings;
DROP POLICY IF EXISTS "admin_all" ON public.regulation_mappings;
DROP POLICY IF EXISTS "cms_read" ON public.regulation_mappings;
DROP POLICY IF EXISTS "cms_write" ON public.regulation_mappings;

-- READ: Public and Authenticated users can read mappings
CREATE POLICY "cms_read" ON public.regulation_mappings
  FOR SELECT TO anon, authenticated
  USING (true);

-- WRITE: Authenticated admins have full write access
CREATE POLICY "cms_write" ON public.regulation_mappings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);


-- -------------------------------------------------------------
-- 4. SITE_BANNERS TABLE
-- -------------------------------------------------------------
ALTER TABLE IF EXISTS public.site_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active" ON public.site_banners;
DROP POLICY IF EXISTS "admin_all" ON public.site_banners;
DROP POLICY IF EXISTS "cms_read" ON public.site_banners;
DROP POLICY IF EXISTS "cms_write" ON public.site_banners;

-- READ: Public reads active/valid banners, Authenticated admins read all
CREATE POLICY "cms_read" ON public.site_banners
  FOR SELECT TO anon, authenticated
  USING (
    (
      is_active = true
      AND (starts_at IS NULL OR starts_at <= now())
      AND (ends_at IS NULL OR ends_at >= now())
    )
    OR auth.role() = 'authenticated'
  );

-- WRITE: Authenticated admins have full write access
CREATE POLICY "cms_write" ON public.site_banners
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);


-- -------------------------------------------------------------
-- 5. TRAINING_PROGRAMS TABLE
-- -------------------------------------------------------------
ALTER TABLE IF EXISTS public.training_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active" ON public.training_programs;
DROP POLICY IF EXISTS "admin_all" ON public.training_programs;
DROP POLICY IF EXISTS "cms_read" ON public.training_programs;
DROP POLICY IF EXISTS "cms_write" ON public.training_programs;

-- READ: Public reads active training programs, Authenticated admins read all
CREATE POLICY "cms_read" ON public.training_programs
  FOR SELECT TO anon, authenticated
  USING (
    is_active = true OR auth.role() = 'authenticated'
  );

-- WRITE: Authenticated admins have full write access
CREATE POLICY "cms_write" ON public.training_programs
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);


-- -------------------------------------------------------------
-- 6. CMS_AUDIT_LOG TABLE
-- -------------------------------------------------------------
ALTER TABLE IF EXISTS public.cms_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read" ON public.cms_audit_log;
DROP POLICY IF EXISTS "cms_read" ON public.cms_audit_log;
DROP POLICY IF EXISTS "cms_write" ON public.cms_audit_log;

-- READ: Only Authenticated admins can view audit logs
CREATE POLICY "cms_read" ON public.cms_audit_log
  FOR SELECT TO authenticated
  USING (true);

-- WRITE: System/Admins can write audit logs (No public access)
CREATE POLICY "cms_write" ON public.cms_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);


-- -------------------------------------------------------------
-- 7. LEADS TABLE (Inquiries & Self-Diagnosis Responses)
-- -------------------------------------------------------------
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cms_read" ON public.leads;
DROP POLICY IF EXISTS "cms_write" ON public.leads;

-- READ: Strictly Authenticated admins ONLY (Read-Only access for CMS)
CREATE POLICY "cms_read" ON public.leads
  FOR SELECT TO authenticated
  USING (true);

-- WRITE: Public anonymous users can submit new inquiries (INSERT ONLY, NO UPDATE/DELETE)
CREATE POLICY "cms_write" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
