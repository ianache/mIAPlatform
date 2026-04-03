import { defineStore } from 'pinia';
import { apiClient } from '../api/client';
import type { Agent, AgentCreate, ApiResponse } from '../types';

export const useAgentStore = defineStore('agents', {
  state: () => ({
    agents: [] as Agent[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAgents(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get<ApiResponse<Agent[]>>('/api/v1/agents');
        this.agents = response.data;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to fetch agents';
      } finally {
        this.loading = false;
      }
    },

    async createAgent(data: AgentCreate): Promise<Agent> {
      this.loading = true;
      this.error = null;
      try {
        const agent = await apiClient.post<Agent>('/api/v1/agents', data);
        this.agents.push(agent);
        return agent;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to create agent';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateAgent(id: string, data: Partial<AgentCreate>): Promise<Agent> {
      this.loading = true;
      this.error = null;
      try {
        const updated = await apiClient.patch<Agent>(`/api/v1/agents/${id}`, data);
        const idx = this.agents.findIndex((a) => a.id === id);
        if (idx !== -1) this.agents[idx] = updated;
        return updated;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to update agent';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteAgent(id: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete<void>(`/api/v1/agents/${id}`);
        this.agents = this.agents.filter((a) => a.id !== id);
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to delete agent';
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
