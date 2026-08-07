import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import LoadingScanState from '../components/LoadingScanState';
import { Github, Upload, ShieldAlert, ArrowRight, FileArchive, AlertCircle, HelpCircle } from 'lucide-react';

const NewScan = () => {
  const [activeTab, setActiveTab] = useState('github'); // 'github' | 'upload'
  const [repoUrl, setRepoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanningSourceLabel, setScanningSourceLabel] = useState('');
  const navigate = useNavigate();

  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL.');
      return;
    }

    try {
      setLoading(true);
      setScanningSourceLabel(repoUrl);
      const res = await api.post('/scan/github', { repoUrl });
      const scanId = res.data.scan.id;
      navigate(`/scan/${scanId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'GitHub security audit failed. Please check repository URL or visibility.');
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please choose a .zip code file to upload.');
      return;
    }

    try {
      setLoading(true);
      setScanningSourceLabel(selectedFile.name);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.post('/scan/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const scanId = res.data.scan.id;
      navigate(`/scan/${scanId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Uploaded ZIP security audit failed.');
      setLoading(false);
    }
  };

  const setSampleRepo = (url) => {
    setRepoUrl(url);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <LoadingScanState sourceLabel={scanningSourceLabel} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Run Automated AI Security Audit
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm">
          Select a public GitHub repository or upload a zipped codebase to scan for exposed keys, missing validation, SQL injection risk, and authorization vulnerabilities.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-gray-800 shadow-2xl">
        <div className="flex border-b border-gray-800 mb-8">
          <button
            onClick={() => { setActiveTab('github'); setError(''); }}
            className={`flex items-center gap-2.5 pb-4 px-4 font-mono text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'github'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Github className="w-4 h-4" />
            Public GitHub Repository
          </button>
          <button
            onClick={() => { setActiveTab('upload'); setError(''); }}
            className={`flex items-center gap-2.5 pb-4 px-4 font-mono text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Zipped Folder (.zip)
          </button>
        </div>

        {/* Tab 1: GitHub URL Form */}
        {activeTab === 'github' && (
          <form onSubmit={handleGithubSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
                GitHub Repository URL
              </label>
              <div className="relative">
                <Github className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full pl-12 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition-all"
                />
              </div>
            </div>

            {/* Quick Sample Presets */}
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-xs">
              <span className="font-mono text-gray-400 block mb-2 font-semibold">Try sample repository:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSampleRepo('https://github.com/expressjs/express')}
                  className="px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-cyan-400 font-mono hover:bg-gray-800 transition-colors"
                >
                  expressjs/express
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              Analyze GitHub Codebase <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 2: Zip Upload Form */}
        {activeTab === 'upload' && (
          <form onSubmit={handleUploadSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
                Select .zip Codebase Archive
              </label>
              <div className="border-2 border-dashed border-gray-800 hover:border-cyan-500/50 rounded-2xl p-8 text-center bg-gray-950/40 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="inline-flex p-3 rounded-2xl bg-gray-900 text-cyan-400 mb-3 border border-gray-800">
                  <FileArchive className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-gray-200">
                  {selectedFile ? selectedFile.name : 'Click or drag & drop .zip file here'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB archive selected (Smart filter extracts security-critical files)` : 'Supports any codebase archive size — automatically filters & extracts security-critical files'}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedFile}
              className="w-full py-3.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              Upload & Audit Zip File <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewScan;
