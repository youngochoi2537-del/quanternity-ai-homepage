/* =============================================================
   Quanternity AI — Main JavaScript Application
   Handles Regulation Map Tab Switching, Contact Form Chips,
   30-Second AI Regulatory Assessment Engine, Mobile Drawer & ScrollSpy
   ============================================================= */

// Regulation Map Data
const REG_DATA = {
  'ai-basic': {
    code: 'KR',
    name: 'AI기본법',
    subtitle: '「인공지능 발전과 신뢰 기반 조성 등에 관한 기본법」',
    effective: '2026-01',
    status: 'current',
    summary: '고영향 AI를 개발·제공·이용하는 사업자에 대한 위험관리·투명성·안전성 확보 조치 의무를 규정합니다.',
    scope: '국내 사업자 · 공공기관',
    controls: [
      { std: 'ISO/IEC 42001', ref: '조항 6.1', name: 'AI 관련 위험 및 기회 처리', match: '고영향 AI 위험식별·평가 절차' },
      { std: 'ISO/IEC 42001', ref: '조항 6.1.4', name: 'AI 시스템 영향평가', match: '이해관계자 영향 문서화 의무' },
      { std: 'ISO/IEC 42001', ref: '부속서 A.6', name: 'AI 시스템 수명주기', match: '개발·배포·운영·폐기 통제' },
      { std: 'ISO/IEC 42001', ref: '조항 9.2', name: '내부심사', match: '자체 이행 점검 근거' }
    ]
  },
  'eu-ai-act': {
    code: 'EU',
    name: 'EU AI Act',
    subtitle: 'Regulation (EU) 2024/1689',
    effective: '2026.08.02 (Art.50) / 2027.12.02 (Annex III)',
    status: 'current',
    summary: '고위험 AI 시스템의 시장 출시 및 사용에 관한 요구사항. EU 시장 진입 기업에 적용됩니다.',
    scope: 'EU 시장 진출 사업자',
    controls: [
      { std: 'ISO/IEC 42001', ref: '조항 8', name: '운영 계획 및 통제', match: '고위험 AI 시스템 관리 요구' },
      { std: 'ISO/IEC 42001', ref: '부속서 A.8', name: '데이터 거버넌스', match: 'Art. 10 데이터 및 데이터 거버넌스' },
      { std: 'ISO/IEC 42001', ref: '부속서 A.9', name: '투명성 및 정보 제공', match: 'Art. 13 투명성 의무' },
      { std: 'ISO/IEC 42001', ref: '부속서 A.10', name: '인간 감독', match: 'Art. 14 Human oversight' },
      { std: 'ISO/IEC 42001', ref: '부속서 A.7', name: '기술 문서', match: 'Art. 11 · Annex IV' }
    ]
  },
  'gdpr': {
    code: 'EU',
    name: 'GDPR',
    subtitle: 'General Data Protection Regulation',
    effective: '2018-05 (시행 중)',
    status: 'past',
    summary: '개인정보의 처리 및 자유로운 이동에 관한 EU 규정. 제32조는 기술적·관리적 보호조치를 요구합니다.',
    scope: 'EU 거주자 개인정보 처리 사업자',
    controls: [
      { std: 'ISO/IEC 27001', ref: '부속서 A.5', name: '조직적 통제', match: '제24조 컨트롤러 책임' },
      { std: 'ISO/IEC 27001', ref: '부속서 A.8', name: '기술적 통제', match: '제32조 처리의 보안' },
      { std: 'ISO/IEC 27701', ref: '전체', name: '개인정보 관리시스템', match: 'DPO·DPIA 프로세스' },
      { std: 'ISO/IEC 42001', ref: '부속서 A.6.2', name: 'AI 개인정보 처리', match: '제22조 자동화된 결정' }
    ]
  },
  'cpra': {
    code: 'US',
    name: 'CCPA / CPRA',
    subtitle: 'California Privacy Rights Act',
    effective: '2023-01 (시행 중)',
    status: 'past',
    summary: '캘리포니아 거주자의 프라이버시 권리 및 자동화된 의사결정 기술에 대한 옵트아웃 권리를 부여합니다.',
    scope: '캘리포니아 사업자 · 미국 진출 기업',
    controls: [
      { std: 'ISO/IEC 27001', ref: '부속서 A.5.34', name: '개인정보 보호', match: '캘리포니아 §1798.150' },
      { std: 'ISO/IEC 27701', ref: '조항 6', name: 'PII 처리자 통제', match: 'CPRA §1798.140(v)' },
      { std: 'ISO/IEC 42001', ref: '부속서 A.9', name: '투명성 및 정보 제공', match: '자동화 의사결정 고지' }
    ]
  },
  'hipaa': {
    code: 'US',
    name: 'HIPAA',
    subtitle: 'Health Insurance Portability and Accountability Act',
    effective: '2003-04 (시행 중)',
    status: 'past',
    summary: '보호대상 건강정보(PHI)의 처리·전송·저장에 관한 미국 법. 헬스케어·IVD 기업의 진입 요건입니다.',
    scope: '헬스케어 · IVD · 의료 SaaS',
    controls: [
      { std: 'ISO/IEC 27001', ref: '부속서 A.5', name: '조직적 통제', match: 'Administrative Safeguards §164.308' },
      { std: 'ISO/IEC 27001', ref: '부속서 A.7', name: '물리적 통제', match: 'Physical Safeguards §164.310' },
      { std: 'ISO/IEC 27001', ref: '부속서 A.8', name: '기술적 통제', match: 'Technical Safeguards §164.312' },
      { std: 'ISO 13485', ref: '조항 7.3', name: '설계 및 개발', match: '의료기기 SaMD 관리' }
    ]
  },
  'isms-p': {
    code: 'KR',
    name: 'ISMS-P',
    subtitle: '정보보호 및 개인정보보호 관리체계',
    effective: '시행 중',
    status: 'past',
    summary: '국내 법정 인증. 방송통신망법·개인정보보호법 준수 입증 수단으로 활용됩니다.',
    scope: '정보통신서비스 제공자 · 매출·이용자 요건 해당 기업',
    controls: [
      { std: 'ISO/IEC 27001', ref: '전체', name: '정보보호 관리체계', match: 'ISMS-P 관리체계 수립·운영' },
      { std: 'ISO/IEC 27701', ref: '전체', name: '개인정보 관리체계', match: 'ISMS-P 개인정보 도메인' },
      { std: 'ISO/IEC 42001', ref: '부속서 A.6.2', name: 'AI 개인정보 처리', match: 'AI 기반 서비스의 개인정보 통제' }
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // 1. Regulation Map Tabs Switching
  const regItems = document.querySelectorAll(".reg-item");
  const detailTitle = document.getElementById("reg-title");
  const detailSub = document.getElementById("reg-subtitle");
  const detailEffective = document.getElementById("reg-effective");
  const detailScope = document.getElementById("reg-scope");
  const detailSummary = document.getElementById("reg-summary");
  const detailTableBody = document.getElementById("reg-table-body");

  function selectRegulation(id) {
    const data = REG_DATA[id];
    if (!data) return;

    regItems.forEach(item => {
      if (item.dataset.id === id) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    if (detailTitle) detailTitle.textContent = `${data.name} (${data.code})`;
    if (detailSub) detailSub.textContent = data.subtitle;
    if (detailEffective) detailEffective.textContent = data.effective;
    if (detailScope) detailScope.textContent = data.scope;
    if (detailSummary) detailSummary.textContent = data.summary;

    if (detailTableBody) {
      detailTableBody.innerHTML = data.controls.map(c => `
        <tr>
          <td style="font-family: var(--font-mono); font-size: 12px; color: var(--fg-1); font-weight: 500;">${c.std}</td>
          <td style="font-family: var(--font-mono); font-size: 12px; color: var(--signal-700); font-weight: 500;">${c.ref}</td>
          <td style="font-weight: 500; color: var(--fg-1);">${c.name}</td>
          <td style="color: var(--fg-3);">${c.match}</td>
        </tr>
      `).join('');
    }
  }

  regItems.forEach(item => {
    item.addEventListener("click", () => {
      selectRegulation(item.dataset.id);
    });
  });

  // Default select first regulation
  selectRegulation('ai-basic');

  // 2. Chip Selection for Inquiry Form
  const chips = document.querySelectorAll(".chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const isMulti = chip.parentElement.dataset.multi !== "false";
      if (!isMulti) {
        chip.parentElement.querySelectorAll(".chip").forEach(c => c.classList.remove("selected"));
        chip.classList.add("selected");
      } else {
        chip.classList.toggle("selected");
      }
    });
  });

  // 3. Diagnostic Assessment Modal Engine
  const modalBackdrop = document.getElementById("assessment-modal");
  const modalCloseBtns = document.querySelectorAll(".modal-close-trigger");
  const openModalBtns = document.querySelectorAll(".open-assessment-trigger");

  let currentStep = 1;
  const selections = { industry: '', aiType: '', target: '' };

  function openModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.add("active");
      currentStep = 1;
      showStep(1);
    }
  }

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove("active");
    }
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  modalCloseBtns.forEach(btn => {
    btn.addEventListener("click", closeModal);
  });

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  // Login Modal Handlers
  const loginModal = document.getElementById("login-modal");
  const openLoginBtns = document.querySelectorAll(".open-login-trigger");
  const closeLoginBtns = document.querySelectorAll(".modal-login-close-trigger");

  openLoginBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginModal) loginModal.classList.add("active");
    });
  });

  closeLoginBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (loginModal) loginModal.classList.remove("active");
    });
  });

  if (loginModal) {
    loginModal.addEventListener("click", (e) => {
      if (e.target === loginModal) loginModal.classList.remove("active");
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("FieldProof 콘솔 로그인 시뮬레이션입니다. 데모 계정 요청 및 신규 고객 등록은 무료 진단/상담 신청 폼을 이용해 주시기 바랍니다.");
      if (loginModal) loginModal.classList.remove("active");
    });
  }

  // Terms & Privacy Modals
  const termsModal = document.getElementById("terms-modal");
  const privacyModal = document.getElementById("privacy-modal");
  
  document.querySelectorAll(".open-terms-trigger").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (termsModal) termsModal.classList.add("active");
    });
  });
  document.querySelectorAll(".modal-terms-close-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      if (termsModal) termsModal.classList.remove("active");
    });
  });

  document.querySelectorAll(".open-privacy-trigger").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (privacyModal) privacyModal.classList.add("active");
    });
  });
  document.querySelectorAll(".modal-privacy-close-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      if (privacyModal) privacyModal.classList.remove("active");
    });
  });

  // Footer Regulation Map Tab Triggers
  document.querySelectorAll("a[data-reg-tab]").forEach(link => {
    link.addEventListener("click", () => {
      const tabId = link.getAttribute("data-reg-tab");
      const targetItem = document.querySelector(`.reg-item[data-id="${tabId}"]`);
      if (targetItem) targetItem.click();
    });
  });

  function showStep(stepNum) {
    document.querySelectorAll(".assessment-step").forEach(step => {
      step.classList.remove("active");
    });
    const targetStep = document.getElementById(`step-${stepNum}`);
    if (targetStep) targetStep.classList.add("active");
  }

  // Diagnostic Option Clicks
  document.querySelectorAll("[data-step-option]").forEach(opt => {
    opt.addEventListener("click", () => {
      const step = opt.dataset.stepOption;
      const value = opt.dataset.value;
      selections[step] = value;

      if (step === "industry") {
        currentStep = 2;
        showStep(2);
      } else if (step === "aiType") {
        currentStep = 3;
        showStep(3);
      } else if (step === "target") {
        currentStep = 4;
        calculateVerdict();
        showStep(4);
      }
    });
  });

  function calculateVerdict() {
    const verdictTitle = document.getElementById("verdict-title");
    const verdictStack = document.getElementById("verdict-stack");
    const verdictSavings = document.getElementById("verdict-savings");

    let title = "고영향 AI (High-Impact AI System)";
    let stack = "ISO/IEC 42001 (AI 경영) + ISO/IEC 27001 (정보보호) + 고영향 AI 규제 요건 분석 보고서";
    let savings = "통합 심사 적용 시 심사일수 절감 여지가 있습니다";

    if (selections.industry === "medtech" || selections.aiType === "medical") {
      title = "EU AI Act 고위험 (High-Risk Class IIa/b)";
      stack = "ISO/IEC 42001 + ISO 13485 (의료기기) + ISO/IEC 27001 + 규제 대응 체계 진단";
      savings = "통합 심사 적용 시 심사일수 절감 여지가 있습니다";
    } else if (selections.target === "export") {
      title = "글로벌 규제 준수 대상 (EU/US Export High-Risk)";
      stack = "ISO/IEC 42001 + ISO/IEC 27001 + GDPR/CCPA 통제 매핑";
      savings = "통합 심사 적용 시 심사일수 절감 여지가 있습니다";
    }

    if (verdictTitle) verdictTitle.textContent = title;
    if (verdictStack) verdictStack.textContent = stack;
    if (verdictSavings) verdictSavings.textContent = savings;
  }

  // Transfer Verdict to Inquiry Form
  const bookConsultationBtn = document.getElementById("book-consultation-btn");
  if (bookConsultationBtn) {
    bookConsultationBtn.addEventListener("click", () => {
      closeModal();
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // 4. Form Submission & Real-Time API/Supabase Sync
  const inquiryForm = document.getElementById("inquiry-form");
  if (inquiryForm) {
    inquiryForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const company = document.getElementById("inquiry-company")?.value?.trim() || "";
      const industry = document.getElementById("inquiry-industry")?.value?.trim() || "";
      const email = document.getElementById("inquiry-email")?.value?.trim() || "";
      const phone = document.getElementById("inquiry-phone")?.value?.trim() || "";

      // Mandatory Field Validation Check (회사명, 산업, 이메일, 연락처 필수)
      if (!company || !industry || !email || !phone) {
        alert("필수 입력 항목(회사명, 산업, 이메일, 연락처)을 모두 작성해 주시기 바랍니다.");
        return;
      }

      const getSelectedChips = (groupId) => {
        const group = document.getElementById(groupId);
        if (!group) return [];
        return Array.from(group.querySelectorAll(".chip.selected")).map(c => c.textContent.trim());
      };

      const currentCerts = getSelectedChips("chip-current-certs");
      const targetStandards = getSelectedChips("chip-target-standards");
      const inquiryTypes = getSelectedChips("chip-inquiry-type");
      const referralSources = getSelectedChips("chip-referral-source");

      const submitBtn = document.getElementById("submit-inquiry-btn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "제출 중...";
      }

      const leadPayload = {
        company_name: company,
        industry: industry,
        current_certifications: currentCerts.length > 0 ? currentCerts : ["없음"],
        target_standards: targetStandards.length > 0 ? targetStandards : ["ISO/IEC 42001"],
        inquiry_type: inquiryTypes.join(", ") || "고영향 AI",
        contact_email: email,
        contact_phone: phone,
        phone: phone,
        referral_source: referralSources.join(", ") || "구글 검색",
        created_at: new Date().toISOString()
      };

      // 1. Submit to CMS Real-Time Lead API Endpoint (Single Source of Truth)
      try {
        const res = await fetch('https://cms.quanternity.kr/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadPayload)
        });
        if (!res.ok) {
          const errData = await res.json();
          if (errData.error) {
            alert("입력 오류: " + errData.error);
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = `문의 제출 <span>→</span>`;
            }
            return;
          }
        }
      } catch (err) {
        console.error('API submission error:', err);
      }

      alert("무료 진단 및 상담 신청이 정상 접수되었습니다. 최소 2영업일 이내로 답변 안내드리겠습니다.");

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `문의 제출 <span>→</span>`;
      }
      inquiryForm.reset();
    });
  }

  // 5. Mobile Drawer Toggle & Accordion Dropdown
  const mobileToggle = document.querySelector(".mobile-nav-toggle");
  const headerNav = document.querySelector(".header-nav");

  if (mobileToggle && headerNav) {
    mobileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      headerNav.classList.toggle("mobile-active");
    });

    // Delegate clicks inside headerNav for mobile menu links & dropdown toggle
    headerNav.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest(".dropdown-toggle");
      if (toggleBtn && (headerNav.classList.contains("mobile-active") || window.innerWidth <= 768)) {
        e.preventDefault();
        e.stopPropagation();
        const dropdownItem = toggleBtn.closest(".dropdown");
        if (dropdownItem) {
          dropdownItem.classList.toggle("mobile-open");
        }
        return;
      }

      const navLink = e.target.closest("a");
      if (navLink && !navLink.classList.contains("dropdown-toggle")) {
        headerNav.classList.remove("mobile-active");
      }
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!headerNav.contains(e.target) && !mobileToggle.contains(e.target)) {
        headerNav.classList.remove("mobile-active");
      }
    });
  }

  // Header Fixed Glassmorphism Scroll Effect
  const headerElement = document.querySelector(".header");
  if (headerElement) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        headerElement.classList.add("scrolled");
      } else {
        headerElement.classList.remove("scrolled");
      }
    });
  }

  // 6. Hero Carousel Controller
  const heroSlides = document.querySelectorAll(".hero-slide");
  const heroCurrentIndex = document.getElementById("hero-current-index");
  const heroPrevBtn = document.getElementById("hero-prev-btn");
  const heroNextBtn = document.getElementById("hero-next-btn");

  let activeHeroSlide = 0;
  let heroTimer = null;

  function updateHeroSlide(index) {
    if (!heroSlides.length) return;
    activeHeroSlide = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach((slide, i) => {
      if (i === activeHeroSlide) {
        slide.classList.add("active");
      } else {
        slide.classList.remove("active");
      }
    });

    if (heroCurrentIndex) {
      heroCurrentIndex.textContent = String(activeHeroSlide + 1).padStart(2, '0');
    }
  }

  function startHeroTimer() {
    stopHeroTimer();
    heroTimer = setInterval(() => {
      updateHeroSlide(activeHeroSlide + 1);
    }, 7000);
  }

  function stopHeroTimer() {
    if (heroTimer) {
      clearInterval(heroTimer);
      heroTimer = null;
    }
  }

  if (heroPrevBtn) {
    heroPrevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      updateHeroSlide(activeHeroSlide - 1);
      startHeroTimer();
    });
  }

  if (heroNextBtn) {
    heroNextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      updateHeroSlide(activeHeroSlide + 1);
      startHeroTimer();
    });
  }

  // Start auto-rotation on load
  startHeroTimer();

  // Dynamic Supabase Banners Fetch & Sync
  async function syncSupabaseBanners() {
    const SUPABASE_URL = 'https://mogpgiejwsjdludkomee.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ3BnaWVqd3NqZGx1ZGtvbWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mjk4NTgsImV4cCI6MjEwMTIwNTg1OH0.td_dAhulUFWCG7lyUZu-qf8Rj4aBOG3O85FeG7llIY4';

    if (!window.supabase) return;
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    try {
      const { data: dbBanners } = await supabase
        .from('site_banners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!dbBanners || dbBanners.length === 0) return;

      // 1. Sync Notice Bar
      const noticeBanner = dbBanners.find(b => b.placement === 'notice_bar');
      if (noticeBanner) {
        const textEl = document.querySelector('.hero-announcement .announcement-text');
        const linkEl = document.querySelector('.hero-announcement .announcement-link');
        if (textEl && noticeBanner.headline) {
          const headlineHtml = `<strong>${noticeBanner.headline}</strong>`;
          const bodyHtml = noticeBanner.body ? `<span class="announcement-body-inline"> — ${noticeBanner.body}</span>` : '';
          textEl.innerHTML = `${headlineHtml}${bodyHtml}`;
        }
        if (linkEl) {
          if (noticeBanner.cta_label) linkEl.textContent = noticeBanner.cta_label;
          if (noticeBanner.cta_target) linkEl.setAttribute('href', noticeBanner.cta_target);
        }

        // Store notice details for modal popup
        window.activeNoticeData = noticeBanner;
      }

      // 2. Sync Hero Slides
      const heroBanners = dbBanners.filter(b => b.placement === 'hero_slide');
      if (heroBanners.length > 0) {
        const heroSlidesContainer = document.querySelector('.hero-slides-container');
        const slideCounterTotal = document.querySelector('.hero-slide-counter span:last-child');
        
        if (heroSlidesContainer) {
          heroSlidesContainer.innerHTML = heroBanners.map((b, idx) => `
            <div class="hero-slide ${idx === 0 ? 'active' : ''}" data-slide="${idx + 1}">
              ${b.eyebrow ? `<div style="font-family: var(--font-mono); font-size: 13px; color: var(--signal-400); font-weight: 600; margin-bottom: 8px;">${b.eyebrow}</div>` : ''}
              <h1 class="hero-h1">${b.headline}</h1>
              ${b.body ? `<p class="hero-sub">${b.body}</p>` : ''}
              <div class="hero-cta-group">
                <a href="${b.cta_target || '#assessment-modal'}" class="btn-hero-primary open-assessment-trigger">
                  ${b.cta_label || '자세히 보기'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          `).join('');

          if (slideCounterTotal) {
            slideCounterTotal.textContent = String(heroBanners.length).padStart(2, '0');
          }

          // Re-bind hero slides array
          heroSlides = document.querySelectorAll(".hero-slide");
          updateHeroSlide(0);
        }
      }
    } catch (err) {
      console.error('Error syncing Supabase banners:', err);
    }
  }

  // Notice Detail Modal Handlers
  const noticeModal = document.getElementById('notice-modal');
  const heroAnnouncement = document.querySelector('.hero-announcement');
  const closeNoticeBtns = document.querySelectorAll('.modal-notice-close-trigger');

  if (heroAnnouncement && noticeModal) {
    heroAnnouncement.addEventListener('click', (e) => {
      // Don't open if direct CTA button was clicked with specific link
      const data = window.activeNoticeData || {
        headline: document.querySelector('.hero-announcement .announcement-text')?.textContent || '공지사항',
        body: '상세 공지 내용이 여기에 표시됩니다. 2026년 AI기본법 및 컴플라이언스 통합 구축 관련 실무 정보입니다.',
        cta_label: '무료 진단 신청 ➔',
        cta_target: '#assessment-modal'
      };

      const titleEl = document.getElementById('notice-modal-title');
      const bodyEl = document.getElementById('notice-modal-body');
      const ctaEl = document.getElementById('notice-modal-cta');

      if (titleEl) titleEl.textContent = data.headline;
      if (bodyEl) bodyEl.textContent = data.body || data.headline;
      if (ctaEl) {
        if (data.cta_label) ctaEl.textContent = data.cta_label;
        if (data.cta_target) ctaEl.setAttribute('href', data.cta_target);
      }

      noticeModal.classList.add('active');
    });

    closeNoticeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        noticeModal.classList.remove('active');
      });
    });

    noticeModal.addEventListener('click', (e) => {
      if (e.target === noticeModal) noticeModal.classList.remove('active');
    });
  }

  syncSupabaseBanners();

  // 7. Member Profile Carousel Controller (PRACTICE COMPOSITION)
  const memberPrevBtns = document.querySelectorAll(".member-prev-btn");
  const memberNextBtns = document.querySelectorAll(".member-next-btn");
  let activeMemberIndex = 0;
  const totalMembers = 3;

  function updateMemberSlide(index) {
    activeMemberIndex = (index + totalMembers) % totalMembers;
    
    document.querySelectorAll(".member-carousel-section").forEach((section) => {
      const counter = section.querySelector(".member-slide-counter");
      const cards = section.querySelectorAll(".member-card");
      
      if (counter) {
        counter.textContent = String(activeMemberIndex + 1).padStart(2, '0') + " / " + String(totalMembers).padStart(2, '0');
      }

      cards.forEach((card, i) => {
        if (i === activeMemberIndex) {
          card.classList.add("active");
        } else {
          card.classList.remove("active");
        }
      });
    });
  }

  memberPrevBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      updateMemberSlide(activeMemberIndex - 1);
    });
  });

  memberNextBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      updateMemberSlide(activeMemberIndex + 1);
    });
  });

  // Auto-rotate member profiles every 4.5 seconds
  setInterval(() => {
    updateMemberSlide(activeMemberIndex + 1);
  }, 4500);

  // 8. Continuous Seamless Video Loop Handler
  const mainPromoVideo = document.getElementById("main-promo-video");
  if (mainPromoVideo) {
    mainPromoVideo.play().catch(() => {});
    mainPromoVideo.addEventListener("ended", () => {
      mainPromoVideo.currentTime = 0;
      mainPromoVideo.play().catch(() => {});
    });
  }

  // 9. Scroll-to-Top Button with Circular Red Progress Gauge (Auto-injected on every page)
  let scrollTopBtn = document.getElementById("scroll-to-top");
  
  if (!scrollTopBtn) {
    scrollTopBtn = document.createElement("button");
    scrollTopBtn.id = "scroll-to-top";
    scrollTopBtn.className = "scroll-to-top-btn";
    scrollTopBtn.setAttribute("aria-label", "최상단으로 이동");
    scrollTopBtn.innerHTML = `
      <svg class="scroll-progress-circle" width="48" height="48" viewBox="0 0 48 48">
        <circle class="progress-bg" cx="24" cy="24" r="20" fill="none" stroke="#1F2937" stroke-width="3" />
        <circle class="progress-ring" cx="24" cy="24" r="20" fill="none" stroke="#EF4444" stroke-width="3.5" stroke-dasharray="125.66" stroke-dashoffset="125.66" stroke-linecap="round" />
      </svg>
      <svg class="scroll-arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    `;
    document.body.appendChild(scrollTopBtn);
  }

  const progressRing = scrollTopBtn.querySelector(".progress-ring");
  const circumference = 2 * Math.PI * 20; // 125.66

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (scrollHeight > 0) {
      const scrollPercent = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
      const offset = circumference - (scrollPercent * circumference);
      if (progressRing) {
        progressRing.style.strokeDashoffset = offset;
      }
    }

    // Show button after scrolling down > 120px
    if (scrollTop > 120) {
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }
  }

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // =============================================================
  // Multi-language (KO / EN) Translation Engine
  // =============================================================
  const I18N_DICTIONARY = {
    ko: {
      nav_services: "서비스",
      nav_why: "왜 인증인가",
      nav_fieldproof: "FieldProof",
      nav_insights: "인사이트",
      nav_company: "회사",
      nav_company_about: "회사 소개",
      nav_company_indep: "원칙과 독립성",
      nav_company_network: "심사원 네트워크",
      nav_company_contact: "오시는 길 · 사업자 정보",
      btn_fieldproof_login: "FieldProof 로그인",
      btn_free_assessment: "무료 진단 신청",

      notice_badge: "NOTICE",
      notice_text: "<strong>2026년 AI기본법 시행 확정</strong><span class=\"announcement-body-inline\"> — 지난 7월 14일 국무회의를 통과한 AI기본법 시행령 개정안이 7월 21일부터 시행되었습니다. 공공조달 AI 확인제 신설 및 ISO/IEC 42001·27001 통합 구축 무료 진단 진행 중</span>",
      notice_link: "진단하기 ➔",

      hero_slide_1_h1: "두 개의 인증,<br /><span class=\"text-green\">한 번의 구축으로</span> 준비합니다.",
      hero_slide_1_sub: "ISO/IEC 42001과 27001은 정책·위험관리·내부심사·경영검토 등 경영시스템 구조를 공유합니다. 통합 구축은 같은 문서를 두 번 만드는 일을 없애고, 준비 기간과 심사 대응 부담을 줄입니다.",
      hero_slide_1_cta1: "3분 자가진단",
      hero_slide_1_cta2: "무료 진단 신청",

      hero_slide_2_h1: "문서가 아니라 <span class=\"text-green\">증적으로</span> 증명합니다.",
      hero_slide_2_sub: "ISO/IEC 42001·27001 통합 구축, 현장 증적 관리, 고영향 AI 규제 요건 분석까지.<br />심사원이 설계하고, 증적으로 증명합니다.",
      hero_slide_2_cta1: "무료 진단 신청",
      hero_slide_2_cta2: "FieldProof 보기",

      hero_slide_3_h1: "공공 AI 사업, 수주는 하셨습니다.<br /><span class=\"text-green\">다음 제안서는</span> 준비되셨습니까?",
      hero_slide_3_sub: "2026년 상반기 AI 관련 공공 낙찰사들중 ISO42001 보유 기업이 확인된 사례가 많지 않았습니다. 평가 항목에 AI 거버넌스가 반영되기 시작한 지금이 격차를 만들 시점입니다.",
      hero_slide_3_cta1: "무료 진단 신청",
      hero_slide_3_cta2: "FieldProof 보기",

      hero_slide_4_h1: "같은 자료를 매번 <span class=\"text-green\">다시 만들고</span> 계십니까.",
      hero_slide_4_sub: "임상수탁 조직은 이미 감사받는 일을 업으로 합니다. 문제는 대응이 끝나면 아무것도 남지 않는다는 것입니다. 운영 중인 SOP와 데이터 관리 절차는 ISO/IEC 27001·42001 요구사항의 상당 부분을 이미 충족하고 있습니다. 새로 만드는 작업이 아니라, 있는 것을 한 번 정렬해 재사용 가능한 형태로 바꾸는 작업입니다.",
      hero_slide_4_cta1: "SOP → 27001·42001 매핑 진단",
      hero_slide_4_cta2: "무엇이 이미 충족되는지 보기 →",

      hero_slide_5_h1: "고영향 AI,<br />이제 <span class=\"text-green\">'하고 있다'가 아니라 '증명하라'</span>를 요구받습니다.",
      hero_slide_5_sub: "AI기본법 시행령이 7월 21일부터 시행되며, 고영향 AI 사업자의 위험관리·영향평가 책임이 구체화되었습니다. ISO/IEC 42001·27001 통합 체계는 그 요구를 일회성 문서가 아닌, 운영되는 경영시스템으로 만듭니다.",
      hero_slide_5_cta1: "무료 진단 신청",
      hero_slide_5_cta2: "FieldProof 보기",

      hero_sidebar_label: "대응 규격",
      promo_video_label: "PROMO · QUANTERNITY AI",
      member_1_role: "I · ADVISORY NETWORK",
      member_1_name: "ADVISORY NETWORK",
      member_1_creds: "AI석사<br />변호사<br />ISO 42001 27001 심사원",
      member_2_role: "II · LEAD IMPLEMENTATION",
      member_2_name: "LEAD IMPLEMENTATION",
      member_2_creds: "AI공학박사<br />ISO 42001 · 27001 · 13485<br />심사원",
      member_3_role: "III · CHIEF TECHNOLOGY OFFICER",
      member_3_name: "CHIEF TECHNOLOGY OFFICER",
      member_3_creds: "AI공학박사<br />Korea Vibe Coding 전문가",

      public_ai_title: "공공 AI 사업, 수주는 하셨습니다.<br /><span style=\"color: var(--fg-3);\">AI 거버넌스 증빙은 준비되셨습니까?</span>",
      public_ai_lead: "AI기본법과 공공조달 평가 기준이 동시에 움직이고 있습니다. 이미 ISO/IEC 27001을 보유한 조직이라면, 통제 확장으로 42001에 도달하는 경로가 가장 짧습니다.",
      fact_1_title: "AI기본법 시행으로 고영향 AI 사업자 의무 신설",
      fact_1_desc: "2026년 1월 시행. 고영향 AI 사업자는 위험관리·사용자 보호·문서화 의무가 부여됩니다.",
      fact_2_title: "공공 발주처의 AI 신뢰성 요구 확대",
      fact_2_desc: "공공 AI 사업 수행 기업 대다수가 ISO/IEC 42001 미보유 상태입니다. 제안서 평가에 AI 거버넌스가 주요 항목으로 반영되고 있습니다.",
      fact_3_title: "ISO/IEC 27001 → 42001 확장 경로",
      fact_3_desc: "이미 보유한 정보보호 관리체계 위에 AI 통제를 얹는 방식으로, 통상 12–16주 내에 구축이 완료됩니다.",

      reg_map_title: "인증은 규제 대응의 입증 수단입니다.",
      reg_map_subtitle: "각 규제가 요구하는 조치와 이를 입증할 수 있는 ISO 조항·부속서 통제를 매핑했습니다. 규제를 선택하시면 대응 항목이 우측에 표시됩니다.",
      reg_table_th_std: "규격명",
      reg_table_th_ref: "조항 참조",
      reg_table_th_name: "통제명",
      reg_table_th_desc: "규제 매칭 설명",
      reg_guardrail: "<strong>가드레일:</strong> 규격은 규제 준수를 <strong>보장</strong>하는 것이 아니라, 요구되는 조치의 이행을 국제적으로 인정된 방식으로 입증하는 수단입니다.",

      services_title: "두 축, 하나의 심사 관점.",
      services_subtitle: "컨설팅과 교육을 분리하지 않습니다. 현장 심사원의 시각으로 시스템을 구축하고 내부 전문성을 내재화합니다.",
      track_a_title: "구축이 아니라 운영이 되게.",
      track_a_desc: "문서 작성을 넘어 조직의 일상 프로세스에 거버넌스 통제가 자연스럽게 녹아들도록 설계합니다.",
      track_a_item1_name: "AI 거버넌스 컨설팅",
      track_a_item1_spec: "ISO/IEC 42001 · AI기본법",
      track_a_item1_dur: "12–16주",
      track_a_item2_name: "정보보호·개인정보 컨설팅",
      track_a_item2_spec: "ISO/IEC 27001 · ISMS-P",
      track_a_item2_dur: "10–14주",
      track_a_item3_name: "인증 취득 컨설팅",
      track_a_item3_spec: "심사 준비 지원 (발급 아님)",
      track_a_item3_dur: "4–8주",
      track_a_link: "컨설팅 트랙 상세 안내 →",

      track_b_title: "외부 의존 없는 내재화.",
      track_b_desc: "컨설팅 종료 후에도 조직 내부 인력이 시스템을 지속 운영·개선할 수 있는 실무 역량을 이식합니다.",
      track_b_item1_name: "ISO 42001 내부심사원 과정",
      track_b_item1_spec: "실무자 중심 · 사례 기반 2일",
      track_b_item1_dur: "16시간",
      track_b_item2_name: "AI 위협 모델링 워크숍",
      track_b_item2_spec: "개발·보안·기획 합동 실습",
      track_b_item2_dur: "8시간",
      track_b_item3_name: "경영진 AI 거버넌스 릴레이",
      track_b_item3_spec: "의사결정권자 리스크 정립",
      track_b_item3_dur: "4시간",
      track_b_link: "교육 트랙 일정 문의 →",

      fieldproof_title: "현장 증적 없이,<br />어떤 심사도 통과할 수 없습니다.",
      fieldproof_subtitle: "FieldProof는 ISO 42001·27001 통제 항목과 조직의 일상 업무 산출물을 실시간 연결하는 증적 관리 플랫폼입니다.",
      fp_feat_1_title: "실시간 증적 캡처 및 자동 태깅",
      fp_feat_1_desc: "개발, 데이터 관리, 모델 평가 과정에서 발생하는 산출물을 ISO 42001 통제 항목과 자동 매핑합니다.",
      fp_feat_2_title: "내부심사·외부심사 모드 분리",
      fp_feat_2_desc: "심사원 제출용 패키지를 클릭 한 번으로 생성하고, 민감 정보에 대한 액세스 권한을 제어합니다.",
      fp_feat_3_title: "지속적 컴플라이언스 모니터링",
      fp_feat_3_desc: "1회성 인증으로 끝나는 것이 아니라, 연간 유지심사 및 재인증에 필요한 증적 공백을 실시간 감지합니다.",

      notes_title: "현장을 아는 회사가 만들어야<br />현장에서 쓰이는 도구가 됩니다.",
      note_1_tag: "NOTE 01 · 심사 현장 관찰",
      note_1_quote: "“증적 사진은 아직도 메신저로 오간다.”",
      note_1_body: "사진 캡처 후 메일이나 메신저 전송 과정에서 위치와 시점이 유실됩니다. 무결성이 보장된 증적 플랫폼이 필수적입니다.",
      note_2_tag: "NOTE 02 · 심사 보고서 일지",
      note_2_quote: "“보고서는 심사 당일 작성돼야 한다.”",
      note_2_body: "심사 종료 후 일주일 뒤 작성되는 보고서는 기억 왜곡을 동반합니다. 당일 수집 및 초안 확정이 심사 품질을 결정합니다.",
      note_3_tag: "NOTE 03 · 인정기구 평가 trend",
      note_3_quote: "“인정기구는 복붙 보고서를 걸러내기 시작했다.”",
      note_3_body: "표준화된 양식 템플릿 복사 제출은 정기 심사에서 부적합 사유가 됩니다. 각 조직 고유의 AI 운영 현장이 직접 입증되어야 합니다.",

      firewall_title: "퀀터니티에이아이의 컨설팅·SaaS 서비스를 제공받은 조직에 대해서는 당사 소속 심사원이 인증 심사를 수행하지 않습니다.",
      firewall_desc: "자문과 제3자 심사 간 이해상충을 근본적으로 차단하는 독립성 방화벽 체계를 운용합니다.",
      firewall_btn1: "심사원 네트워크 안내 →",
      firewall_btn2: "독립성 원칙 보기 →",

      insights_title: "규제 브리핑과 현장 분석.",
      insights_link: "전체 인사이트 목록 →",

      contact_title: "초기 진단은 무료로 안내드립니다.",
      contact_lead: "30분 온라인 미팅으로 AI기본법·ISO/IEC 42001-27001 기준 현재 수준을 진단하고, A4 3매 진단 요약서(적용 대상 규격 / 주요 갭 3~5개 / 예상 구축 기간-심사일수)를 영업일 2일 내 회신드립니다. 수집된 정보는 상담 목적으로만 사용하며 종료 후 30일 내 파기합니다.",
      contact_quote: "“심사에서 반복적으로 발견되는 부적합의 원인은, 문서와 절차 설계 단계에서 대부분 제거할 수 있습니다.”",
      contact_author: "대표<br />ISO/IEC 42001 · 27001 · 13485 심사원",
      form_privacy_agree: "개인정보 처리방침에 동의합니다. 수집된 정보는 상담 목적으로만 사용되며 30일 이내 파기됩니다.",
      form_submit: "문의 제출 ➔",

      disclaimer_notice: "📌 <strong>안내:</strong> 본 진단 및 컨설팅은 ISO/IEC 42001 등 규격 요구사항에 대한 기술적 분석이며, 법률 자문이 아닙니다. 법령 해석·법적 판단이 필요한 사안은 별도의 법률전문가 확인이 필요합니다.",
      disclaimer_indep: "🛡️ 주식회사 퀀터니티에이아이의 컨설팅·SaaS 서비스를 제공받은 조직에 대해서는 당사 소속 심사원이 인증 심사를 수행하지 않습니다.",

      modal_step1_title: "귀사의 주요 산업 도메인은 무엇입니까?",
      modal_step1_sub: "적용할 주 규제 기준 및 ISO 표준 조합을 판단하기 위한 첫 단계입니다.",
      modal_step2_title: "개발 또는 활용 중인 AI 시스템 형태는 무엇입니까?",
      modal_step3_title: "가장 시급한 규제 및 인증 대응 목표는 무엇입니까?",
      modal_step4_title: "고영향 AI (High-Impact AI System)",

      legal_terms_title: "웹사이트 이용약관",
      legal_privacy_title: "개인정보 처리방침",

      about_hero_title: "회사 소개",
      about_hero_sub: "심사 현장의 경험과 기술을 결합하여, 인증서 제출 후에도 지속 가능한 AI 거버넌스 및 ISO 컴플라이언스 체계를 구축합니다.",
      about_nav_1: "01 무엇을 하는 회사인가",
      about_nav_2: "02 비전과 미션",
      about_nav_3: "03 대표 인사말",
      about_nav_4: "04 사람들",
      about_nav_5: "05 원칙과 독립성",
      about_nav_6: "06 회사 개요",
      about_sec1_title: "무엇을 하는 회사인가",
      about_sec1_p1: "퀀터니티에이아이(Quanternity AI)는 현직 국제심사원과 AI·법률·컴플라이언스 전문가가 설립한 <strong>AI 거버넌스 운영체계 전문 기업</strong>입니다.",
      about_sec1_p2: "우리는 일회성 인증 취득 컨설팅에 그치지 않고, AI기본법·EU AI Act·ISO/IEC 42001 및 27001에 대응하는 지속 가능한 현장 증적 중심의 경영시스템 체계를 수립합니다.",
      about_sec1_p3: "자체 개발한 모바일 현장 증적 SaaS &lsquo;FieldProof&rsquo;를 통해 심사 수검 준비부터 수명주기 통제까지 객관적인 증적 사슬을 제공합니다.",
      about_sec2_title: "비전과 미션",
      about_sec2_sub: "도입한 AI를 설명할 수 있는 조직을 만들고, 인증이 끝난 뒤에도 운영되는 체계를 남깁니다.",
      about_vm_v_title: "도입한 AI를 설명할 수 있는 조직을 만듭니다.",
      about_vm_v_desc: "AI 알고리즘과 서비스가 사회 및 규제 환경과 마찰 없이 안착하도록 기술과 위험 통제 간의 명확한 설명가능성을 구축합니다.",
      about_vm_m_title: "인증서가 아니라, 인증이 끝난 뒤에도 운영되는 체계를 남깁니다.",
      about_vm_m_desc: "단순한 심사 서류 작성을 넘어 조직 내부에 자연스럽게 내재화되어 수명주기 내내 스스로 작동하는 컴플라이언스 시스템을 설계합니다.",
      about_p1_title: "실사 현장 중심성",
      about_p1_desc: "탁상공론 서류가 아닌, 실제 심사원과 규제 당국이 검증하는 증적 위주로 시스템 구축",
      about_p2_title: "기술과 법률의 결합",
      about_p2_desc: "기술적 AI 수명주기 통제와 법률적 고영향 판단 및 책임 구조의 완벽한 융합",
      about_p3_title: "독립성 방화벽 (Firewall)",
      about_p3_desc: "컨설팅 수행 조직과 제3자 심사원의 엄격한 분리로 객관성과 신뢰성 입증",
      about_sec3_title: "대표 인사말",
      about_ceo_quote: "&ldquo;인증서 자체보다 중요한 것은, 심사가 끝난 뒤에도 기업 내부에서 끊임없이 작동하는 위험관리 체계입니다.&rdquo;",
      about_ceo_p1: "안녕하세요. 퀀터니티에이아이 대표 입니다.",
      about_ceo_p2: "최근 2026년 AI기본법 시행과 EU AI Act 적용 본격화로 많은 기업들이 '고영향 AI' 판단과 ISO/IEC 42001 인증 준비에 커다란 부담을 느끼고 계십니다. 그러나 수많은 서류를 만든 후 상자에 넣어두는 방식의 컨설팅은 실제 심사 현장이나 발주처 실사에서 아무런 힘을 발휘하지 못합니다.",
      about_ceo_p3: "우리는 현직 심사원으로서 수많은 실사를 수행하며, 기업들이 진정으로 필요로 하는 것은 '보여주기식 문서'가 아닌 '실제 운영 가능한 증적 체계'임을 절감하였습니다. 이에 퀀터니티에이아이는 심사원의 설계 역량과 법률 전문가의 판정 기준, 그리고 FieldProof SaaS 기술을 하나로 묶었습니다.",
      about_ceo_p4: "여러분의 조직이 글로벌 AI 규제 파도를 넘어 시장의 굳건한 신뢰를 얻을 수 있도록 가장 전문적이고 독립적인 파트너로서 함께하겠습니다. 감사합니다.",
      about_sec4_title: "사람들",
      about_sec4_sub: "대표·법률·기술 현직 심사원 및 전문 연구진이 체계를 수립합니다.",
      about_card1_desc: "ISO/IEC 42001, 27001, 13485 심사원. 공공·의료 SaaS 거버넌스 체계 설계 총괄.",
      about_card2_desc: "AI기본법 및 EU AI Act 규제 요건 분석, 고영향 AI 위험 식별 및 거버넌스 체계 설계.",
      about_card3_desc: "FieldProof SaaS 개발 총괄, ISO 42001/42005 자동 보고서 생성 알고리즘 설계.",
      about_sec5_title: "원칙과 독립성",
      about_sec5_sub: "컨설팅과 제3자 심사의 이해상충을 완벽히 격리합니다.",
      about_fw_p: "퀀터니티에이아이는 <strong>인증 심사 준비 지원 컨설팅</strong>을 제공하며, 컨설팅 서비스를 제공받은 조직에 대해서는 당사 소속 심사원이 직접 제3자 인증 심사를 수행하지 않습니다.",
      about_fw_btn: "독립성 정책 상세 보기 →",
      about_sec6_title: "회사 개요",
      fact_th_name: "회사명",
      fact_td_name: "퀀터니티에이아이 주식회사 (Quanternity AI Inc.)",
      fact_th_ceo: "대표이사",
      fact_td_ceo: "ISO/IEC 42001 · 27001 · 13485 심사원",
      fact_th_purpose: "설립 목적",
      fact_td_purpose: "AI 거버넌스 및 ISO 경영시스템 컴플라이언스 체계 구축 및 증적 검증 도구 제공",
      fact_th_biz: "주요 사업",
      fact_td_biz: "AI 거버넌스 컨설팅, ISO/IEC 42001·27001 구축, FieldProof SaaS 개발 및 운영",
      fact_th_addr: "소재지 (오시는 길)",
      fact_td_addr: "인천광역시 서구 원당대로 876, 7층 703-19호(당하동, 희림타워)",
      fact_th_contact: "문의처",
      fact_td_contact: "이메일: scoc0505@gmail.com | 운영시간: 평일 09:30 – 18:30 (KST)",
      fact_th_contact: "문의처",
      fact_td_contact: "이메일: scoc0505@gmail.com | 운영시간: 평일 09:30 – 18:30 (KST)",

      ins_hero_title: "규제 인사이트 & 실무 가이드",
      ins_hero_sub: "현직 심사원과 규제 전담 연구진이 검토·분석한 AI기본법, EU AI Act, ISO/IEC 42001 최신 실무 가이드입니다.",
      ins_filter_all: "전체 (3)",
      ins_read_full: "전문 읽기 →"
    },
    en: {
      nav_services: "Services",
      nav_why: "Why ISO Audit",
      nav_fieldproof: "FieldProof",
      nav_insights: "Insights",
      nav_company: "Company",
      nav_company_about: "About Us",
      nav_company_indep: "Principles & Independence",
      nav_company_network: "Auditor Network",
      nav_company_contact: "Location & Business Info",
      btn_fieldproof_login: "FieldProof Login",
      btn_free_assessment: "Free Assessment",

      notice_badge: "NOTICE",
      notice_text: "<strong>Korea AI Framework Act Confirmed</strong><span class=\"announcement-body-inline\"> — Enforcement Decree in effect. Public procurement AI verification & ISO/IEC 42001·27001 integrated build assessment open.</span>",
      notice_link: "Assess Now ➔",

      hero_slide_1_h1: "Two Certifications,<br /><span class=\"text-green\">One Streamlined Implementation</span>.",
      hero_slide_1_sub: "ISO/IEC 42001 and 27001 share core management system structures such as policy, risk management, internal audit, and management review. Integrated implementation eliminates duplicate documentation, reducing preparation time and audit burdens.",
      hero_slide_1_cta1: "3-Min Assessment",
      hero_slide_1_cta2: "Free Assessment",

      hero_slide_2_h1: "Proving through <span class=\"text-green\">audit evidence</span>, not paperwork.",
      hero_slide_2_sub: "Integrated ISO/IEC 42001 & 27001 implementation, field evidence management, and high-impact AI regulatory analysis.<br />Designed by auditors, proven by evidence.",
      hero_slide_2_cta1: "Free Assessment",
      hero_slide_2_cta2: "Explore FieldProof",

      hero_slide_3_h1: "Won the public AI contract?<br /><span class=\"text-green\">Ready for the next RFP?</span>",
      hero_slide_3_sub: "Among public AI contract winners in early 2026, certified ISO/IEC 42001 cases remain rare. Now is the time to build a competitive edge as AI governance becomes an RFP criteria.",
      hero_slide_3_cta1: "Free Assessment",
      hero_slide_3_cta2: "Explore FieldProof",

      hero_slide_4_h1: "Recreating the same <span class=\"text-green\">audit documents</span> every time?",
      hero_slide_4_sub: "Clinical and tech organizations face constant audits. Operating SOPs and data protocols already satisfy most ISO/IEC 27001 & 42001 controls. Align existing practices once into a reusable framework.",
      hero_slide_4_cta1: "SOP → 27001·42001 Assessment",
      hero_slide_4_cta2: "See What Is Already Covered →",

      hero_slide_5_h1: "High-Impact AI,<br />Now Required to <span class=\"text-green\">'Prove It' Rather Than 'Claim It'</span>.",
      hero_slide_5_sub: "With the AI Framework Act Enforcement Decree in effect, risk management and impact assessment responsibilities for High-Impact AI are now formalized. The ISO/IEC 42001 & 27001 integrated framework transforms these requirements into an operational management system.",
      hero_slide_5_cta1: "Free Assessment",
      hero_slide_5_cta2: "Explore FieldProof",

      hero_sidebar_label: "Target Standards",
      promo_video_label: "PROMO · QUANTERNITY AI",
      member_1_role: "I · ADVISORY NETWORK",
      member_1_name: "ADVISORY NETWORK",
      member_1_creds: "M.S. in AI<br />Attorney<br />ISO 42001 · 27001 Auditor",
      member_2_role: "II · LEAD IMPLEMENTATION",
      member_2_name: "LEAD IMPLEMENTATION",
      member_2_creds: "Ph.D. in AI Engineering<br />ISO 42001 · 27001 · 13485<br />Auditor",
      member_3_role: "III · CHIEF TECHNOLOGY OFFICER",
      member_3_name: "CHIEF TECHNOLOGY OFFICER",
      member_3_creds: "Ph.D. in AI Engineering<br />Korea Vibe Coding Expert",

      public_ai_title: "Won the public AI contract?<br /><span style=\"color: var(--fg-3);\">Is your AI governance evidence ready?</span>",
      public_ai_lead: "Korea's AI Framework Act and procurement criteria are evolving together. If you hold ISO/IEC 27001, extending controls to ISO 42001 is the fastest path.",
      fact_1_title: "New Obligations for High-Impact AI",
      fact_1_desc: "Enforced Jan 2026. High-impact AI providers must maintain risk management, transparency, and documentation.",
      fact_2_title: "Expanding AI Trustworthiness Demands in Public RFPs",
      fact_2_desc: "Most public AI vendors lack ISO/IEC 42001. AI governance is now a key evaluation metric in RFPs.",
      fact_3_title: "ISO/IEC 27001 → 42001 Extension Pathway",
      fact_3_desc: "Layer AI controls onto existing ISMS. Implementation typically completes in 12–16 weeks.",

      reg_map_title: "Certification is Evidence for Regulatory Compliance.",
      reg_map_subtitle: "We mapped regulatory requirements to ISO clauses and Annex controls. Select a regulation on the left to view corresponding controls.",
      reg_table_th_std: "Standard",
      reg_table_th_ref: "Clause Ref",
      reg_table_th_name: "Control Name",
      reg_table_th_desc: "Requirement Mapping",
      reg_guardrail: "<strong>Compliance Guardrail:</strong> ISO standards do not <strong>guarantee</strong> legal immunity, but provide internationally recognized proof of compliance implementation.",

      services_title: "Two Axes, One Auditor Perspective.",
      services_subtitle: "We do not separate consulting from education. We build systems through an auditor's lens and embed internal expertise.",
      track_a_title: "Built to Operate, Not Just Document.",
      track_a_desc: "Designed to embed governance controls naturally into daily operations beyond static documents.",
      track_a_item1_name: "AI Governance Consulting",
      track_a_item1_spec: "ISO/IEC 42001 · AI Framework Act",
      track_a_item1_dur: "12–16 Weeks",
      track_a_item2_name: "ISMS & Privacy Consulting",
      track_a_item2_spec: "ISO/IEC 27001 · ISMS-P",
      track_a_item2_dur: "10–14 Weeks",
      track_a_item3_name: "Certification Readiness",
      track_a_item3_spec: "Audit Preparation Support",
      track_a_item3_dur: "4–8 Weeks",
      track_a_link: "Consulting Track Details →",

      track_b_title: "Internalization Without External Dependency.",
      track_b_desc: "Equips internal teams with practical capabilities to operate and improve systems independently.",
      track_b_item1_name: "ISO 42001 Internal Auditor Course",
      track_b_item1_spec: "Practitioner-Focused · Case-Based 2-Day",
      track_b_item1_dur: "16 Hours",
      track_b_item2_name: "AI Threat Modeling Workshop",
      track_b_item2_spec: "Joint Eng/Sec/Product Hands-on",
      track_b_item2_dur: "8 Hours",
      track_b_item3_name: "Executive AI Governance Relay",
      track_b_item3_spec: "Executive Risk Alignment",
      track_b_item3_dur: "4 Hours",
      track_b_link: "Training Track Schedule Inquiry →",

      fieldproof_title: "No audit can be passed<br />without field evidence.",
      fieldproof_subtitle: "FieldProof is an evidence management platform connecting ISO controls to daily operational outputs in real time.",
      fp_feat_1_title: "Real-Time Evidence Capture & Auto-Tagging",
      fp_feat_1_desc: "Auto-maps engineering, data, and model evaluation outputs to ISO 42001 control requirements.",
      fp_feat_2_title: "Internal & External Audit Mode Separation",
      fp_feat_2_desc: "Generates auditor-ready packages in one click while controlling sensitive data access.",
      fp_feat_3_title: "Continuous Compliance Monitoring",
      fp_feat_3_desc: "Detects evidence gaps in real time for surveillance and recertification audits.",

      notes_title: "Built by those who know the field,<br />used where real audits happen.",
      note_1_tag: "NOTE 01 · Field Observation",
      note_1_quote: "“Audit evidence photos are still sent via chat apps.”",
      note_1_body: "Location and time metadata are lost when sending via email or chat. An integrity-guaranteed platform is essential.",
      note_2_tag: "NOTE 02 · Audit Report Log",
      note_2_quote: "“Reports must be drafted on the day of audit.”",
      note_2_body: "Reports drafted a week after audits risk memory distortion. Same-day collection and drafting dictate audit quality.",
      note_3_tag: "NOTE 03 · Accreditation Trend",
      note_3_quote: "“Accreditors are filtering out copy-paste reports.”",
      note_3_body: "Submitting template copies results in non-conformities during surveillance audits. Each AI operation must be proven directly.",

      firewall_title: "Our auditors do not conduct certification audits for organizations that have received consulting or SaaS services from Quanternity AI.",
      firewall_desc: "We operate an independence firewall structure that eliminates conflicts of interest between consulting and 3rd-party audits.",
      firewall_btn1: "Auditor Network Guide →",
      firewall_btn2: "View Independence Principles →",

      insights_title: "Regulatory Briefings & Field Analysis.",
      insights_link: "All Insights List →",

      contact_title: "Initial Diagnosis Provided Free of Charge.",
      contact_lead: "In a 30-minute online session, we evaluate your compliance under the AI Framework Act & ISO 42001/27001, delivering a 3-page diagnostic summary within 2 business days. Collected data is used strictly for consultation and deleted within 30 days.",
      contact_quote: "“Most non-conformities found repeatedly during audits can be eliminated during document and procedure design.”",
      contact_author: "CEO<br />ISO/IEC 42001 · 27001 · 13485 Auditor",
      form_privacy_agree: "I agree to the Privacy Policy. Collected information is used solely for consultation and deleted within 30 days.",
      form_submit: "Submit Inquiry ➔",

      disclaimer_notice: "📌 <strong>Notice:</strong> This diagnosis and consulting represent technical analysis of ISO standards and do not constitute legal advice. Matters requiring legal interpretation require separate legal counsel.",
      disclaimer_indep: "🛡️ Quanternity AI Inc. is not a certification body and does not issue certificates. We do not participate in audits for organizations we have consulted.",

      modal_step1_title: "What is your primary industry domain?",
      modal_step1_sub: "First step to determine applicable regulations and ISO standards.",
      modal_step2_title: "What type of AI system do you develop or deploy?",
      modal_step3_title: "What is your most urgent compliance goal?",
      modal_step4_title: "High-Impact AI System",

      legal_terms_title: "Terms of Service",
      legal_privacy_title: "Privacy Policy",

      about_hero_title: "About Us",
      about_hero_sub: "Combining audit field experience and technology to build a sustainable AI governance & ISO compliance system beyond certificate submission.",
      about_nav_1: "01 Overview",
      about_nav_2: "02 Vision & Mission",
      about_nav_3: "03 CEO Message",
      about_nav_4: "04 People & Expertise",
      about_nav_5: "05 Principles & Independence",
      about_nav_6: "06 Fact Sheet",
      about_sec1_title: "Overview",
      about_sec1_p1: "Quanternity AI is an <strong>AI governance operating system company</strong> founded by active auditors, AI engineers, and legal compliance experts.",
      about_sec1_p2: "We go beyond one-off certification consulting to establish a sustainable, evidence-based management system under the Korea AI Framework Act, EU AI Act, and ISO/IEC 42001 & 27001.",
      about_sec1_p3: "Through our proprietary mobile field evidence SaaS 'FieldProof', we provide an objective evidence trail from audit prep to lifecycle control.",
      about_sec2_title: "Vision & Mission",
      about_sec2_sub: "Creating organizations that can explain their deployed AI, leaving operational systems that outlast the certificate.",
      about_vm_v_title: "Creating organizations that can explain their deployed AI.",
      about_vm_v_desc: "Building clear explainability between technology and risk controls so AI algorithms settle without regulatory friction.",
      about_vm_m_title: "Leaving operational systems that outlast the certificate, not just paperwork.",
      about_vm_m_desc: "Designing compliance systems that naturally embed into internal workflows to operate self-sustainably across the lifecycle.",
      about_p1_title: "Field Evidence Centric",
      about_p1_desc: "Building systems based on verifiable evidence examined by real auditors and regulators, not desktop documentation.",
      about_p2_title: "Fusion of Tech & Legal",
      about_p2_desc: "Seamless fusion of AI lifecycle tech controls with legal high-impact criteria and governance accountability.",
      about_p3_title: "Independence Firewall",
      about_p3_desc: "Strict separation between consulting execution and 3rd-party auditors to guarantee objectivity.",
      about_sec3_title: "Message from Leadership",
      about_ceo_quote: "&ldquo;What matters more than the certificate itself is a risk management system that operates continuously within the organization post-audit.&rdquo;",
      about_ceo_p1: "Hello, I am the representative of Quanternity AI.",
      about_ceo_p2: "With the 2026 AI Framework Act and EU AI Act enforcement, companies face heavy burdens regarding High-Impact AI determination and ISO/IEC 42001 certification. However, consulting that creates binders of papers to store in boxes holds zero weight during real audits or client due diligence.",
      about_ceo_p3: "As active auditors conducting numerous site audits, we realized organizations truly need an operational evidence framework—not vanity paperwork. Quanternity AI combines auditor design capabilities, legal advisory standards, and FieldProof SaaS technology.",
      about_ceo_p4: "We stand as your independent, professional partner to navigate global AI regulatory waves and build lasting market trust. Thank you.",
      about_sec4_title: "People & Expertise",
      about_sec4_sub: "Led by active auditors, legal advisors, and AI engineers.",
      about_card1_desc: "ISO/IEC 42001, 27001, 13485 Auditor. Head of public & medical SaaS governance system architecture.",
      about_card2_desc: "Korea AI Framework Act & EU AI Act regulatory requirements analysis, high-impact AI risk determination.",
      about_card3_desc: "Head of FieldProof SaaS R&D, architect of ISO 42001/42005 automated report generation engines.",
      about_sec5_title: "Principles & Independence",
      about_sec5_sub: "Completely isolating conflicts of interest between consulting and 3rd-party audits.",
      about_fw_p: "Quanternity AI provides <strong>certification audit preparation consulting</strong>. Our auditors do not conduct 3rd-party certification audits for organizations we have consulted.",
      about_fw_btn: "View Independence Policy Details →",
      about_sec6_title: "Fact Sheet",
      fact_th_name: "Company Name",
      fact_td_name: "Quanternity AI Inc.",
      fact_th_ceo: "CEO",
      fact_td_ceo: "ISO/IEC 42001 · 27001 · 13485 Auditor",
      fact_th_purpose: "Establishment Purpose",
      fact_td_purpose: "Establishing AI governance & ISO management system compliance frameworks and providing evidence verification tools",
      fact_th_biz: "Core Business",
      fact_td_biz: "AI Governance Consulting, ISO/IEC 42001·27001 Implementation, FieldProof SaaS Development & Operations",
      fact_th_addr: "Location (Address)",
      fact_td_addr: "703-19, 7F, Hirim Tower, 876 Wondang-daero, Seo-gu, Incheon, Republic of Korea",
      fact_th_contact: "Contact Info",
      fact_td_contact: "Email: scoc0505@gmail.com | Hours: Weekdays 09:30 – 18:30 (KST)",

      ins_hero_title: "Regulatory Insights & Practical Guides",
      ins_hero_sub: "Latest practical guides on the Korea AI Framework Act, EU AI Act, and ISO/IEC 42001 analyzed by active lead auditors and compliance researchers.",
      ins_filter_all: "All (3)",
      ins_read_full: "Read Full Article →"
    }
  };

  let currentLang = localStorage.getItem("quanternity_lang") || "ko";

  function applyTranslations(lang) {
    currentLang = lang;
    localStorage.setItem("quanternity_lang", lang);
    document.documentElement.lang = lang;

    const dict = I18N_DICTIONARY[lang] || I18N_DICTIONARY.ko;

    // Update all elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });

    // Update lang-switch button state & style
    document.querySelectorAll(".lang-switch").forEach(btn => {
      if (lang === "en") {
        btn.innerHTML = 'KO / <strong style="color: #10B981; text-decoration: underline;">EN</strong>';
      } else {
        btn.innerHTML = '<strong style="color: #10B981; text-decoration: underline;">KO</strong> / EN';
      }
    });
  }

  // Bind click listener to all lang-switch buttons
  document.querySelectorAll(".lang-switch").forEach(btn => {
    btn.style.cursor = "pointer";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const nextLang = currentLang === "ko" ? "en" : "ko";
      applyTranslations(nextLang);
    });
  });

  // Apply saved or default language on boot
  applyTranslations(currentLang);
});
