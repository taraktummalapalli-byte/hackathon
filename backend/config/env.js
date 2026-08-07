const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'codeguard-ai-fallback-jwt-secret-key-2026',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || ''
};
