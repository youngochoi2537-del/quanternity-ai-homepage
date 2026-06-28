/* Quanternity AI — section components.
   Reads global COPY (window.COPY[lang]) and renders each section. */

const { useState, useEffect, useMemo, useContext, createContext } = React;

// ----- i18n context -----
const L = createContext({ lang: "ko", t: window.COPY.ko, heroKey: "master" });
const useL = () => useContext(L);

// ============================================================
// TopBar
// ============================================================
function TopBar({ lang, setLang }) {
  const { t } = useL();
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <a href="#" className="brand">
          {t.brand}
          <small>EST · 2026</small>
        </a>
        <nav className="nav">
          <a href="#solutions">{t.nav.solutions}</a>
          <a href="#industries">{t.nav.industries}</a>
          <a href="#insights">{t.nav.insights}</a>
          <a href="#about">{t.nav.about}</a>
        </nav>
        <div className="nav-right">
          <div className="lang-toggle">
            <button
              className={lang === "ko" ? "active" : ""}
              onClick={() => setLang("ko")}
            >KO</button>
            <button
              className={lang === "en" ? "active" : ""}
              onClick={() => setLang("en")}
            >EN</button>
          </div>
          <a href="#consult" className="btn btn-primary" style={{ padding: "10px 18px" }}>
            {t.nav.consult}
            <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// Hero
// ============================================================
function Hero() {
  const { t, heroKey } = useL();
  const v = t.heroVariants[heroKey] || t.heroVariants.master;
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <div className="hero-label">{t.heroLabel}</div>
          <h1 className="h-display" style={{ marginTop: 32 }}>
            <span>{v.h1Lead}</span>
            <br />
            <span className="emph">{v.h1Emph}</span>
          </h1>
          <p className="lead hero-sub">{v.sub}</p>
          <div className="hero-actions">
            <a href="#diagnose" className="btn btn-primary">
              {t.heroCta1}<span className="arrow">→</span>
            </a>
            <a href="#consult" className="btn btn-ghost">{t.heroCta2}</a>
          </div>

          <div style={{
            marginTop: 64,
            paddingTop: 28,
            borderTop: "1px solid var(--rule)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}>
            {[
              { k: "ISO/IEC 42001", v: "AI Management" },
              { k: "ISO/IEC 27001", v: "Information Security" },
              { k: "ISO 13485", v: "Medical Devices" },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--ink)" }}>{b.k}</div>
                <div className="small">{b.v}</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="hero-card">
          <div className="hero-card-label">
            <span>{t.heroCard.label}</span>
            <span>03</span>
          </div>

          {[
            { key: "k", img: "assets/images/portrait-k.jpg", num: "I" },
            { key: "mark", img: "assets/images/portrait-mark.jpg", num: "II" },
            { key: "daniel", img: "assets/images/portrait-daniel.jpg", num: "III" },
          ].map(({ key, img, num }) => (
            <div key={key} className="hero-card-row" style={{ gridTemplateColumns: "1fr" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 18, alignItems: "center" }}>
                <div className="hero-card-portrait"><img src={img} alt={t.heroCard[key].name} /></div>
                <div className="hero-card-person">
                  <div className="role">{num} · {t.heroCard[key].role}</div>
                  <div className="name">{t.heroCard[key].name}</div>
                  <div className="creds">{t.heroCard[key].creds}</div>
                </div>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

// ============================================================
// Triggers
// ============================================================
function Triggers() {
  const { t } = useL();
  const s = t.triggers;
  return (
    <section className="section" id="triggers" style={{ paddingTop: 90 }}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">{s.eyebrow}</div>
            <h2 className="h-section">{s.title}</h2>
          </div>
          <p className="lead">{s.sub}</p>
        </div>
        <div className="triggers-grid">
          {s.items.map((item, i) => (
            <div key={i} className="trigger-card">
              <div className="trigger-num">{item.num}</div>
              <div className="trigger-title">{item.title}</div>
              <div className="trigger-meta">
                <span>{item.meta}</span>
                <span className="trigger-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Positioning
// ============================================================
function Positioning() {
  const { t } = useL();
  const s = t.positioning;
  return (
    <section className="section" id="positioning">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">{s.eyebrow}</div>
            <h2 className="h-section">
              {s.h2Lead}<span className="emph">{s.h2Emph}</span>{s.h2Trail}
            </h2>
          </div>
          <p className="lead">{s.sub}</p>
        </div>
        <div className="pillars">
          {s.pillars.map((p, i) => (
            <div key={i} className="pillar">
              <div className="pillar-num">{p.num}</div>
              <h3 className="h-card">{p.title}</h3>
              <p className="body">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Signature
// ============================================================
function Signature() {
  const { t } = useL();
  const s = t.signature;
  return (
    <section className="section" id="solutions" style={{ background: "color-mix(in oklch, var(--paper) 60%, var(--paper-2))" }}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">{s.eyebrow}</div>
            <h2 className="h-section">{s.title}</h2>
          </div>
          <p className="lead">{s.sub}</p>
        </div>
        <div className="signature-steps">
          {s.steps.map((st, i) => (
            <div key={i} className="signature-step">
              <div className="sig-phase">{st.phase}</div>
              <div className="sig-lead">{st.lead}</div>
              <h3 className="sig-title">{st.title}</h3>
              <div className="sig-owner">◆ {st.owner}</div>
              <p className="body" style={{ marginTop: 4 }}>{st.body}</p>
              <div className="sig-out">{st.out}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Industries
// ============================================================
function Industries() {
  const { t } = useL();
  const s = t.industries;
  return (
    <section className="section" id="industries">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">{s.eyebrow}</div>
            <h2 className="h-section">{s.title}</h2>
          </div>
          <p className="lead">{s.sub}</p>
        </div>
        <div className="industries-grid">
          {s.items.map((it, i) => (
            <a key={i} href="#" className="industry-card">
              <div className="industry-img">
                <img src={it.img} alt={it.name} />
              </div>
              <div className="industry-meta">
                <div className="industry-tag">{it.tag}</div>
                <div className="industry-name">{it.name}</div>
                <div className="industry-trigger">{it.trigger}</div>
                <div className="industry-stack">{it.stack}</div>
                <div className="industry-link">{it.link}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Duo
// ============================================================
function Duo() {
  const { t } = useL();
  const s = t.duo;
  return (
    <section className="section" id="about" style={{ background: "color-mix(in oklch, var(--paper) 60%, var(--paper-2))" }}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">{s.eyebrow}</div>
            <h2 className="h-section">{s.title}</h2>
          </div>
          <p className="lead">{s.sub}</p>
        </div>

        <div className="duo-grid trio-grid">
          {[
            { key: "k", img: "assets/images/portrait-k.jpg", num: "I" },
            { key: "mark", img: "assets/images/portrait-mark.jpg", num: "II" },
            { key: "daniel", img: "assets/images/portrait-daniel.jpg", num: "III" },
          ].map(({ key, img, num }) => (
            <div key={key} className="duo-person">
              <div className="duo-photo"><img src={img} alt={s[key].name} /></div>
              <div className="duo-info">
                <div className="duo-role">{num} · {s[key].role}</div>
                <div className="duo-name">{s[key].name}</div>
                <div className="duo-title">{s[key].title}</div>
                <ul className="duo-creds">
                  {s[key].creds.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
                <p className="duo-body">{s[key].body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="duo-boundary">
          <div className="label">{s.separation.label}</div>
          <p className="body" style={{ fontSize: 13.5 }}>{s.separation.body}</p>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Stats
// ============================================================
function Stats() {
  const { t } = useL();
  const s = t.stats;
  return (
    <section className="section" id="timing">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">{s.eyebrow}</div>
            <h2 className="h-section">{s.title}</h2>
          </div>
          <p className="lead">{s.sub}</p>
        </div>
        <div className="stats-grid">
          {s.items.map((it, i) => (
            <div key={i} className="stat">
              <div className="stat-num">
                {it.num}{it.unit && <span className="unit">{it.unit}</span>}
              </div>
              <div className="stat-label">{it.label}</div>
              <div className="stat-note">{it.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Scenarios
// ============================================================
function Scenarios() {
  const { t } = useL();
  const s = t.scenarios;
  return (
    <section className="section" id="methodology" style={{ background: "color-mix(in oklch, var(--paper) 60%, var(--paper-2))" }}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">{s.eyebrow}</div>
            <h2 className="h-section">{s.title}</h2>
          </div>
          <p className="lead">{s.sub}</p>
        </div>
        <div className="scenarios-list">
          {s.items.map((sc, i) => (
            <div key={i} className="scenario">
              <div className="sc-tag">
                <div className="num">{sc.tag}</div>
                <div className="ind">{sc.industry}</div>
              </div>
              <div className="sc-situation">{sc.situation}</div>
              <div className="sc-steps">
                <div className="sc-step"><div className="k">01 · Legal</div><div className="v">{sc.step1}</div></div>
                <div className="sc-step"><div className="k">02 · Joint</div><div className="v">{sc.step2}</div></div>
                <div className="sc-step"><div className="k">03 · Audit</div><div className="v">{sc.step3}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Insights
// ============================================================
function Insights() {
  const { t } = useL();
  const s = t.insights;
  return (
    <section className="section" id="insights">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">{s.eyebrow}</div>
            <h2 className="h-section">{s.title}</h2>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <a href="#" className="btn-link">{s.seeAll}</a>
          </div>
        </div>
        <div className="insights-grid">
          {s.items.map((it, i) => (
            <div key={i} className="insight">
              <div className="insight-meta">
                <span className="insight-cat">{it.cat}</span>
                <span>{it.date}</span>
              </div>
              <h3 className="insight-title">{it.title}</h3>
              <p className="insight-lead">{it.lead}</p>
              <div style={{ marginTop: "auto", paddingTop: 18 }}>
                <span className="btn-link">Read →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FooterCTA + Footer
// ============================================================
function FooterCTA() {
  const { t } = useL();
  const s = t.footerCta;
  return (
    <section className="footer-cta" id="consult">
      <div className="wrap">
        <div className="eyebrow">{s.eyebrow}</div>
        <h2>
          {s.h2Lead}<br />
          <span className="emph">{s.h2Emph}</span>
        </h2>
        <p className="sub">{s.sub}</p>
        <div className="actions">
          <a href="#diagnose" className="btn btn-primary">{s.cta1}<span className="arrow">→</span></a>
          <a href="#" className="btn btn-ghost">{s.cta2}</a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useL();
  const s = t.footer;
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="b">{s.brand}</div>
            <div className="t">{s.tagline}</div>
          </div>
          {s.cols.map((c, i) => (
            <div key={i} className="footer-col">
              <h4>{c.title}</h4>
              <ul>
                {c.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-legal">
          <div className="row">
            <span>{s.legal.co}</span>
            <span>{s.legal.biz}</span>
            <span>{s.legal.addr}</span>
          </div>
          <div className="note">{s.legal.note}</div>
          <div className="copy">
            <span>{s.legal.copy}</span>
            <span className="mono">v1.0 · 2026.06</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// Expose components globally
// ============================================================
Object.assign(window, {
  L, useL,
  TopBar, Hero, Triggers, Positioning, Signature,
  Industries, Duo, Stats, Scenarios, Insights,
  FooterCTA, Footer,
});
