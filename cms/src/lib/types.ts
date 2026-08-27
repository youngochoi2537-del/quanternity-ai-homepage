export type InsightStatus = 'draft' | 'review' | 'published';
export type AdminRole = 'owner' | 'editor' | 'viewer' | 'superadmin' | string;

export interface Insight {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  body_md: string;
  read_minutes: number;
  cover_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  status: InsightStatus;
  published_at?: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface Regulation {
  id: string;
  code: string;
  region: 'KR' | 'EU' | 'US';
  name_ko: string;
  full_name_ko?: string;
  effective_date?: string;
  scope_note?: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export interface RegulationMapping {
  id: string;
  regulation_id: string;
  standard_name: string;
  clause_ref: string;
  control_name: string;
  match_description?: string;
  sort_order: number;
}

export type BannerPlacement = 'notice_bar' | 'hero_slide';

export interface SiteBanner {
  id: string;
  placement: BannerPlacement;
  eyebrow?: string;
  headline: string;
  body?: string;
  cta_label?: string;
  cta_target?: string;
  sort_order: number;
  starts_at?: string;
  ends_at?: string;
  is_active: boolean;
  created_at: string;
}

export type EnrollmentStatus = 'upcoming' | 'open' | 'closed' | 'completed';

export interface TrainingProgram {
  id: string;
  title: string;
  subtitle?: string;
  duration_label?: string;
  cohort_label?: string;
  starts_on?: string;
  ends_on?: string;
  location?: string;
  capacity?: number;
  enrollment_status: EnrollmentStatus;
  detail_md?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Lead {
  id: string;
  created_at: string;
  company_name?: string;
  industry?: string;
  current_certifications?: string[];
  target_standards?: string[];
  inquiry_type?: string;
  contact_email?: string;
  contact_phone?: string;
  referral_source?: string;
  diagnosis_step1?: string;
  diagnosis_step2?: string;
  diagnosis_step3?: string;
  diagnosis_score?: string;
}

export interface QuoteSite {
  id?: string;
  name: string;
  postcode?: string;
  address?: string;
  addressDetail?: string;
}

export interface QuoteRequest {
  id: string;
  created_at: string;
  company_name: string;
  ceo_name: string;
  biz_reg_no: string;
  industry: string;
  employee_count: number;
  sites: QuoteSite[];
  main_product: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  referral_source: string;
  note?: string;
  target_standards: string[];
  target_date: string;
  has_existing_cert: boolean;
  existing_certs: string[];
  source_funnel: string;
  status?: '접수완료' | '검토중' | '견적발송' | '계약체결' | '보류';
}

export interface AuditLog {
  id: number;
  actor_email: string;
  action: 'create' | 'update' | 'publish' | 'unpublish' | 'delete';
  entity_type: 'insight' | 'regulation_mapping' | 'banner' | 'training';
  entity_id: string;
  diff?: any;
  created_at: string;
}
