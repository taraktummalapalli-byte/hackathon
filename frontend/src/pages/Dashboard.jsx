import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import {
  ShieldAlert, SearchCode, AlertOctagon, CheckCircle2,
  TrendingUp, ArrowUpRight, Loader2, Shield
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';

const SEVERITY_COLORS = {
  critical: '#f43f5e',
  high: '#f59e0b',
  medium: '#eab308',
  low: '#10b981'
};

const CATEGORY_NAMES = {
  exposed_secret: 'Exposed Secret',
  missing_validation: 'Missing Validation',
  missing_auth: 'Missing Auth',
  xss_risk: 'XSS Risk',
  sql_injection_risk: 'SQL Injection',
  insecure_config: 'Insecure Config'
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      setSummary(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data.');
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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          {error}
        </div>
      </div>
    );
  }

  const { totalScans, totalIssues, averageRiskScore, issuesBySeverity, issuesByCategory, recentScans } = summary;

  // Prepare Pie Chart data
  const pieData = [
    { name: 'Critical', value: issuesBySeverity.critical, color: SEVERITY_COLORS.critical },
    { name: 'High', value: issuesBySeverity.high, color: SEVERITY_COLORS.high },
    { name: 'Medium', value: issuesBySeverity.medium, color: SEVERITY_COLORS.medium },
    { name: 'Low', value: issuesBySeverity.low, color: SEVERITY_COLORS.low }
  ].filter(d => d.value > 0);

  // Prepare Bar Chart data
  const barData = Object.keys(issuesByCategory).map(key => ({
    category: CATEGORY_NAMES[key] || key,
    count: issuesByCategory[key]
  }));

  // Prepare Risk Score Trend data
  const trendData = [...(recentScans || [])].reverse().map((s, idx) => ({
    name: `Scan ${idx + 1}`,
    risk_score: s.risk_score,
    label: s.source_label
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-gray-900 via-[#111827] to-cyan-950/40 border border-gray-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-cyan-400" /> Security Analytics & Command Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time security posture metrics across your vibe-coded repositories
          </p>
        </div>
        <Link
          to="/new-scan"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all shrink-0"
        >
          <SearchCode className="w-4 h-4" /> Start New Security Audit
        </Link>
      </div>

      {/* Stats Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-[#111827] border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Scans</span>
            <SearchCode className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">{totalScans}</div>
          <span className="text-xs text-gray-500 mt-1 block">Repositories & archives audited</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Issues</span>
            <AlertOctagon className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-400">{totalIssues}</div>
          <span className="text-xs text-gray-500 mt-1 block">Vulnerabilities flagged by AI</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Avg Risk Score</span>
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400">{averageRiskScore}<span className="text-sm font-normal text-gray-500">/100</span></div>
          <span className="text-xs text-gray-500 mt-1 block">Overall threat index rating</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Critical Vulns</span>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">{issuesBySeverity.critical}</div>
          <span className="text-xs text-gray-500 mt-1 block">High priority patch items</span>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Severity Breakdown Pie Chart */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
            <span>Issues by Severity Level</span>
            <span className="text-xs font-mono text-gray-400">Distribution</span>
          </h3>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                    <span className="text-gray-300">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm font-mono">
              No security issues logged yet.
            </div>
          )}
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
            <span>Issues by Vulnerability Category</span>
            <span className="text-xs font-mono text-gray-400">Vulnerability Classification</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis
                  dataKey="category"
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Score Trend Chart */}
      {trendData.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">
            Risk Score Trend Over Recent Audits
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                  formatter={(val, name, props) => [`Risk Score: ${val}`, props.payload.label]}
                />
                <Area type="monotone" dataKey="risk_score" stroke="#f43f5e" fillOpacity={1} fill="url(#scoreColor)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Scans Table */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Recent Audit History</h3>
          <Link to="/history" className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1">
            View All Scans <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentScans && recentScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900/60 text-xs font-mono uppercase text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Codebase Source</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Issues Found</th>
                  <th className="py-3 px-4">Audited Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
                {recentScans.slice(0, 5).map(scan => (
                  <tr key={scan.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white truncate max-w-[220px]">
                      {scan.source_label}
                    </td>
                    <td className="py-3 px-4 capitalize text-gray-400">{scan.source_type}</td>
                    <td className="py-3 px-4 font-bold">
                      <span className={scan.risk_score >= 70 ? 'text-rose-400' : scan.risk_score >= 40 ? 'text-amber-400' : 'text-emerald-400'}>
                        {scan.risk_score} / 100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{scan.issue_count} issues</td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/scan/${scan.id}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        View Report <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 font-mono text-sm">
            No audit scans performed yet. Click "Start New Security Audit" to run your first report.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
