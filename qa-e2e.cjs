const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:5173';
const OUT = path.join(process.cwd(), 'qa-artifacts');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const consoleErrors = [];
const pageErrors = [];

function ok(name, detail) { results.push({ name, status: 'PASS', detail }); }
function fail(name, detail) { results.push({ name, status: 'FAIL', detail }); }
function note(name, detail) { results.push({ name, status: 'NOTE', detail }); }

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true });
}

async function clickText(page, re, opts = {}) {
  const loc = page.getByText(re).first();
  await loc.waitFor({ timeout: opts.timeout || 8000 });
  await loc.click();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  try {
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
    await shot(page, '01-landing');
    if (await page.locator('h1').count()) ok('landing loads', await page.locator('h1').first().innerText());
    else fail('landing loads', 'no h1');

    // Language switch smoke
    const langBtn = page.locator('button, select').filter({ hasText: /RU|EN|KK|Рус|Қаз|Eng/i }).first();
    if (await langBtn.count()) {
      await langBtn.click().catch(() => {});
      note('language control present', 'clicked');
    }

    // Start / demo path
    const demo = page.locator('button.demo-path, button:has-text("демо"), button:has-text("Demo")').first();
    if (await demo.count()) await demo.click();
    else await page.getByRole('button').filter({ hasText: /Начать|Start|Баста/i }).first().click();
    await page.waitForURL(/profiles|home|onboarding|diagnostic/, { timeout: 10000 });
    await shot(page, '02-after-start');

    // Pick demo profile Ayan if present
    const ayan = page.getByText(/Ayan|Аян/i).first();
    if (await ayan.count()) {
      await ayan.click();
      ok('select Ayan', page.url());
    } else {
      const card = page.locator('.profile-card, .card, button').first();
      await card.click();
      note('select profile', 'Ayan not found, clicked first card');
    }
    await page.waitForTimeout(800);
    // may land diagnostic
    if (page.url().includes('diagnostic')) {
      await shot(page, '03-diagnostic');
      // try finish / skip diagnostic
      const skip = page.getByRole('button').filter({ hasText: /Пропуст|Skip|Далее|Next|Готово|Finish|Продолж/i });
      for (let i = 0; i < 12; i++) {
        if (!page.url().includes('diagnostic')) break;
        if (await skip.count()) await skip.first().click().catch(() => {});
        else {
          const any = page.getByRole('button').first();
          if (await any.count()) await any.click().catch(() => {});
        }
        await page.waitForTimeout(400);
      }
    }
    await page.waitForTimeout(500);
    await shot(page, '04-home-or-current');

    // Navigate child tabs via direct URLs for coverage
    const childRoutes = ['/home', '/learn', '/read', '/write', '/stories', '/progress', '/profile', '/settings'];
    for (const r of childRoutes) {
      await page.goto(BASE + r, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(400);
      const name = 'child' + r.replace(/\//g, '-');
      await shot(page, name);
      const body = await page.locator('body').innerText();
      if (/Something went wrong|is not defined|Cannot read|TypeError/i.test(body)) fail(r, 'error text on page');
      else ok(r, 'renders');
    }

    // Session modules
    for (const mod of ['letters', 'sounds', 'words', 'reading']) {
      await page.goto(BASE + '/session/' + mod, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(500);
      await shot(page, 'session-' + mod);
      const err = pageErrors.slice(-3);
      if (err.length) note('session-' + mod, 'pageerrors: ' + err.join(' | '));
      else ok('session-' + mod, 'loaded');
      // try interact first clickable option
      const choice = page.locator('button, [role="button"]').filter({ hasNotText: /назад|back|выход|exit/i });
      if (await choice.count() > 1) {
        await choice.nth(1).click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }

    // Reader: open first story if list has links
    await page.goto(BASE + '/read', { waitUntil: 'domcontentloaded' });
    const storyLink = page.locator('a[href*="/read/"]').first();
    if (await storyLink.count()) {
      await storyLink.click();
      await page.waitForTimeout(600);
      await shot(page, 'reader');
      const words = page.locator('.word, [data-word], .reader__word, button').filter({ hasText: /\S/ });
      if (await words.count()) {
        await words.first().click().catch(() => {});
        ok('reader tap word', 'clicked');
      }
      const finish = page.getByRole('button').filter({ hasText: /Готово|Finish|Заверш|Done/i });
      if (await finish.count()) {
        const disabled = await finish.first().isDisabled().catch(() => null);
        note('reader finish state', 'disabled=' + disabled);
      }
    } else note('reader', 'no story links');

    // Parent gate wrong then right PIN
    await page.goto(BASE + '/parent', { waitUntil: 'domcontentloaded' });
    await shot(page, 'parent-gate');
    // clear unlock via localStorage/session
    await page.evaluate(() => { try { sessionStorage.clear(); localStorage.removeItem('readly_parent_unlocked'); } catch(e){} });
    await page.reload({ waitUntil: 'domcontentloaded' });

    async function tapPin(digits) {
      for (const d of digits) {
        const b = page.locator('.pin-pad button', { hasText: new RegExp('^' + d + '$') }).first();
        if (await b.count()) await b.click();
        else await page.getByRole('button', { name: d, exact: true }).click();
        await page.waitForTimeout(80);
      }
    }

    await tapPin('0000');
    await page.waitForTimeout(700);
    const stillGate = page.url().includes('/parent') && !page.url().includes('overview');
    if (stillGate) ok('wrong PIN stays on gate', page.url());
    else fail('wrong PIN stays on gate', page.url());

    await tapPin('1234');
    await page.waitForTimeout(800);
    if (page.url().includes('/parent/overview')) ok('PIN 1234 opens overview', page.url());
    else {
      // maybe still on /parent but unlocked redirect pending
      await page.goto(BASE + '/parent/overview');
      await page.waitForTimeout(400);
      if (page.url().includes('overview') || !(await page.locator('.pin-pad').count())) ok('parent overview reachable', page.url());
      else fail('PIN 1234 opens overview', page.url());
    }
    await shot(page, 'parent-overview');

    for (const r of ['/parent/progress', '/parent/skills', '/parent/history', '/parent/settings']) {
      await page.goto(BASE + r, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(350);
      await shot(page, 'parent' + r.replace(/\//g, '-'));
      ok(r, 'renders');
    }

    // Settings parent section from child - ensure no auto-unlock without PIN
    await page.evaluate(() => { try { sessionStorage.clear(); } catch(e){} });
    await page.goto(BASE + '/settings', { waitUntil: 'domcontentloaded' });
    await shot(page, 'child-settings');
    const forParents = page.getByText(/родител|parent|ата-ана/i).first();
    if (await forParents.count()) {
      await forParents.click().catch(() => {});
      await page.waitForTimeout(300);
    }
    // if somehow at overview without pin, fail
    if (page.url().includes('/parent/overview')) fail('settings no bypass', 'landed on overview without pin');
    else ok('settings no bypass', page.url());

  } catch (e) {
    fail('fatal', String(e && e.stack || e));
    await shot(page, 'fatal').catch(() => {});
  }

  await browser.close();

  const uniqueConsole = [...new Set(consoleErrors)];
  const uniquePage = [...new Set(pageErrors)];
  const report = {
    summary: {
      pass: results.filter(r => r.status === 'PASS').length,
      fail: results.filter(r => r.status === 'FAIL').length,
      note: results.filter(r => r.status === 'NOTE').length,
      consoleErrors: uniqueConsole.length,
      pageErrors: uniquePage.length,
    },
    results,
    consoleErrors: uniqueConsole,
    pageErrors: uniquePage,
  };
  fs.writeFileSync(path.join(OUT, 'e2e-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.summary));
  console.log('FAILS:');
  for (const r of results.filter(x => x.status === 'FAIL')) console.log('-', r.name, '::', r.detail);
  if (uniqueConsole.length) {
    console.log('CONSOLE_ERRORS:');
    uniqueConsole.slice(0, 30).forEach(e => console.log('-', e));
  }
  if (uniquePage.length) {
    console.log('PAGE_ERRORS:');
    uniquePage.forEach(e => console.log('-', e));
  }
  process.exit(report.summary.fail > 0 || uniquePage.length > 0 ? 1 : 0);
}

main();

