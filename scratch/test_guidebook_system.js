const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function checkFile(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) {
    throw new Error(`File not found: ${relPath}`);
  }
  return fs.readFileSync(full, 'utf8');
}

const results = [];
function assert(name, condition) {
  if (condition) {
    results.push({ name, status: 'PASS' });
  } else {
    results.push({ name, status: 'FAIL' });
  }
}

console.log('====================================================');
console.log('QUANTERNITY AI — GUIDEBOOK & EMAIL LOGS TEST SUITE');
console.log('====================================================\n');

// 1. Files existence
const guidebooksApi = checkFile('cms/src/app/api/guidebooks/route.ts');
const requestsApi = checkFile('cms/src/app/api/guidebook-requests/route.ts');
const resendApi = checkFile('cms/src/app/api/guidebook-requests/resend/route.ts');
const guidebooksPage = checkFile('cms/src/app/guidebooks/page.tsx');
const cmsLayout = checkFile('cms/src/components/cms-layout.tsx');
const diagnosisStartHtml = checkFile('diagnosis/start.html');

// 2. PDF Documents existence
assert(
  'assets/docs/ISO42001_27001_Practical_Guidebook_Quanternity.pdf exists',
  fs.existsSync(path.join(ROOT, 'assets/docs/ISO42001_27001_Practical_Guidebook_Quanternity.pdf'))
);
assert(
  'assets/docs/ISO_Certification_Roadmap_Quanternity.pdf exists',
  fs.existsSync(path.join(ROOT, 'assets/docs/ISO_Certification_Roadmap_Quanternity.pdf'))
);
assert(
  'assets/docs/AI_Basic_Act_Compliance_Checklist_Quanternity.pdf exists',
  fs.existsSync(path.join(ROOT, 'assets/docs/AI_Basic_Act_Compliance_Checklist_Quanternity.pdf'))
);

// 3. API Assertions
assert(
  'guidebooks route supports GET, POST, toggle_active and delete',
  guidebooksApi.includes('toggle_active') && guidebooksApi.includes('delete') && guidebooksApi.includes('DEFAULT_MATERIALS')
);
assert(
  'guidebook-requests route tracks email dispatch logs',
  requestsApi.includes('GuidebookEmailLog') && requestsApi.includes('materials_sent') && requestsApi.includes('resend_count')
);
assert(
  'guidebook-requests route syncs with Supabase leads',
  requestsApi.includes('/rest/v1/leads')
);
assert(
  'resend route updates status to 재발송완료',
  resendApi.includes('재발송완료') && resendApi.includes('resend_count')
);

// 4. CMS UI Assertions
assert(
  'guidebooks CMS page contains 3 tabs (logs, materials, template)',
  guidebooksPage.includes("activeTab === 'logs'") &&
  guidebooksPage.includes("activeTab === 'materials'") &&
  guidebooksPage.includes("activeTab === 'template'")
);
assert(
  'guidebooks CMS page contains CSV export functionality',
  guidebooksPage.includes('exportCSV') && guidebooksPage.includes('\\uFEFF')
);
assert(
  'guidebooks CMS page contains materials registration modal and toggle switch',
  guidebooksPage.includes('isAddModalOpen') && guidebooksPage.includes('handleToggleMaterial')
);
assert(
  'cms-layout includes /guidebooks navigation link',
  cmsLayout.includes("href: '/guidebooks'") && cmsLayout.includes('BookOpenCheck')
);

// 5. Diagnosis Result Page Assertions
assert(
  'diagnosis/start.html contains instant download container',
  diagnosisStartHtml.includes('guidebook-instant-downloads') &&
  diagnosisStartHtml.includes('ISO42001_27001_Practical_Guidebook_Quanternity.pdf')
);
assert(
  'diagnosis/start.html dispatches email and shows instant download links',
  diagnosisStartHtml.includes('guidebook-instant-downloads') &&
  diagnosisStartHtml.includes('https://cms.quanternity.kr/api/guidebook-requests')
);

let passed = 0;
results.forEach((r) => {
  if (r.status === 'PASS') {
    console.log(`[PASS] ${r.name}`);
    passed++;
  } else {
    console.log(`[FAIL] ${r.name}`);
  }
});

console.log(`\nGuidebook System Test Complete: ${passed} / ${results.length} checks passed.`);

if (passed !== results.length) {
  process.exit(1);
}
