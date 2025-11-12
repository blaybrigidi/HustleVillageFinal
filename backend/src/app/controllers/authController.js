const authService = require('../services/authService');

/**
 * Request signup code - sends OTP verification code to user's email
 */
const requestSignup = async (req, res) => {
  try {
    const { email, full_name, phone_number } = req.body;
    
    // Validate required fields
    if (!email || !full_name || !phone_number) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, full_name, and phone_number are required' 
      });
    }

    // Validate Ashesi email
    if (!email.endsWith("ashesi.edu.gh")) {
      return res.status(400).json({
        success: false,
        error: "Must use an Ashesi Email"
      });
    }

    const result = await authService.requestSignupCode({ email, full_name, phone_number });
    res.status(200).json({ 
      success: true, 
      message: result.message,
      email: result.email
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Verify signup code - verifies OTP code and creates user account
 * Only requires email and token since user data was already validated in requestSignup
 */
const verifySignup = async (req, res) => {
  try {
    const { email, token } = req.body;
    
    // Validate required fields
    if (!email || !token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and token (verification code) are required' 
      });
    }

    // No need to re-validate email format or check Ashesi domain
    // This was already done in requestSignup and stored with the OTP
    
    const result = await authService.verifySignupCode({ email, token });
    res.status(200).json({ 
      success: true, 
      message: 'User verified and created successfully',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    const statusCode = error.message.includes('Invalid') || error.message.includes('failed') ? 400 : 500;
    res.status(statusCode).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = {
  requestSignup,
  verifySignup
};