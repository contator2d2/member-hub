import api from './api';
import type { Lesson, CreateLessonData, UpdateLessonData } from '@/types';

export const lessonService = {
  // Get all lessons for a module
  async getLessons(moduleId: string): Promise<Lesson[]> {
    const response = await api.get<{ data: Lesson[] }>(`/modules/${moduleId}/lessons`);
    return response.data;
  },

  // Get a single lesson
  async getLesson(id: string): Promise<Lesson> {
    const response = await api.get<{ data: Lesson }>(`/lessons/${id}`);
    return response.data;
  },

  // Create a new lesson
  async createLesson(data: CreateLessonData): Promise<Lesson> {
    const response = await api.post<{ data: Lesson }>(`/modules/${data.moduleId}/lessons`, data);
    return response.data;
  },

  // Update a lesson
  async updateLesson({ id, ...data }: UpdateLessonData): Promise<Lesson> {
    const response = await api.patch<{ data: Lesson }>(`/lessons/${id}`, data);
    return response.data;
  },

  // Delete a lesson
  async deleteLesson(id: string): Promise<void> {
    await api.delete(`/lessons/${id}`);
  },

  // Reorder lessons within a module
  async reorderLessons(moduleId: string, lessonIds: string[]): Promise<void> {
    await api.post(`/modules/${moduleId}/lessons/reorder`, { lessonIds });
  },

  // Upload video for a lesson
  async uploadVideo(lessonId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('video', file);

    // For progress tracking, we need XMLHttpRequest
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${import.meta.env.VITE_API_URL}/lessons/${lessonId}/video`);
        
        const token = localStorage.getItem('auth_token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.data.url);
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
      });
    }

    const response = await api.upload<{ data: { url: string } }>(`/lessons/${lessonId}/video`, formData);
    return response.data.url;
  },

  // Upload attachment for a lesson
  async uploadAttachment(lessonId: string, file: File): Promise<{ id: string; url: string; name: string }> {
    const formData = new FormData();
    formData.append('attachment', file);
    const response = await api.upload<{ data: { id: string; url: string; name: string } }>(
      `/lessons/${lessonId}/attachments`,
      formData
    );
    return response.data;
  },

  // Delete attachment
  async deleteAttachment(lessonId: string, attachmentId: string): Promise<void> {
    await api.delete(`/lessons/${lessonId}/attachments/${attachmentId}`);
  },
};

export default lessonService;
