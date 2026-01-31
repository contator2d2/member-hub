import api from './api';
import type { CourseProgress, LessonProgress } from '@/types';

export const progressService = {
  // Get progress for a course
  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    const response = await api.get<{ data: CourseProgress }>(`/courses/${courseId}/progress`);
    return response.data;
  },

  // Get progress for a specific lesson
  async getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
    try {
      const response = await api.get<{ data: LessonProgress }>(`/lessons/${lessonId}/progress`);
      return response.data;
    } catch {
      return null;
    }
  },

  // Update lesson progress (watch time)
  async updateWatchProgress(lessonId: string, watchedSeconds: number): Promise<LessonProgress> {
    const response = await api.post<{ data: LessonProgress }>(`/lessons/${lessonId}/progress`, {
      watchedSeconds,
    });
    return response.data;
  },

  // Mark lesson as completed
  async completeLesson(lessonId: string): Promise<LessonProgress> {
    const response = await api.post<{ data: LessonProgress }>(`/lessons/${lessonId}/complete`);
    return response.data;
  },

  // Submit quiz answers
  async submitQuiz(lessonId: string, answers: number[]): Promise<{ score: number; passed: boolean }> {
    const response = await api.post<{ data: { score: number; passed: boolean } }>(`/lessons/${lessonId}/quiz/submit`, {
      answers,
    });
    return response.data;
  },

  // Get all progress for current user
  async getAllProgress(): Promise<CourseProgress[]> {
    const response = await api.get<{ data: CourseProgress[] }>('/progress');
    return response.data;
  },

  // Reset progress for a course (useful for retaking)
  async resetCourseProgress(courseId: string): Promise<void> {
    await api.delete(`/courses/${courseId}/progress`);
  },
};

export default progressService;
