const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

console.log('--- STEP 5: VERIFY SEO IMPLEMENTATION ---');

// 1. Check robots.txt
const robotsPath = path.join(rootDir, 'robots.txt');
if (fs.existsSync(robotsPath)) {
  console.log('✔ robots.txt exists in root directory');
  console.log(fs.readFileSync(robotsPath, 'utf-8'));
} else {
  console.error('❌ robots.txt missing');
}

// 2. Check sitemap.xml
const sitemapPath = path.join(rootDir, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  console.log('✔ sitemap.xml exists in root directory');
  const xml = fs.readFileSync(sitemapPath, 'utf-8');
  const matches = xml.match(/<loc>(.*?)<\/loc>/g);
  console.log(`✔ Found ${matches ? matches.length : 0} URLs in sitemap:`);
  matches.forEach(m => console.log('  -', m.replace(/<\/?loc>/g, '')));
} else {
  console.error('❌ sitemap.xml missing');
}

// 3. Inspect HTML files for canonical and JSON-LD
const htmlFiles = [
  'index.html',
  'why-certification.html',
  'about.html',
  'about/index.html',
  'about/independence.html',
  'insights.html',
  'insights/index.html',
  'insights/gpai-document-checklist.html',
  'insights/high-impact-ai-criteria.html',
  'insights/iso42001-dpia-integration.html',
  'insights/post.html',
  'network.html',
  'network/index.html',
  'network/join.html',
  'privacy.html',
  'terms.html'
];

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasCanonical = content.includes('<link rel="canonical" href="https://quanternity.kr/');
    const hasJsonLd = content.includes('<script type="application/ld+json">');
    console.log(`✔ ${file}: Canonical [${hasCanonical ? 'OK' : 'MISSING'}], JSON-LD [${hasJsonLd ? 'OK' : 'MISSING'}]`);
  } else {
    console.error(`❌ File not found: ${file}`);
  }
});
