const path = require('path');

/**
 * Filter and select high-priority security-relevant files from a repository file map.
 * @param {Array<{path: string, content: string}>} files - List of candidate files
 * @returns {Array<{path: string, content: string, truncated?: boolean}>} Formatted files under length limits
 */
function filterSecurityFiles(files) {
  const MAX_SINGLE_FILE_CHARS = 15000;
  const MAX_COMBINED_CHARS = 45000;

  // Excluded directory and file extension patterns
  const excludePaths = [
    'node_modules/', '.git/', 'dist/', 'build/', '.next/', 'out/',
    'coverage/', '.vscode/', '.idea/'
  ];
  const excludeExts = [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
    '.woff', '.woff2', '.ttf', '.eot',
    '.lock', '.pdf', '.zip', '.tar', '.gz'
  ];
  const lockfiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'];

  const cleanFiles = files.filter(f => {
    const p = f.path.replace(/\\/g, '/');
    const basename = path.basename(p);
    const ext = path.extname(p).toLowerCase();

    // Check directory exclusions
    if (excludePaths.some(dir => p.includes(dir))) return false;
    // Check file extension exclusions
    if (excludeExts.includes(ext)) return false;
    // Check lockfiles
    if (lockfiles.includes(basename)) return false;

    return true;
  });

  const testFileRegex = /(\.test\.js$|\.spec\.js$|__tests__\/|\.test\.ts$|\.spec\.ts$)/i;
  const nonTestFiles = cleanFiles.filter(f => !testFileRegex.test(f.path));
  const candidatePool = nonTestFiles.length > 0 ? nonTestFiles : cleanFiles;

  const scoredFiles = candidatePool.map(f => {
    const p = f.path.replace(/\\/g, '/');
    const basename = path.basename(p);
    let priority = 0;

    // 1. Critical env and config files
    if (/\.env(\..+)?$/i.test(basename)) priority += 100;
    if (p.includes('config/') || ['next.config.js', 'vite.config.js', 'server.js', 'app.js'].includes(basename)) priority += 90;
    if (basename === 'package.json') priority += 85;

    // 2. Controller, route, and API endpoint files
    if (/\b(routes|controllers|api|pages\/api)\//i.test(p)) priority += 80;

    // 3. Files calling external APIs or containing security sensitive keywords
    const content = f.content || '';
    if (/fetch\(|axios|process\.env|API_KEY|secret|password|bearer|auth/i.test(content)) {
      priority += 60;
    }

    // 4. Context files like README.md
    if (basename.toLowerCase() === 'readme.md') priority += 30;

    return { ...f, priority, path: p };
  });

  // Sort descending by priority score
  scoredFiles.sort((a, b) => b.priority - a.priority);

  const selected = [];
  let totalChars = 0;

  for (const f of scoredFiles) {
    if (totalChars >= MAX_COMBINED_CHARS) break;

    let content = f.content || '';
    let truncated = false;

    if (content.length > MAX_SINGLE_FILE_CHARS) {
      content = content.slice(0, MAX_SINGLE_FILE_CHARS) + '\n\n/* [TRUNCATED FOR LENGTH SECURITY REVIEW] */';
      truncated = true;
    }

    if (totalChars + content.length > MAX_COMBINED_CHARS) {
      const remainingSpace = MAX_COMBINED_CHARS - totalChars;
      if (remainingSpace > 500) {
        content = content.slice(0, remainingSpace) + '\n\n/* [TRUNCATED TO FIT COMBINED TOKEN BUDGET] */';
        truncated = true;
      } else {
        break;
      }
    }

    totalChars += content.length;
    selected.push({
      path: f.path,
      content,
      truncated
    });
  }

  return selected;
}

module.exports = {
  filterSecurityFiles
};
