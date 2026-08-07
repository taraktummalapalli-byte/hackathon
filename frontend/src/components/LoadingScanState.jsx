import React, { useState, useEffect } from 'react';
import { ShieldAlert, Loader2, CheckCircle2, Lock, Cpu, Search } from 'lucide-react';

const scanSteps = [
  { label: 'Connecting to codebase source...', icon: Search },
  { label: 'Filtering security-critical routes & configurations...', icon: Lock },
  { label: 'Analyzing code patterns with Gemini AI model...', icon: Cpu },
  { label: 'Synthesizing vulnerability report & fix recommendations...', icon: ShieldAlert }
];

const LoadingScanState = ({ sourceLabel = 'target codebase' }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-xl mx-auto glass-card rounded-2xl border border-cyan-500/20 shadow-2xl">
      {/* Glowing Radar Animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center animate-pulse">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">
        Auditing Security of <span className="font-mono text-cyan-400">{sourceLabel}</span>
      </h3>
      <p className="text-sm text-gray-400 mb-8 max-w-md">
        CodeGuard AI is running static analysis and AI model vulnerability classification. This takes 10–25 seconds.
      </p>

      {/* Audit Step List */}
      <div className="w-full space-y-3 text-left">
        {scanSteps.map((step, idx) => {
          const StepIcon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : isDone
                  ? 'bg-gray-900/60 border-gray-800 text-gray-300'
                  : 'bg-gray-950/40 border-gray-900 text-gray-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <StepIcon className="w-5 h-5 text-gray-600 shrink-0" />
              )}
              <span className="text-xs font-mono">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingScanState;
