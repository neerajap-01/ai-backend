import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/keys.js';
import UserModel from '../models/user.model.js';

const client = new OAuth2Client(
  env.AINMAIL_GOOGLE_CLIENT_ID,
  env.AINMAIL_GOOGLE_CLIENT_SECRET,
);

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
    await client.request({
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/profile',
    });
    
    // Make mongoDB call to check if user exists
    const user = await UserModel.findOne({ email: userInfoResponse.data.email });
    const userData = {
      id: '',
      email: '',
      name: '',
      avatar: '',
      tokens: {
        access_token: token,
        // Note: refresh tokens require additional setup with server-side flow
        expiry_date: Date.now() + 3600000 // 1 hour from now
      }
    }
    if (!user) {
      // If user doesn't exist, create a new user
      const newUser = new UserModel({
        email: userInfoResponse.data.email,
        name: userInfoResponse.data.name,
        profilePicture: userInfoResponse.data.picture,
        authType: 'google',
        googleId: userInfoResponse.data.sub,
        isVerified: true,
      });

      // Save the new user to the database
      const data = await newUser.save();
      
      userData.id = data._id;
      userData.email = data.email;
      userData.name = data.name;
      userData.avatar = data.profilePicture;
    } else {
      userData.id = user._id;
      userData.email = user.email;
      userData.name = user.name;
      userData.avatar = user.profilePicture;
    }

    return res.json({
      ok: true,
      statusCode: 200,
      data: userData
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    // You would need server-side OAuth flow to get refresh tokens
    // This is a simplified example assuming you have refresh tokens
    client.setCredentials({ refresh_token });
    
    const { credentials } = await client.refreshAccessToken();
    
    return res.json({
      ok: true,
      statusCode: 200,
      data: {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
        expiry_date: credentials.expiry_date
      }
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