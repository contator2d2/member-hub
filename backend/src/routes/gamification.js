const express = require('express');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.use(authenticate);

// GET /gamification/stats
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Stats gerais
    const statsResult = await query(
      'SELECT * FROM user_stats WHERE user_id = $1',
      [userId]
    );

    // Contar cursos
    const coursesResult = await query(
      `SELECT 
         COUNT(*) FILTER (WHERE status != 'cancelled') as total_enrolled,
         COUNT(*) FILTER (WHERE status = 'completed') as completed
       FROM enrollments WHERE user_id = $1`,
      [userId]
    );

    // Contar badges
    const badgesResult = await query(
      'SELECT COUNT(*) as total FROM user_badges WHERE user_id = $1',
      [userId]
    );

    // Contar certificados
    const certsResult = await query(
      'SELECT COUNT(*) as total FROM certificates WHERE user_id = $1',
      [userId]
    );

    const stats = statsResult.rows[0] || {
      total_watch_time: 0,
      current_streak: 0,
      longest_streak: 0,
      points: 0
    };

    res.json({
      data: {
        totalCoursesEnrolled: parseInt(coursesResult.rows[0].total_enrolled) || 0,
        completedCourses: parseInt(coursesResult.rows[0].completed) || 0,
        totalWatchTime: stats.total_watch_time || 0,
        currentStreak: stats.current_streak || 0,
        longestStreak: stats.longest_streak || 0,
        totalBadges: parseInt(badgesResult.rows[0].total) || 0,
        totalCertificates: parseInt(certsResult.rows[0].total) || 0,
        points: stats.points || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /gamification/badges - Todas as badges disponíveis
router.get('/badges', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM badges ORDER BY type, requirement');
    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /gamification/badges/me - Badges do usuário
router.get('/badges/me', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT b.*, ub.earned_at
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC`,
      [req.user.id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /gamification/certificates
router.get('/certificates', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT cert.*, c.title as course_title, c.thumbnail as course_thumbnail
       FROM certificates cert
       JOIN courses c ON cert.course_id = c.id
       WHERE cert.user_id = $1
       ORDER BY cert.issued_at DESC`,
      [req.user.id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// POST /courses/:id/certificate/claim
router.post('/courses/:id/certificate/claim', async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.user.id;

    // Verificar se completou o curso
    const enrollment = await query(
      "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status = 'completed'",
      [userId, courseId]
    );

    if (enrollment.rows.length === 0) {
      return res.status(400).json({
        message: 'Course not completed yet',
        code: 'NOT_COMPLETED',
        statusCode: 400
      });
    }

    // Verificar se já tem certificado
    const existing = await query(
      'SELECT id FROM certificates WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: 'Certificate already claimed',
        code: 'ALREADY_CLAIMED',
        statusCode: 400
      });
    }

    // Gerar número do certificado
    const certificateNumber = `CERT-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

    const result = await query(
      `INSERT INTO certificates (user_id, course_id, certificate_number)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, courseId, certificateNumber]
    );

    res.status(201).json({
      data: result.rows[0],
      message: 'Certificate claimed successfully!'
    });
  } catch (error) {
    next(error);
  }
});

// GET /gamification/leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const result = await query(
      `SELECT u.id, u.name, u.avatar, us.points, us.current_streak,
              (SELECT COUNT(*) FROM certificates WHERE user_id = u.id) as certificates_count
       FROM users u
       JOIN user_stats us ON u.id = us.user_id
       WHERE u.role = 'student'
       ORDER BY us.points DESC
       LIMIT $1`,
      [limit]
    );

    // Adicionar posição
    const leaderboard = result.rows.map((user, index) => ({
      ...user,
      position: index + 1
    }));

    res.json({ data: leaderboard });
  } catch (error) {
    next(error);
  }
});

// POST /gamification/daily-login
router.post('/daily-login', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Atualizar streak
    const result = await query(
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
       points = points + CASE 
         WHEN last_activity_date < CURRENT_DATE THEN 5 
         ELSE 0 
       END,
       last_activity_date = CURRENT_DATE
       WHERE user_id = $1
       RETURNING *`,
      [userId]
    );

    // Verificar badges de streak
    const stats = result.rows[0];
    if (stats) {
      await checkStreakBadges(userId, stats.current_streak);
    }

    res.json({
      data: result.rows[0],
      message: 'Daily login recorded'
    });
  } catch (error) {
    next(error);
  }
});

// Helper: Verificar badges de streak
async function checkStreakBadges(userId, streak) {
  const streakMilestones = [7, 30, 100];
  
  for (const milestone of streakMilestones) {
    if (streak >= milestone) {
      // Buscar badge correspondente
      const badge = await query(
        "SELECT id FROM badges WHERE type = 'streak' AND requirement <= $1",
        [milestone]
      );

      if (badge.rows.length > 0) {
        // Tentar atribuir badge (ignora se já tem)
        await query(
          `INSERT INTO user_badges (user_id, badge_id) 
           VALUES ($1, $2) 
           ON CONFLICT DO NOTHING`,
          [userId, badge.rows[0].id]
        );
      }
    }
  }
}

module.exports = router;
