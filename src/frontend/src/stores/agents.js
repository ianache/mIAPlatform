import { defineStore } from 'pinia';
import { apiClient } from '../api/client';
export const useAgentStore = defineStore('agents', {
    state: () => ({
        agents: [],
        loading: false,
        error: null,
    }),
    actions: {
        async fetchAgents() {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiClient.get('/api/v1/agents');
                this.agents = response.items;
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to fetch agents';
            }
            finally {
                this.loading = false;
            }
        },
        async createAgent(data) {
            this.loading = true;
            this.error = null;
            try {
                const agent = await apiClient.post('/api/v1/agents', data);
                this.agents.push(agent);
                return agent;
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to create agent';
                throw err;
            }
            finally {
                this.loading = false;
            }
        },
        async fetchAgentById(id) {
            const cached = this.agents.find((a) => a.id === id);
            if (cached)
                return cached;
            return apiClient.get(`/api/v1/agents/${id}`);
        },
        async updateAgent(id, data) {
            this.loading = true;
            this.error = null;
            try {
                const updated = await apiClient.patch(`/api/v1/agents/${id}`, data);
                const idx = this.agents.findIndex((a) => a.id === id);
                if (idx !== -1)
                    this.agents[idx] = updated;
                return updated;
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to update agent';
                throw err;
            }
            finally {
                this.loading = false;
            }
        },
        async deleteAgent(id) {
            this.loading = true;
            this.error = null;
            try {
                await apiClient.delete(`/api/v1/agents/${id}`);
                this.agents = this.agents.filter((a) => a.id !== id);
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to delete agent';
                throw err;
            }
            finally {
                this.loading = false;
            }
        },
    },
});
