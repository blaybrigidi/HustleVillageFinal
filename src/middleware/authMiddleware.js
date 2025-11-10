// Authentication middleware - verifies JWT tokens
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

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

    // Decode JWT to get user info (without verification first, just to get the user ID)
    let decodedToken;
    try {
      // Decode without verification to get the payload
      decodedToken = jwt.decode(token);
      if (!decodedToken || !decodedToken.sub) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token format'
        });
      }
    } catch (decodeError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format'
      });
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      console.log('Token expired:', {
        exp: decodedToken.exp,
        currentTime,
        expiredBy: currentTime - decodedToken.exp,
        seconds: 'seconds'
      });
      return res.status(401).json({
        success: false,
        error: 'Token has expired. Please refresh your token.'
      });
    }

    // Get email from decoded token
    const userEmail = decodedToken.email || decodedToken.user_metadata?.email;
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: 'Email not found in token'
      });
    }

    // Get user from our users table using email from the token
    // Use the admin client to bypass RLS
    const supabase = require('../config/database');
    const supabaseAdmin = require('../config/database').supabaseAdmin;
    const dbClient = supabaseAdmin || supabase;
    
    const { data: user, error: userError } = await dbClient
      .from('users')
      .select('id, email, full_name, phone_number')
      .eq('email', userEmail)
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
      supabaseUserId: decodedToken.sub // Supabase Auth user ID from token
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

