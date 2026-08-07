const axios = require('axios');

/**
 * Parses GitHub repository URL into owner and repo name.
 * Example: https://github.com/expressjs/express -> { owner: 'expressjs', repo: 'express' }
 */
function parseGithubUrl(url) {
  const cleanUrl = url.trim().replace(/\/$/, '');
  const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub repository URL format.');
  }
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

/**
 * Recursively fetch repository tree files using GitHub REST API
 */
async function fetchGithubRepoFiles(repoUrl) {
  const { owner, repo } = parseGithubUrl(repoUrl);
  
  let repoDetails;
  try {
    const repoDetailsUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const repoRes = await axios.get(repoDetailsUrl, {
      headers: { 'User-Agent': 'CodeGuard-AI-Auditor' }
    });
    repoDetails = repoRes.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      throw new Error(`GitHub repository "${owner}/${repo}" was not found or is private. Please verify the URL.`);
    }
    throw new Error(`Failed to access GitHub API for "${owner}/${repo}": ${err.message}`);
  }
  
  const canonicalFullName = repoDetails.full_name || `${owner}/${repo}`;
  const defaultBranch = repoDetails.default_branch || 'main';

  // 2. Fetch full tree recursively
  let treeRes;
  try {
    const treeUrl = `https://api.github.com/repos/${canonicalFullName}/git/trees/${defaultBranch}?recursive=1`;
    treeRes = await axios.get(treeUrl, {
      headers: { 'User-Agent': 'CodeGuard-AI-Auditor' }
    });
  } catch (err) {
    // Try master fallback branch if main fails
    try {
      const treeUrl = `https://api.github.com/repos/${canonicalFullName}/git/trees/master?recursive=1`;
      treeRes = await axios.get(treeUrl, {
        headers: { 'User-Agent': 'CodeGuard-AI-Auditor' }
      });
    } catch (e) {
      throw new Error(`Could not fetch file tree for repository "${canonicalFullName}".`);
    }
  }

  const items = treeRes.data.tree || [];
  // Filter only blob (file) nodes and exclude binary extensions
  const excludeExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf', '.eot', '.lock', '.pdf', '.zip', '.tar', '.gz'];
  
  const fileItems = items.filter(item => {
    if (item.type !== 'blob') return false;
    const p = item.path.toLowerCase();
    if (p.includes('node_modules/') || p.includes('.git/') || p.includes('dist/') || p.includes('build/')) return false;
    const ext = p.substring(p.lastIndexOf('.'));
    if (excludeExts.includes(ext)) return false;
    return true;
  });

  // Sort files by security relevance priority before fetching content
  fileItems.sort((a, b) => {
    const score = (pathStr) => {
      let s = 0;
      const p = pathStr.toLowerCase();
      if (p.includes('.env')) s += 100;
      if (p.includes('config') || p.includes('server') || p.includes('app.js') || p.includes('app.ts')) s += 90;
      if (p.includes('package.json')) s += 85;
      if (p.includes('routes/') || p.includes('controllers/') || p.includes('api/')) s += 80;
      if (p.includes('auth') || p.includes('secret') || p.includes('middleware')) s += 70;
      return s;
    };
    return score(b.path) - score(a.path);
  });

  const fileContents = [];
  // Take top 40 security-relevant candidate files
  const targetFiles = fileItems.slice(0, 40);

  for (const item of targetFiles) {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${canonicalFullName}/${defaultBranch}/${item.path}`;
      const contentRes = await axios.get(rawUrl, {
        headers: { 'User-Agent': 'CodeGuard-AI-Auditor' },
        responseType: 'text'
      });
      fileContents.push({
        path: item.path,
        content: contentRes.data
      });
    } catch (err) {
      // Fallback to GitHub Contents API if raw download fails
      try {
        const contentApiUrl = `https://api.github.com/repos/${canonicalFullName}/contents/${item.path}?ref=${defaultBranch}`;
        const apiRes = await axios.get(contentApiUrl, {
          headers: { 'User-Agent': 'CodeGuard-AI-Auditor' }
        });
        if (apiRes.data && apiRes.data.content) {
          const decoded = Buffer.from(apiRes.data.content, 'base64').toString('utf8');
          fileContents.push({
            path: item.path,
            content: decoded
          });
        }
      } catch (e) {
        console.warn(`[GithubService] Could not fetch raw content for ${item.path}:`, err.message);
      }
    }
  }

  return fileContents;
}

module.exports = {
  parseGithubUrl,
  fetchGithubRepoFiles
};
