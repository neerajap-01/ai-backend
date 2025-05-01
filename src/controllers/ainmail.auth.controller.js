import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/keys.js';


const client = new OAuth2Client(
  env.AINMAIL_GOOGLE_CLIENT_ID,
  env.AINMAIL_GOOGLE_CLIENT_SECRET,
);

/**
 * Generate a deterministic user ID from email
 * @param {string} email - User's email address
 * @returns {string} - Hashed user ID
 */
const generateUserId = (email) => {
  return crypto
    .createHash('sha256')
    .update(email + 'env.USER_ID_SECRET')
    .digest('hex');
};

const validateToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify the token and get user info
    client.setCredentials({ access_token: token });
    
    // Get user profile
    const userInfoResponse = await client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });

    // Get Gmail-specific data if needed
    const gmailResponse = await client.request({
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/profile',
    });
    
    // Generate a server-side user ID
    // const userId = generateUserId(userInfoResponse.data.email);
    
    // You could store user info in your database here
    
    // Return user data to client
    return res.json({
      ok: true,
      statusCode: 200,
      data: {
        id: 1,
        email: userInfoResponse.data.email,
        name: userInfoResponse.data.name,
        avatar: userInfoResponse.data.picture,
        tokens: {
          access_token: token,
          // Note: refresh tokens require additional setup with server-side flow
          expiry_date: Date.now() + 3600000 // 1 hour from now
        }
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token, account_id } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    // You would need server-side OAuth flow to get refresh tokens
    // This is a simplified example assuming you have refresh tokens
    client.setCredentials({ refresh_token });
    
    const { credentials } = await client.refreshAccessToken();
    
    return res.json({
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export {
  validateToken,
  refreshToken
}