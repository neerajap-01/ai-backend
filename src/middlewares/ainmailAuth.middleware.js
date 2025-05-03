import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/keys.js';

const client = new OAuth2Client(
  env.AINMAIL_GOOGLE_CLIENT_ID,
  env.AINMAIL_GOOGLE_CLIENT_SECRET
);

/**
 * Middleware to authenticate requests to ainmail routes
 * Checks for Bearer token in Authorization header and validates it with Google
 * @param {Object} options - Configuration options
 * @param {boolean} options.allowRefresh - Whether to allow refresh token validation
 */
const checkAinmailAuth = (options = { allowRefresh: false }) => async (req, res, next) => {
  try {
    // Special handling for refresh token route
    if (options.allowRefresh && req.body && req.body.refresh_token) {
      // For refresh token route, we don't validate the access token
      // since it's likely expired - that's why they're refreshing
      return next();
    }
    
    // Regular token validation for other routes
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        ok: false,
        statusCode: 401,
        error: 'Authentication required',
        data: null,
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        ok: false,
        statusCode: 401,
        error: 'Invalid token format',
        data: null,
      });
    }

    // Verify the token
    try {
      // Set the token to verify
      client.setCredentials({ access_token: token });
      
      // Verify token by making a request to Google's userinfo endpoint
      const userInfoResponse = await client.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      });

      // If we reach here, token is valid
      // Attach user info to request for use in controllers
      req.user = {
        email: userInfoResponse.data.email,
        name: userInfoResponse.data.name,
        picture: userInfoResponse.data.picture,
        accessToken: token
      };
      
      next();
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return res.status(401).json({ 
        ok: false,
        statusCode: 401,
        error: 'Invalid or expired token',
        message: tokenError.message,
        data: null,
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      ok: false,
      statusCode: 500,
      error: 'Authentication error',
      data: null, 
    });
  }
};

export default checkAinmailAuth;