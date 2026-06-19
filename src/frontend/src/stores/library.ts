import { defineStore } from 'pinia';
import { apiClient } from '../api/client';
import type { Flow, FlowCreate, FlowUpdate } from '../types';

export const useLibraryStore = defineStore('library', {
  state: () => ({
    flows: [] as Flow[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchFlows(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get<{ items: Flow[]; total: number }>('/api/v1/library/flows');
        this.flows = response.items;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to fetch flows';
      } finally {
        this.loading = false;
      }
    },

    async fetchFlowById(id: string): Promise<Flow> {
      const cached = this.flows.find((f) => f.id === id);
      if (cached) return cached;
      return apiClient.get<Flow>(`/api/v1/library/flows/${id}`);
    },

    async createFlow(data: FlowCreate): Promise<Flow> {
      this.loading = true;
      this.error = null;
      try {
        const flow = await apiClient.post<Flow>('/api/v1/library/flows', data);
        this.flows.push(flow);
        return flow;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to create flow';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateFlow(id: string, data: FlowUpdate): Promise<Flow> {
      this.loading = true;
      this.error = null;
      try {
        const updated = await apiClient.patch<Flow>(`/api/v1/library/flows/${id}`, data);
        const idx = this.flows.findIndex((f) => f.id === id);
        if (idx !== -1) this.flows[idx] = updated;
        return updated;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to update flow';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteFlow(id: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete<void>(`/api/v1/library/flows/${id}`);
        this.flows = this.flows.filter((f) => f.id !== id);
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to delete flow';
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
