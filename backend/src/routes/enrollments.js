const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// GET /enrollments - Lista todas (Admin)
router.get('/', authorize('admin'), async (req, res, next) => {
  try {
    const { status, paymentStatus, courseId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND e.status = $${paramIndex++}`;
      params.push(status);
    }
    if (paymentStatus) {
      whereClause += ` AND e.payment_status = $${paramIndex++}`;
      params.push(paymentStatus);
    }
    if (courseId) {
      whereClause += ` AND e.course_id = $${paramIndex++}`;
      params.push(courseId);
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM enrollments e ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT e.*, 
              u.name as user_name, u.email as user_email,
              c.title as course_title, c.thumbnail as course_thumbnail
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       JOIN courses c ON e.course_id = c.id
       ${whereClause}
       ORDER BY e.enrolled_at DESC
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

// GET /enrollments/me - Matrículas do usuário atual
router.get('/me', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT e.*, 
              c.title as course_title, c.thumbnail as course_thumbnail, c.description as course_description,
              c.duration as course_duration, c.instructor_id,
              u.name as instructor_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// POST /enrollments - Criar matrícula manual (Admin)
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { userId, courseId, status = 'active', paymentStatus = 'paid', expiresAt } = req.body;

    // Verificar se já existe matrícula
    const existing = await query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: 'User already enrolled in this course',
        code: 'ALREADY_ENROLLED',
        statusCode: 400
      });
    }

    const result = await query(
      `INSERT INTO enrollments (user_id, course_id, status, payment_status, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, courseId, status, paymentStatus, expiresAt]
    );

    // Atualizar contagem de alunos do curso
    await query(
      'UPDATE courses SET students_count = students_count + 1 WHERE id = $1',
      [courseId]
    );

    res.status(201).json({
      data: result.rows[0],
      message: 'Enrollment created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /courses/:id/enroll - Solicitar matrícula (Aluno)
router.post('/courses/:id/enroll', async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.user.id;

    // Verificar se já existe matrícula
    const existing = await query(
      'SELECT id, status FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: 'Already enrolled or enrollment pending',
        code: 'ALREADY_ENROLLED',
        statusCode: 400
      });
    }

    // Verificar se curso existe e está publicado
    const course = await query(
      "SELECT id, price FROM courses WHERE id = $1 AND status = 'published'",
      [courseId]
    );

    if (course.rows.length === 0) {
      return res.status(404).json({
        message: 'Course not found or not available',
        code: 'COURSE_NOT_AVAILABLE',
        statusCode: 404
      });
    }

    // Se curso é gratuito, ativar direto
    const isFree = parseFloat(course.rows[0].price) === 0;
    const status = isFree ? 'active' : 'pending';
    const paymentStatus = isFree ? 'paid' : 'pending';

    const result = await query(
      `INSERT INTO enrollments (user_id, course_id, status, payment_status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, courseId, status, paymentStatus]
    );

    if (isFree) {
      await query(
        'UPDATE courses SET students_count = students_count + 1 WHERE id = $1',
        [courseId]
      );
    }

    res.status(201).json({
      data: result.rows[0],
      message: isFree ? 'Enrolled successfully' : 'Enrollment request submitted'
    });
  } catch (error) {
    next(error);
  }
});

// GET /courses/:id/enrollment - Verificar matrícula
router.get('/courses/:id/enrollment', async (req, res, next) => {
  try {
    const { id: courseId } = req.params;

    const result = await query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [req.user.id, courseId]
    );

    if (result.rows.length === 0) {
      return res.json({ data: null, enrolled: false });
    }

    res.json({ data: result.rows[0], enrolled: true });
  } catch (error) {
    next(error);
  }
});

// POST /enrollments/:id/approve (Admin)
router.post('/:id/approve', authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE enrollments 
       SET status = 'active', payment_status = 'paid', updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Enrollment not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    // Atualizar contagem de alunos
    await query(
      'UPDATE courses SET students_count = students_count + 1 WHERE id = $1',
      [result.rows[0].course_id]
    );

    res.json({
      data: result.rows[0],
      message: 'Enrollment approved'
    });
  } catch (error) {
    next(error);
  }
});

// POST /enrollments/:id/reject (Admin)
router.post('/:id/reject', authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE enrollments SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Enrollment not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({
      data: result.rows[0],
      message: 'Enrollment rejected'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /enrollments/:id/payment (Admin)
router.patch('/:id/payment', authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const result = await query(
      `UPDATE enrollments SET payment_status = $1 WHERE id = $2 RETURNING *`,
      [paymentStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Enrollment not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({
      data: result.rows[0],
      message: 'Payment status updated'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
