import { defineStore } from 'pinia';
import { apiClient } from '../api/client';
export const useRegistryStore = defineStore('registry', {
    state: () => ({
        models: [],
        apiKeys: [],
        featureMappings: [],
        loading: false,
        error: null,
    }),
    getters: {
        activeModels: (state) => state.models.filter((m) => m.status === 'active'),
        activeModelCount: (state) => state.models.filter((m) => m.status === 'active').length,
        totalModelCount: (state) => state.models.length,
        providerCount: (state) => new Set(state.models.map((m) => m.provider)).size,
        hasValidKey: (state) => state.apiKeys.some((k) => k.is_valid),
        registryHealthLabel: (state) => state.apiKeys.some((k) => k.is_valid) ? 'Healthy' : 'No valid keys',
    },
    actions: {
        // ── Models ────────────────────────────────────────────────────────────────
        async fetchModels() {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiClient.get('/api/v1/registry/models');
                this.models = response.items;
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to fetch models';
            }
            finally {
                this.loading = false;
            }
        },
        async createModel(data) {
            this.loading = true;
            this.error = null;
            try {
                const model = await apiClient.post('/api/v1/registry/models', data);
                this.models.push(model);
                return model;
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to create model';
                throw err;
            }
            finally {
                this.loading = false;
            }
        },
        async fetchModelById(id) {
            const cached = this.models.find((m) => m.id === id);
            if (cached)
                return cached;
            // Fetch all and find — registry list is typically small
            await this.fetchModels();
            const found = this.models.find((m) => m.id === id);
            if (!found)
                throw { detail: 'Model not found', status_code: 404 };
            return found;
        },
        async updateModel(id, data) {
            this.loading = true;
            this.error = null;
            try {
                const updated = await apiClient.patch(`/api/v1/registry/models/${id}`, data);
                const idx = this.models.findIndex((m) => m.id === id);
                if (idx !== -1)
                    this.models[idx] = updated;
                return updated;
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to update model';
                throw err;
            }
            finally {
                this.loading = false;
            }
        },
        async deleteModel(id) {
            this.loading = true;
            this.error = null;
            try {
                await apiClient.delete(`/api/v1/registry/models/${id}`);
                this.models = this.models.filter((m) => m.id !== id);
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to delete model';
                throw err;
            }
            finally {
                this.loading = false;
            }
        },
        // ── API Keys ──────────────────────────────────────────────────────────────
        async fetchApiKeys() {
            this.error = null;
            try {
                const response = await apiClient.get('/api/v1/registry/api-keys');
                this.apiKeys = response.items;
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to fetch API keys';
            }
        },
        async saveApiKey(provider, key) {
            try {
                const record = await apiClient.put(`/api/v1/registry/api-keys/${provider}`, { key });
                const idx = this.apiKeys.findIndex((k) => k.provider === provider);
                if (idx !== -1)
                    this.apiKeys[idx] = record;
                else
                    this.apiKeys.push(record);
                return record;
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to save API key';
                throw err;
            }
        },
        async validateApiKey(provider) {
            try {
                const record = await apiClient.post(`/api/v1/registry/api-keys/${provider}/validate`, {});
                const idx = this.apiKeys.findIndex((k) => k.provider === provider);
                if (idx !== -1)
                    this.apiKeys[idx] = record;
                return record;
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to validate API key';
                throw err;
            }
        },
        // ── Feature Mappings ──────────────────────────────────────────────────────
        async fetchFeatureMappings() {
            this.error = null;
            try {
                const response = await apiClient.get('/api/v1/registry/feature-mappings');
                this.featureMappings = response.items;
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to fetch feature mappings';
            }
        },
        async upsertFeatureMapping(featureId, featureName, modelId) {
            try {
                const mapping = await apiClient.put(`/api/v1/registry/feature-mappings/${featureId}`, { feature_name: featureName, model_id: modelId });
                const idx = this.featureMappings.findIndex((fm) => fm.feature_id === featureId);
                if (idx !== -1)
                    this.featureMappings[idx] = mapping;
                else
                    this.featureMappings.push(mapping);
                return mapping;
            }
            catch (err) {
                this.error = err?.detail ?? 'Failed to save feature mapping';
                throw err;
            }
        },
    },
});
