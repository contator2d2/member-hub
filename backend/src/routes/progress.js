const express = require('express');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// GET /courses/:id/progress - Progresso do usuário no curso
router.get('/courses/:id/progress', async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.user.id;

    // Verificar matrícula
    const enrollment = await query(
      "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status = 'active'",
      [userId, courseId]
    );

    if (enrollment.rows.length === 0) {
      return res.status(403).json({
        message: 'Not enrolled in this course',
        code: 'NOT_ENROLLED',
        statusCode: 403
      });
    }

    // Contar total de aulas
    const totalResult = await query(
      `SELECT COUNT(*) as total 
       FROM lessons l 
       JOIN modules m ON l.module_id = m.id 
       WHERE m.course_id = $1`,
      [courseId]
    );
    const totalLessons = parseInt(totalResult.rows[0].total);

    // Contar aulas completadas
    const completedResult = await query(
      `SELECT COUNT(*) as completed 
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       WHERE lp.user_id = $1 AND m.course_id = $2 AND lp.completed = true`,
      [userId, courseId]
    );
    const completedLessons = parseInt(completedResult.rows[0].completed);

    // Buscar progresso de cada aula
    const lessonsProgress = await query(
      `SELECT lp.*, l.title as lesson_title, l.duration as lesson_duration
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       WHERE lp.user_id = $1 AND m.course_id = $2`,
      [userId, courseId]
    );

    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Atualizar progresso na matrícula
    await query(
      'UPDATE enrollments SET progress = $1 WHERE user_id = $2 AND course_id = $3',
      [progressPercent, userId, courseId]
    );

    res.json({
      data: {
        courseId,
        totalLessons,
        completedLessons,
        progressPercent,
        enrolledAt: enrollment.rows[0].enrolled_at,
        lessonsProgress: lessonsProgress.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /lessons/:id/progress - Atualizar tempo assistido
router.post('/lessons/:id/progress', async (req, res, next) => {
  try {
    const { id: lessonId } = req.params;
    const { watchedSeconds } = req.body;
    const userId = req.user.id;

    // Verificar se usuário tem acesso à aula
    const access = await query(
      `SELECT e.id, e.enrolled_at, l.drip_type, l.drip_days, l.drip_date
       FROM enrollments e
       JOIN modules m ON e.course_id = m.course_id
       JOIN lessons l ON l.module_id = m.id
       WHERE e.user_id = $1 AND l.id = $2 AND e.status = 'active'`,
      [userId, lessonId]
    );

    if (access.rows.length === 0) {
      return res.status(403).json({
        message: 'No access to this lesson',
        code: 'NO_ACCESS',
        statusCode: 403
      });
    }

    // Verificar drip content
    const lesson = access.rows[0];
    if (!isLessonUnlocked(lesson)) {
      return res.status(403).json({
        message: 'Lesson not yet available',
        code: 'LESSON_LOCKED',
        statusCode: 403
      });
    }

    // Upsert progresso
    const result = await query(
      `INSERT INTO lesson_progress (user_id, lesson_id, watched_seconds)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, lesson_id) 
       DO UPDATE SET watched_seconds = GREATEST(lesson_progress.watched_seconds, $3)
       RETURNING *`,
      [userId, lessonId, watchedSeconds]
    );

    // Atualizar tempo total assistido
    await query(
      `UPDATE user_stats 
       SET total_watch_time = total_watch_time + $1,
           points = points + 1,
           last_activity_date = CURRENT_DATE
       WHERE user_id = $2`,
      [Math.floor(watchedSeconds / 60), userId]
    );

    res.json({
      data: result.rows[0],
      message: 'Progress updated'
    });
  } catch (error) {
    next(error);
  }
});

// POST /lessons/:id/complete - Marcar aula como concluída
router.post('/lessons/:id/complete', async (req, res, next) => {
  try {
    const { id: lessonId } = req.params;
    const userId = req.user.id;

    // Verificar acesso
    const access = await query(
      `SELECT e.id, m.course_id
       FROM enrollments e
       JOIN modules m ON e.course_id = m.course_id
       JOIN lessons l ON l.module_id = m.id
       WHERE e.user_id = $1 AND l.id = $2 AND e.status = 'active'`,
      [userId, lessonId]
    );

    if (access.rows.length === 0) {
      return res.status(403).json({
        message: 'No access to this lesson',
        code: 'NO_ACCESS',
        statusCode: 403
      });
    }

    const courseId = access.rows[0].course_id;

    // Marcar como completa
    const result = await query(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at)
       VALUES ($1, $2, true, NOW())
       ON CONFLICT (user_id, lesson_id) 
       DO UPDATE SET completed = true, completed_at = NOW()
       RETURNING *`,
      [userId, lessonId]
    );

    // Atualizar pontos
    await query(
      `UPDATE user_stats 
       SET points = points + 10,
           last_activity_date = CURRENT_DATE
       WHERE user_id = $1`,
      [userId]
    );

    // Verificar se completou o curso
    const totalLessons = await query(
      `SELECT COUNT(*) as total FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = $1`,
      [courseId]
    );
    
    const completedLessons = await query(
      `SELECT COUNT(*) as completed 
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       WHERE lp.user_id = $1 AND m.course_id = $2 AND lp.completed = true`,
      [userId, courseId]
    );

    const courseCompleted = parseInt(completedLessons.rows[0].completed) >= parseInt(totalLessons.rows[0].total);

    if (courseCompleted) {
      await query(
        `UPDATE enrollments SET status = 'completed', completed_at = NOW() WHERE user_id = $1 AND course_id = $2`,
        [userId, courseId]
      );

      // Bonus de pontos por completar curso
      await query(
        'UPDATE user_stats SET points = points + 100 WHERE user_id = $1',
        [userId]
      );
    }

    res.json({
      data: result.rows[0],
      courseCompleted,
      message: courseCompleted ? 'Course completed! Congratulations!' : 'Lesson completed'
    });
  } catch (error) {
    next(error);
  }
});

// POST /lessons/:id/quiz/submit - Enviar respostas do quiz
router.post('/lessons/:id/quiz/submit', async (req, res, next) => {
  try {
    const { id: lessonId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    // Buscar aula e verificar se é quiz
    const lessonResult = await query(
      "SELECT * FROM lessons WHERE id = $1 AND type = 'quiz'",
      [lessonId]
    );

    if (lessonResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Quiz not found',
        code: 'NOT_FOUND',
        statusCode: 404
      });
    }

    const lesson = lessonResult.rows[0];
    const quizContent = lesson.content;

    // Calcular pontuação
    let correctAnswers = 0;
    const totalQuestions = quizContent.questions?.length || 0;

    if (quizContent.questions && answers) {
      quizContent.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });
    }

    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const passed = score >= 70; // 70% para passar

    // Salvar resultado
    await query(
      `INSERT INTO lesson_progress (user_id, lesson_id, quiz_score, completed, completed_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, lesson_id) 
       DO UPDATE SET quiz_score = $3, completed = $4, completed_at = NOW()`,
      [userId, lessonId, score, passed]
    );

    res.json({
      data: {
        score,
        correctAnswers,
        totalQuestions,
        passed
      },
      message: passed ? 'Quiz passed!' : 'Quiz not passed. Try again!'
    });
  } catch (error) {
    next(error);
  }
});

// Helper: Verificar se aula está liberada
function isLessonUnlocked(lesson) {
  if (lesson.drip_type === 'immediate') return true;

  const now = new Date();
  const enrolledAt = new Date(lesson.enrolled_at);

  if (lesson.drip_type === 'days_after_enrollment') {
    const unlockDate = new Date(enrolledAt);
    unlockDate.setDate(unlockDate.getDate() + lesson.drip_days);
    return now >= unlockDate;
  }

  if (lesson.drip_type === 'fixed_date' && lesson.drip_date) {
    return now >= new Date(lesson.drip_date);
  }

  return false;
}

module.exports = router;
