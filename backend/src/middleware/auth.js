const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

// Middleware de autenticação
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Token not provided',
        code: 'UNAUTHORIZED',
        statusCode: 401
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Buscar usuário atualizado do banco
      const result = await query(
        'SELECT id, email, name, role, avatar FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          statusCode: 401
        });
      }

      req.user = result.rows[0];
      next();
    } catch (jwtError) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
        statusCode: 401
      });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware de autorização por role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Not authenticated',
        code: 'UNAUTHORIZED',
        statusCode: 401
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied. Insufficient permissions.',
        code: 'FORBIDDEN',
        statusCode: 403
      });
    }

    next();
  };
};

// Gerar token JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = { authenticate, authorize, generateToken };
