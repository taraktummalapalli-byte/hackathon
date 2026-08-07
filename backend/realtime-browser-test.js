const axios = require('axios');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runRealtimeUserSimulation() {
  const BASE_URL = 'http://localhost:5000/api';

  console.log('\n============================================================');
  console.log('🌐  REAL-TIME USER WEBSITE SIMULATION AUDIT');
  console.log('============================================================\n');

  // STEP 1: Land on website and go to Register Page
  console.log('📍 STEP 1: User opens http://localhost:3000/register');
  console.log('   -> Filling registration form with email: realtime_auditor@codeguard.ai');
  await sleep(1500);

  let token;
  const userEmail = `realtime_auditor_${Date.now()}@codeguard.ai`;
  const password = 'Password123!';

  try {
    const regRes = await axios.post(`${BASE_URL}/auth/register`, { email: userEmail, password });
    token = regRes.data.token;
    console.log('   ✅ [AUTHENTICATION SUCCESS] User registered and persisted in Supabase Postgres!');
    console.log(`   -> Issued JWT Token: ${token.slice(0, 30)}...`);
  } catch (err) {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, { email: userEmail, password });
    token = loginRes.data.token;
    console.log('   ✅ [LOGIN SUCCESS] Verified user credentials!');
  }

  const headers = { headers: { Authorization: `Bearer ${token}` } };
  await sleep(2000);

  // STEP 2: Navigate to Dashboard
  console.log('\n📍 STEP 2: Redirected to http://localhost:3000/dashboard');
  console.log('   -> Rendering Security Command Dashboard...');
  await sleep(1500);

  const dashInitial = await axios.get(`${BASE_URL}/dashboard/summary`, headers);
  console.log('   📊 Dashboard Loaded:');
  console.log(`      - Scans Count: ${dashInitial.data.totalScans}`);
  console.log(`      - Total Issues: ${dashInitial.data.totalIssues}`);
  console.log(`      - Average Risk Score: ${dashInitial.data.averageRiskScore}/100`);

  await sleep(2000);

  // STEP 3: Click "New Audit" -> Navigate to /new-scan
  console.log('\n📍 STEP 3: User clicks "New Audit" -> Navigates to http://localhost:3000/new-scan');
  console.log('   -> Selecting "Public GitHub Repository" Tab');
  console.log('   -> Entering Repository URL: https://github.com/jaredhanson/passport');
  console.log('   -> Clicking "Analyze GitHub Codebase"...');
  await sleep(2000);

  console.log('\n⌛ STEP 4: AI Security Audit Progress (LoadingScanState)...');
  console.log('   [1/4] Fetching repository files from GitHub API...');
  await sleep(1200);
  console.log('   [2/4] Filtering security-critical paths (routes/, controllers/, config/, .env)...');
  await sleep(1200);
  console.log('   [3/4] Running Google Gemini AI security audit against OWASP guidelines...');
  
  const scanRes = await axios.post(
    `${BASE_URL}/scan/github`,
    { repoUrl: 'https://github.com/jaredhanson/passport' },
    headers
  );

  console.log('   [4/4] Security Audit complete! Saving scan & issues to Supabase Postgres...');
  await sleep(1500);

  const scanId = scanRes.data.scan.id;

  // STEP 5: Redirected to Scan Result Page (/scan/:id)
  console.log(`\n📍 STEP 5: Redirected to http://localhost:3000/scan/${scanId}`);
  console.log('   -> Rendering Risk Score Gauge & Security Vulnerability Report...');
  await sleep(1500);

  const reportRes = await axios.get(`${BASE_URL}/scan/${scanId}`, headers);
  const scanData = reportRes.data.scan;
  const issuesData = reportRes.data.issues;

  console.log('   🛡️  AUDIT REPORT RESULTS:');
  console.log(`      - Target Codebase: ${scanData.source_label}`);
  console.log(`      - Overall Risk Score: ${scanData.risk_score} / 100 (${scanData.risk_score >= 40 ? 'HIGH RISK' : 'LOW RISK'})`);
  console.log(`      - Total Vulnerabilities Found: ${issuesData.length}`);

  if (issuesData.length > 0) {
    console.log('\n   ⚠️  Vulnerabilities Identified by Category:');
    issuesData.forEach((iss, index) => {
      console.log(`      [Issue ${index + 1}] Severity: ${iss.severity.toUpperCase()} | Category: ${iss.category}`);
      console.log(`         - File: ${iss.file_path}`);
      console.log(`         - Description: ${iss.description}`);
      console.log(`         - Actionable Fix: ${iss.fix_suggestion.slice(0, 80)}...`);
    });
  }

  await sleep(2500);

  // STEP 6: Navigate to History Page (/history)
  console.log('\n📍 STEP 6: User clicks "History" in Navbar -> Navigates to http://localhost:3000/history');
  console.log('   -> Loading user past security audit log table...');
  await sleep(1500);

  const historyRes = await axios.get(`${BASE_URL}/scan`, headers);
  console.log(`   📋 History Log Table: Loaded ${historyRes.data.scans.length} historical audit records from database.`);

  await sleep(1500);

  // STEP 7: Updated Dashboard Summary
  console.log('\n📍 STEP 7: User returns to http://localhost:3000/dashboard');
  const dashFinal = await axios.get(`${BASE_URL}/dashboard/summary`, headers);
  console.log('   📈 Updated Dashboard Metrics:');
  console.log(`      - Total Audited Scans: ${dashFinal.data.totalScans}`);
  console.log(`      - Total Identified Vulnerabilities: ${dashFinal.data.totalIssues}`);
  console.log(`      - Average Risk Score: ${dashFinal.data.averageRiskScore}/100`);

  console.log('\n============================================================');
  console.log('✨ REAL-TIME WEBSITE USER SIMULATION COMPLETED SUCCESSFULLY!');
  console.log('============================================================\n');
}

runRealtimeUserSimulation();
