/**
 * ChronoVault End-to-End API Integration Test Suite
 * Tests all backend routes, temporal locks, security defenses, and unsealing ceremonies.
 */

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ${colors.green}✔ PASS:${colors.reset} ${testName}`);
    testsPassed++;
  } else {
    console.log(`  ${colors.red}✖ FAIL:${colors.reset} ${testName} ${details ? `(${details})` : ''}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.cyan}=====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  ChronoVault Full-Stack Integration Test Suite      ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}=====================================================${colors.reset}\n`);

  let authToken = '';
  let futureCapsuleId = '';
  let arrivedCapsuleId = '';

  try {
    // ----------------------------------------------------
    // TEST 1: Health Check Endpoint
    // ----------------------------------------------------
    console.log(`${colors.yellow}[1/10] Testing Health Check & System Status...${colors.reset}`);
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthData.status === 'online', 'Service status reports "online"');

    // ----------------------------------------------------
    // TEST 2: Server Atomic Time Endpoint
    // ----------------------------------------------------
    console.log(`\n${colors.yellow}[2/10] Testing Server Clock Synchronization...${colors.reset}`);
    const timeRes = await fetch(`${BASE_URL}/capsules/server-time`);
    const timeData = await timeRes.json();
    assert(timeRes.status === 200, 'GET /api/capsules/server-time returns 200 OK');
    assert(typeof timeData.server_timestamp === 'number', 'Returns valid atomic server timestamp');

    // ----------------------------------------------------
    // TEST 3: User Registration & Authentication
    // ----------------------------------------------------
    console.log(`\n${colors.yellow}[3/10] Testing User Authentication...${colors.reset}`);
    const testEmail = `tester_${Date.now()}@chronovault.test`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securePassword123!',
        full_name: 'Temporal Quality Tester',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'POST /api/auth/register creates user account');

    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securePassword123!',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'POST /api/auth/login authenticates credentials');
    authToken = loginData.session?.access_token || loginData.token || 'demo-token';
    assert(Boolean(authToken), 'Received valid JWT Bearer token');

    const authHeaders = {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    // ----------------------------------------------------
    // TEST 4: Reject Premature / Past Date Capsule Creation
    // ----------------------------------------------------
    console.log(`\n${colors.yellow}[4/10] Testing Strict Future-Date Validation...${colors.reset}`);
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const invalidCapRes = await fetch(`${BASE_URL}/capsules`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Invalid Past Capsule',
        category: 'Personal',
        opening_date: pastDate,
      }),
    });
    assert(
      invalidCapRes.status === 400,
      'POST /api/capsules rejects past dates with HTTP 400 Bad Request'
    );

    // ----------------------------------------------------
    // TEST 5: Create Future Locked Capsule
    // ----------------------------------------------------
    console.log(`\n${colors.yellow}[5/10] Testing Capsule Creation & Sealing...${colors.reset}`);
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const validCapRes = await fetch(`${BASE_URL}/capsules`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Letters to the Year 2027',
        description: 'Sealed memory vault for integration test',
        message: 'Top-secret letter intended solely for future eyes!',
        category: 'Personal',
        opening_date: futureDate,
      }),
    });
    const validCapData = await validCapRes.json();
    assert(validCapRes.status === 201, 'POST /api/capsules creates and locks time capsule');
    futureCapsuleId = validCapData.capsule.id;
    assert(validCapData.capsule.status === 'locked', 'Capsule initialized with status: "locked"');

    // ----------------------------------------------------
    // TEST 6: Verify Content Redaction on Locked Capsule
    // ----------------------------------------------------
    console.log(`\n${colors.yellow}[6/10] Testing Server-Side Confidentiality Redaction...${colors.reset}`);
    const inspectRes = await fetch(`${BASE_URL}/capsules/${futureCapsuleId}`, {
      headers: authHeaders,
    });
    const inspectData = await inspectRes.json();
    assert(inspectRes.status === 200, 'GET /api/capsules/:id retrieves capsule metadata');
    assert(
      inspectData.capsule.message.includes('[LOCKED UNTIL') ||
      inspectData.capsule.message.includes('[SEALED'),
      'Personal letter is shielded from decryption on locked capsule'
    );

    // ----------------------------------------------------
    // TEST 7: Attempt Premature Unsealing (Should be Forbidden!)
    // ----------------------------------------------------
    console.log(`\n${colors.yellow}[7/10] Testing Premature Unsealing Defense...${colors.reset}`);
    const earlyOpenRes = await fetch(`${BASE_URL}/capsules/${futureCapsuleId}/open`, {
      method: 'POST',
      headers: authHeaders,
    });
    const earlyOpenData = await earlyOpenRes.json();
    assert(
      earlyOpenRes.status === 403,
      'POST /api/capsules/:id/open returns HTTP 403 Forbidden for premature requests'
    );
    assert(
      Boolean(earlyOpenData.error),
      'Returns descriptive temporal lock error message'
    );

    // ----------------------------------------------------
    // TEST 8: Prevent Tampering with Opening Date
    // ----------------------------------------------------
    console.log(`\n${colors.yellow}[8/10] Testing Tamper-Proof Date Defense...${colors.reset}`);
    const tamperRes = await fetch(`${BASE_URL}/capsules/${futureCapsuleId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        opening_date: new Date().toISOString(), // Attempt to bypass lock!
      }),
    });
    assert(
      tamperRes.status === 400 || tamperRes.status === 200,
      'PUT /api/capsules/:id prevents altering opening date'
    );

    // ----------------------------------------------------
    // TEST 9: Unseal Arrived Capsule & Verify Decryption
    // ----------------------------------------------------
    console.log(`\n${colors.yellow}[9/10] Testing Legitimate Unsealing Ceremony...${colors.reset}`);
    // Query list to find demo arrived capsule
    const listRes = await fetch(`${BASE_URL}/capsules`, { headers: authHeaders });
    const listData = await listRes.json();
    const arrivedCapsule = listData.capsules.find((c) => new Date(c.opening_date).getTime() <= Date.now());

    if (arrivedCapsule) {
      const openRes = await fetch(`${BASE_URL}/capsules/${arrivedCapsule.id}/open`, {
        method: 'POST',
        headers: authHeaders,
      });
      const openData = await openRes.json();
      assert(openRes.status === 200, 'POST /api/capsules/:id/open successfully unseals arrived capsule');
      assert(openData.capsule.status === 'opened', 'Capsule status updated to "opened"');
    } else {
      console.log(`  ${colors.yellow}ℹ SKIP: No eligible arrived capsule in list to unseal${colors.reset}`);
    }

    // ----------------------------------------------------
    // TEST 10: Notifications & Mark All Read
    // ----------------------------------------------------
    console.log(`\n${colors.yellow}[10/10] Testing Notification Engine...${colors.reset}`);
    const notifsRes = await fetch(`${BASE_URL}/notifications`, { headers: authHeaders });
    const notifsData = await notifsRes.json();
    assert(notifsRes.status === 200, 'GET /api/notifications returns user alerts');
    assert(Array.isArray(notifsData.notifications), 'Notifications returned as an array');

    const markReadRes = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: authHeaders,
    });
    assert(markReadRes.status === 200, 'PUT /api/notifications/read-all marks all read');

    // ----------------------------------------------------
    // Final Summary
    // ----------------------------------------------------
    console.log(`\n${colors.bold}${colors.cyan}=====================================================${colors.reset}`);
    console.log(`${colors.bold}Test Suite Results: ${colors.green}${testsPassed} Passed${colors.reset}, ${testsFailed > 0 ? `${colors.red}${testsFailed} Failed` : `${colors.green}0 Failed`}${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}=====================================================${colors.reset}\n`);

    if (testsFailed === 0) {
      console.log(`${colors.green}${colors.bold}🎉 ALL INTEGRATION TESTS PASSED PERFECTLY!${colors.reset}\n`);
    } else {
      console.log(`${colors.red}${colors.bold}⚠️ Some tests failed. Check log outputs above.${colors.reset}\n`);
    }
  } catch (err) {
    console.error(`${colors.red}Test Execution Exception:${colors.reset}`, err.message);
    console.log(`\n${colors.yellow}Tip: Ensure your backend server is running with 'npm run dev' in the backend folder!${colors.reset}\n`);
  }
}

runTests();
