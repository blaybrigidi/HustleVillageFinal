const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.DB_PROJECT_URL;
const supabaseAnonKey = process.env.ANON_KEY;
const supabaseServiceKey = process.env.SERVICE_ROLE_KEY; // For server-side operations that bypass RLS

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your .env file.');
}

// Client with anon key (for client-side operations, respects RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client with service role key (for server-side operations, bypasses RLS)
// Use this for operations that need to bypass RLS like creating users
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Test connection
supabase
  .from('users')
  .select('count')
  .limit(1)
  .then(() => {
    console.log('✅ Database connection successful');
  })
  .catch((error) => {
    console.log('⚠️  Database connection test failed:', error.message);
    console.log('Note: This is normal if the users table does not exist yet.');
  });

// Export both clients
module.exports = supabase;
module.exports.supabaseAdmin = supabaseAdmin;

// Also export as named exports for easier access
if (typeof module.exports.default === 'undefined') {
  module.exports.default = supabase;
}

