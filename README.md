# Handoff: Quanternity AI — Corporate Homepage

## Overview

This is the design handoff for the **Quanternity AI corporate homepage** — a single-page marketing site whose purpose is to convert high-regulation enterprise visitors (MedTech / IVD, Finance / Fintech, Public sector / Listed companies) into qualified consultation leads.

The single-page goal is: **30-second regulatory assessment → attorney consultation booking**.

The design is anchored around three positioning premises that recur throughout the page:

1. **Legal judgment precedes certification** — the page is built around the thesis that ISO certification alone cannot solve AI regulatory risk; an attorney must classify the risk first.
2. **Attorney + Lead Auditor + CTO as one team** — three named credentials operating as a single engagement.
3. **Integrated cost efficiency** — 27001 + 42001 (and optionally 13485 / 37301) implemented as one management system.

The page is bilingual (Korean / English) with a runtime language toggle, and ships a `Tweaks` panel that lets the user explore hero-copy variants and palette options without code changes.

---

## About the Design Files

**The files in `source/` are design references created in HTML/CSS/React-via-Babel** — a prototype showing the intended look, copy, layout, and interactions. They are **not production code to copy directly**.

The expected task is to **recreate these designs in the target codebase's environment** (Next.js, Astro, Vue, SvelteKit, whatever the production stack is), using its established patterns, component library, and conventions. If no production environment exists yet, choose an appropriate framework for a marketing/corporate site — Next.js (App Router) + Tailwind, or Astro + a small React/Vue island layer for the Tweaks panel — and implement the designs there.

Specifically, do not ship:

- The Babel in-browser compiler (`@babel/standalone`).
- The `Tweaks` panel runtime (`tweaks_panel.jsx`) — this is a designer-time exploration tool, not user-facing functionality. The selected hero variant and palette should be baked into production, not toggleable at runtime.
- The CDN font loads as written — use the codebase's existing font loading strategy (`next/font`, `@fontsource`, self-hosted, etc.).
- The runtime JSX dictionary (`copy.js`) as-is — re-implement as proper i18n (next-intl, react-i18next, vue-i18n, etc.) keyed off the same string namespaces.

---

## Fidelity

**High-fidelity (hi-fi).** Final colors, typography, spacing, copy, and imagery are all production-ready. Recreate pixel-perfectly using the codebase's existing primitives where reasonable substitutions exist (e.g. use the existing Button component if it can be themed to match; otherwise build a new one to spec).

One explicit caveat: **the AI-generated portraits of K, Mark, and Daniel are placeholders** — they were generated to convey the intended tone (classical law-firm portrait / modern business portrait / tech-executive portrait) and must be replaced with real photographs of the actual founders before launch. The slots, sizing, and grayscale treatment should be preserved.

---

## Screens / Views

There is **one screen** — the homepage at `/`. It is composed of 12 stacked sections inside a single scroll container.

### Global layout

- **Max content width**: 1320px. Outer page is full-bleed; `.wrap` is the constrained container.
- **Horizontal padding**: 40px desktop, 22px mobile (≤760px).
- **Vertical section padding**: 120px top/bottom on desktop, 80px on mobile (≤900px).
- **Page background**: `--paper` (default Ivory `oklch(0.965 0.012 80)` — see Design Tokens).
- **Body text color**: `--ink` (default `oklch(0.18 0.025 250)` — near-black deep navy).
- **Section separator**: 1px hairline rule (`var(--rule)`).
- **Alternating section background**: every other section uses a slightly darker paper tone via `color-mix(in oklch, var(--paper) 60%, var(--paper-2))` — applied inline to `#solutions`, `#about`, `#methodology`.

### Sticky top bar

- **Height**: 72px.
- **Position**: `sticky; top: 0; z-index: 50`.
- **Background**: `color-mix(in oklch, var(--paper) 92%, transparent)` with `backdrop-filter: blur(12px)`.
- **Border-bottom**: 1px `var(--rule)`.
- **Inner grid**: `1fr auto 1fr` — left brand, center nav, right actions.
- **Brand** (left): serif logotype "Quanternity AI" 22px / weight 500 / letter-spacing -0.015em, followed by a mono small-caps `EST · 2026` in `var(--ink-3)`.
- **Nav** (center, ≥760px): horizontal list of `Solutions / Industries / Insights / About` — 14px / weight 500 / 36px gap. Each link has a left-anchored underline that scales from 0 → 1 on hover (200ms).
- **Right actions**: a `KO / EN` segmented toggle (mono 11px, active state = filled ink) and a primary `Schedule a Consultation` button.

### 1. Hero (`section.hero`)

- **Padding**: 72px top / 96px bottom; bottom border 1px rule.
- **Grid**: `minmax(0, 1.5fr) minmax(300px, 1fr)` with 72px gap; collapses to a single 760px-max-width column at ≤1024px.

**Left column** (the headline):

- **Eyebrow**: mono 11px / 0.18em tracking / `var(--ink-3)`, prefixed by a 28px horizontal hairline. Content: `AI Regulatory Era · 2026`.
- **H1**: serif 38-76px clamp (`clamp(38px, 5.4vw, 76px)`) / line-height 1.06 / letter-spacing -0.025em / `text-wrap: balance` / `word-break: keep-all` when `:lang(ko)`. Two-line composition: a plain lead line, a `<br>`, then an italicized emphasis line. Headline copy is variant-controlled (see Tweaks → Hero copy below).
- **Sub**: 18px / line-height 1.6 / `var(--ink-2)` / max-width 58ch / 28px top margin.
- **CTA row** (40px top margin, 14px gap, wrap):
  - Primary: `30-second Regulatory Assessment →` (filled `--ink` button, 14px / weight 500 / 14px×22px padding / sharp corners; arrow translates +4px on hover).
  - Secondary: `Schedule a Consultation` (ghost button, 1px `var(--rule-strong)` border).
- **Credential strip** (64px top margin, 28px top padding, top-rule): 3-column grid showing `ISO/IEC 42001 — AI Management`, `ISO/IEC 27001 — Information Security`, `ISO 13485 — Medical Devices`. Each item is a mono 11px / 0.14em label over a 13px gray small line.

**Right column** (`aside.hero-card` — the practice composition card):

- **Container**: 1px `var(--rule-strong)` border, padding 28px, no border-radius, background `color-mix(in oklch, var(--paper) 70%, var(--paper-2))`.
- **Header**: mono 10px / 0.2em tracking, `Practice Composition` left + index `03` right, separated from body by an 18px-padded bottom rule.
- **Three person rows** (K → Mark → Daniel), each:
  - 18px vertical padding between rows; bottom hairline (last row has no rule, no bottom padding).
  - Inner grid: portrait `1fr` / info `1.4fr` / 18px gap / vertically centered.
  - Portrait: `aspect-ratio: 1 / 1.15` / `object-fit: cover` / `filter: grayscale(1) contrast(1.02)`.
  - Info: role label (mono 9px / 0.18em / `var(--ink-3)` / format `I · Legal Counsel`), name (serif 20px), creds (sans 11.5px / `var(--ink-2)` / line-height 1.5).

### 2. Triggers (`#triggers`)

The four entry points by trigger situation.

- **Section head**: 2-column grid (`1fr 1.4fr`) — left: eyebrow `BEGIN WHERE YOU ARE` + H2 `What is your trigger?`; right: lead paragraph. 48px gap, end-aligned, 64px bottom margin.
- **Grid**: 4 columns, top border `var(--rule-strong)`, left border `var(--rule)`. Collapses to 2 columns at ≤1024px, 1 column at ≤600px.
- **Each card**:
  - Padding 32/28/28/28, right + bottom 1px rules, min-height 220px, flex column 16px gap.
  - Top: mono 11px / 0.15em number (`01`–`04`).
  - Middle: serif 19px / 1.35 / `word-break: keep-all` title, `flex: 1`.
  - Bottom: mono 11px meta on left, arrow `→` on right; arrow translates +6px on hover.
  - Hover: background shifts to `color-mix(in oklch, var(--paper) 70%, var(--paper-2))`.

**Card contents** (KO / EN):

| # | Title | Meta |
|---|---|---|
| 01 | 납품처에서 ISO 42001을 요구받았습니다 / A customer asked us for ISO 42001 | MS · SAP · 글로벌 SaaS |
| 02 | AI 기본법 · EU AI Act 대응이 필요합니다 / We need to respond to the AI Framework Act / EU AI Act | 2026.1 · 2026.8 시행 |
| 03 | 보안사고를 경험했거나 우려됩니다 / We've had a security incident — or we're worried | ISO 27001 + governance |
| 04 | 해외 수출 · 의료기기 인증 준비 중입니다 / Preparing for export / medical device certification | ISO 13485 + EU AI Act |

### 3. Positioning (`#positioning`)

Three differentiator pillars beneath a thesis statement.

- **Section head**: H2 with inline italic emphasis — `Consulting where [legal judgment] precedes the checklist.` The bracketed phrase uses `.emph` (italic).
- **Pillars**: 3-column grid with internal right-rules between columns, top rule on the row.
- **Each pillar**: padding 40px top/bottom and 36px right (last has no right padding/rule), flex column 18px gap.
  - Roman numeral (`I` / `II` / `III`) in serif italic 28px / `var(--ink-3)`.
  - Title — serif 22px (`h3.h-card`).
  - Body — 15px / `var(--ink-2)` / line-height 1.7.

### 4. Signature (`#solutions`)

The three-phase signature engagement.

- **Background**: alternating darker paper tone.
- **Steps grid**: 3 columns, 1px solid `var(--rule-strong)` on top, with a 10×10 ink square positioned at `top: -5px; left: 0` to act as a starting marker.
- **Each step**: padding 40/32/36/0, right hairline, min-height 360px, flex column 14px gap.
- **Step contents** (in order):
  1. Phase tag (mono 10px / 0.18em / uppercase) — `Phase 01` / `02` / `03`.
  2. Lead label (serif italic 16px / `var(--ink-3)`) — `Legal Diagnosis` / `AI Governance Design` / `Certification Execution`.
  3. Title (serif 26px) — Korean / English titles per copy.
  4. Owner chip — `◆ <name>` inline-flex, 4px×10px padding, 1px `var(--rule-strong)` border, mono 11px / 0.06em tracking, `align-self: flex-start`. Values: `K · 변호사` / `K · Mark · Daniel 공동` / `K · Mark 선임심사원`.
  5. Body — 15px / `var(--ink-2)`.
  6. Output strip — `margin-top: auto`, 16px top padding, dashed top rule, mono 11px / 0.05em / `var(--ink-3)`, prefixed with `↳ `.

### 5. Industries (`#industries`)

Three industry cards (MedTech / Finance / Public Sector).

- **Grid**: 3 columns, 32px gap; collapses to 1 column at ≤1000px with 28px gap.
- **Each card** (`a.industry-card`):
  - Image: 4:3 aspect, full-width, `object-fit: cover`, `filter: grayscale(1) contrast(1.04) brightness(0.95)`. On card hover: `scale(1.03)` + brightness back to 1.0 over 600ms cubic-bezier(0.2, 0.8, 0.2, 1).
  - Meta block (24px top padding, top hairline, 18px margin-top from image, 14px gap):
    - Tag: mono 11px / 0.14em (`I.` / `II.` / `III.`).
    - Name: serif 24px / letter-spacing -0.015em / line-height 1.2.
    - Trigger: 13px sans / `var(--ink-2)` / 1.55 line-height.
    - Stack: mono 11px / 0.06em / `var(--ink)`, 12px top padding, dashed top rule.
    - Link: 13px sans `var(--ink)`, 4px top padding, gap 6px between text and arrow; gap animates to 12px on card hover.

### 6. Duo / Trio profiles (`#about`)

The three-person practice leadership grid.

- **Background**: alternating darker paper tone.
- **Trio grid**: 3 columns / 40px gap at ≥1100px; collapses to a single 720px-max-width column with horizontal cards (photo left, info right) below 1100px; fully stacked at ≤600px.
- **Each person card** (`.duo-person`):
  - At ≥1100px: photo on top (`aspect-ratio: 4/5`), info below, 20px gap.
  - At 600–1100px: 2-column `minmax(180px, 0.9fr) 1.4fr`, 28px gap, photo `aspect-ratio: 3/4`.
  - Photo: `object-fit: cover`, `filter: grayscale(1) contrast(1.05)`.
  - Info block (flex column, 14px gap):
    - Role (mono 10px / 0.2em / uppercase) — `I · Legal Counsel` / `II · Lead Implementation` / `III · Chief Technology Officer`.
    - Name (serif 30px on trio, line-height 1) — `K` / `Mark` / `Daniel`.
    - Title (serif italic 16px / `var(--ink-2)`) — e.g. `Attorney · Co-founder`.
    - Credentials list (`ul.duo-creds`): 8px top margin, top hairline, 14px top padding, 6px gap; each `li` is 12px sans `var(--ink-2)` with a 16px left indent and an em-dash `—` glyph as the marker.
    - Body — 13.5px / `var(--ink-2)` / line-height 1.65, top hairline, 16px top padding, 6px margin-top.

**Boundary disclaimer block** (56px top margin):

- 1px `var(--rule-strong)` border, 28px padding, 2-column grid (`auto 1fr`) with 28px gap, alternating paper background.
- Left: mono 11px / 0.2em / uppercase label `Boundary` inside a 1px boxed chip.
- Right: 13.5px body explaining the legal/audit/engineering responsibility separation under Korean Attorney Act and advertising rules.

### 7. Stats (`#timing`)

Four market-timing numbers.

- **Grid**: 4 columns, top border `var(--rule-strong)`. Collapses to 2 columns ≤1000px, 1 column ≤600px.
- **Each stat**: padding 40px top/bottom and 28px right (last has no right padding/rule), flex column 12px gap.
  - Number: serif clamp(48px, 5.4vw, 72px) / letter-spacing -0.03em / line-height 1. Unit (e.g. `%+`) is 0.4em smaller, mono, `var(--ink-3)`, with 4px left margin.
  - Label: 13.5px / 1.5 / weight 500 / `var(--ink)`.
  - Note: mono 11px / 0.04em / `var(--ink-3)`, pushed to the bottom (`margin-top: auto`) over a 12px top padding + dashed hairline.

**Values**:

| Number | Unit | Label | Note |
|---|---|---|---|
| 16 | — | ISO 42001 cumulative certifications in Korea | First-mover whitespace |
| 2026.1 | — | Korea AI Framework Act in force | High-impact AI obligations |
| 2026.8 | — | EU AI Act high-risk obligations apply | Direct impact: MedTech, Finance |
| 50 | %+ | Cost saving on integrated 27001 + 42001 | Audit & doc overlap removed |

### 8. Scenarios (`#methodology`)

Three illustrative engagement walkthroughs.

- **Background**: alternating darker paper tone.
- **Each scenario row** (`.scenario`):
  - Grid: `220px / 1fr / 2.2fr` columns, 48px gap, 40px top/bottom padding, 1px top rule (last has bottom rule too). Stacks to 1 column with 20px gap at ≤1000px.
  - Column 1 (tag): mono 10px / 0.2em / uppercase number (`Scenario A` / `B` / `C`) over a 22px serif italic industry name.
  - Column 2 (situation): serif 19px / 1.5 / `word-break: keep-all` paragraph.
  - Column 3 (steps): 3 step rows, each a `56px 1fr` grid with `16px` gap, dashed top hairline between (first has none). Step key: mono 10px / 0.15em / `var(--ink-3)` — `01 · Legal`, `02 · Joint`, `03 · Audit`. Step value: 14px / `var(--ink-2)` / 1.6.

### 9. Insights (`#insights`)

Three regulatory insights cards (latest 3).

- **Section head**: H2 on the left, `All insights →` link on the right (`.btn-link` style — underlined 14px / weight 500, gap from text to arrow animates from 8px to 14px on hover).
- **Grid**: 3 columns, top hairline. Collapses to 1 column at ≤900px.
- **Each card**: padding 32px top / 36px right / 36px bottom / 0 left, right hairline, min-height 240px, flex column 16px gap, `cursor: pointer`.
  - Meta row: 14px gap mono 11px — category (gets a right hairline and 14px right padding, `var(--ink)`) + date (`var(--ink-3)`).
  - Title: serif 22px / 1.3 / -0.015em / `flex: 1` / `word-break: keep-all`.
  - Lead: 13.5px / `var(--ink-2)` / 1.6.
  - `Read →` link at bottom (`margin-top: auto`, 18px top padding).

### 10. Footer CTA (`#consult`)

The terminal conversion block.

- **Background**: `var(--ink)` (deep navy); text on `var(--paper)`.
- **Padding**: 120px top/bottom.
- **Composition**: eyebrow → H2 → sub → actions, all left-aligned.
- **Eyebrow**: mono 11px / 0.18em / `oklch(0.7 0.015 80)` color, with a 18px hairline of the same color preceding it.
- **H2**: serif clamp(36px, 5vw, 64px) / line-height 1.08 / -0.025em / `text-wrap: balance` / `max-width: 22ch`. Two-line copy with an italic emphasis on the second line.
- **Sub**: 14px / `oklch(0.78 0.015 80)` / max-width 52ch.
- **Actions** (44px top margin, 14px gap):
  - Inverted primary: paper background, ink text — `30-second Regulatory Assessment →`.
  - Inverted ghost: 1px `oklch(0.5 0.02 80)` border, paper text — `Schedule a Consultation`.

### 11. Footer (`footer.footer`)

- **Background**: `var(--paper-2)`.
- **Padding**: 80px top / 40px bottom.
- **Grid**: `1.6fr 1fr 1fr 1fr` (brand + 3 link columns), 40px gap, 56px bottom padding ending in a hairline.
  - Brand column: serif 26px name + 13px tagline (`var(--ink-2)`, max-width 36ch).
  - Link columns: 11px mono uppercase H4 / 0.18em (`Solutions` / `Industries` / `Resources`), then 13.5px li items in a flex column with 10px gap. Items get `var(--ink)` color on hover.
- **Legal block** (32px top padding, 14px gap):
  - Single row of company info: corp name, business reg number, contact line (12px / `var(--ink-3)`, 18px gaps).
  - **Disclaimer note** in a boxed block — `padding: 14px 16px`, 2px left border `var(--rule-strong)`, slightly darker mixed background, max-width 92ch, line-height 1.6. This is the variance-of-authority disclaimer separating attorney / lead-auditor / CTO accountability under the Korean Attorney Act.
  - **Copyright row** at the bottom: hairline above, flex space-between of `© 2026 Quanternity AI. All rights reserved.` and a mono version stamp.

---

## Interactions & Behavior

### Navigation

- Top nav links scroll to in-page section IDs (`#solutions`, `#industries`, `#insights`, `#about`).
- `Schedule a Consultation` (top right + CTA buttons throughout) → `#consult` (in this MVP). In production, route to a dedicated consultation form / Calendly equivalent.
- The 30-second-assessment CTAs link to `#diagnose` in the prototype. **In production this should route to a separate `/assessment` page** that implements the diagnostic flow (F1 in the PRD: industry → AI use → export → returns a "High-impact / High-risk / Recommended stack" verdict). The form is **not** implemented in this prototype — only its entry point.

### Language toggle

- Two-button segmented control in the top bar (`KO` / `EN`).
- On click, swaps the entire copy dictionary in place via React state. No URL change in the prototype. In production, this should use `next/router` locale switching or equivalent — `/` for KO, `/en` for EN.

### Hover transitions

| Element | Property | Duration | Easing |
|---|---|---|---|
| Nav link underline | `transform: scaleX(0→1)` | 200ms | ease |
| Primary button arrow | `translateX(+4px)` | 200ms | ease |
| Trigger card arrow | `translateX(+6px)` | 200ms | ease |
| Trigger card background | `background` shift | 200ms | ease |
| Industry image | `scale(1) → scale(1.03)` + `filter brightness 0.95 → 1.0` | 600ms image / 400ms filter | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Industry link gap | gap `6px → 12px` | 200ms | ease |
| Insights "All insights →" | gap `8px → 14px` | 200ms | ease |
| Button hover (primary) | `background-color` darken | 200ms | ease |
| Button hover (ghost) | `border-color` to ink + 3% bg | 200ms | ease |

### `prefers-reduced-motion`

All transitions are clamped to 0.01ms when `prefers-reduced-motion: reduce` — keep this in production.

### Korean line-breaking

The page uses `word-break: keep-all` globally on `body` and `overflow-wrap: break-word`. Headlines, trigger titles, insight titles, and scenario situations re-assert `word-break: keep-all` under `:lang(ko)`. This is important — Korean text without `keep-all` breaks mid-eojeol and looks unprofessional. Replicate this in the target codebase.

### Smooth scroll

`scroll-margin-top: 80px` is set on `.section` so anchor jumps don't slide under the sticky top bar.

---

## State Management

For a marketing site, only two pieces of state need persistence:

1. **Language**: KO / EN. Should live in URL locale (Next.js i18n, Astro `lang`, etc.), not in client state.
2. **Hero variant / palette**: design-only knobs. **Do not ship the Tweaks panel** — bake the chosen variant into production. The four hero variants are documented below in case the team wants per-campaign landing pages.

No data fetching, no user accounts, no forms in this MVP. The contact / assessment / consultation forms will live on subsequent pages (out of scope for this handoff).

---

## Design Tokens

All tokens are declared as CSS custom properties on `:root` in `source/assets/styles.css`. The default palette is `Ivory + Navy`.

### Colors (oklch + approximate hex)

| Token | oklch | Approx hex | Use |
|---|---|---|---|
| `--ink` | `oklch(0.18 0.025 250)` | `#0f1622` | Primary text, primary buttons, dark sections |
| `--ink-2` | `oklch(0.32 0.04 250)` | `#3b455c` | Body / secondary text |
| `--ink-3` | `oklch(0.5 0.03 250)` | `#6c7388` | Tertiary / muted (eyebrows, notes, meta) |
| `--mute` | `oklch(0.6 0.02 250)` | `#888d9d` | Disabled / lightest copy |
| `--paper` | `oklch(0.965 0.012 80)` | `#f6f1e6` | Page background (Ivory) |
| `--paper-2` | `oklch(0.93 0.018 80)` | `#ebe2cf` | Alt section background (subtler) |
| `--paper-3` | `oklch(0.89 0.022 75)` | `#dbcfb4` | Tertiary surfaces (image placeholders) |
| `--rule` | `oklch(0.18 0.025 250 / 0.16)` | `rgba(15,22,34,0.16)` | Hairline dividers |
| `--rule-strong` | `oklch(0.18 0.025 250 / 0.5)` | `rgba(15,22,34,0.5)` | Stronger dividers, borders |
| `--accent` | `oklch(0.55 0.13 38)` | `#b56830` | Burnt ochre accent (used sparingly — currently unused on the live home; reserved for insights / callouts) |
| `--on-ink` | `var(--paper)` | — | Text color on ink-filled surfaces |

**Alternate palettes** (`[data-palette="..."]`):

- `vellum` — warmer / more saturated paper: `--paper: oklch(0.92 0.022 80)`, `--paper-2: oklch(0.88 0.028 78)`, `--paper-3: oklch(0.84 0.03 75)`.
- `pure` — cooler near-white: `--paper: oklch(0.995 0.002 250)`, `--paper-2: oklch(0.965 0.006 250)`, `--paper-3: oklch(0.93 0.008 250)`, `--rule: oklch(0.18 0.025 250 / 0.12)`.
- `charcoal` — full dark mode: swaps `--ink` and `--paper` axes; `--ink: oklch(0.94 0.008 80)`, `--paper: oklch(0.18 0.018 250)`, `--rule: oklch(0.94 0.008 80 / 0.18)`, `--accent: oklch(0.7 0.13 50)`.

For production, decide on **one** palette (default `ivory`) and bake it in; the other three are exploration artifacts.

### Typography

| Token | Font stack |
|---|---|
| `--font-serif-ko` | `"Noto Serif KR", "Nanum Myeongjo", "Source Serif 4", "Times New Roman", serif` |
| `--font-serif-en` | `"Source Serif 4", "Noto Serif KR", "Times New Roman", serif` |
| `--font-sans` | `"Pretendard", "Inter", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Helvetica Neue", Helvetica, Arial, sans-serif` |
| `--font-mono` | `"JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace` |
| `--font-serif` | aliased to `--font-serif-ko` by default |

Headlines use the serif family; body and UI use Pretendard / Inter; eyebrows, meta, dates, and stat units use the mono family.

**Type scale** (CSS classes in `styles.css`):

| Class | Size | Weight | Line-height | Letter-spacing | Notes |
|---|---|---|---|---|---|
| `.h-display` | clamp(38px, 5.4vw, 76px) | 400 | 1.06 | -0.025em | Hero H1. `text-wrap: balance`. |
| `.h-section` | clamp(30px, 3.8vw, 50px) | 400 | 1.10 | -0.022em | Section H2. |
| `.h-sub` | clamp(22px, 2.2vw, 28px) | 400 | 1.25 | -0.015em | Sub-headings. |
| `.h-card` | 20px | 500 | 1.30 | -0.012em | Card titles. |
| `.lead` | 18px | 400 | 1.60 | — | Hero/section lead paragraph. `max-width: 62ch`. |
| `.body` | 15px | 400 | 1.70 | — | Body paragraphs in cards. |
| `.small` | 13px | 400 | 1.65 | — | Small print. |
| `.eyebrow` | 11px | 500 | — | 0.18em | Uppercase section eyebrows. |
| `.mono` | inherits size | 400 | — | — | Switches family to `--font-mono`, enables `tnum`. |

Global body: 16px / 1.65 / `-0.005em` letter-spacing / Pretendard.

### Spacing scale

Loose, not strict — values used in practice:

| Token | px |
|---|---|
| xxs | 4 |
| xs | 8 |
| sm | 14 |
| md | 18 |
| lg | 24 |
| xl | 32 |
| 2xl | 48 |
| 3xl | 64 |
| 4xl | 80 |
| 5xl | 120 |

Section vertical padding: `120px` desktop, `80px` mobile. Section head bottom margin: `64px` (desktop) / `40px` (mobile). Inner card padding usually `28–40px`. Hairline rules are 1px; emphasized rules are still 1px but at higher opacity (`--rule-strong`).

### Border radius

**Zero radius throughout** — sharp corners are an explicit aesthetic choice (law-firm classical). No element uses `border-radius`. Do not introduce rounded corners.

### Shadows

**Zero shadows.** All elevation is communicated via 1px hairlines and background-tone shifts. Do not introduce drop shadows.

### Filters

Imagery uses a strong grayscale treatment:

- Industry mood shots: `grayscale(1) contrast(1.04) brightness(0.95)`; on card-hover, brightness → 1.0.
- Hero card portraits: `grayscale(1) contrast(1.02)`.
- About-section portraits: `grayscale(1) contrast(1.05)`.

This is the visual glue that holds the AI-generated placeholders together with the document tone. When real photographs replace the placeholders, keep the same grayscale filter — they were shot/generated assuming this treatment.

---

## Hero Copy Variants

The hero has **four interchangeable copy sets**, one per primary trigger audience. Pick the right one per landing page in production:

| Variant key | Eyebrow | H1 lead | H1 emph (italic) | Sub |
|---|---|---|---|---|
| `master` (default) | Our Premise | AI 규제는 인증만으로 막을 수 없습니다. | 법률 판단이 먼저입니다. | 사시 출신 변호사와 ISO 선임심사원이 한 팀으로… |
| `medical` | For MedTech & IVD | EU AI Act 고위험. | 변호사가 먼저 봅니다. | 2026.8 EU AI Act 고위험 의무… |
| `finance` | For Financial Institutions | 납품 조건이 된 ISO 42001. | 매출 기회로 바꾸십시오. | MS DPR v10, SAP 책임AI 요건… |
| `public` | For Public Sector & Listed Companies | AI 기본법 시대, | 입찰과 이사회를 통과하는 체계. | 2026.1 AI 기본법 시행… |

Full text (both languages) lives in `source/assets/copy.js` under `COPY.<lang>.heroVariants.<key>`. Re-implement these as i18n message bundles, not as a runtime dictionary.

---

## Assets

All images live in `source/assets/images/`. They are AI-generated placeholders in a documentary black-and-white / warm sepia style. **Replace before launch.**

| File | Subject | Aspect | Use |
|---|---|---|---|
| `industry-medical.jpg` | Gloved hand holding an IVD diagnostic device over lab paperwork | 4:3 | Industries section — MedTech card |
| `industry-finance.jpg` | Empty modern trading desk at dusk, dimmed monitors | 4:3 | Industries section — Finance card |
| `industry-public.jpg` | Empty formal government conference room with classical architecture | 4:3 | Industries section — Public Sector card |
| `portrait-k.jpg` | Korean male, early 40s, charcoal three-piece suit + dark tie, seated profile in a wood-paneled study | 3:4 | K — Attorney (Hero card + About) |
| `portrait-mark.jpg` | Korean male, late 30s, navy suit + open collar (no tie), three-quarter portrait | 3:4 | Mark — Lead Auditor (Hero card + About) |
| `portrait-daniel.jpg` | Korean male, mid 30s, charcoal turtleneck, seated three-quarter, books behind | 3:4 | Daniel — CTO (Hero card + About) |

All images are `.jpg` extension but were saved as PNG bytes by the generator — browsers handle this transparently, but **re-encode to proper JPEG/WebP at production-appropriate sizes** before shipping. They are currently 1.5–2 MB each.

### Fonts (external)

The prototype loads from CDNs — replace with the codebase's font-loading strategy:

- Noto Serif KR (weights 400, 500, 600) — Google Fonts
- Source Serif 4 (regular + italic, 400/500) — Google Fonts
- JetBrains Mono (400, 500) — Google Fonts
- Pretendard — `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css`
- Inter — `https://rsms.me/inter/inter.css`

For Next.js: use `next/font/google` for Noto Serif KR / Source Serif 4 / JetBrains Mono / Inter, and `next/font/local` (or self-host) for Pretendard.

### Icons

**No icon library is used.** All glyphs are typographic — `→`, `↳`, `◆`, em-dashes, Roman numerals — set in the same families as surrounding text. Do not introduce Lucide / Material Icons / etc. to "fill in" — the absence is intentional.

---

## Files

Source files included under `source/`:

```
source/
├── index.html                 # Page shell, font + script loading
├── assets/
│   ├── styles.css             # All design tokens + section styles (~1100 lines)
│   ├── copy.js                # Bilingual copy dictionary (KO/EN) — 4 hero variants
│   ├── sections.jsx           # All React section components
│   ├── app.jsx                # App root + Tweaks panel wiring
│   ├── tweaks_panel.jsx       # Designer-time tweaks UI (DO NOT SHIP)
│   └── images/
│       ├── industry-medical.jpg
│       ├── industry-finance.jpg
│       ├── industry-public.jpg
│       ├── portrait-k.jpg
│       ├── portrait-mark.jpg
│       └── portrait-daniel.jpg
```

The single most important file to read first is `assets/styles.css` — every visual decision is encoded there as design tokens. `assets/sections.jsx` shows the DOM/JSX composition; `assets/copy.js` is the complete content source of truth in both languages.

---

## Non-functional requirements

From the PRD (carry into production):

- **Security**: HTTPS everywhere; form data encrypted in transit and at rest. As a company selling ISO 27001, the site itself must be a credible reference.
- **Privacy (KR PIPA / GDPR)**: consent flow for forms; processing policy linked in footer.
- **Performance**: LCP ≤ 2.5s on mobile. Achievable easily with static generation — there's no dynamic data on the home page.
- **SEO**: structured data for `Organization` (`@type: "ProfessionalService"`), title/meta per language. The PRD's Insights hub is the SEO play but is out of scope here.
- **Accessibility**: WCAG 2.1 AA. The current design uses 1px hairlines with `oklch(... / 0.5)` opacity — verify contrast against the chosen paper. Buttons and links must have ≥3:1 against background; text ≥4.5:1. All interactive elements should have visible focus rings (the prototype does not implement custom focus styles — add them in production with a 2px `--ink` outline + 2px offset).
- **Internationalization**: full KO/EN. Right-to-left is not required. Korean line-breaking (`word-break: keep-all`) is non-negotiable.

---

## Out of scope for this handoff

These are explicitly **not** in the design and need separate design + build:

1. `/assessment` — the 30-second diagnostic flow (PRD F1/F2).
2. Industry deep-pages (MedTech / Finance / Public Sector landings).
3. Solution detail pages (ISO 42001 / 27001 / 13485 / 37301).
4. Insights CMS — list + detail templates.
5. Consultation form + CRM routing (HubSpot / Salesforce / etc.).
6. Cookie/consent banner.

---

## Open items the founders need to confirm before launch

(carried from PRD §11, surfaced here so they don't get lost in the handoff)

1. Final hero variant for default landing — currently `master`. Per-channel landing pages can use the other three.
2. Final wording of the diagnostic disclaimer (informational vs. legal opinion). Attorney K to review.
3. Final wording of the `Boundary` disclaimer in About + the footer legal note — must satisfy Korean Attorney Act and advertising rules across **three** practice areas (legal / audit / engineering). Attorney K to sign off.
4. CRM choice + privacy policy text.
5. English site URL pattern (`/en/...` vs. subdomain) — decision affects routing.
6. Real photography for K / Mark / Daniel; real business registration number + address for the footer.
