/* Quanternity AI — main app
   Composes all sections + Tweaks panel */

const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2 } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "ko",
  "palette": "ivory",
  "headfont": "serif",
  "heroVariant": "master"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweaks] = useTweaks(TWEAK_DEFAULTS);

  const lang = tweaks.lang || "ko";
  const setLang = (newLang) => setTweaks("lang", newLang);

  const t = window.COPY[lang];

  // Apply palette + headfont to body
  useEffect2(() => {
    document.body.setAttribute("data-palette", tweaks.palette || "ivory");
    document.body.setAttribute("data-headfont", tweaks.headfont || "serif");
    document.documentElement.lang = lang;
  }, [tweaks.palette, tweaks.headfont, lang]);

  const ctx = useMemo2(() => ({
    lang,
    t,
    heroKey: tweaks.heroVariant || "master",
  }), [lang, tweaks.heroVariant]);

  const heroOptions = [
    { value: "master", label: lang === "ko" ? "통합 (PRD 명제)" : "Master (PRD thesis)" },
    { value: "medical", label: lang === "ko" ? "의료·IVD 전면" : "MedTech-led" },
    { value: "finance", label: lang === "ko" ? "금융·핀테크 전면" : "Finance-led" },
    { value: "public", label: lang === "ko" ? "공공·컴플라이언스" : "Public sector-led" },
  ];

  const paletteOptions = [
    { value: "ivory", label: lang === "ko" ? "아이보리 + 네이비 (기본)" : "Ivory + Navy (default)" },
    { value: "vellum", label: lang === "ko" ? "벨럼 베이지 + 네이비" : "Vellum + Navy" },
    { value: "pure", label: lang === "ko" ? "퓨어 화이트 + 잉크" : "Pure White + Ink" },
    { value: "charcoal", label: lang === "ko" ? "차콜 (다크모드)" : "Charcoal (dark)" },
  ];

  return (
    <L.Provider value={ctx}>
      <TopBar lang={lang} setLang={setLang} />
      <main>
        <Hero />
        <Triggers />
        <Positioning />
        <Signature />
        <Industries />
        <Duo />
        <Stats />
        <Scenarios />
        <Insights />
        <FooterCTA />
      </main>
      <Footer />

      <TweaksPanel title="Tweaks" defaultOpen={false}>
        <TweakSection title={lang === "ko" ? "언어" : "Language"}>
          <TweakRadio
            label=""
            value={lang}
            onChange={(v) => setLang(v)}
            options={[
              { value: "ko", label: "한국어" },
              { value: "en", label: "English" },
            ]}
          />
        </TweakSection>

        <TweakSection title={lang === "ko" ? "히어로 카피" : "Hero copy"}>
          <TweakSelect
            label=""
            value={tweaks.heroVariant || "master"}
            onChange={(v) => setTweaks("heroVariant", v)}
            options={heroOptions}
          />
        </TweakSection>

        <TweakSection title={lang === "ko" ? "팔레트" : "Palette"}>
          <TweakSelect
            label=""
            value={tweaks.palette || "ivory"}
            onChange={(v) => setTweaks("palette", v)}
            options={paletteOptions}
          />
        </TweakSection>

        <TweakSection title={lang === "ko" ? "헤드라인 폰트" : "Headline font"}>
          <TweakRadio
            label=""
            value={tweaks.headfont || "serif"}
            onChange={(v) => setTweaks("headfont", v)}
            options={[
              { value: "serif", label: lang === "ko" ? "한글 세리프" : "Noto Serif KR" },
              { value: "source", label: "Source Serif" },
              { value: "sans-bold", label: lang === "ko" ? "산세리프 굵게" : "Pretendard Bold" },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </L.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
