import passport from "../config/passport.js";

const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { 
    session: false,
  }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        statusCode: 500,
        error: 1,
        message: 'Internal authentication error',
        data: null
      });
    }
    
    if (!user) {
      let message = 'Authentication required';
      
      // Provide more specific error messages based on the info object
      if (info && info.name === 'TokenExpiredError') {
        message = 'Your session has expired. Please log in again.';
      } else if (info && info.name === 'JsonWebTokenError') {
        message = 'Invalid authentication token';
      }
      
      return res.status(401).json({
        statusCode: 401,
        error: 1,
        message,
        data: null
      });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

export { authenticateJWT };