import api from './api';
import type { Badge, UserBadge, Certificate, UserStats } from '@/types';

export const gamificationService = {
  // Get user stats
  async getUserStats(): Promise<UserStats> {
    const response = await api.get<{ data: UserStats }>('/gamification/stats');
    return response.data;
  },

  // Get all available badges
  async getAllBadges(): Promise<Badge[]> {
    const response = await api.get<{ data: Badge[] }>('/gamification/badges');
    return response.data;
  },

  // Get user's earned badges
  async getUserBadges(): Promise<UserBadge[]> {
    const response = await api.get<{ data: UserBadge[] }>('/gamification/badges/me');
    return response.data;
  },

  // Get user's certificates
  async getUserCertificates(): Promise<Certificate[]> {
    const response = await api.get<{ data: Certificate[] }>('/gamification/certificates');
    return response.data;
  },

  // Get certificate for a specific course
  async getCourseCertificate(courseId: string): Promise<Certificate | null> {
    try {
      const response = await api.get<{ data: Certificate }>(`/courses/${courseId}/certificate`);
      return response.data;
    } catch {
      return null;
    }
  },

  // Generate/claim certificate for completed course
  async claimCertificate(courseId: string): Promise<Certificate> {
    const response = await api.post<{ data: Certificate }>(`/courses/${courseId}/certificate/claim`);
    return response.data;
  },

  // Download certificate PDF
  async downloadCertificate(certificateId: string): Promise<Blob> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/gamification/certificates/${certificateId}/download`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    );
    return response.blob();
  },

  // Get leaderboard
  async getLeaderboard(limit = 10): Promise<{ userId: string; name: string; points: number; rank: number }[]> {
    const response = await api.get<{ data: { userId: string; name: string; points: number; rank: number }[] }>(
      '/gamification/leaderboard',
      { limit }
    );
    return response.data;
  },

  // Record daily login (for streak tracking)
  async recordDailyLogin(): Promise<{ streak: number; isNewDay: boolean }> {
    const response = await api.post<{ data: { streak: number; isNewDay: boolean } }>('/gamification/daily-login');
    return response.data;
  },
};

export default gamificationService;
