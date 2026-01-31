import api from './api';
import type {
  Course,
  CourseWithModules,
  CreateCourseData,
  UpdateCourseData,
  PaginatedResponse,
} from '@/types';

export interface CourseFilters {
  search?: string;
  status?: string;
  instructorId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const courseService = {
  // Get all courses with pagination and filters
  async getCourses(filters?: CourseFilters): Promise<PaginatedResponse<Course>> {
    return api.get<PaginatedResponse<Course>>('/courses', filters as Record<string, string | number | boolean | undefined>);
  },

  // Get a single course by ID
  async getCourse(id: string): Promise<Course> {
    const response = await api.get<{ data: Course }>(`/courses/${id}`);
    return response.data;
  },

  // Get course with all modules and lessons
  async getCourseWithModules(id: string): Promise<CourseWithModules> {
    const response = await api.get<{ data: CourseWithModules }>(`/courses/${id}/full`);
    return response.data;
  },

  // Create a new course
  async createCourse(data: CreateCourseData): Promise<Course> {
    const response = await api.post<{ data: Course }>('/courses', data);
    return response.data;
  },

  // Update a course
  async updateCourse({ id, ...data }: UpdateCourseData): Promise<Course> {
    const response = await api.patch<{ data: Course }>(`/courses/${id}`, data);
    return response.data;
  },

  // Delete a course
  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  },

  // Publish a course
  async publishCourse(id: string): Promise<Course> {
    const response = await api.post<{ data: Course }>(`/courses/${id}/publish`);
    return response.data;
  },

  // Archive a course
  async archiveCourse(id: string): Promise<Course> {
    const response = await api.post<{ data: Course }>(`/courses/${id}/archive`);
    return response.data;
  },

  // Upload course thumbnail
  async uploadThumbnail(courseId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('thumbnail', file);
    const response = await api.upload<{ data: { url: string } }>(`/courses/${courseId}/thumbnail`, formData);
    return response.data.url;
  },

  // Get courses for student (enrolled + available)
  async getStudentCourses(): Promise<{ enrolled: Course[]; available: Course[] }> {
    const response = await api.get<{ data: { enrolled: Course[]; available: Course[] } }>('/courses/student');
    return response.data;
  },

  // Get courses for instructor
  async getInstructorCourses(): Promise<Course[]> {
    const response = await api.get<{ data: Course[] }>('/courses/instructor');
    return response.data;
  },
};

export default courseService;
