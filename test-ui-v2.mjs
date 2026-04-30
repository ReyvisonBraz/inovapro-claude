import { chromium } from 'playwright';

const API_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

async function testUI() {
  console.log('🚀 Starting UI Tests v2...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    errors.push(`[PAGE ERROR] ${error.message}`);
  });

  try {
    // 1. Login
    console.log('📝 TEST 1: Login');
    await page.goto(FRONTEND_URL, { timeout: 10000 });
    await page.fill('input[name="username"], input[placeholder*="usuário"], input[placeholder*="Usuario"]', 'admin');
    await page.fill('input[name="password"], input[type="password"]', 'admin2021');
    await page.click('button:has-text("Entrar"), button:has-text("Login"), input[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    console.log('   ✅ Login OK');

    // Wait for data to load
    await page.waitForTimeout(3000);

    // 2. Check localStorage token
    console.log('\n📝 TEST 2: Token in localStorage');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('   Token exists:', !!token, token ? `(${token.substring(0,20)}...)` : '');

    // 3. Check API calls
    console.log('\n📝 TEST 3: Network Requests');
    const responseUrls = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responseUrls.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.reload();
    await page.waitForTimeout(3000);

    console.log('   API responses:');
    responseUrls.forEach(url => console.log('   -', url));

    // 4. Check stats endpoint
    console.log('\n📝 TEST 4: Direct API Stats Call');
    if (token) {
      const statsResp = await fetch(`${API_URL}/api/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   Stats status:', statsResp.status);
      const statsData = await statsResp.json();
      console.log('   Stats keys:', Object.keys(statsData));
      console.log('   Total income:', statsData.totalIncome);
      console.log('   Chart data length:', statsData.chartData?.length || 0);
    }

    // Summary
    console.log('\n========================================');
    console.log('📊 TEST SUMMARY');
    console.log('========================================');
    console.log('Errors:', errors.length);
    errors.forEach(e => console.log('  ❌', e.substring(0, 100)));

    if (errors.length === 0) {
      console.log('\n✅ ALL TESTS PASSED!');
    } else {
      console.log('\n⚠️ ERRORS FOUND');
    }

  } catch (error) {
    console.error('TEST FAILED:', error.message);
    errors.push(`[FATAL] ${error.message}`);
  } finally {
    await browser.close();
  }
}

testUI().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
