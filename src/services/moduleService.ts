import api from './api';
import type { Module, CreateModuleData, UpdateModuleData } from '@/types';

export const moduleService = {
  // Get all modules for a course
  async getModules(courseId: string): Promise<Module[]> {
    const response = await api.get<{ data: Module[] }>(`/courses/${courseId}/modules`);
    return response.data;
  },

  // Get a single module
  async getModule(id: string): Promise<Module> {
    const response = await api.get<{ data: Module }>(`/modules/${id}`);
    return response.data;
  },

  // Create a new module
  async createModule(data: CreateModuleData): Promise<Module> {
    const response = await api.post<{ data: Module }>(`/courses/${data.courseId}/modules`, data);
    return response.data;
  },

  // Update a module
  async updateModule({ id, ...data }: UpdateModuleData): Promise<Module> {
    const response = await api.patch<{ data: Module }>(`/modules/${id}`, data);
    return response.data;
  },

  // Delete a module
  async deleteModule(id: string): Promise<void> {
    await api.delete(`/modules/${id}`);
  },

  // Reorder modules
  async reorderModules(courseId: string, moduleIds: string[]): Promise<void> {
    await api.post(`/courses/${courseId}/modules/reorder`, { moduleIds });
  },
};

export default moduleService;
