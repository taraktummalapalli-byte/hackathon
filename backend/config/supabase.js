const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

let supabase = null;

const isValidSupabaseConfig = 
  env.supabaseUrl && 
  env.supabaseUrl.startsWith('http') && 
  !env.supabaseUrl.includes('your-supabase-project-id') &&
  env.supabaseServiceKey && 
  !env.supabaseServiceKey.includes('your-supabase-service-role-key');

if (isValidSupabaseConfig) {
  try {
    supabase = createClient(env.supabaseUrl, env.supabaseServiceKey, {
      auth: { persistSession: false }
    });
    console.log('[Supabase] Connected to live Supabase Postgres database.');
  } catch (err) {
    console.warn('[Supabase] Failed to initialize Supabase client:', err.message);
  }
}

if (!supabase) {
  console.warn('[Supabase] Running with in-memory fallback database adapter (Configure SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY for live Postgres persistence).');
  
  // In-memory mock database store for seamless local execution
  const mockDb = {
    users: [],
    scans: [],
    scan_issues: []
  };

  supabase = {
    isMock: true,
    from: (tableName) => {
      const records = mockDb[tableName] || [];
      return {
        select: (columns = '*') => {
          let filtered = [...records];
          const queryObj = {
            eq: (field, val) => {
              filtered = filtered.filter(r => r[field] === val);
              return queryObj;
            },
            order: (field, { ascending = true } = {}) => {
              filtered.sort((a, b) => {
                const valA = new Date(a[field]).getTime() || a[field];
                const valB = new Date(b[field]).getTime() || b[field];
                return ascending ? valA - valB : valB - valA;
              });
              return queryObj;
            },
            single: async () => {
              return { data: filtered[0] || null, error: filtered.length ? null : { message: 'Row not found' } };
            },
            then: (resolve) => resolve({ data: filtered, error: null })
          };
          return queryObj;
        },
        insert: (data) => {
          const rows = Array.isArray(data) ? data : [data];
          const inserted = rows.map(item => {
            const row = {
              id: item.id || require('crypto').randomUUID(),
              created_at: item.created_at || new Date().toISOString(),
              ...item
            };
            records.push(row);
            return row;
          });
          return {
            select: () => ({
              single: async () => ({ data: inserted[0], error: null }),
              then: (resolve) => resolve({ data: inserted, error: null })
            }),
            then: (resolve) => resolve({ data: Array.isArray(data) ? inserted : inserted[0], error: null })
          };
        }
      };
    }
  };
}

module.exports = supabase;
