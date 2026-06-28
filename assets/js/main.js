document.addEventListener("DOMContentLoaded", () => {
  const koBtn = document.getElementById("lang-ko");
  const enBtn = document.getElementById("lang-en");

  function setLanguage(lang) {
    document.documentElement.setAttribute("lang", lang);
    if (lang === "ko") {
      koBtn.classList.add("active");
      enBtn.classList.remove("active");
    } else {
      enBtn.classList.add("active");
      koBtn.classList.remove("active");
    }
    localStorage.setItem("quanternity-lang", lang);
  }

  if (koBtn && enBtn) {
    koBtn.addEventListener("click", () => setLanguage("ko"));
    enBtn.addEventListener("click", () => setLanguage("en"));
  }

  // Load language preference
  const savedLang = localStorage.getItem("quanternity-lang") || "ko";
  setLanguage(savedLang);
});
