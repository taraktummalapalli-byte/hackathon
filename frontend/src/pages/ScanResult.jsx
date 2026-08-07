import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import RiskScoreGauge from '../components/RiskScoreGauge';
import IssueCard from '../components/IssueCard';
import {
  ShieldCheck, ShieldAlert, ArrowLeft, Loader2,
  Filter, FileText, Calendar, CheckCircle2, Download
} from 'lucide-react';

const ScanResult = () => {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchScanDetails();
  }, [id]);

  const fetchScanDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/scan/${id}`);
      setScan(res.data.scan);
      setIssues(res.data.issues || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load security scan report.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4">
          {error || 'Scan report not found.'}
        </div>
        <Link to="/dashboard" className="text-cyan-400 font-mono hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // Count severities
  const counts = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length
  };

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    return matchesSeverity && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono text-gray-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Codebase Title Banner */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" /> AI Security Audit Report
          </div>
          <h1 className="text-2xl font-extrabold text-white font-mono break-all">
            {scan.source_label}
          </h1>
          <div className="flex items-center gap-4 text-xs text-gray-400 mt-2 font-mono">
            <span className="capitalize bg-gray-900 px-2.5 py-1 rounded border border-gray-800">Source: {scan.source_type}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(scan.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Severity Metrics Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center font-mono">
            <span className="block text-xs text-rose-400 uppercase font-semibold">Critical</span>
            <span className="text-lg font-bold text-rose-400">{counts.critical}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center font-mono">
            <span className="block text-xs text-amber-400 uppercase font-semibold">High</span>
            <span className="text-lg font-bold text-amber-400">{counts.high}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center font-mono">
            <span className="block text-xs text-yellow-400 uppercase font-semibold">Medium</span>
            <span className="text-lg font-bold text-yellow-400">{counts.medium}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center font-mono">
            <span className="block text-xs text-emerald-400 uppercase font-semibold">Low</span>
            <span className="text-lg font-bold text-emerald-400">{counts.low}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Gauge + Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Risk Gauge */}
        <div className="space-y-6">
          <RiskScoreGauge score={scan.risk_score} />

          <div className="p-5 rounded-2xl bg-[#111827] border border-gray-800 space-y-3">
            <h4 className="text-xs uppercase font-mono tracking-wider text-gray-400 font-semibold">
              Audit Methodology
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Files extracted based on critical security criteria (endpoints, secrets, configuration). Evaluated using Google Gemini AI against standard OWASP top security risks.
            </p>
          </div>
        </div>

        {/* Right Column: Vulnerability Issues List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#111827] border border-gray-800">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <Filter className="w-4 h-4 text-cyan-400" /> Filter Vulnerabilities:
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Severity Dropdown */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-gray-950 border border-gray-800 text-xs font-mono text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Severities ({issues.length})</option>
                <option value="critical">Critical ({counts.critical})</option>
                <option value="high">High ({counts.high})</option>
                <option value="medium">Medium ({counts.medium})</option>
                <option value="low">Low ({counts.low})</option>
              </select>

              {/* Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-950 border border-gray-800 text-xs font-mono text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Categories</option>
                <option value="exposed_secret">Exposed Secrets</option>
                <option value="missing_validation">Missing Validation</option>
                <option value="missing_auth">Missing Auth</option>
                <option value="xss_risk">XSS Risk</option>
                <option value="sql_injection_risk">SQL Injection Risk</option>
                <option value="insecure_config">Insecure Config</option>
              </select>
            </div>
          </div>

          {/* Issues Stream */}
          {filteredIssues.length > 0 ? (
            <div className="space-y-4">
              {filteredIssues.map((issue, idx) => (
                <IssueCard key={issue.id || idx} issue={issue} />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#111827] border border-gray-800 space-y-3">
              <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white">No Security Issues Found</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                No high-risk vulnerabilities, exposed API keys, or missing validation patterns were identified in the audited files.
              </p>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[#111827] border border-gray-800 text-gray-400 text-sm font-mono">
              No vulnerabilities match the selected filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanResult;
