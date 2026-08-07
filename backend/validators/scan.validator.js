const { z } = require('zod');

const githubScanSchema = z.object({
  repoUrl: z.string()
    .min(1, 'GitHub URL is required')
    .refine(val => {
      return /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/.test(val.trim());
    }, { message: 'Invalid GitHub repository URL format. Example: https://github.com/owner/repo' })
});

module.exports = {
  githubScanSchema
};
