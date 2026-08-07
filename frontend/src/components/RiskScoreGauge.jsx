import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const RiskScoreGauge = ({ score = 0 }) => {
  const getScoreColor = (s) => {
    if (s >= 70) return { text: 'text-rose-500', stroke: '#f43f5e', bg: 'from-rose-500/20 to-rose-950/40', status: 'CRITICAL RISK' };
    if (s >= 40) return { text: 'text-amber-500', stroke: '#f59e0b', bg: 'from-amber-500/20 to-amber-950/40', status: 'MODERATE RISK' };
    if (s >= 20) return { text: 'text-yellow-400', stroke: '#facc15', bg: 'from-yellow-500/20 to-yellow-950/40', status: 'LOW RISK' };
    return { text: 'text-emerald-400', stroke: '#10b981', bg: 'from-emerald-500/20 to-emerald-950/40', status: 'SECURE' };
  };

  const theme = getScoreColor(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b ${theme.bg} border border-gray-800 shadow-xl`}>
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Outer Circular SVG Track */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="text-gray-800/80 stroke-current"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={theme.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score Value Display inside gauge */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold font-mono tracking-tight ${theme.text}`}>
            {score}
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400">/ 100</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider border border-gray-800 bg-gray-950/80 ${theme.text}`}>
          {score >= 40 ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {theme.status}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {score >= 70
            ? 'Urgent security vulnerabilities detected. Immediate patch recommended.'
            : score >= 40
            ? 'Security vulnerabilities identified that require code remediation.'
            : 'Codebase exhibits good security baseline with minimal identified risks.'}
        </p>
      </div>
    </div>
  );
};

export default RiskScoreGauge;
