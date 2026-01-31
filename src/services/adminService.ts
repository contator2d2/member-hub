import api from './api';
import type { DashboardStats, RecentActivity } from '@/types';

export const adminService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<{ data: DashboardStats }>('/admin/dashboard/stats');
    return response.data;
  },

  // Get recent activity
  async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    const response = await api.get<{ data: RecentActivity[] }>('/admin/dashboard/activity', { limit });
    return response.data;
  },

  // Get revenue data for charts
  async getRevenueData(period: 'week' | 'month' | 'year'): Promise<{ date: string; revenue: number }[]> {
    const response = await api.get<{ data: { date: string; revenue: number }[] }>('/admin/analytics/revenue', {
      period,
    });
    return response.data;
  },

  // Get enrollment data for charts
  async getEnrollmentData(period: 'week' | 'month' | 'year'): Promise<{ date: string; enrollments: number }[]> {
    const response = await api.get<{ data: { date: string; enrollments: number }[] }>('/admin/analytics/enrollments', {
      period,
    });
    return response.data;
  },

  // Export data
  async exportData(type: 'users' | 'courses' | 'enrollments' | 'revenue', format: 'csv' | 'xlsx'): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/export/${type}?format=${format}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    return response.blob();
  },
};

export default adminService;
