import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token and authenticate customer
 * Use this middleware on protected routes
 */
export const authenticateCustomer = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header is required'
      });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is for a customer
    if (decoded.type !== 'customer') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Customer authentication required.'
      });
    }

    // Attach customer info to request
    req.customer = {
      id: decoded.id,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

export default authenticateCustomer;
