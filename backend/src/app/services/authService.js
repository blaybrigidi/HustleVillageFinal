// Auth service - handles authentication business logic
const supabase = require('../../config/database');
const supabaseAdmin = require('../../config/database').supabaseAdmin;

/**
 * Request signup code - sends OTP code to user's email
 * @param {string} email - User's email address
 * @param {string} full_name - User's full name
 * @param {string} phone_number - User's phone number
 */
const requestSignupCode = async ({ email, full_name, phone_number }) => {
  // Send OTP code via email using Supabase Auth
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: {
        full_name,
        phone_number
      }
    }
  });

  if (error) {
    throw new Error(`Failed to send verification code: ${error.message}`);
  }

  return {
    message: 'Verification code sent to email',
    email: email
  };
};

/**
 * Verify signup code - verifies OTP and creates user
 * @param {string} email - User's email address
 * @param {string} token - OTP code from email
 */
const verifySignupCode = async ({ email, token }) => {
  // Verify the OTP code
  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });

  if (verifyError) {
    throw new Error(`Invalid verification code: ${verifyError.message}`);
  }

  if (!verifyData.user) {
    throw new Error('User verification failed');
  }

  // Extract full_name and phone_number from user metadata (stored during requestSignupCode)
  const full_name = verifyData.user.user_metadata?.full_name || verifyData.user.user_metadata?.fullName || '';
  const phone_number = verifyData.user.user_metadata?.phone_number || verifyData.user.user_metadata?.phoneNumber || '';

  if (!full_name || !phone_number) {
    console.warn('Warning: full_name or phone_number not found in user metadata');
  }

  // Also store in custom users table if it exists
  // Use admin client (service role key) to bypass RLS for server-side operations
  const dbClient = supabaseAdmin || supabase;
  
  // Check if user already exists in users table
  const { data: existingUser, error: checkError } = await dbClient
    .from('users')
    .select('id, email, full_name, phone_number, created_at')
    .eq('email', email)
    .single();

  let user;
  
  // If checkError exists and it's not a "not found" error, log it
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking for existing user:', checkError);
  }

  if (existingUser) {
    // Update existing user
    const { data: updatedUser, error: dbError } = await dbClient
      .from('users')
      .update({
        full_name: full_name || existingUser.full_name,
        phone_number: phone_number || existingUser.phone_number,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select('id, email, full_name, phone_number, created_at')
      .single();

    if (dbError) {
      console.error('Error updating user in database:', dbError);
      throw new Error(`Failed to update user in database: ${dbError.message}`);
    } else {
      user = updatedUser;
    }
  } else {
    // Create new user in users table
    // Use admin client to bypass RLS
    const { data: newUser, error: dbError } = await dbClient
      .from('users')
      .insert([
        {
          email,
          full_name: full_name || '',
          phone_number: phone_number || '',
          created_at: new Date().toISOString()
        }
      ])
      .select('id, email, full_name, phone_number, created_at')
      .single();

    if (dbError) {
      console.error('Error creating user in database:', dbError);
      // This is critical - we should throw an error if we can't create the user
      throw new Error(`Failed to create user in database: ${dbError.message}`);
    } else {
      user = newUser;
    }
  }

  // Return session tokens from Supabase
  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number,
      createdAt: user.created_at
    },
    session: verifyData.session,
    accessToken: verifyData.session?.access_token,
    refreshToken: verifyData.session?.refresh_token
  };
};

module.exports = {
  requestSignupCode,
  verifySignupCode
};

