async function checkLive() {
  const res = await fetch('https://quanternity.kr/');
  const html = await res.text();
  console.log("=== Live Website Verification (https://quanternity.kr/) ===");
  console.log("1. '두 개의 인증':", html.includes("두 개의 인증"));
  console.log("2. '한 번의 구축으로':", html.includes("한 번의 구축으로"));
  console.log("3. '경영시스템 구조를 공유':", html.includes("경영시스템 구조를 공유"));

  // Check main.js
  const jsRes = await fetch('https://quanternity.kr/assets/js/main.js');
  const js = await jsRes.text();
  console.log("\n=== Live main.js Verification ===");
  console.log("1. '두 개의 인증' in main.js:", js.includes("두 개의 인증"));
  console.log("2. 'Two Certifications' in main.js:", js.includes("Two Certifications"));
}

checkLive();
