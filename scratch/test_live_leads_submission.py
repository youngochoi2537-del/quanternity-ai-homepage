import urllib.request
import json

url = "https://cms.quanternity.kr/api/leads"

payload = {
    "company_name": "(주)퀀터니티테스트엔터프라이즈",
    "industry": "의료/바이오 AI",
    "contact_email": "test-lead@quanternity.kr",
    "contact_phone": "010-9999-8888",
    "phone": "010-9999-8888",
    "current_certifications": ["ISO/IEC 27001"],
    "target_standards": ["ISO/IEC 42001", "한국 AI 기본법"],
    "inquiry_type": "고영향 AI 진단 및 42001 통합 구축 컨설팅",
    "referral_source": "구글 검색",
    "created_at": "2026-08-06T08:50:00.000Z"
}

data = json.dumps(payload).encode('utf-8')

print("=== 1. Testing Live Lead POST Submission ===")
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as resp:
        print("POST Status:", resp.status)
        res_body = resp.read().decode('utf-8')
        print("POST Response:", res_body)
except Exception as e:
    print("POST Error:", e)

print("\n=== 2. Testing Live Lead GET Retrieval ===")
req_get = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req_get) as resp:
        print("GET Status:", resp.status)
        res_body = resp.read().decode('utf-8')
        leads = json.loads(res_body).get('leads', [])
        print(f"Total Leads Retained: {len(leads)}")
        for idx, l in enumerate(leads[:5]):
            print(f"  [{idx+1}] {l.get('created_at')} | {l.get('company_name')} | {l.get('contact_email')} | Phone: {l.get('contact_phone') or l.get('phone')}")
except Exception as e:
    print("GET Error:", e)
