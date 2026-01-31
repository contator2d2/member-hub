import api from './api';
import type { Enrollment, PaginatedResponse } from '@/types';

export interface EnrollmentFilters {
  userId?: string;
  courseId?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

export const enrollmentService = {
  // Get all enrollments (admin)
  async getEnrollments(filters?: EnrollmentFilters): Promise<PaginatedResponse<Enrollment>> {
    return api.get<PaginatedResponse<Enrollment>>('/enrollments', filters as Record<string, string | number | boolean | undefined>);
  },

  // Get a single enrollment
  async getEnrollment(id: string): Promise<Enrollment> {
    const response = await api.get<{ data: Enrollment }>(`/enrollments/${id}`);
    return response.data;
  },

  // Get user's enrollments
  async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await api.get<{ data: Enrollment[] }>('/enrollments/me');
    return response.data;
  },

  // Create enrollment (admin manual enrollment)
  async createEnrollment(userId: string, courseId: string): Promise<Enrollment> {
    const response = await api.post<{ data: Enrollment }>('/enrollments', { userId, courseId });
    return response.data;
  },

  // Request enrollment (student)
  async requestEnrollment(courseId: string): Promise<Enrollment> {
    const response = await api.post<{ data: Enrollment }>(`/courses/${courseId}/enroll`);
    return response.data;
  },

  // Approve enrollment (admin)
  async approveEnrollment(id: string): Promise<Enrollment> {
    const response = await api.post<{ data: Enrollment }>(`/enrollments/${id}/approve`);
    return response.data;
  },

  // Reject enrollment (admin)
  async rejectEnrollment(id: string, reason?: string): Promise<Enrollment> {
    const response = await api.post<{ data: Enrollment }>(`/enrollments/${id}/reject`, { reason });
    return response.data;
  },

  // Cancel enrollment
  async cancelEnrollment(id: string): Promise<void> {
    await api.delete(`/enrollments/${id}`);
  },

  // Update payment status (admin)
  async updatePaymentStatus(id: string, paymentStatus: 'pending' | 'paid' | 'refunded'): Promise<Enrollment> {
    const response = await api.patch<{ data: Enrollment }>(`/enrollments/${id}/payment`, { paymentStatus });
    return response.data;
  },

  // Check if user is enrolled in a course
  async checkEnrollment(courseId: string): Promise<Enrollment | null> {
    try {
      const response = await api.get<{ data: Enrollment }>(`/courses/${courseId}/enrollment`);
      return response.data;
    } catch {
      return null;
    }
  },
};

export default enrollmentService;
