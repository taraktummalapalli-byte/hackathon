const supabase = require('../config/supabase');
const { githubScanSchema } = require('../validators/scan.validator');
const { fetchGithubRepoFiles, parseGithubUrl } = require('../services/github.service');
const { extractZipFiles } = require('../services/zip.service');
const { filterSecurityFiles } = require('../services/fileFilter.service');
const { auditCodebaseWithAI } = require('../services/ai.service');

/**
 * Scan GitHub Repository
 */
const scanGithubRepo = async (req, res, next) => {
  try {
    const { repoUrl } = githubScanSchema.parse(req.body);
    const userId = req.user.id;
    const { owner, repo } = parseGithubUrl(repoUrl);
    const sourceLabel = `${owner}/${repo}`;

    // 1. Fetch files from GitHub
    console.log(`[ScanCtrl] Fetching GitHub repo files for ${sourceLabel}...`);
    const rawFiles = await fetchGithubRepoFiles(repoUrl);

    if (!rawFiles || rawFiles.length === 0) {
      return res.status(400).json({ error: 'No readable files found in the specified GitHub repository.' });
    }

    // 2. Filter security-relevant files
    const targetFiles = filterSecurityFiles(rawFiles);

    // 3. Call AI audit service
    console.log(`[ScanCtrl] Running AI Security Audit on ${targetFiles.length} filtered files...`);
    const auditResult = await auditCodebaseWithAI(targetFiles);

    // 4. Save scan record to database
    const { data: scanRecord, error: scanErr } = await supabase
      .from('scans')
      .insert({
        user_id: userId,
        source_type: 'github',
        source_label: sourceLabel,
        risk_score: auditResult.risk_score,
        issue_count: auditResult.issues.length,
        status: 'completed'
      })
      .select('*')
      .single();

    if (scanErr) {
      console.error('[ScanCtrl] Error saving scan to DB:', scanErr);
      return res.status(500).json({ error: 'Failed to record scan results.' });
    }

    // 5. Insert scan issues into database
    if (auditResult.issues.length > 0) {
      const issueRecords = auditResult.issues.map(issue => ({
        scan_id: scanRecord.id,
        file_path: issue.file_path,
        severity: issue.severity,
        category: issue.category,
        description: issue.description,
        fix_suggestion: issue.fix_suggestion,
        line_reference: issue.line_reference || 'N/A'
      }));

      const { error: issuesErr } = await supabase
        .from('scan_issues')
        .insert(issueRecords);

      if (issuesErr) {
        console.error('[ScanCtrl] Error saving scan issues to DB:', issuesErr);
      }
    }

    res.status(201).json({
      message: 'GitHub repository security audit completed successfully.',
      scan: scanRecord,
      issues: auditResult.issues,
      filesScannedCount: targetFiles.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Scan Uploaded ZIP Archive
 */
const scanUploadedZip = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid .zip file.' });
    }

    const userId = req.user.id;
    const filename = req.file.originalname || 'uploaded_archive.zip';

    // 1. Extract zip files from memory buffer
    console.log(`[ScanCtrl] Extracting zip file: ${filename}...`);
    const rawFiles = extractZipFiles(req.file.buffer);

    if (!rawFiles || rawFiles.length === 0) {
      return res.status(400).json({ error: 'Uploaded zip file is empty or contains no code files.' });
    }

    // 2. Filter security-relevant files
    const targetFiles = filterSecurityFiles(rawFiles);

    // 3. Call AI audit service
    console.log(`[ScanCtrl] Running AI Security Audit on ${targetFiles.length} zip files...`);
    const auditResult = await auditCodebaseWithAI(targetFiles);

    // 4. Save scan record to database
    const { data: scanRecord, error: scanErr } = await supabase
      .from('scans')
      .insert({
        user_id: userId,
        source_type: 'upload',
        source_label: filename,
        risk_score: auditResult.risk_score,
        issue_count: auditResult.issues.length,
        status: 'completed'
      })
      .select('*')
      .single();

    if (scanErr) {
      console.error('[ScanCtrl] Error saving zip scan to DB:', scanErr);
      return res.status(500).json({ error: 'Failed to record upload scan results.' });
    }

    // 5. Insert scan issues into database
    if (auditResult.issues.length > 0) {
      const issueRecords = auditResult.issues.map(issue => ({
        scan_id: scanRecord.id,
        file_path: issue.file_path,
        severity: issue.severity,
        category: issue.category,
        description: issue.description,
        fix_suggestion: issue.fix_suggestion,
        line_reference: issue.line_reference || 'N/A'
      }));

      await supabase.from('scan_issues').insert(issueRecords);
    }

    res.status(201).json({
      message: 'Zip file security audit completed successfully.',
      scan: scanRecord,
      issues: auditResult.issues,
      filesScannedCount: targetFiles.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Single Scan Details with Issues
 */
const getScanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: scan, error: scanErr } = await supabase
      .from('scans')
      .select('*')
      .eq('id', id)
      .single();

    if (scanErr || !scan) {
      return res.status(404).json({ error: 'Scan report not found.' });
    }

    // Check ownership if user_id present
    if (scan.user_id && scan.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to this scan report.' });
    }

    const { data: issues } = await supabase
      .from('scan_issues')
      .select('*')
      .eq('scan_id', id);

    res.json({
      scan,
      issues: issues || []
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get User's Past Scans List
 */
const getUserScans = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data: scans, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ScanCtrl] Error fetching user scans:', error);
      return res.status(500).json({ error: 'Failed to retrieve scan history.' });
    }

    res.json({ scans: scans || [] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  scanGithubRepo,
  scanUploadedZip,
  getScanById,
  getUserScans
};
