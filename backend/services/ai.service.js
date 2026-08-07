const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

/**
 * System prompt sent to Gemini AI model
 */
const SYSTEM_AUDIT_PROMPT = `
You are a senior application security auditor reviewing code from a web application that was likely built quickly using AI coding assistants ("vibe coded"), meaning it may lack standard security review.

Analyze the provided files and identify security issues in these categories only:
1. exposed_secret — hardcoded API keys, passwords, tokens, or secrets in code (not .env.example placeholders)
2. missing_validation — API endpoints that accept user input without validation/sanitization
3. missing_auth — routes/endpoints that modify or expose data without an authentication check
4. xss_risk — rendering unsanitized user input in the frontend
5. sql_injection_risk — raw string concatenation used to build database queries
6. insecure_config — misconfigurations (CORS set to allow all origins, debug mode enabled, weak JWT secret, etc.)

For each issue found, provide:
- file_path: the file where it occurs
- severity: "critical" | "high" | "medium" | "low"
- category: one of the six categories above
- description: a plain-English, 1-2 sentence explanation of the risk
- fix_suggestion: a concrete, actionable fix
- line_reference: approximate line number or code snippet if identifiable

Also calculate an overall risk_score from 0-100 (100 = most severe) based on the number and severity of issues found.

Respond with ONLY valid JSON in this exact structure, no markdown formatting, no preamble:

{
  "risk_score": 0,
  "issues": [
    {
      "file_path": "example.js",
      "severity": "high",
      "category": "exposed_secret",
      "description": "Hardcoded secret detected.",
      "fix_suggestion": "Move secret to process.env.",
      "line_reference": "const key = '12345';"
    }
  ]
}

If no issues are found, return an empty issues array and a low risk_score. Do not invent issues that aren't clearly present in the provided code.
`;

/**
 * Run Gemini AI Audit on a list of filtered files
 * @param {Array<{path: string, content: string}>} files 
 * @returns {Promise<{risk_score: number, issues: Array}>}
 */
async function auditCodebaseWithAI(files) {
  if (!files || files.length === 0) {
    return {
      risk_score: 0,
      issues: []
    };
  }

  // Format combined code files payload
  let filesFormattedPayload = '=== CODEBASE FILES SUBMITTED FOR AUDIT ===\n\n';
  files.forEach(f => {
    filesFormattedPayload += `--- FILE: ${f.path} ---\n${f.content}\n\n`;
  });

  // Check if API key is present and valid
  const hasGeminiKey = env.geminiApiKey && !env.geminiApiKey.includes('your-google-gemini-api-key');

  if (hasGeminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(env.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const promptPayload = `${SYSTEM_AUDIT_PROMPT}\n\n${filesFormattedPayload}`;

      const result = await model.generateContent(promptPayload);
      const responseText = await result.response.text();

      return parseAIResponseDefensively(responseText);
    } catch (err) {
      console.error('[AIService] Gemini API error, falling back to heuristic engine:', err.message);
    }
  }

  // Fallback Rule-Based AI Engine if Gemini API is not configured or fails
  return fallbackHeuristicAudit(files);
}

/**
 * Clean up and defensively parse JSON string from AI model
 */
function parseAIResponseDefensively(rawText) {
  try {
    let cleanText = rawText.trim();
    // Strip markdown code fences if present
    cleanText = cleanText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(cleanText);

    // Validate expected structure
    const risk_score = typeof parsed.risk_score === 'number' ? Math.min(100, Math.max(0, parsed.risk_score)) : 50;
    const issues = Array.isArray(parsed.issues) ? parsed.issues.map(issue => ({
      file_path: issue.file_path || 'unknown_file',
      severity: ['critical', 'high', 'medium', 'low'].includes(issue.severity) ? issue.severity : 'medium',
      category: issue.category || 'insecure_config',
      description: issue.description || 'Potential security issue identified.',
      fix_suggestion: issue.fix_suggestion || 'Review code for security best practices.',
      line_reference: issue.line_reference || 'N/A'
    })) : [];

    return { risk_score, issues };
  } catch (err) {
    console.error('[AIService] Failed to parse AI JSON response:', err.message, rawText);
    return {
      risk_score: 40,
      issues: [
        {
          file_path: 'ai.service.js',
          severity: 'medium',
          category: 'insecure_config',
          description: 'AI model returned non-standard formatting. Report fallback generated.',
          fix_suggestion: 'Verify Gemini API prompt formatting or retry audit.',
          line_reference: 'JSON.parse'
        }
      ]
    };
  }
}

/**
 * Offline Heuristic Security Audit Engine for fallback / local testing
 */
function fallbackHeuristicAudit(files) {
  const issues = [];

  files.forEach(f => {
    const content = f.content || '';
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNo = `Line ${index + 1}: ${line.trim()}`;

      // 1. Hardcoded API secrets
      if (/api[_-]?key\s*=\s*['"][A-Za-z0-9_\-]{16,}['"]/i.test(line) ||
          /secret[_-]?key\s*=\s*['"][A-Za-z0-9_\-]{16,}['"]/i.test(line) ||
          /jwt[_-]?secret\s*=\s*['"](secret|12345|password)['"]/i.test(line)) {
        issues.push({
          file_path: f.path,
          severity: 'critical',
          category: 'exposed_secret',
          description: 'Hardcoded secret or API key detected in source code.',
          fix_suggestion: 'Move sensitive credentials to environment variables (.env) and reference via process.env.',
          line_reference: lineNo
        });
      }

      // 2. SQL Injection string concatenation
      if (/SELECT|INSERT|UPDATE|DELETE/i.test(line) && /\+\s*\w+|\$\{/i.test(line)) {
        issues.push({
          file_path: f.path,
          severity: 'critical',
          category: 'sql_injection_risk',
          description: 'Database query constructed using string concatenation instead of parameterized queries.',
          fix_suggestion: 'Use parameterized queries or ORM placeholders (e.g. db.query("SELECT * FROM users WHERE id = $1", [id])).',
          line_reference: lineNo
        });
      }

      // 3. XSS Risk with dangerouslySetInnerHTML or innerHTML
      if (/dangerouslySetInnerHTML|innerHTML\s*=/i.test(line)) {
        issues.push({
          file_path: f.path,
          severity: 'high',
          category: 'xss_risk',
          description: 'Unsanitized HTML rendered directly into DOM allows Cross-Site Scripting (XSS).',
          fix_suggestion: 'Sanitize user HTML using DOMPurify before rendering or use standard React JSX escape syntax.',
          line_reference: lineNo
        });
      }

      // 4. Insecure CORS
      if (/cors\(\s*\{\s*origin\s*:\s*['"]\*['"]/i.test(line) || /Access-Control-Allow-Origin['"]\s*,\s*['"]\*['"]/i.test(line)) {
        issues.push({
          file_path: f.path,
          severity: 'medium',
          category: 'insecure_config',
          description: 'CORS policy configured to allow requests from any origin (*).',
          fix_suggestion: 'Restrict allowed CORS origins to specific trusted frontend domains.',
          line_reference: lineNo
        });
      }

      // 5. Missing Input Validation
      if (/req\.body/i.test(line) && !/zod|validate|schema/i.test(content)) {
        if (index === 0) { // Only log once per file
          issues.push({
            file_path: f.path,
            severity: 'medium',
            category: 'missing_validation',
            description: 'API endpoint consumes req.body directly without input validation or schema sanitization.',
            fix_suggestion: 'Validate incoming payload with Zod or Joi schemas before processing.',
            line_reference: lineNo
          });
        }
      }
    });
  });

  // Calculate heuristic risk score
  const severityWeights = { critical: 30, high: 20, medium: 10, low: 5 };
  let calculatedScore = issues.reduce((acc, curr) => acc + (severityWeights[curr.severity] || 5), 0);
  const risk_score = Math.min(100, Math.max(10, calculatedScore));

  return {
    risk_score,
    issues
  };
}

module.exports = {
  auditCodebaseWithAI
};
