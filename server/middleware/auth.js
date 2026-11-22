import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const DEFAULT_DEV_SECRET = 'bishi_hyper_secure_jwt_token_secret_sepolia_2026';
export const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_DEV_SECRET;

if (!process.env.JWT_SECRET) {
  console.warn('[Security Warning] JWT_SECRET is not set in environment. Using default development secret.');
}

export const generateToken = (user, expiresIn = '7d') => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn }
  );
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Malformed or missing Bearer token'
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (jwtErr) {
        if (jwtErr.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Token expired',
            message: 'Authentication token has expired. Please login again.'
          });
        }
        return res.status(401).json({
          error: 'Invalid token',
          message: 'The provided authentication token is invalid.'
        });
      }

      const user = await User.findOne({ id: decoded.id });
      if (!user) {
        return res.status(401).json({
          error: 'User not found',
          message: 'User belonging to this token no longer exists'
        });
      }

      req.user = user;
      return next();
    }

    // Header-based role override for hackathon demo testing (e.g. x-demo-role: organizer)
    const demoRole = req.headers['x-demo-role'];
    if (demoRole) {
      const cleanRole = demoRole.toLowerCase().trim();
      let demoUser = await User.findOne({ role: cleanRole });
      if (!demoUser) {
        // Fall back to first matching user or create virtual profile
        demoUser = await User.findOne();
      }
      if (demoUser) {
        req.user = demoUser;
        return next();
      }
    }

    return res.status(401).json({
      error: 'Authentication required',
      message: 'Missing Authorization header with Bearer token'
    });
  } catch (err) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: err.message
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          const user = await User.findOne({ id: decoded.id });
          if (user) req.user = user;
        } catch {
          // Ignore invalid token in optional mode
        }
      }
    } else if (req.headers['x-demo-role']) {
      const cleanRole = req.headers['x-demo-role'].toLowerCase().trim();
      const demoUser = await User.findOne({ role: cleanRole });
      if (demoUser) req.user = demoUser;
    }
  } catch {
    // Ignore error in optional auth
  }
  next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required before checking role authorization'
      });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const allowed = roles.map(r => r.toLowerCase());

    if (!allowed.includes(userRole) && !allowed.includes('all')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role '${userRole}' is not authorized. Requires: ${roles.join(', ')}`
      });
    }
    next();
  };
};

export const blockAuditorWrites = (req, res, next) => {
  const method = req.method.toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (req.user && req.user.role === 'auditor') {
      return res.status(403).json({
        error: 'Auditor role is strictly read-only',
        message: 'Auditors are authorized for independent audit verification only and cannot record or modify data.'
      });
    }
  }
  next();
};
