import { defineStore } from 'pinia';
import { apiClient } from '../api/client';
import type { NodeType, NodeTypeCreate, NodeTypeUpdate } from '../types';

export const useNodeTypesStore = defineStore('nodeTypes', {
  state: () => ({
    nodeTypes: [] as NodeType[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    byCategory: (state) => (category: string) =>
      state.nodeTypes.filter((n) => n.category === category),

    byId: (state) => (id: string) =>
      state.nodeTypes.find((n) => n.id === id) ?? null,
  },

  actions: {
    async fetchNodeTypes(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get<{ items: NodeType[]; total: number }>(
          '/api/v1/library/node-types'
        );
        this.nodeTypes = response.items;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to fetch node types';
      } finally {
        this.loading = false;
      }
    },

    async fetchNodeTypeById(id: string): Promise<NodeType> {
      const cached = this.nodeTypes.find((n) => n.id === id);
      if (cached) return cached;
      return apiClient.get<NodeType>(`/api/v1/library/node-types/${id}`);
    },

    async createNodeType(data: NodeTypeCreate): Promise<NodeType> {
      this.loading = true;
      this.error = null;
      try {
        const nt = await apiClient.post<NodeType>('/api/v1/library/node-types', data);
        this.nodeTypes.push(nt);
        return nt;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to create node type';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateNodeType(id: string, data: NodeTypeUpdate): Promise<NodeType> {
      this.loading = true;
      this.error = null;
      try {
        const updated = await apiClient.patch<NodeType>(`/api/v1/library/node-types/${id}`, data);
        const idx = this.nodeTypes.findIndex((n) => n.id === id);
        if (idx !== -1) this.nodeTypes[idx] = updated;
        return updated;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to update node type';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteNodeType(id: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete<void>(`/api/v1/library/node-types/${id}`);
        this.nodeTypes = this.nodeTypes.filter((n) => n.id !== id);
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to delete node type';
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
