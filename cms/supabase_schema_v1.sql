-- =============================================================
-- Quanternity AI — CMS Supabase SQL Schema & RLS Policies (v1.0)
-- Region: Seoul (ap-northeast-2)
-- Execute this SQL script in Supabase Dashboard -> SQL Editor
-- =============================================================

-- 1. INSIGHTS (규제 브리핑 아티클)
create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                -- URL: /insights/{slug}
  title text not null,
  category text not null,                   -- 'AI기본법' | 'EU AI Act' | 'ISO 42001' | 'ISO 27001' | 'ISMS-P' | '현장노트'
  summary text,                             -- 목록 카드용 2~3문장
  body_md text,                             -- 본문 (Markdown)
  read_minutes int default 5,               -- 예상 읽기 시간(분)
  cover_image_url text,
  seo_title text,
  seo_description text,
  status text not null default 'draft',     -- 'draft' | 'review' | 'published'
  published_at timestamptz,
  author_name text default 'Quanternity AI',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_insights_status_pub on insights (status, published_at desc);

-- 2. REGULATIONS & REGULATION MAPPINGS (규제 → 인증 매핑)
create table if not exists regulations (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                -- 'ai_basic_act' | 'eu_ai_act' | 'gdpr' | 'ccpa_cpra' | 'hipaa' | 'isms_p'
  region text not null,                     -- 'KR' | 'EU' | 'US'
  name_ko text not null,
  full_name_ko text,                        -- 정식 법령명
  effective_date text,                      -- 표시용 문자열 (예: '2026-01 시행')
  scope_note text,                          -- 적용 범위
  description text,
  sort_order int default 0,
  is_active boolean default true
);

create table if not exists regulation_mappings (
  id uuid primary key default gen_random_uuid(),
  regulation_id uuid references regulations(id) on delete cascade,
  standard_name text not null,              -- 'ISO/IEC 42001' 등
  clause_ref text not null,                 -- '6.1.4', 'A.8.2' 등
  control_name text not null,
  match_description text,                   -- 규제 매칭 설명
  sort_order int default 0
);
create index if not exists idx_reg_mappings_rel on regulation_mappings (regulation_id, sort_order);

-- 3. SITE BANNERS & HERO SLIDES (NOTICE / 히어로 관리)
create table if not exists site_banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null,                  -- 'notice_bar' | 'hero_slide'
  eyebrow text,                             -- 상단 소제목 (히어로용)
  headline text not null,
  body text,
  cta_label text,
  cta_target text,                          -- '#assessment-modal' 등
  sort_order int default 0,
  starts_at timestamptz,                    -- 노출 시작 (null=즉시)
  ends_at timestamptz,                      -- 노출 종료 (null=무기한)
  is_active boolean default false,
  created_at timestamptz default now()
);

-- 4. TRAINING PROGRAMS (교육 트랙 일정)
create table if not exists training_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,                      -- 'ISO 42001 내부심사원 과정'
  subtitle text,                            -- '실무자 중심 · 사례 기반 2일'
  duration_label text,                      -- '16시간'
  cohort_label text,                        -- '2026년 9월 3기'
  starts_on date,
  ends_on date,
  location text,
  capacity int,
  enrollment_status text default 'upcoming',-- 'upcoming' | 'open' | 'closed' | 'completed'
  detail_md text,
  sort_order int default 0,
  is_active boolean default true
);

-- 5. CMS AUDIT LOG (감사 로그)
create table if not exists cms_audit_log (
  id bigint generated always as identity primary key,
  actor_email text,
  action text,                              -- 'create' | 'update' | 'publish' | 'unpublish' | 'delete'
  entity_type text,                         -- 'insight' | 'regulation_mapping' | 'banner' | 'training'
  entity_id uuid,
  diff jsonb,
  created_at timestamptz default now()
);

-- 6. AUTOMATIC UPDATED_AT TRIGGER
create or replace function set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists insights_updated_at on insights;
create trigger insights_updated_at before update on insights
  for each row execute function set_updated_at();


-- =============================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================
alter table insights            enable row level security;
alter table regulations         enable row level security;
alter table regulation_mappings enable row level security;
alter table site_banners        enable row level security;
alter table training_programs   enable row level security;
alter table cms_audit_log       enable row level security;

-- Public (Anonymous): Read only published / active items
drop policy if exists "public_read_published" on insights;
create policy "public_read_published" on insights
  for select to anon using (status = 'published');

drop policy if exists "public_read" on regulations;
create policy "public_read" on regulations
  for select to anon using (is_active = true);

drop policy if exists "public_read" on regulation_mappings;
create policy "public_read" on regulation_mappings
  for select to anon using (true);

drop policy if exists "public_read_active" on site_banners;
create policy "public_read_active" on site_banners
  for select to anon using (
    is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at   is null or ends_at   >= now())
  );

drop policy if exists "public_read_active" on training_programs;
create policy "public_read_active" on training_programs
  for select to anon using (is_active = true);

-- Authenticated Admins: Full Read/Write Access
drop policy if exists "admin_all" on insights;
create policy "admin_all" on insights for all to authenticated using (true) with check (true);

drop policy if exists "admin_all" on regulations;
create policy "admin_all" on regulations for all to authenticated using (true) with check (true);

drop policy if exists "admin_all" on regulation_mappings;
create policy "admin_all" on regulation_mappings for all to authenticated using (true) with check (true);

drop policy if exists "admin_all" on site_banners;
create policy "admin_all" on site_banners for all to authenticated using (true) with check (true);

drop policy if exists "admin_all" on training_programs;
create policy "admin_all" on training_programs for all to authenticated using (true) with check (true);

drop policy if exists "admin_read" on cms_audit_log;
create policy "admin_read" on cms_audit_log for select to authenticated using (true);


-- =============================================================
-- 8. INITIAL SEED DATA (MIGRATING EXISTING 3 INSIGHTS & REGULATIONS)
-- =============================================================

-- Seed Regulations
insert into regulations (code, region, name_ko, full_name_ko, effective_date, scope_note, description, sort_order)
values
  ('ai_basic_act', 'KR', 'AI기본법', '인공지능 발전과 신뢰 기반 조성 등에 관한 기본법', '2026-01 시행', '국내 사업자 · 공공기관', '고영향 AI를 개발·제공·이용하는 사업자에 대한 위험관리·투명성·안전성 확보 조치 의무를 규정합니다.', 1),
  ('eu_ai_act', 'EU', 'EU AI Act', 'European Union Artificial Intelligence Act', '2026-08 시행', 'EU 시장 진출/서비스 사업자', '위험 기반 접근방식에 따른 고위험 AI 위험관리시스템, 데이터 거버넌스 및 CE 마킹 의무를 규정합니다.', 2),
  ('gdpr', 'EU', 'GDPR', 'General Data Protection Regulation', '2018-05 시행 중', 'EU 정보주체 정보 처리 사업자', 'EU 정보주체의 개인정보 보호 및 데이터 이동권, 프로파일링에 대한 자동화된 결정 거부권을 규정합니다.', 3),
  ('ccpa_cpra', 'US', 'CCPA / CPRA', 'California Consumer Privacy Act / CPRA', '2023-01 시행 중', '캘리포니아 소비자의 개인정보 처리 기업', '소비자의 정보 옵트아웃 권리, 위험평가(DPIA) 수립 및 고위험 데이터 처리 통제를 명시합니다.', 4),
  ('hipaa', 'US', 'HIPAA', 'Health Insurance Portability and Accountability Act', '2003-04 시행 중', '미국 의료 정보 처리 기관/외주사', 'protected health information(PHI)에 대한 기술적·관리적·물리적 보안 가드레일을 규정합니다.', 5),
  ('isms_p', 'KR', 'ISMS-P', '정보보호 및 개인정보보호 관리체계 인증', '시행 중', '국내 주요 정보통신서비스 제공자', '관리체계 수립·운영 및 정보보호·개인정보 보호 대책 요구사항 102개 항목을 심사합니다.', 6)
on conflict (code) do nothing;

-- Seed Insights Article 1
insert into insights (slug, title, category, summary, read_minutes, status, published_at, body_md)
values (
  'high-impact-ai-criteria',
  '고영향 AI 사업자, 하위법령이 요구하는 세부 관리 기준',
  'AI기본법',
  '2026년 1월 시행된 AI기본법 하위법령에 따른 고영향 인공지능의 사업자 위험관리계획 수립 및 안전성 확보 조치 세부 가이드라인.',
  6,
  'published',
  now(),
  '# 고영향 AI 사업자, 하위법령이 요구하는 세부 관리 기준

> 기준일: 2026년 7월 31일

「인공지능 발전과 신뢰 기반 조성 등에 관한 기본법」, 이른바 AI기본법은 2026년 1월 22일부터 시행되었다.

AI기본법에서 말하는 **‘고영향 인공지능’**은 보건의료, 에너지, 먹는 물, 원자력, 교통, 교육, 채용·대출 등 국민의 생명·신체 안전이나 기본권에 중대한 영향을 미칠 수 있는 영역에서 사용되는 AI를 의미한다.

## 1. 고영향 AI 사업자의 4대 의무

1. **위험관리계획 수립 및 이행** (ISO/IEC 42001 조항 6.1.4 연계)
2. **신뢰성·안전성 확보 조치** (품질 데이터 확보, 모니터링)
3. **설명가능성 및 투명성 보장** (사용자 고지 및 생성형 AI 표시)
4. **문서화 및 관리 실태 보고**
'
) on conflict (slug) do nothing;

-- Seed Insights Article 2
insert into insights (slug, title, category, summary, read_minutes, status, published_at, body_md)
values (
  'gpai-document-checklist',
  '생성형 AI (GPAI) 거버넌스 구축 시 필수 작성 문서 5종',
  'EU AI Act',
  '범용 인공지능(GPAI) 모델 및 애플리케이션 개발·도입 기업이 갖춰야 할 위험평가서, 데이터 출처 명세서 등 필수 증적 5종 체크리스트.',
  8,
  'published',
  now() - interval '2 days',
  '# 생성형 AI (GPAI) 거버넌스 구축 시 필수 작성 문서 5종

생성형 AI(Generative AI) 및 범용 AI(GPAI) 도입이 확산됨에 따라, 단 1회의 인증서 취득이 아닌 지속 가능한 증적 관리가 핵심 평가 요소로 자리잡고 있습니다.

## 필수 작성 증적 5종

1. **AI 시스템 카탈로그 및 위험 식별서**
2. **학습 데이터 출처 및 저작권 검증서**
3. **인간 감독(Human-in-the-loop) SOP**
4. **편향성 및 환각(Hallucination) 테스트 결과서**
5. **AI 사고 대응 및 비상 정지 절차서**
'
) on conflict (slug) do nothing;

-- Seed Insights Article 3
insert into insights (slug, title, category, summary, read_minutes, status, published_at, body_md)
values (
  'iso42001-dpia-integration',
  'ISO/IEC 42001과 개인정보 영향평가(DPIA)의 통합 연계 방안',
  'ISO 42001',
  '기존 ISO/IEC 27001 및 개인정보 영향평가(DPIA) 프로세스 위에 ISO/IEC 42001 AI 경영시스템 통제를 효율적으로 확장하는 이중 프레임워크 설계법.',
  7,
  'published',
  now() - interval '5 days',
  '# ISO/IEC 42001과 개인정보 영향평가(DPIA)의 통합 연계 방안

이미 ISO/IEC 27001 및 ISMS-P 인증을 보유한 기업은 전체 관리체계를 새로 구축할 필요 없이 통제 확장(Control Expansion) 방식으로 ISO/IEC 42001을 연계할 수 있습니다.

## 통합 3단계 로드맵

1. **공통 통제(Context & Leadership) 매핑**
2. **DPIA + AI Impact Assessment(AIIA) 통합 영향평가 양식 단일화**
3. **현장 증적(FieldProof) 무결성 연결**
'
) on conflict (slug) do nothing;
