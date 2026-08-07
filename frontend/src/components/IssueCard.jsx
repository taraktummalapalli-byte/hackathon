import React, { useState } from 'react';
import SeverityBadge from './SeverityBadge';
import { FileCode, Wrench, Check, Copy, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const categoryLabels = {
  exposed_secret: 'Exposed Secret / Key',
  missing_validation: 'Missing Input Validation',
  missing_auth: 'Missing Authentication Check',
  xss_risk: 'Cross-Site Scripting (XSS)',
  sql_injection_risk: 'SQL Injection Risk',
  insecure_config: 'Insecure Configuration'
};

const IssueCard = ({ issue }) => {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyFix = () => {
    navigator.clipboard.writeText(issue.fix_suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl bg-[#111827] border border-gray-800 overflow-hidden shadow-lg hover:border-gray-700 transition-all">
      {/* Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-4 bg-gray-900/60 cursor-pointer select-none border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <SeverityBadge severity={issue.severity} />
          <span className="font-semibold text-sm text-gray-200">
            {categoryLabels[issue.category] || issue.category}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-950/80 border border-gray-800 text-xs font-mono text-cyan-400">
            <FileCode className="w-3.5 h-3.5" />
            <span>{issue.file_path}</span>
          </div>
        </div>

        <button className="p-1 text-gray-400 hover:text-white">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-5 space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-gray-400 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Vulnerability Risk Description
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed bg-gray-900/40 p-3 rounded-lg border border-gray-800/50">
              {issue.description}
            </p>
          </div>

          {/* Line Reference if present */}
          {issue.line_reference && issue.line_reference !== 'N/A' && (
            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-gray-400 mb-1">
                Affected Snippet / Reference
              </h4>
              <div className="font-mono text-xs bg-gray-950 p-3 rounded-lg border border-gray-800 text-rose-300 overflow-x-auto">
                <code>{issue.line_reference}</code>
              </div>
            </div>
          )}

          {/* Actionable Fix Suggestion */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" /> Recommended Security Fix
              </h4>
              <button
                onClick={handleCopyFix}
                className="flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Fix'}
              </button>
            </div>
            <div className="font-mono text-xs bg-[#090d16] p-3.5 rounded-lg border border-emerald-500/20 text-emerald-300 overflow-x-auto leading-relaxed">
              <pre className="whitespace-pre-wrap font-mono">{issue.fix_suggestion}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCard;
