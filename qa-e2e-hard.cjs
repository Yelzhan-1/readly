const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:5173';
const OUT = path.join(process.cwd(), 'qa-artifacts');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const consoleErrors = [];
const pageErrors = [];
const networkFails = [];

function ok(name, detail) { results.push({ name, status: 'PASS', detail: String(detail || '') }); }
function fail(name, detail) { results.push({ name, status: 'FAIL', detail: String(detail || '') }); }
function note(name, detail) { results.push({ name, status: 'NOTE', detail: String(detail || '') }); }
function med(name, detail) { results.push({ name, status: 'MEDIUM', detail: String(detail || '') }); }
function high(name, detail) { results.push({ name, status: 'HIGH', detail: String(detail || '') }); }
function crit(name, detail) { results.push({ name, status: 'CRITICAL', detail: String(detail || '') }); }

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true }).catch(() => {});
}

async function bodyHasError(page) {
  const body = await page.locator('body').innerText().catch(() => '');
  return /Something went wrong|is not defined|Cannot read|TypeError|Unhandled|ChunkLoadError/i.test(body) ? body.slice(0, 200) : null;
}

async function tapPin(page, digits) {
  for (const d of String(digits)) {
    const b = page.locator('.pin-pad button', { hasText: new RegExp('^' + d + '$') }).first();
    if (await b.count()) await b.click();
    else await page.getByRole('button', { name: d, exact: true }).click().catch(() => {});
    await page.waitForTimeout(80);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  page.on('requestfailed', (req) => {
    networkFails.push(req.method() + ' ' + req.url() + ' :: ' + (req.failure() && req.failure().errorText));
  });
  page.on('response', async (res) => {
    const st = res.status();
    if (st >= 400) {
      const u = res.url();
      if (!/favicon|chrome-extension/i.test(u)) networkFails.push('HTTP ' + st + ' ' + u);
    }
  });

  try {
    // --- Landing ---
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
    await shot(page, 'hard-01-landing');
    if (await page.locator('h1').count()) ok('landing loads', await page.locator('h1').first().innerText());
    else crit('landing loads', 'no h1');

    // --- i18n language switch ---
    const langCandidates = page.locator('button, select, [role="button"]').filter({ hasText: /^(RU|EN|KK|Рус|Қаз|Eng|English|Русский|Қазақша)$/i });
    let langSwitched = false;
    if (await langCandidates.count()) {
      const before = await page.locator('h1').first().innerText().catch(() => '');
      await langCandidates.first().click().catch(() => {});
      await page.waitForTimeout(400);
      // try pick another option if menu opened
      const opt = page.getByText(/English|Русский|Қазақша|EN|RU|KK/i).nth(1);
      if (await opt.count()) await opt.click().catch(() => {});
      await page.waitForTimeout(500);
      const after = await page.locator('h1').first().innerText().catch(() => '');
      if (before && after && before !== after) {
        ok('i18n lang switch', before + ' -> ' + after);
        langSwitched = true;
      } else {
        note('i18n lang switch', 'control present but text unchanged: ' + after);
      }
      await shot(page, 'hard-01b-lang');
    } else {
      // try landing language chips
      const chip = page.locator('[data-lang], .lang, .language button, .locale').first();
      if (await chip.count()) {
        await chip.click().catch(() => {});
        note('i18n lang switch', 'clicked lang chip');
      } else note('i18n lang switch', 'no obvious control on landing');
    }

    // Reset to EN for stable selectors if possible
    const enBtn = page.getByText(/^(EN|English)$/i).first();
    if (await enBtn.count()) await enBtn.click().catch(() => {});

    // --- Landing -> child (demo / start) ---
    const demo = page.locator('button.demo-path, button:has-text("демо"), button:has-text("Demo"), a:has-text("Demo")').first();
    if (await demo.count()) await demo.click();
    else {
      const start = page.getByRole('button').filter({ hasText: /Начать|Start|Баста|Try|Попробовать/i }).first();
      if (await start.count()) await start.click();
      else fail('landing start', 'no start/demo button');
    }
    await page.waitForURL(/profiles|home|onboarding|diagnostic/, { timeout: 12000 }).catch(() => {});
    await shot(page, 'hard-02-after-start');

    // Pick Ayan
    const ayan = page.getByText(/Ayan|Аян/i).first();
    if (await ayan.count()) {
      await ayan.click();
      ok('select Ayan', page.url());
    } else {
      // maybe already on home as Ayan from prior session
      const body = await page.locator('body').innerText();
      if (/Ayan|Аян/i.test(body) && /home|learn/i.test(page.url())) ok('select Ayan', 'already on child as Ayan: ' + page.url());
      else {
        const card = page.locator('.profile-card, [data-profile], button').filter({ hasText: /\S/ }).first();
        if (await card.count()) {
          await card.click();
          note('select profile', 'Ayan not found, clicked first card');
        } else fail('select Ayan', 'no profile cards');
      }
    }
    await page.waitForTimeout(800);

    if (page.url().includes('diagnostic')) {
      await shot(page, 'hard-03-diagnostic');
      const skip = page.getByRole('button').filter({ hasText: /Пропуст|Skip|Далее|Next|Готово|Finish|Продолж/i });
      for (let i = 0; i < 14; i++) {
        if (!page.url().includes('diagnostic')) break;
        if (await skip.count()) await skip.first().click().catch(() => {});
        else {
          const any = page.getByRole('button').first();
          if (await any.count()) await any.click().catch(() => {});
        }
        await page.waitForTimeout(350);
      }
    }
    await page.waitForTimeout(400);
    await shot(page, 'hard-04-home');

    // Ensure child home
    await page.goto(BASE + '/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const homeErr = await bodyHasError(page);
    if (homeErr) crit('child home', homeErr);
    else ok('child home', page.url());

    // Coach DEMO badge on home/learn
    const demoBadge = page.getByText(/\bDEMO\b|демо|Demo mode|демо-режим/i).first();
    if (await demoBadge.count()) ok('Coach DEMO badge', await demoBadge.innerText());
    else {
      await page.goto(BASE + '/learn', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);
      const b2 = page.getByText(/\bDEMO\b|демо|Demo/i).first();
      if (await b2.count()) ok('Coach DEMO badge', await b2.innerText());
      else note('Coach DEMO badge', 'not visible on home/learn — may be expected if not demo coach');
      await shot(page, 'hard-coach-demo');
    }

    // Child routes via URL
    const childRoutes = ['/home', '/learn', '/read', '/write', '/stories', '/progress', '/profile', '/settings'];
    for (const r of childRoutes) {
      await page.goto(BASE + r, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(350);
      await shot(page, 'hard-child' + r.replace(/\//g, '-'));
      const err = await bodyHasError(page);
      if (err) high(r, err);
      else ok(r, 'renders');
    }

    // Settings via UI (nav), not only direct URL
    await page.goto(BASE + '/home', { waitUntil: 'domcontentloaded' });
    const settingsNav = page.locator('a[href="/settings"], a[href*="settings"], nav a, [role="navigation"] a, button').filter({ hasText: /Settings|Настрой|Баптау|⚙|⚙️/i }).first();
    if (await settingsNav.count()) {
      await settingsNav.click();
      await page.waitForTimeout(500);
      if (page.url().includes('settings')) ok('Settings via UI', page.url());
      else {
        // profile gear?
        const gear = page.locator('a[href="/settings"], button[aria-label*="setting" i]').first();
        if (await gear.count()) {
          await gear.click();
          await page.waitForTimeout(400);
        }
        if (page.url().includes('settings')) ok('Settings via UI', page.url());
        else note('Settings via UI', 'nav click did not land on /settings: ' + page.url());
      }
      await shot(page, 'hard-settings-ui');
    } else {
      // try profile then settings link
      await page.goto(BASE + '/profile', { waitUntil: 'domcontentloaded' });
      const s2 = page.locator('a[href="/settings"], a[href*="settings"]').first();
      if (await s2.count()) {
        await s2.click();
        await page.waitForTimeout(400);
        if (page.url().includes('settings')) ok('Settings via UI', 'from profile ' + page.url());
        else note('Settings via UI', 'link present but url=' + page.url());
      } else note('Settings via UI', 'no settings nav found');
    }

    // Progress empty-ish state (child)
    await page.goto(BASE + '/progress', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    const progBody = await page.locator('body').innerText();
    if (/Something went wrong|TypeError/i.test(progBody)) high('child progress empty', 'error text');
    else ok('child progress renders', progBody.slice(0, 80).replace(/\s+/g, ' '));

    // Short Writing session
    await page.goto(BASE + '/write', { waitUntil: 'domcontentloaded' });
    await shot(page, 'hard-write');
    const writeStart = page.getByRole('button').filter({ hasText: /Начать|Start|Баста|Писать|Write|Продолж|Continue|Попробовать/i }).first();
    if (await writeStart.count()) {
      await writeStart.click().catch(() => {});
      await page.waitForTimeout(600);
    }
    // also try session writing route variants
    for (const wr of ['/session/writing', '/session/write', '/write/session']) {
      await page.goto(BASE + wr, { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
      if (/session|write/i.test(page.url()) && !page.url().endsWith('/write')) break;
    }
    await page.waitForTimeout(500);
    await shot(page, 'hard-write-session');
    const wErr = await bodyHasError(page);
    if (wErr) high('Writing session', wErr);
    else {
      // interact lightly
      const choice = page.locator('button, [role="button"], input, textarea').filter({ hasNotText: /назад|back|выход|exit/i });
      if (await choice.count()) {
        await choice.first().click().catch(() => {});
        await page.waitForTimeout(300);
        const input = page.locator('input, textarea').first();
        if (await input.count()) await input.fill('мама').catch(() => {});
      }
      ok('Writing session smoke', page.url());
    }

    // Session modules
    for (const mod of ['letters', 'sounds', 'words', 'reading']) {
      await page.goto(BASE + '/session/' + mod, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(400);
      await shot(page, 'hard-session-' + mod);
      const err = await bodyHasError(page);
      if (err) high('session-' + mod, err);
      else ok('session-' + mod, 'loaded');
      const choice = page.locator('button, [role="button"]').filter({ hasNotText: /назад|back|выход|exit/i });
      if (await choice.count() > 1) {
        await choice.nth(1).click().catch(() => {});
        await page.waitForTimeout(250);
      }
    }

    // Reader
    await page.goto(BASE + '/read', { waitUntil: 'domcontentloaded' });
    const storyLink = page.locator('a[href*="/read/"]').first();
    if (await storyLink.count()) {
      await storyLink.click();
      await page.waitForTimeout(500);
      await shot(page, 'hard-reader');
      ok('reader open story', page.url());
    } else note('reader', 'no story links');

    // --- Parent PIN gate ---
    await page.evaluate(() => {
      try {
        sessionStorage.clear();
        localStorage.removeItem('readly_parent_unlocked');
        for (const k of Object.keys(localStorage)) {
          if (/parent|pin|unlock/i.test(k)) localStorage.removeItem(k);
        }
      } catch (e) {}
    });
    await page.goto(BASE + '/parent', { waitUntil: 'domcontentloaded' });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await shot(page, 'hard-parent-gate');

    await tapPin(page, '0000');
    await page.waitForTimeout(700);
    const stillGate = /\/parent\/?$/.test(page.url().replace(BASE, '')) || (page.url().includes('/parent') && !/overview|progress|history|skills|settings/.test(page.url()));
    const pinPad = await page.locator('.pin-pad, input[type="password"], input[inputmode="numeric"]').count();
    if (stillGate || pinPad > 0) ok('wrong PIN stays on gate', page.url());
    else fail('wrong PIN stays on gate', 'unexpected url ' + page.url());

    await tapPin(page, '1234');
    await page.waitForTimeout(900);
    if (page.url().includes('/parent/overview') || !(await page.locator('.pin-pad').count())) {
      ok('PIN 1234 opens parent', page.url());
    } else {
      await page.goto(BASE + '/parent/overview');
      await page.waitForTimeout(400);
      if (!(await page.locator('.pin-pad').count())) ok('PIN 1234 opens parent', 'overview after goto ' + page.url());
      else crit('PIN 1234 opens parent', 'still gated: ' + page.url());
    }
    await shot(page, 'hard-parent-overview');

    // Parent Progress / History (empty history ok)
    for (const r of ['/parent/progress', '/parent/skills', '/parent/history', '/parent/settings']) {
      await page.goto(BASE + r, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      await shot(page, 'hard-parent' + r.replace(/\//g, '-'));
      const err = await bodyHasError(page);
      const text = await page.locator('body').innerText();
      if (err) high(r, err);
      else if (r === '/parent/history' && /empty|нет|пока нет|no session|история пуст|nothing yet|no history/i.test(text)) {
        ok(r + ' empty state', 'empty history UI present');
      } else ok(r, 'renders');
    }

    // Settings no bypass without PIN
    await page.evaluate(() => { try { sessionStorage.clear(); } catch (e) {} });
    await page.goto(BASE + '/settings', { waitUntil: 'domcontentloaded' });
    const forParents = page.getByText(/родител|For parents|ата-ана|Parent area|Родитель/i).first();
    if (await forParents.count()) {
      await forParents.click().catch(() => {});
      await page.waitForTimeout(400);
    }
    if (page.url().includes('/parent/overview') && !(await page.locator('.pin-pad').count())) {
      high('settings no bypass', 'landed unlocked overview without PIN');
    } else ok('settings no bypass', page.url());

    // Reset demo if available
    await page.goto(BASE + '/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    let resetBtn = page.getByRole('button').filter({ hasText: /Reset demo|Сброс демо|Сбросить демо|Reset data|Сбросить|Қалпына/i }).first();
    if (!(await resetBtn.count())) {
      // parent settings may have it
      await page.evaluate(() => { try { sessionStorage.setItem('readly_parent_unlocked', '1'); } catch(e){} });
      await page.goto(BASE + '/parent/settings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      // unlock if needed
      if (await page.locator('.pin-pad').count()) {
        await tapPin(page, '1234');
        await page.waitForTimeout(600);
        await page.goto(BASE + '/parent/settings', { waitUntil: 'domcontentloaded' });
      }
      resetBtn = page.getByRole('button').filter({ hasText: /Reset demo|Сброс демо|Сбросить|Reset/i }).first();
    }
    if (await resetBtn.count()) {
      await shot(page, 'hard-reset-before');
      page.once('dialog', async (d) => { await d.accept().catch(() => {}); });
      await resetBtn.click();
      await page.waitForTimeout(800);
      await shot(page, 'hard-reset-after');
      const afterReset = await bodyHasError(page);
      if (afterReset) high('reset demo', afterReset);
      else ok('reset demo', 'clicked reset; url=' + page.url());
      // re-enter as Ayan after reset
      await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
      const demo2 = page.locator('button.demo-path, button:has-text("Demo"), button:has-text("демо")').first();
      if (await demo2.count()) await demo2.click().catch(() => {});
      else {
        const st = page.getByRole('button').filter({ hasText: /Start|Начать|Баста/i }).first();
        if (await st.count()) await st.click().catch(() => {});
      }
      await page.waitForTimeout(600);
      const ayan2 = page.getByText(/Ayan|Аян/i).first();
      if (await ayan2.count()) {
        await ayan2.click();
        ok('post-reset Ayan available', page.url());
      } else note('post-reset Ayan', 'Ayan not immediately visible: ' + page.url());
    } else note('reset demo', 'no reset button found in settings/parent settings');

  } catch (e) {
    crit('fatal', String(e && e.stack || e));
    await shot(page, 'hard-fatal').catch(() => {});
  }

  await browser.close();

  const uniqueConsole = [...new Set(consoleErrors)];
  const uniquePage = [...new Set(pageErrors)];
  const uniqueNet = [...new Set(networkFails)].filter((u) => !/favicon/i.test(u));

  const report = {
    headHint: 'see OVERNIGHT_HARD_QA.md',
    base: BASE,
    summary: {
      pass: results.filter(r => r.status === 'PASS').length,
      fail: results.filter(r => r.status === 'FAIL').length,
      critical: results.filter(r => r.status === 'CRITICAL').length,
      high: results.filter(r => r.status === 'HIGH').length,
      medium: results.filter(r => r.status === 'MEDIUM').length,
      note: results.filter(r => r.status === 'NOTE').length,
      consoleErrors: uniqueConsole.length,
      pageErrors: uniquePage.length,
      networkFails: uniqueNet.length,
    },
    results,
    consoleErrors: uniqueConsole,
    pageErrors: uniquePage,
    networkFails: uniqueNet.slice(0, 40),
  };
  fs.writeFileSync(path.join(OUT, 'e2e-hard-report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(OUT, 'e2e-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.summary, null, 2));
  console.log('NONPASS:');
  for (const r of results.filter(x => x.status !== 'PASS' && x.status !== 'NOTE')) {
    console.log('-', r.status, r.name, '::', r.detail);
  }
  console.log('NOTES:');
  for (const r of results.filter(x => x.status === 'NOTE')) console.log('-', r.name, '::', r.detail);
  if (uniqueConsole.length) {
    console.log('CONSOLE_ERRORS:');
    uniqueConsole.slice(0, 40).forEach(e => console.log('-', e));
  }
  if (uniquePage.length) {
    console.log('PAGE_ERRORS:');
    uniquePage.forEach(e => console.log('-', e));
  }
  if (uniqueNet.length) {
    console.log('NETWORK_FAILS:');
    uniqueNet.slice(0, 40).forEach(e => console.log('-', e));
  }
  const bad = report.summary.fail + report.summary.critical + report.summary.high + uniquePage.length;
  process.exit(bad > 0 ? 1 : 0);
}

main();
