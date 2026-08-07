import React from 'react';
import { AlertOctagon, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const severityConfig = {
  critical: {
    label: 'CRITICAL',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/20',
    icon: AlertOctagon
  },
  high: {
    label: 'HIGH',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
    icon: AlertTriangle
  },
  medium: {
    label: 'MEDIUM',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    glow: 'shadow-yellow-500/20',
    icon: AlertCircle
  },
  low: {
    label: 'LOW',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    icon: Info
  }
};

const SeverityBadge = ({ severity = 'medium' }) => {
  const config = severityConfig[severity.toLowerCase()] || severityConfig.medium;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold uppercase border shadow-sm ${config.bg} ${config.text} ${config.border} ${config.glow}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export default SeverityBadge;
