const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Todos os endpoints requerem autenticação
router.use(authenticate);

// GET /users - Lista usuários (Admin)
router.get('/', authorize('admin'), async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      whereClause += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    // Contar total
    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Buscar usuários
    const result = await query(
      `SELECT id, email, name, role, avatar, created_at, updated_at 
       FROM users 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    res.json({
      data: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

// GET /users/instructors
router.get('/instructors', authorize('admin'), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, email, name, avatar, created_at 
       FROM users 
       WHERE role = 'instructor'
       ORDER BY name`
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /users/students
router.get('/students', authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE role = 'student'";
    const params = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const result = await query(
      `SELECT id, email, name, avatar, created_at 
       FROM users 
       ${whereClause}
       ORDER BY name
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /users/:id
router.get('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, email, name, role, avatar, created_at, updated_at 
       FROM users 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// POST /users - Criar usuário (Admin)
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { email, password, name, role = 'student' } = req.body;

    // Verificar email
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: 'Email already registered',
        code: 'EMAIL_EXISTS',
        statusCode: 400
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role, created_at`,
      [email, passwordHash, name, role]
    );

    // Criar stats de gamificação
    await query(
      'INSERT INTO user_stats (user_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [result.rows[0].id]
    );

    res.status(201).json({
      data: result.rows[0],
      message: 'User created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /users/:id
router.patch('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (role) {
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message: 'No fields to update',
        code: 'NO_UPDATES',
        statusCode: 400
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, name, role`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({
      data: result.rows[0],
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /users/:id
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Não permitir deletar o próprio usuário
    if (id === req.user.id) {
      return res.status(400).json({
        message: 'Cannot delete your own account',
        code: 'SELF_DELETE',
        statusCode: 400
      });
    }

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
