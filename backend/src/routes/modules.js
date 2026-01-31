const express = require('express');
const { query, transaction } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /courses/:courseId/modules
router.get('/courses/:courseId/modules', async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      `SELECT m.*, 
              (SELECT COUNT(*) FROM lessons WHERE module_id = m.id) as lessons_count,
              (SELECT COALESCE(SUM(duration), 0) FROM lessons WHERE module_id = m.id) as total_duration
       FROM modules m
       WHERE m.course_id = $1
       ORDER BY m."order"`,
      [courseId]
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// POST /courses/:courseId/modules (Admin)
router.post('/courses/:courseId/modules', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    // Pegar próximo order
    const orderResult = await query(
      'SELECT COALESCE(MAX("order"), 0) + 1 as next_order FROM modules WHERE course_id = $1',
      [courseId]
    );
    const order = orderResult.rows[0].next_order;

    const result = await query(
      `INSERT INTO modules (course_id, title, description, "order")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [courseId, title, description, order]
    );

    res.status(201).json({
      data: result.rows[0],
      message: 'Module created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /modules/:id (Admin)
router.patch('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;

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
    if (order !== undefined) {
      updates.push(`"order" = $${paramIndex++}`);
      values.push(order);
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
      `UPDATE modules SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Module not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({
      data: result.rows[0],
      message: 'Module updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /modules/:id (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM modules WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Module not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /courses/:courseId/modules/reorder (Admin)
router.post('/courses/:courseId/modules/reorder', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { moduleIds } = req.body; // Array de IDs na nova ordem

    if (!Array.isArray(moduleIds)) {
      return res.status(400).json({
        message: 'moduleIds must be an array',
        code: 'INVALID_INPUT',
        statusCode: 400
      });
    }

    await transaction(async (client) => {
      for (let i = 0; i < moduleIds.length; i++) {
        await client.query(
          'UPDATE modules SET "order" = $1 WHERE id = $2 AND course_id = $3',
          [i, moduleIds[i], courseId]
        );
      }
    });

    res.json({ message: 'Modules reordered successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
