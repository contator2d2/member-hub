const express = require('express');
const { query, transaction } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

const router = express.Router();

// GET /courses - Lista cursos públicos ou filtrados
router.get('/', async (req, res, next) => {
  try {
    const { search, status, instructorId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (instructorId) {
      whereClause += ` AND c.instructor_id = $${paramIndex}`;
      params.push(instructorId);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM courses c ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT c.*, u.name as instructor_name, u.avatar as instructor_avatar,
              (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as modules_count,
              (SELECT COUNT(*) FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = c.id) as lessons_count
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       ${whereClause}
       ORDER BY c.created_at DESC
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

// GET /courses/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT c.*, u.name as instructor_name, u.avatar as instructor_avatar
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// GET /courses/:id/full - Curso com módulos e aulas
router.get('/:id/full', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Buscar curso
    const courseResult = await query(
      `SELECT c.*, u.name as instructor_name, u.avatar as instructor_avatar
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    const course = courseResult.rows[0];

    // Buscar módulos com aulas
    const modulesResult = await query(
      `SELECT m.*, 
              json_agg(
                json_build_object(
                  'id', l.id,
                  'title', l.title,
                  'type', l.type,
                  'duration', l.duration,
                  'order', l."order",
                  'isFree', l.is_free,
                  'dripType', l.drip_type,
                  'dripDays', l.drip_days,
                  'dripDate', l.drip_date
                ) ORDER BY l."order"
              ) FILTER (WHERE l.id IS NOT NULL) as lessons
       FROM modules m
       LEFT JOIN lessons l ON l.module_id = m.id
       WHERE m.course_id = $1
       GROUP BY m.id
       ORDER BY m."order"`,
      [id]
    );

    course.modules = modulesResult.rows.map(m => ({
      ...m,
      lessons: m.lessons || []
    }));

    res.json({ data: course });
  } catch (error) {
    next(error);
  }
});

// POST /courses (Admin)
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { title, description, instructorId, price = 0, status = 'draft', originalPrice } = req.body;

    const result = await query(
      `INSERT INTO courses (title, description, instructor_id, price, original_price, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, instructorId, price, originalPrice, status]
    );

    res.status(201).json({
      data: result.rows[0],
      message: 'Course created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /courses/:id (Admin)
router.patch('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, instructorId, price, originalPrice, status } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (instructorId !== undefined) {
      updates.push(`instructor_id = $${paramIndex++}`);
      values.push(instructorId);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramIndex++}`);
      values.push(price);
    }
    if (originalPrice !== undefined) {
      updates.push(`original_price = $${paramIndex++}`);
      values.push(originalPrice);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
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
      `UPDATE courses SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({
      data: result.rows[0],
      message: 'Course updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /courses/:id (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM courses WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /courses/:id/publish (Admin)
router.post('/:id/publish', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE courses SET status = 'published', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({
      data: result.rows[0],
      message: 'Course published successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /courses/:id/archive (Admin)
router.post('/:id/archive', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE courses SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({
      data: result.rows[0],
      message: 'Course archived successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /courses/:id/thumbnail (Admin)
router.post('/:id/thumbnail', authenticate, authorize('admin'), uploadImage.single('thumbnail'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded',
        code: 'NO_FILE',
        statusCode: 400
      });
    }

    const thumbnailUrl = `/uploads/${req.file.filename}`;

    const result = await query(
      `UPDATE courses SET thumbnail = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [thumbnailUrl, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({
      data: result.rows[0],
      message: 'Thumbnail uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
