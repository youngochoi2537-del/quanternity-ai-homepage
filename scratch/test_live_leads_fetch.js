async function testLiveApi() {
  const url = "https://cms.quanternity.kr/api/leads";

  const payload = {
    company_name: "(주)퀀터니티테스트엔터프라이즈",
    industry: "의료/바이오 AI",
    contact_email: "test-lead@quanternity.kr",
    contact_phone: "010-9999-8888",
    phone: "010-9999-8888",
    current_certifications: ["ISO/IEC 27001"],
    target_standards: ["ISO/IEC 42001", "한국 AI 기본법"],
    inquiry_type: "고영향 AI 진단 및 42001 통합 구축 컨설팅",
    referral_source: "구글 검색",
    created_at: new Date().toISOString()
  };

  console.log("=== 1. Node fetch POST https://cms.quanternity.kr/api/leads ===");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow"
    });
    console.log("POST Status:", res.status);
    const text = await res.text();
    console.log("POST Body:", text);
  } catch (e) {
    console.error("POST Error:", e);
  }

  console.log("\n=== 2. Node fetch GET https://cms.quanternity.kr/api/leads ===");
  try {
    const res = await fetch(url, { redirect: "follow" });
    console.log("GET Status:", res.status);
    const json = await res.json();
    console.log("GET Body:", json);
  } catch (e) {
    console.error("GET Error:", e);
  }
}

testLiveApi();
