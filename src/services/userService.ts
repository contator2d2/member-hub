import api from './api';
import type { User, PaginatedResponse } from '@/types';

export interface UserFilters {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export const userService = {
  // Get all users (admin only)
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    return api.get<PaginatedResponse<User>>('/users', filters as Record<string, string | number | boolean | undefined>);
  },

  // Get a single user
  async getUser(id: string): Promise<User> {
    const response = await api.get<{ data: User }>(`/users/${id}`);
    return response.data;
  },

  // Create a new user (admin only)
  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role: string;
  }): Promise<User> {
    const response = await api.post<{ data: User }>('/users', data);
    return response.data;
  },

  // Update a user
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await api.patch<{ data: User }>(`/users/${id}`, data);
    return response.data;
  },

  // Delete a user
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // Upload user avatar
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.upload<{ data: { url: string } }>('/users/avatar', formData);
    return response.data.url;
  },

  // Get instructors list
  async getInstructors(): Promise<User[]> {
    const response = await api.get<{ data: User[] }>('/users/instructors');
    return response.data;
  },

  // Get students list
  async getStudents(): Promise<User[]> {
    const response = await api.get<{ data: User[] }>('/users/students');
    return response.data;
  },
};

export default userService;
