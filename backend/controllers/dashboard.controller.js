const supabase = require('../config/supabase');

const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user's scans
    const { data: userScans, error: scansErr } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (scansErr) {
      console.error('[DashboardCtrl] Error fetching user scans:', scansErr);
      return res.status(500).json({ error: 'Failed to generate dashboard metrics.' });
    }

    const scansList = userScans || [];
    const totalScans = scansList.length;

    if (totalScans === 0) {
      return res.json({
        totalScans: 0,
        totalIssues: 0,
        averageRiskScore: 0,
        issuesBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
        issuesByCategory: {
          exposed_secret: 0,
          missing_validation: 0,
          missing_auth: 0,
          xss_risk: 0,
          sql_injection_risk: 0,
          insecure_config: 0
        },
        recentScans: []
      });
    }

    const scanIds = scansList.map(s => s.id);

    // 2. Fetch all scan issues for these user scans
    const { data: issues } = await supabase
      .from('scan_issues')
      .select('*');

    const userIssues = (issues || []).filter(i => scanIds.includes(i.scan_id));

    const totalIssues = userIssues.length;

    // Severity Breakdown
    const issuesBySeverity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    // Category Breakdown
    const issuesByCategory = {
      exposed_secret: 0,
      missing_validation: 0,
      missing_auth: 0,
      xss_risk: 0,
      sql_injection_risk: 0,
      insecure_config: 0
    };

    userIssues.forEach(issue => {
      if (issuesBySeverity[issue.severity] !== undefined) {
        issuesBySeverity[issue.severity]++;
      }
      if (issuesByCategory[issue.category] !== undefined) {
        issuesByCategory[issue.category]++;
      } else {
        issuesByCategory['insecure_config']++;
      }
    });

    const sumRiskScore = scansList.reduce((acc, s) => acc + (s.risk_score || 0), 0);
    const averageRiskScore = Math.round(sumRiskScore / totalScans);

    res.json({
      totalScans,
      totalIssues,
      averageRiskScore,
      issuesBySeverity,
      issuesByCategory,
      recentScans: scansList.slice(0, 10)
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardSummary
};
