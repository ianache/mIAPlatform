import { defineStore } from 'pinia';
import { apiClient } from '../api/client';

export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  status: string;
  path: string;
  github_url: string;
}

interface SkillsResponse {
  skills: Skill[];
  total: number;
  repository: string;
  last_updated: string | null;
}

export const useSkillsStore = defineStore('skills', {
  state: () => ({
    skills: [] as Skill[],
    loading: false,
    error: null as string | null,
    lastFetched: null as number | null,
  }),

  getters: {
    activeSkills: (state) => state.skills.filter((s) => s.status === 'active'),
    skillsCount: (state) => state.skills.length,
  },

  actions: {
    async fetchSkills(): Promise<void> {
      // Cache for 5 minutes
      const now = Date.now();
      if (this.lastFetched && now - this.lastFetched < 5 * 60 * 1000) {
        return;
      }

      this.loading = true;
      this.error = null;
      
      try {
        const response = await apiClient.get<SkillsResponse>('/api/v1/skills/catalog');
        this.skills = response.skills;
        this.lastFetched = now;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to fetch skills catalog';
        console.error('Error fetching skills:', err);
      } finally {
        this.loading = false;
      }
    },

    getSkillById(id: string): Skill | undefined {
      return this.skills.find((s) => s.id === id);
    },

    clearCache(): void {
      this.lastFetched = null;
    },
  },
});
