import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { History as HistoryIcon, SearchCode, ArrowUpRight, Loader2, Calendar, FileText } from 'lucide-react';

const History = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/scan');
      setScans(res.data.scans || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retrieve scan history.');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <HistoryIcon className="w-7 h-7 text-cyan-400" /> Security Audit History
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Complete record of past GitHub & Zip codebase security reviews
          </p>
        </div>
        <Link
          to="/new-scan"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm shadow-md shadow-cyan-500/20 transition-all shrink-0"
        >
          <SearchCode className="w-4 h-4" /> Run New Audit
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Scans Table */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl">
        {scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900/60 text-xs font-mono uppercase text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">Codebase Label</th>
                  <th className="py-3.5 px-4">Source Type</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Issues Found</th>
                  <th className="py-3.5 px-4">Scan Date</th>
                  <th className="py-3.5 px-4 text-right">Audit Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
                {scans.map(scan => (
                  <tr key={scan.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white truncate max-w-[280px]">
                      {scan.source_label}
                    </td>
                    <td className="py-4 px-4 uppercase text-gray-400">{scan.source_type}</td>
                    <td className="py-4 px-4 font-bold">
                      <span className={`px-2.5 py-1 rounded border ${
                        scan.risk_score >= 70
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : scan.risk_score >= 40
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {scan.risk_score} / 100
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {scan.issue_count} {scan.issue_count === 1 ? 'vulnerability' : 'vulnerabilities'}
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {new Date(scan.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/scan/${scan.id}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-cyan-500/30 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 font-mono text-sm space-y-3">
            <HistoryIcon className="w-10 h-10 mx-auto text-gray-600" />
            <p>No security audit history found in your account.</p>
            <Link
              to="/new-scan"
              className="inline-block text-cyan-400 font-semibold hover:underline"
            >
              Perform your first codebase security audit →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
