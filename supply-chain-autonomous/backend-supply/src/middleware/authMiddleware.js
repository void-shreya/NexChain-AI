const { verifyToken } = require('../config/jwt');
const { db } = require('../database/dbClient');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    let user = await db.findUserById(decoded.id);
    if (!user && decoded.email) {
      user = await db.findUserByEmail(decoded.email);
    }

    if (!user && decoded.email) {
      // Reconstruct user context from cryptographically verified token payload
      user = {
        id: decoded.id,
        email: decoded.email,
        role_id: decoded.role_id || 'SUPPLY_MANAGER',
        full_name: decoded.full_name || decoded.email.split('@')[0],
      };
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User session has expired or account is inactive.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authorization token.',
    });
  }
};

module.exports = {
  authenticate,
};
