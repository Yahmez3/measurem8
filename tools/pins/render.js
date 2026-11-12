// Renders each <section class="pin"> in pins.html to ../../pins/<id>.png (1000x1500) with Brave.
// Run from this folder:  node render.js
// Uses playwright-core from the yahmezz-animator project (no install needed on James's Mac).
const { chromium } = require('/Users/jamesobrien/Desktop/Claude Code/yahmezz-animator/node_modules/playwright-core');
const path = require('path');
const fs = require('fs');
const BROWSER = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const OUT = path.resolve(__dirname, '../../pins');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: BROWSER, headless: true });
  const page = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('[pageerror]', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.resolve(__dirname, 'pins.html'));
  await page.waitForFunction(() => window.READY === true);
  await page.waitForTimeout(300);
  const ids = await page.$$eval('section.pin', els => els.map(e => e.id));
  for (const id of ids) {
    const el = await page.$('#' + id);
    // flag any pin whose content overflows its 1500px frame
    const over = await el.evaluate(e => e.scrollHeight - e.clientHeight);
    if (over > 0) { console.error('OVERFLOW', id, over + 'px'); process.exitCode = 1; }
    await el.screenshot({ path: path.join(OUT, id + '.png') });
    console.log('wrote pins/' + id + '.png');
  }
  await browser.close();
})();
