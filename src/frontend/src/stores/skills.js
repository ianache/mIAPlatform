import { defineStore } from 'pinia';
import { apiClient } from '../api/client';
export const useSkillsStore = defineStore('skills', {
    state: () => ({
        skills: [],
        loading: false,
        error: null,
        lastFetched: null,
    }),
    getters: {
        activeSkills: (state) => state.skills.filter((s) => s.status === 'active'),
        skillsCount: (state) => state.skills.length,
    },
    actions: {
        async fetchSkills() {
            // Cache for 5 minutes
            const now = Date.now();
            if (this.lastFetched && now - this.lastFetched < 5 * 60 * 1000) {
                return;
            }
            this.loading = true;
            this.error = null;
            try {
                const response = await apiClient.get('/api/v1/skills/catalog');
                this.skills = response.skills;
                this.lastFetched = now;
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to fetch skills catalog';
                console.error('Error fetching skills:', err);
            }
            finally {
                this.loading = false;
            }
        },
        getSkillById(id) {
            return this.skills.find((s) => s.id === id);
        },
        clearCache() {
            this.lastFetched = null;
        },
    },
});
