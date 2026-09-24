const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const robots = fs.readFileSync('robots.txt', 'utf8');
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const llms = fs.readFileSync('llms.txt', 'utf8');
const config = fs.readFileSync('js/config.js', 'utf8');
const notfound = fs.readFileSync('404.html', 'utf8');

const files = { 'index.html': html, 'robots.txt': robots, 'sitemap.xml': sitemap, 'llms.txt': llms, 'js/config.js': config, '404.html': notfound };

let fail = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (detail ? '  [' + detail + ']' : ''));
  if (!ok) fail++;
}

for (const [name, content] of Object.entries(files)) {
  check(name + ': no ariya.app', !content.includes('ariya.app'));
}

check('canonical = new domain', html.includes('<link rel="canonical" href="https://ariyamusic.us.ci/">'));
check('og:url = new domain', html.includes('<meta property="og:url" content="https://ariyamusic.us.ci/">'));
check('robots sitemap = new domain', robots.includes('Sitemap: https://ariyamusic.us.ci/sitemap.xml'));
check('sitemap loc = new domain', sitemap.includes('<loc>https://ariyamusic.us.ci/</loc>'));
check('llms home = new domain', llms.includes('https://ariyamusic.us.ci/'));

const ldMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
check('JSON-LD present', !!ldMatch);
let ld = null;
try { ld = JSON.parse(ldMatch[1]); } catch (e) { console.log('JSON parse error:', e.message); }
check('JSON-LD parses', !!ld);
if (ld) {
  const types = (ld['@graph'] || []).map(n => n['@type']);
  for (const t of ['Organization', 'WebSite', 'WebPage', 'SoftwareApplication', 'FAQPage']) {
    check('JSON-LD has ' + t, types.includes(t));
  }
  const ldStr = JSON.stringify(ld);
  check('JSON-LD no ariya.app', !ldStr.includes('ariya.app'));
  check('JSON-LD domain present', ldStr.includes('ariyamusic.us.ci'));
}

const h1s = (html.match(/<h1[\s>]/g) || []).length;
check('exactly one h1', h1s === 1, 'count=' + h1s);

const faqSummarys = (html.match(/<summary>/g) || []).length;
const faqQuestions = ld ? JSON.stringify(ld['@graph'].find(n => n['@type'] === 'FAQPage')).match(/"name":/g).length : 0;
check('FAQ summary count matches schema', faqSummarys === faqQuestions, 'summary=' + faqSummarys + ' schema=' + faqQuestions);

check('scripts deferred', (html.match(/<script src="js\/[^"]+" defer><\/script>/g) || []).length === 7);
check('no unnecessary preconnects', !html.includes('rel="preconnect"'));
check('main landmark', html.includes('<main id="main">') && html.includes('</main>'));
check('skip link', html.includes('class="skip-link"'));
check('hero logo width/height', html.includes('class="hero-logo" width="240" height="240"'));
check('critical css inlined', html.includes('id="critical-css"'));
check('css async loaded', html.includes('as="style"'));
check('ad reserved space', html.includes('class="container ad-slot"'));
check('adsense script once', (html.match(/pagead2\.googlesyndication/g) || []).length === 1);
check('404 noindex', notfound.includes('noindex, nofollow'));
check('manifest id/scope', fs.readFileSync('manifest.json', 'utf8').includes('"scope"'));
check('sw cache bumped', fs.readFileSync('sw.js', 'utf8').includes('ariya-dl-v7'));
check('google verification kept', html.includes('google-site-verification'));
check('html lang', html.includes('<html lang="en">'));

const noindexMeta = /<meta name="robots"[^>]*noindex/i.test(html);
check('index not noindexed', !noindexMeta);

console.log('\n' + (fail === 0 ? 'ALL ' + 'CHECKS PASSED' : fail + ' FAILED'));
process.exit(fail === 0 ? 0 : 1);
