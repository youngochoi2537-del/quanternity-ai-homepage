const https = require('https');

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '4a5e6f8b9c0d1e2f3a4b5c6d7e8f9a0b';
const SITE_HOST = 'quanternity.kr';

const defaultUrls = [
  'https://quanternity.kr/',
  'https://quanternity.kr/why-certification',
  'https://quanternity.kr/about',
  'https://quanternity.kr/about/independence',
  'https://quanternity.kr/insights',
  'https://quanternity.kr/insights/gpai-document-checklist',
  'https://quanternity.kr/insights/high-impact-ai-criteria',
  'https://quanternity.kr/insights/iso42001-dpia-integration',
  'https://quanternity.kr/network',
  'https://quanternity.kr/network/join',
  'https://quanternity.kr/privacy',
  'https://quanternity.kr/terms'
];

// Read URLs from command line args if passed, otherwise default to all site URLs
const inputUrls = process.argv.slice(2);
const targetUrls = inputUrls.length > 0 ? inputUrls : defaultUrls;

const payload = JSON.stringify({
  host: SITE_HOST,
  key: INDEXNOW_KEY,
  keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
  urlList: targetUrls
});

console.log('=== IndexNow Manual URL Submission ===');
console.log(`Host: ${SITE_HOST}`);
console.log(`Key: ${INDEXNOW_KEY}`);
console.log(`Key Location: https://${SITE_HOST}/${INDEXNOW_KEY}.txt`);
console.log(`Submitting ${targetUrls.length} URLs to https://api.indexnow.org/indexnow ...`);

const req = https.request('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`HTTP Status: ${res.statusCode}`);
    if (res.statusCode === 200 || res.statusCode === 202) {
      console.log('✔ Successfully submitted URLs to IndexNow (SearchAdvisor / Bing)!');
    } else {
      console.log(`❌ IndexNow returned status ${res.statusCode}: ${body}`);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request error:', err.message);
});

req.write(payload);
req.end();
