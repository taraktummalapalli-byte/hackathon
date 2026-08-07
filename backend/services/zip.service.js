const AdmZip = require('adm-zip');

/**
 * Extract files from uploaded ZIP archive buffer
 * @param {Buffer} zipBuffer 
 * @returns {Array<{path: string, content: string}>}
 */
function extractZipFiles(zipBuffer) {
  try {
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    const extractedFiles = [];

    const excludePaths = ['node_modules/', '.git/', 'dist/', 'build/', '.next/', 'coverage/'];
    const excludeExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf', '.eot', '.lock', '.pdf', '.zip', '.tar', '.gz', '.mp4', '.avi', '.mov', '.mp3', '.exe', '.dll'];

    zipEntries.forEach(entry => {
      if (entry.isDirectory) return;

      const p = entry.entryName.replace(/\\/g, '/');
      const pLower = p.toLowerCase();

      // Skip ignored paths and media/binary extensions BEFORE reading data to save memory
      if (excludePaths.some(dir => pLower.includes(dir))) return;

      const extIdx = pLower.lastIndexOf('.');
      if (extIdx !== -1) {
        const ext = pLower.substring(extIdx);
        if (excludeExts.includes(ext)) return;
      }

      try {
        // Read text contentsafely
        const content = entry.getData().toString('utf8');
        extractedFiles.push({
          path: p,
          content: content.length > 50000 ? content.slice(0, 50000) + '\n\n/* [TRUNCATED HIGH FILE SIZE CONTENT] */' : content
        });
      } catch (e) {
        console.warn(`[ZipService] Could not read content for entry ${p}:`, e.message);
      }
    });

    return extractedFiles;
  } catch (err) {
    console.error('[ZipService] Error extracting zip file:', err.message);
    throw new Error('Failed to extract uploaded ZIP file. Ensure it is a valid zip archive.');
  }
}

module.exports = {
  extractZipFiles
};
