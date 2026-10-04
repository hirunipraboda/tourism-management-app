const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, options);
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data: json };
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 AI TRAVEL GUIDE BOT — COMPREHENSIVE END-TO-END VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ── 1. UNAUTHENTICATED REQUEST REJECTION ───────────────────────────────────
  console.log('\n--- 1. AUTHENTICATION & AUTHORIZATION REJECTION ---');
  const unauthRes = await request('/chat/sessions');
  assert(unauthRes.status === 401, 'Unauthenticated request to /chat/sessions rejected with 401');

  // ── 2. LOGIN OR REGISTER USER A & USER B ──────────────────────────────────
  console.log('\n--- 2. USER A & USER B REGISTRATION / LOGIN ---');
  const userAEmail = `traveler_a_${Date.now()}@example.com`;
  const userBEmail = `traveler_b_${Date.now()}@example.com`;

  const regA = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Kasun Traveler', email: userAEmail, password: 'Password123!' }),
  });
  assert(regA.ok && regA.data.data.token, 'User A registered successfully');
  const tokenA = regA.data?.data?.token;

  const regB = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Nimal Traveler', email: userBEmail, password: 'Password123!' }),
  });
  assert(regB.ok && regB.data.data.token, 'User B registered successfully');
  const tokenB = regB.data?.data?.token;

  const authHeaderA = { Authorization: `Bearer ${tokenA}` };
  const authHeaderB = { Authorization: `Bearer ${tokenB}` };

  // ── 3. PACKAGE & QUOTA INITIALIZATION (AUTO-SEEDED FREE TIER) ─────────────
  console.log('\n--- 3. PACKAGE & REMAINING QUOTA VERIFICATION ---');
  const pkgResBefore = await request('/chat/package-status', { headers: authHeaderA });
  assert(pkgResBefore.ok, 'User A fetched package status');
  const initialRemaining = pkgResBefore.data?.data?.remainingQueries;
  console.log(`   User A Active Package: "${pkgResBefore.data?.data?.packageName}", Quota: ${initialRemaining}`);
  assert(initialRemaining > 0, `User A has active quota (> 0): ${initialRemaining}`);

  // ── 4. CREATE CHAT SESSION ────────────────────────────────────────────────
  console.log('\n--- 4. SESSION CREATION & LISTING ---');
  const createSessionRes = await request('/chat/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaderA },
    body: JSON.stringify({ title: 'Trip to Ella Exploration' }),
  });
  assert(createSessionRes.ok && createSessionRes.data?.data?.id, 'Chat session created for User A');
  const sessionAId = createSessionRes.data?.data?.id;

  const listResA = await request('/chat/sessions', { headers: authHeaderA });
  assert(listResA.data?.data?.some(s => s.id === sessionAId), 'Session appears in User A sessions list');

  // ── 5. TEXT-BASED CHAT (REAL GEMINI AI CALL) ──────────────────────────────
  console.log('\n--- 5. TEXT-BASED CHAT: REAL GEMINI AI RESPONSE ---');
  await sleep(1000);
  const formDataMsg1 = new FormData();
  formDataMsg1.append('message', 'What are the best places to visit in Ella?');

  const textMsgRes = await request(`/chat/sessions/${sessionAId}/messages`, {
    method: 'POST',
    headers: authHeaderA,
    body: formDataMsg1,
  });

  assert(textMsgRes.ok, 'User A sent question about Ella');
  const reply1 = textMsgRes.data?.data?.reply || '';
  console.log(`   Bot Reply Sample: "${reply1.slice(0, 160)}..."`);
  assert(reply1.length > 50, 'Gemini AI generated detailed response (> 50 chars)');
  assert(
    reply1.toLowerCase().includes('ella') || reply1.toLowerCase().includes('bridge') || reply1.toLowerCase().includes('peak') || reply1.toLowerCase().includes('rock'),
    'AI response accurately references Ella attractions'
  );

  // ── 6. CONVERSATION CONTEXT & FOLLOW-UP ────────────────────────────────────
  console.log('\n--- 6. CONTEXT-AWARE FOLLOW-UP QUESTION ---');
  await sleep(1500);
  const formDataMsg2 = new FormData();
  formDataMsg2.append('message', 'Which one of those is better for a family with kids?');

  const followUpRes = await request(`/chat/sessions/${sessionAId}/messages`, {
    method: 'POST',
    headers: authHeaderA,
    body: formDataMsg2,
  });

  assert(followUpRes.ok, 'User A sent follow-up question');
  const reply2 = followUpRes.data?.data?.reply || '';
  console.log(`   Follow-up Reply Sample: "${reply2.slice(0, 160)}..."`);
  assert(
    reply2.toLowerCase().includes('family') || reply2.toLowerCase().includes('kid') || reply2.toLowerCase().includes('children') || reply2.toLowerCase().includes('bridge') || reply2.toLowerCase().includes('peak'),
    'Bot understands follow-up context and family recommendations'
  );

  // ── 7. IMAGE + QUESTION MULTIMODAL INTERACTION ───────────────────────────
  console.log('\n--- 7. MULTIMODAL: IMAGE + QUESTION ---');
  await sleep(1500);
  const imagePath = path.resolve('../frontend/src/assets/destinations/sigiriya.jpg');
  if (fs.existsSync(imagePath)) {
    const fileBuffer = fs.readFileSync(imagePath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

    const formDataImg = new FormData();
    formDataImg.append('message', 'What attraction is shown in this photo and what is its history?');
    formDataImg.append('image', blob, 'sigiriya.jpg');

    const imgRes = await request(`/chat/sessions/${sessionAId}/messages`, {
      method: 'POST',
      headers: authHeaderA,
      body: formDataImg,
    });

    assert(imgRes.ok, 'User A uploaded image with question');
    const imgReply = imgRes.data?.data?.reply || '';
    console.log(`   Image + Question Reply: "${imgReply.slice(0, 160)}..."`);
    assert(
      imgReply.toLowerCase().includes('sigiriya') || imgReply.toLowerCase().includes('lion rock'),
      'AI accurately identified Sigiriya Rock Fortress from the photo'
    );
  } else {
    console.warn('⚠️ Sigiriya test image not found at', imagePath);
  }

  // ── 8. IMAGE-ONLY QUESTION (NO TEXT) IN DEDICATED SCAN SESSION ────────────
  console.log('\n--- 8. MULTIMODAL: IMAGE-ONLY (AUTOMATIC IDENTIFICATION) ---');
  await sleep(1500);
  if (fs.existsSync(imagePath)) {
    const sessionScanRes = await request('/chat/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaderA },
      body: JSON.stringify({ title: 'Photo Identification' }),
    });
    const sessionScanId = sessionScanRes.data?.data?.id;

    const fileBuffer = fs.readFileSync(imagePath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

    const formDataImgOnly = new FormData();
    formDataImgOnly.append('image', blob, 'sigiriya.jpg');

    const imgOnlyRes = await request(`/chat/sessions/${sessionScanId}/messages`, {
      method: 'POST',
      headers: authHeaderA,
      body: formDataImgOnly,
    });

    assert(imgOnlyRes.ok, 'User A uploaded image without any text prompt');
    const autoReply = imgOnlyRes.data?.data?.reply || '';
    console.log(`   Image-Only Reply: "${autoReply.slice(0, 160)}..."`);
    assert(
      autoReply.toLowerCase().includes('sigiriya') || autoReply.toLowerCase().includes('lion rock') || autoReply.toLowerCase().includes('fortress'),
      'AI automatically identified and described the attraction from image alone'
    );
  }

  // ── 9. USAGE DEDUCTION VERIFICATION ───────────────────────────────────────
  console.log('\n--- 9. USAGE DEDUCTION VERIFICATION ---');
  const pkgResAfter = await request('/chat/package-status', { headers: authHeaderA });
  const finalRemaining = pkgResAfter.data?.data?.remainingQueries;
  console.log(`   Initial Quota: ${initialRemaining} -> Remaining Quota: ${finalRemaining}`);
  assert(finalRemaining < initialRemaining, `Usage successfully deducted (decremented from ${initialRemaining} to ${finalRemaining})`);

  // ── 10. USER ISOLATION & PRIVACY (USER B ATTEMPTS ACCESS TO USER A) ──────
  console.log('\n--- 10. MULTI-TENANT USER ISOLATION & SECURITY CHECKS ---');
  const userBTamperRes = await request(`/chat/sessions/${sessionAId}`, { headers: authHeaderB });
  assert(userBTamperRes.status === 404, 'User B attempted to view User A session -> Blocked with 404');

  const formDataTamper = new FormData();
  formDataTamper.append('message', 'User B injection');
  const userBTamperSend = await request(`/chat/sessions/${sessionAId}/messages`, {
    method: 'POST',
    headers: authHeaderB,
    body: formDataTamper,
  });
  assert(userBTamperSend.status === 404, 'User B attempted to send message into User A session -> Blocked with 404');

  const listResB = await request('/chat/sessions', { headers: authHeaderB });
  assert(!listResB.data?.data?.some(s => s.id === sessionAId), "User B cannot see User A's session in their list");

  // ── 11. ADMIN AI GUIDE ENDPOINTS VERIFICATION ─────────────────────────────
  console.log('\n--- 11. ADMIN AI GUIDE MONITORING & ANALYTICS ---');
  const adminEmail = `admin_guide_${Date.now()}@example.com`;
  const regAdmin = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'System Admin', email: adminEmail, password: 'AdminPassword123!', role: 'ADMIN' }),
  });
  const adminToken = regAdmin.data?.data?.token;
  const adminHeader = { Authorization: `Bearer ${adminToken}` };

  const adminPkgs = await request('/admin/ai-guide/packages', { headers: adminHeader });
  assert(adminPkgs.ok && Array.isArray(adminPkgs.data?.data), 'Admin fetched chatbot packages list');

  const adminPurchases = await request('/admin/ai-guide/purchases', { headers: adminHeader });
  assert(adminPurchases.ok && Array.isArray(adminPurchases.data?.data), 'Admin fetched package purchases');

  const adminUsage = await request('/admin/ai-guide/usage', { headers: adminHeader });
  assert(adminUsage.ok && adminUsage.data?.data?.totalQueries > 0, 'Admin fetched AI usage statistics (> 0 queries tracked)');

  const adminAnalytics = await request('/admin/ai-guide/analytics', { headers: adminHeader });
  assert(adminAnalytics.ok && Array.isArray(adminAnalytics.data?.data?.topPlaces), 'Admin fetched question & place analytics');

  console.log('\n================================================================');
  console.log(`FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
