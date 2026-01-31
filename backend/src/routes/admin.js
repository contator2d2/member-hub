const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem admin
router.use(authenticate, authorize('admin'));

// GET /admin/dashboard/stats
router.get('/dashboard/stats', async (req, res, next) => {
  try {
    // Usuários
    const usersResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE role = 'student') as students,
        COUNT(*) FILTER (WHERE role = 'instructor') as instructors,
        COUNT(*) FILTER (WHERE role = 'admin') as admins
      FROM users
    `);

    // Cursos
    const coursesResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE status = 'archived') as archived
      FROM courses
    `);

    // Matrículas
    const enrollmentsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
      FROM enrollments
    `);

    // Receita (cursos pagos)
    const revenueResult = await query(`
      SELECT 
        COALESCE(SUM(c.price), 0) as total_revenue
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.payment_status = 'paid'
    `);

    // Receita do mês
    const monthlyRevenueResult = await query(`
      SELECT 
        COALESCE(SUM(c.price), 0) as monthly_revenue
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.payment_status = 'paid'
        AND e.enrolled_at >= date_trunc('month', CURRENT_DATE)
    `);

    const users = usersResult.rows[0];
    const courses = coursesResult.rows[0];
    const enrollments = enrollmentsResult.rows[0];

    res.json({
      data: {
        totalUsers: parseInt(users.total),
        totalStudents: parseInt(users.students),
        totalInstructors: parseInt(users.instructors),
        totalAdmins: parseInt(users.admins),
        totalCourses: parseInt(courses.total),
        publishedCourses: parseInt(courses.published),
        draftCourses: parseInt(courses.draft),
        archivedCourses: parseInt(courses.archived),
        totalEnrollments: parseInt(enrollments.total),
        activeEnrollments: parseInt(enrollments.active),
        pendingEnrollments: parseInt(enrollments.pending),
        completedEnrollments: parseInt(enrollments.completed),
        totalRevenue: parseFloat(revenueResult.rows[0].total_revenue) || 0,
        monthlyRevenue: parseFloat(monthlyRevenueResult.rows[0].monthly_revenue) || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /admin/dashboard/activity
router.get('/dashboard/activity', async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    // Últimas matrículas
    const enrollments = await query(
      `SELECT e.*, u.name as user_name, c.title as course_title
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       JOIN courses c ON e.course_id = c.id
       ORDER BY e.enrolled_at DESC
       LIMIT $1`,
      [limit]
    );

    // Últimos usuários registrados
    const users = await query(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    // Últimos cursos criados
    const courses = await query(
      `SELECT c.*, u.name as instructor_name
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       ORDER BY c.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      data: {
        recentEnrollments: enrollments.rows,
        recentUsers: users.rows,
        recentCourses: courses.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /admin/analytics/revenue
router.get('/analytics/revenue', async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    let interval = '30 days';
    let groupBy = 'day';
    
    if (period === '7d') {
      interval = '7 days';
    } else if (period === '90d') {
      interval = '90 days';
      groupBy = 'week';
    } else if (period === '1y') {
      interval = '1 year';
      groupBy = 'month';
    }

    const result = await query(`
      SELECT 
        date_trunc($1, e.enrolled_at)::date as date,
        COALESCE(SUM(c.price), 0) as revenue,
        COUNT(*) as enrollments
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.enrolled_at >= CURRENT_DATE - $2::interval
        AND e.payment_status = 'paid'
      GROUP BY date_trunc($1, e.enrolled_at)
      ORDER BY date
    `, [groupBy, interval]);

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /admin/analytics/enrollments
router.get('/analytics/enrollments', async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    let interval = '30 days';
    
    if (period === '7d') {
      interval = '7 days';
    } else if (period === '90d') {
      interval = '90 days';
    } else if (period === '1y') {
      interval = '1 year';
    }

    const result = await query(`
      SELECT 
        date_trunc('day', enrolled_at)::date as date,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'pending') as pending
      FROM enrollments
      WHERE enrolled_at >= CURRENT_DATE - $1::interval
      GROUP BY date_trunc('day', enrolled_at)
      ORDER BY date
    `, [interval]);

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /admin/analytics/courses
router.get('/analytics/courses', async (req, res, next) => {
  try {
    // Top cursos por matrículas
    const topCourses = await query(`
      SELECT c.id, c.title, c.thumbnail, c.price,
             COUNT(e.id) as enrollments_count,
             COUNT(e.id) FILTER (WHERE e.status = 'completed') as completed_count,
             COALESCE(SUM(c.price) FILTER (WHERE e.payment_status = 'paid'), 0) as revenue
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id
      ORDER BY enrollments_count DESC
      LIMIT 10
    `);

    // Distribuição por status
    const statusDist = await query(`
      SELECT status, COUNT(*) as count
      FROM courses
      GROUP BY status
    `);

    res.json({
      data: {
        topCourses: topCourses.rows,
        statusDistribution: statusDist.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
