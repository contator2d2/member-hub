const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { query } = require('../config/database');
const { authenticate, generateToken } = require('../middleware/auth');

const router = express.Router();

// Schemas de validação
const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
});

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    
    // Verificar se email já existe
    const existing = await query('SELECT id FROM users WHERE email = $1', [data.email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: 'Email already registered',
        code: 'EMAIL_EXISTS',
        statusCode: 400
      });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Criar usuário
    const result = await query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, 'student') 
       RETURNING id, email, name, role, created_at`,
      [data.email, passwordHash, data.name]
    );

    const user = result.rows[0];

    // Criar stats iniciais de gamificação
    await query(
      'INSERT INTO user_stats (user_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [user.id]
    );

    // Gerar token
    const token = generateToken(user);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.errors[0].message,
        code: 'VALIDATION_ERROR',
        statusCode: 400
      });
    }
    next(error);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    // Buscar usuário
    const result = await query(
      'SELECT id, email, name, role, password_hash, avatar FROM users WHERE email = $1',
      [data.email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
        statusCode: 401
      });
    }

    const user = result.rows[0];

    // Verificar senha
    const validPassword = await bcrypt.compare(data.password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
        statusCode: 401
      });
    }

    // Gerar token
    const token = generateToken(user);

    // Atualizar streak de login
    await query(
      `UPDATE user_stats 
       SET current_streak = CASE 
         WHEN last_activity_date = CURRENT_DATE - 1 THEN current_streak + 1
         WHEN last_activity_date = CURRENT_DATE THEN current_streak
         ELSE 1 
       END,
       longest_streak = GREATEST(longest_streak, CASE 
         WHEN last_activity_date = CURRENT_DATE - 1 THEN current_streak + 1
         ELSE 1 
       END),
       last_activity_date = CURRENT_DATE
       WHERE user_id = $1`,
      [user.id]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.errors[0].message,
        code: 'VALIDATION_ERROR',
        statusCode: 400
      });
    }
    next(error);
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req, res) => {
  res.json({
    data: req.user
  });
});

// POST /auth/logout
router.post('/logout', authenticate, (req, res) => {
  // JWT é stateless, então apenas retornamos sucesso
  // O cliente deve remover o token
  res.json({ message: 'Logged out successfully' });
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await query('SELECT id FROM users WHERE email = $1', [email]);
    
    // Sempre retorna sucesso por segurança
    res.json({
      message: 'If email exists, a reset link was sent'
    });
    
    // TODO: Implementar envio de email
  } catch (error) {
    next(error);
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // TODO: Implementar verificação do token de reset
    
    res.json({
      message: 'Password reset functionality not implemented yet'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
