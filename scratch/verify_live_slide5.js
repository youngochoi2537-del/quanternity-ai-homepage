async function checkLiveSlide5() {
  const res = await fetch('https://quanternity.kr/');
  const html = await res.text();
  console.log("=== Live Website Verification (https://quanternity.kr/) ===");
  console.log("1. '01 / 05' (Total 5 slides):", html.includes("01 / 05") || html.includes("<span>05</span>"));
  console.log("2. '고영향 AI':", html.includes("고영향 AI"));
  console.log("3. '하고 있다가 아니라 증명하라':", html.includes("하고 있다") || html.includes("증명하라"));
  console.log("4. 'FieldProof 보기':", html.includes("FieldProof 보기"));
}

checkLiveSlide5();
