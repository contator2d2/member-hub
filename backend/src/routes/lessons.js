const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadVideo } = require('../middleware/upload');

const router = express.Router();

// GET /modules/:moduleId/lessons
router.get('/modules/:moduleId/lessons', async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const result = await query(
      `SELECT * FROM lessons WHERE module_id = $1 ORDER BY "order"`,
      [moduleId]
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /lessons/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT l.*, m.course_id, m.title as module_title
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Lesson not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// POST /modules/:moduleId/lessons (Admin)
router.post('/modules/:moduleId/lessons', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { 
      title, 
      description, 
      type = 'video', 
      content, 
      duration = 0,
      isFree = false,
      dripType = 'immediate',
      dripDays,
      dripDate
    } = req.body;

    // Pegar próximo order
    const orderResult = await query(
      'SELECT COALESCE(MAX("order"), 0) + 1 as next_order FROM lessons WHERE module_id = $1',
      [moduleId]
    );
    const order = orderResult.rows[0].next_order;

    const result = await query(
      `INSERT INTO lessons (module_id, title, description, type, content, duration, is_free, drip_type, drip_days, drip_date, "order")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [moduleId, title, description, type, JSON.stringify(content), duration, isFree, dripType, dripDays, dripDate, order]
    );

    // Atualizar duração total do curso
    await updateCourseDuration(moduleId);

    res.status(201).json({
      data: result.rows[0],
      message: 'Lesson created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /lessons/:id (Admin)
router.patch('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, type, content, duration, isFree, dripType, dripDays, dripDate, order } = req.body;

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
    if (type !== undefined) {
      updates.push(`type = $${paramIndex++}`);
      values.push(type);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(JSON.stringify(content));
    }
    if (duration !== undefined) {
      updates.push(`duration = $${paramIndex++}`);
      values.push(duration);
    }
    if (isFree !== undefined) {
      updates.push(`is_free = $${paramIndex++}`);
      values.push(isFree);
    }
    if (dripType !== undefined) {
      updates.push(`drip_type = $${paramIndex++}`);
      values.push(dripType);
    }
    if (dripDays !== undefined) {
      updates.push(`drip_days = $${paramIndex++}`);
      values.push(dripDays);
    }
    if (dripDate !== undefined) {
      updates.push(`drip_date = $${paramIndex++}`);
      values.push(dripDate);
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
      `UPDATE lessons SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Lesson not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    // Atualizar duração do curso
    const lesson = result.rows[0];
    await updateCourseDuration(lesson.module_id);

    res.json({
      data: lesson,
      message: 'Lesson updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /lessons/:id (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Pegar module_id antes de deletar
    const lessonResult = await query('SELECT module_id FROM lessons WHERE id = $1', [id]);
    
    if (lessonResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Lesson not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    const moduleId = lessonResult.rows[0].module_id;

    await query('DELETE FROM lessons WHERE id = $1', [id]);

    // Atualizar duração do curso
    await updateCourseDuration(moduleId);

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /lessons/:id/video (Admin) - Upload de vídeo
router.post('/:id/video', authenticate, authorize('admin'), uploadVideo.single('video'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: 'No video uploaded',
        code: 'NO_FILE',
        statusCode: 400
      });
    }

    const videoUrl = `/uploads/${req.file.filename}`;
    const content = {
      provider: 'upload',
      url: videoUrl
    };

    const result = await query(
      `UPDATE lessons SET content = $1, type = 'video', updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(content), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Lesson not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({
      data: result.rows[0],
      message: 'Video uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Helper: Atualizar duração total do curso
async function updateCourseDuration(moduleId) {
  try {
    await query(
      `UPDATE courses 
       SET duration = (
         SELECT COALESCE(SUM(l.duration), 0) 
         FROM lessons l 
         JOIN modules m ON l.module_id = m.id 
         WHERE m.course_id = courses.id
       ),
       updated_at = NOW()
       WHERE id = (SELECT course_id FROM modules WHERE id = $1)`,
      [moduleId]
    );
  } catch (error) {
    console.error('Error updating course duration:', error);
  }
}

module.exports = router;
