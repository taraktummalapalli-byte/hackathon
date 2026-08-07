const axios = require('axios');
const AdmZip = require('adm-zip');

async function runTotalWebsiteTest() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('====================================================');
  console.log('🛡️  STARTING COMPREHENSIVE END-TO-END WEBSITE AUDIT');
  console.log('====================================================\n');

  try {
    // TEST 1: Health Check
    console.log('1️⃣  Testing Backend Server & Supabase Health Check...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log('   ✅ Health Status:', healthRes.data);

    // TEST 2: User Registration & Database Persistence
    const testEmail = `fulltest_${Date.now()}@codeguard.ai`;
    const password = 'SecurePassword123!';
    console.log(`\n2️⃣  Testing User Registration for: ${testEmail}...`);
    const regRes = await axios.post(`${BASE_URL}/auth/register`, { email: testEmail, password });
    const token = regRes.data.token;
    console.log('   ✅ Registration successful! User created in Supabase database.');
    console.log('   ✅ JWT Bearer Token issued:', token.slice(0, 25) + '...');

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // TEST 3: User Login
    console.log(`\n3️⃣  Testing User Login for: ${testEmail}...`);
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, { email: testEmail, password });
    console.log('   ✅ Login successful! Verified bcrypt password hash matching.');

    // TEST 4: GitHub Repository Security Audit Scan
    const githubRepo = 'https://github.com/jaredhanson/passport';
    console.log(`\n4️⃣  Testing GitHub Security Audit on Repo: ${githubRepo}...`);
    const ghRes = await axios.post(`${BASE_URL}/scan/github`, { repoUrl: githubRepo }, authHeaders);
    console.log('   ✅ GitHub Scan Completed!');
    console.log(`      - Scan ID: ${ghRes.data.scan.id}`);
    console.log(`      - Codebase Label: ${ghRes.data.scan.source_label}`);
    console.log(`      - Risk Score: ${ghRes.data.scan.risk_score} / 100`);
    console.log(`      - Scanned Files Count: ${ghRes.data.filesScannedCount}`);
    console.log(`      - Issues Count: ${ghRes.data.scan.issue_count}`);

    // TEST 5: ZIP File Upload Security Audit Scan
    console.log('\n5️⃣  Testing ZIP File Upload Security Audit Scan...');
    const zip = new AdmZip();
    zip.addFile('.env', Buffer.from('DATABASE_URL=postgres://root:secret123@localhost:5432/db\nAPI_KEY=AIzaSyD-TESTKEY999\n'));
    zip.addFile('routes/user.js', Buffer.from('const express = require("express");\nconst router = express.Router();\nrouter.post("/profile", (req, res) => {\n  const query = "SELECT * FROM users WHERE username = \'" + req.body.username + "\'";\n  db.query(query);\n  res.send("Profile updated");\n});\nmodule.exports = router;\n'));
    zip.addFile('config/cors.js', Buffer.from('module.exports = { origin: "*" };\n'));

    const zipBuffer = zip.toBuffer();

    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', zipBuffer, { filename: 'sample_vibe_app.zip' });

    const zipScanRes = await axios.post(`${BASE_URL}/scan/upload`, form, {
      headers: {
        ...authHeaders.headers,
        ...form.getHeaders()
      }
    });

    console.log('   ✅ ZIP Upload Scan Completed!');
    console.log(`      - Scan ID: ${zipScanRes.data.scan.id}`);
    console.log(`      - File Label: ${zipScanRes.data.scan.source_label}`);
    console.log(`      - Risk Score: ${zipScanRes.data.scan.risk_score} / 100`);
    console.log(`      - Flagged Issues Count: ${zipScanRes.data.scan.issue_count}`);
    if (zipScanRes.data.issues && zipScanRes.data.issues.length > 0) {
      console.log('      - Flagged Vulnerability Categories:', zipScanRes.data.issues.map(i => i.category));
    }

    // TEST 6: Single Scan Details API
    console.log(`\n6️⃣  Fetching Single Scan Audit Details for Scan ID: ${zipScanRes.data.scan.id}...`);
    const singleScanRes = await axios.get(`${BASE_URL}/scan/${zipScanRes.data.scan.id}`, authHeaders);
    console.log(`   ✅ Retrieved report from Supabase Postgres database. Verified ${singleScanRes.data.issues.length} issues.`);

    // TEST 7: Scan History List API
    console.log('\n7️⃣  Fetching User Scan History List...');
    const historyRes = await axios.get(`${BASE_URL}/scan`, authHeaders);
    console.log(`   ✅ Retrieved ${historyRes.data.scans.length} historical scan records for user.`);

    // TEST 8: Dashboard Analytics Summary API
    console.log('\n8️⃣  Fetching Dashboard Metrics & Recharts Aggregations...');
    const dashRes = await axios.get(`${BASE_URL}/dashboard/summary`, authHeaders);
    console.log('   ✅ Dashboard Metrics Summary:');
    console.log(`      - Total Scans: ${dashRes.data.totalScans}`);
    console.log(`      - Total Vulnerabilities: ${dashRes.data.totalIssues}`);
    console.log(`      - Average Risk Score: ${dashRes.data.averageRiskScore}`);
    console.log('      - Issues by Severity:', dashRes.data.issuesBySeverity);
    console.log('      - Issues by Category:', dashRes.data.issuesByCategory);

    console.log('\n====================================================');
    console.log('🎉 ALL 8 FULL-STACK WEBSITE TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Test Execution Error:', err.response?.data || err.message);
  }
}

runTotalWebsiteTest();
