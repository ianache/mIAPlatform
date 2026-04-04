import { defineStore } from 'pinia';
import { computed } from 'vue';
import { apiClient } from '../api/client';
import type { RegistryModel, RegistryModelCreate, RegistryModelUpdate, APIKeyRecord, FeatureMapping } from '../types';

export const useRegistryStore = defineStore('registry', {
  state: () => ({
    models: [] as RegistryModel[],
    apiKeys: [] as APIKeyRecord[],
    featureMappings: [] as FeatureMapping[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    activeModels: (state) => state.models.filter((m) => m.status === 'active'),
    activeModelCount: (state) => state.models.filter((m) => m.status === 'active').length,
    totalModelCount: (state) => state.models.length,
    providerCount: (state) => new Set(state.models.map((m) => m.provider)).size,
    hasValidKey: (state) => state.apiKeys.some((k) => k.is_valid),
    registryHealthLabel: (state) =>
      state.apiKeys.some((k) => k.is_valid) ? 'Healthy' : 'No valid keys',
  },

  actions: {
    // ── Models ────────────────────────────────────────────────────────────────

    async fetchModels(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get<{ items: RegistryModel[]; total: number }>(
          '/api/v1/registry/models'
        );
        this.models = response.items;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to fetch models';
      } finally {
        this.loading = false;
      }
    },

    async createModel(data: RegistryModelCreate): Promise<RegistryModel> {
      this.loading = true;
      this.error = null;
      try {
        const model = await apiClient.post<RegistryModel>('/api/v1/registry/models', data);
        this.models.push(model);
        return model;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to create model';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchModelById(id: string): Promise<RegistryModel> {
      const cached = this.models.find((m) => m.id === id);
      if (cached) return cached;
      // Fetch all and find — registry list is typically small
      await this.fetchModels();
      const found = this.models.find((m) => m.id === id);
      if (!found) throw { detail: 'Model not found', status_code: 404 };
      return found;
    },

    async updateModel(id: string, data: RegistryModelUpdate): Promise<RegistryModel> {
      this.loading = true;
      this.error = null;
      try {
        const updated = await apiClient.patch<RegistryModel>(
          `/api/v1/registry/models/${id}`,
          data
        );
        const idx = this.models.findIndex((m) => m.id === id);
        if (idx !== -1) this.models[idx] = updated;
        return updated;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to update model';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteModel(id: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete<void>(`/api/v1/registry/models/${id}`);
        this.models = this.models.filter((m) => m.id !== id);
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to delete model';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ── API Keys ──────────────────────────────────────────────────────────────

    async fetchApiKeys(): Promise<void> {
      this.error = null;
      try {
        const response = await apiClient.get<{ items: APIKeyRecord[]; total: number }>(
          '/api/v1/registry/api-keys'
        );
        this.apiKeys = response.items;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to fetch API keys';
      }
    },

    async saveApiKey(provider: string, key: string): Promise<APIKeyRecord> {
      try {
        const record = await apiClient.put<APIKeyRecord>(
          `/api/v1/registry/api-keys/${provider}`,
          { key }
        );
        const idx = this.apiKeys.findIndex((k) => k.provider === provider);
        if (idx !== -1) this.apiKeys[idx] = record;
        else this.apiKeys.push(record);
        return record;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to save API key';
        throw err;
      }
    },

    async validateApiKey(provider: string): Promise<APIKeyRecord> {
      try {
        const record = await apiClient.post<APIKeyRecord>(
          `/api/v1/registry/api-keys/${provider}/validate`,
          {}
        );
        const idx = this.apiKeys.findIndex((k) => k.provider === provider);
        if (idx !== -1) this.apiKeys[idx] = record;
        return record;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to validate API key';
        throw err;
      }
    },

    // ── Feature Mappings ──────────────────────────────────────────────────────

    async fetchFeatureMappings(): Promise<void> {
      this.error = null;
      try {
        const response = await apiClient.get<{ items: FeatureMapping[]; total: number }>(
          '/api/v1/registry/feature-mappings'
        );
        this.featureMappings = response.items;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to fetch feature mappings';
      }
    },

    async upsertFeatureMapping(
      featureId: string,
      featureName: string,
      modelId: string
    ): Promise<FeatureMapping> {
      try {
        const mapping = await apiClient.put<FeatureMapping>(
          `/api/v1/registry/feature-mappings/${featureId}`,
          { feature_name: featureName, model_id: modelId }
        );
        const idx = this.featureMappings.findIndex((fm) => fm.feature_id === featureId);
        if (idx !== -1) this.featureMappings[idx] = mapping;
        else this.featureMappings.push(mapping);
        return mapping;
      } catch (err: any) {
        this.error = err?.detail ?? 'Failed to save feature mapping';
        throw err;
      }
    },
  },
});
