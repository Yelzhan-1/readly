const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const BASE = 'http://127.0.0.1:5173';
const OUT = path.join(process.cwd(), 'qa-artifacts');
const findings = [];
const consoleErrors = [];
const pageErrors = [];
const networkFails = [];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('requestfailed', r => networkFails.push(r.url() + ' ' + (r.failure()&&r.failure().errorText)));
  page.on('response', r => { if (r.status()>=400 && !/favicon/i.test(r.url())) networkFails.push('HTTP '+r.status()+' '+r.url()); });

  // enter demo
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.locator('button.demo-path').first().click().catch(async () => {
    await page.getByRole('button').filter({ hasText: /Start|Начать/i }).first().click();
  });
  await page.waitForTimeout(600);
  const ayan = page.getByText(/Ayan|Аян/i).first();
  if (await ayan.count()) await ayan.click();
  await page.waitForTimeout(500);
  if (page.url().includes('diagnostic')) {
    for (let i=0;i<10;i++) {
      if (!page.url().includes('diagnostic')) break;
      const b = page.getByRole('button').filter({ hasText: /Skip|Пропуст|Далее|Next|Готово|Finish/i }).first();
      if (await b.count()) await b.click().catch(()=>{});
      else break;
      await page.waitForTimeout(300);
    }
  }

  // Open story via card click (not <a>)
  await page.goto(BASE + '/read', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const card = page.locator('.story-card, .card, article, button, [role="button"]').filter({ hasText: /Dino|Nova|Luna|Milo|words|min/i }).first();
  if (await card.count()) {
    await card.click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, 'hard-reader-open.png'), fullPage: true });
    if (/\/read\//.test(page.url())) findings.push({ sev: 'PASS', name: 'open story card', detail: page.url() });
    else findings.push({ sev: 'MEDIUM', name: 'open story card', detail: 'clicked but url=' + page.url() });
    // tap a word
    const word = page.locator('.word, [data-word], .reader__word, button').filter({ hasText: /\S/ }).first();
    if (await word.count()) {
      await word.click().catch(()=>{});
      findings.push({ sev: 'PASS', name: 'reader word tap', detail: 'ok' });
    }
    // coach DEMO on reader?
    const coach = page.getByText(/\bDEMO\b|\(demo\)|Demo Mode/i).first();
    if (await coach.count()) findings.push({ sev: 'PASS', name: 'DEMO badge on reader/coach', detail: await coach.innerText() });
  } else findings.push({ sev: 'HIGH', name: 'open story card', detail: 'no story cards found' });

  // Session reading - look for coach DEMO chip
  await page.goto(BASE + '/session/reading', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'hard-session-reading-coach.png'), fullPage: true });
  const demoChip = page.locator('.chip--demo, .chip').filter({ hasText: /DEMO|demo|Demo/i });
  if (await demoChip.count()) findings.push({ sev: 'PASS', name: 'Coach DEMO chip in session', detail: await demoChip.first().innerText() });
  else {
    const anyDemo = page.getByText(/\bDEMO\b/i);
    if (await anyDemo.count()) findings.push({ sev: 'PASS', name: 'DEMO text in session', detail: await anyDemo.first().innerText() });
    else findings.push({ sev: 'NOTE', name: 'Coach DEMO in session', detail: 'not visible on /session/reading at load' });
  }

  // Writing interact without hitting nav
  await page.goto(BASE + '/write', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  // dismiss nav if open by clicking main
  await page.locator('h1, .page-enter, main').first().click({ position: { x: 10, y: 10 } }).catch(()=>{});
  const canvas = page.locator('canvas, textarea, input[type="text"], .write-area, .drawing').first();
  if (await canvas.count()) {
    const tag = await canvas.evaluate(el => el.tagName);
    if (tag === 'TEXTAREA' || tag === 'INPUT') await canvas.fill('sun');
    else {
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.move(box.x + 20, box.y + 20);
        await page.mouse.down();
        await page.mouse.move(box.x + 80, box.y + 60);
        await page.mouse.up();
      }
    }
    findings.push({ sev: 'PASS', name: 'writing interact', detail: 'tag=' + tag + ' url=' + page.url() });
  } else findings.push({ sev: 'MEDIUM', name: 'writing interact', detail: 'no canvas/input on /write' });
  await page.screenshot({ path: path.join(OUT, 'hard-write-interact.png'), fullPage: true });

  // Parent history empty-ish content after unlock
  await page.evaluate(() => { try { sessionStorage.clear(); } catch(e){} });
  await page.goto(BASE + '/parent', { waitUntil: 'domcontentloaded' });
  for (const d of '1234') {
    const b = page.locator('.pin-pad button', { hasText: new RegExp('^'+d+'$') }).first();
    if (await b.count()) await b.click();
  }
  await page.waitForTimeout(700);
  await page.goto(BASE + '/parent/history', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const hist = await page.locator('body').innerText();
  await page.screenshot({ path: path.join(OUT, 'hard-parent-history-detail.png'), fullPage: true });
  if (/Something went wrong|TypeError/i.test(hist)) findings.push({ sev: 'HIGH', name: 'parent history', detail: 'error text' });
  else findings.push({ sev: 'PASS', name: 'parent history', detail: hist.slice(0,120).replace(/\s+/g,' ') });

  // Parent overview DEMO mode chip
  await page.goto(BASE + '/parent/overview', { waitUntil: 'domcontentloaded' });
  const dm = page.getByText(/Demo Mode|демо-режим|DEMO/i).first();
  if (await dm.count()) findings.push({ sev: 'PASS', name: 'parent Demo Mode chip', detail: await dm.innerText() });
  else findings.push({ sev: 'MEDIUM', name: 'parent Demo Mode chip', detail: 'missing' });

  await browser.close();
  const report = {
    findings,
    consoleErrors: [...new Set(consoleErrors)],
    pageErrors: [...new Set(pageErrors)],
    networkFails: [...new Set(networkFails)].slice(0,20),
  };
  fs.writeFileSync(path.join(OUT, 'e2e-supplemental.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
