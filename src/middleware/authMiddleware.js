// Authentication middleware - verifies JWT tokens
const { createClient } = require('@supabase/supabase-js');

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user info to req.user
 * The token should be a Supabase access token returned from the verify endpoint
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authorization header provided'
      });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Create a Supabase client with the user's token to verify it
    const supabaseUrl = process.env.DB_PROJECT_URL;
    const supabaseAnonKey = process.env.ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    // Create a Supabase client instance with the user's token
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verify token by getting the user
    const { data: { user: supabaseUser }, error: supabaseError } = await userSupabase.auth.getUser();

    if (supabaseError || !supabaseUser) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get user from our users table using email
    // Use the regular supabase client for database queries
    const supabase = require('../config/database');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, phone_number')
      .eq('email', supabaseUser.email)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        error: 'User not found in database'
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id, // Database user ID (from users table) - use this as sellerId
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number,
      supabaseUserId: supabaseUser.id // Supabase Auth user ID
    };
    console.log('User from middleware:', req.user);


    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed: ' + error.message
    });
  }
};

module.exports = {
  authenticate
};

