<template>
  <div class="space-y-6">
    <!-- Provider Dropdown -->
    <div class="space-y-1.5">
      <label class="block text-sm font-label text-onSurface-variant" for="provider-select">
        LLM Provider <span class="text-error">*</span>
      </label>
      <div class="relative">
        <select
          id="provider-select"
          v-model="localProvider"
          class="w-full appearance-none bg-surface-high text-onSurface font-body rounded-lg px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all"
          @change="handleProviderChange"
        >
          <option value="" disabled>Select a provider</option>
          <option
            v-for="provider in availableProviders"
            :key="provider.id"
            :value="provider.id"
          >
            {{ provider.label }}
          </option>
        </select>
        <span
          v-if="localProvider"
          class="absolute w-2 h-2 rounded-full top-1/2 -translate-y-1/2"
          :class="providerDotClass"
          style="right: 2.5rem;"
        />
        <svg
          class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onSurface-variant"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Model Dropdown (value = registry_model UUID) -->
    <div class="space-y-1.5">
      <label class="block text-sm font-label text-onSurface-variant" for="model-select">
        Model <span class="text-error">*</span>
      </label>
      <div class="relative">
        <select
          id="model-select"
          v-model="localRegistryModelId"
          :disabled="!localProvider || registryStore.loading"
          class="w-full appearance-none bg-surface-high text-onSurface font-body rounded-lg px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" disabled>
            {{ registryStore.loading ? 'Loading models...' : 'Select a model' }}
          </option>
          <option
            v-for="m in filteredModels"
            :key="m.id"
            :value="m.id"
          >
            {{ m.name }}{{ m.model_id ? ` — ${m.model_id}` : '' }}
          </option>
        </select>
        <svg
          class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onSurface-variant"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <p v-if="registryStore.error" class="text-xs text-error mt-1">{{ registryStore.error }}</p>
      <p v-else-if="filteredModels.length === 0 && localProvider && !registryStore.loading" class="text-xs text-onSurface-variant mt-1">
        No active models for this provider. Add one in the Model Registry first.
      </p>
    </div>

    <!-- Temperature Slider -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="block text-sm font-label text-onSurface-variant" for="temperature-slider">
          Temperature
        </label>
        <span class="text-sm font-label text-primary bg-surface-high px-2 py-0.5 rounded-md">
          {{ localTemperature.toFixed(1) }}
        </span>
      </div>
      <input
        id="temperature-slider"
        v-model.number="localTemperature"
        type="range" min="0" max="2" step="0.1"
        class="w-full accent-primary cursor-pointer"
      />
      <div class="flex justify-between text-xs text-onSurface-variant font-label">
        <span>0.0 Precise</span>
        <span>1.0 Balanced</span>
        <span>2.0 Creative</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRegistryStore } from '../../stores/registry';
import type { LLMProvider } from '../../types';

interface Props {
  provider: LLMProvider['id'] | '';
  registryModelId: string;  // UUID of selected registry model
  temperature: number;
}

interface Emits {
  (e: 'update:provider', value: string): void;
  (e: 'update:registryModelId', value: string): void;
  (e: 'update:temperature', value: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const registryStore = useRegistryStore();

const localProvider = ref<string>(props.provider);
const localRegistryModelId = ref<string>(props.registryModelId);
const localTemperature = ref(props.temperature);

// Sync props → local (edit mode load)
watch(() => props.provider, (val) => { localProvider.value = val; });
watch(() => props.temperature, (val) => { localTemperature.value = val; });
watch(() => props.registryModelId, (uuid) => {
  localRegistryModelId.value = uuid;
  // Sync localProvider from registry entry (needed on edit mode load)
  if (uuid) {
    const entry = registryStore.models.find(m => m.id === uuid);
    if (entry) localProvider.value = entry.provider;
  }
});

// Emit changes
watch(localTemperature, (val) => emit('update:temperature', val));

watch(localRegistryModelId, (uuid) => {
  emit('update:registryModelId', uuid);
  // Derive and emit provider from selected registry entry
  if (uuid) {
    const entry = registryStore.models.find(m => m.id === uuid);
    if (entry) {
      localProvider.value = entry.provider;
      emit('update:provider', entry.provider);
    }
  }
});

const providerLabels: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google Gemini',
  ollama: 'Ollama',
  other: 'Other',
};

// Providers that have at least one active registered model
const availableProviders = computed(() => {
  const seen = new Set<string>();
  registryStore.models.forEach((m) => {
    if (m.status === 'active') seen.add(m.provider);
  });
  return Array.from(seen).map((id) => ({
    id: id as LLMProvider['id'],
    label: providerLabels[id] ?? id.charAt(0).toUpperCase() + id.slice(1),
  }));
});

// Registry models filtered by selected provider
const filteredModels = computed(() =>
  localProvider.value
    ? registryStore.models.filter(
        (m) => m.provider === localProvider.value && m.status === 'active'
      )
    : []
);

const providerDotClass = computed(() => ({
  openai: 'bg-primary',
  anthropic: 'bg-tertiary',
  google: 'bg-secondary',
  ollama: 'bg-outline',
  other: 'bg-outline',
}[localProvider.value] ?? 'bg-outline'));

function handleProviderChange() {
  localRegistryModelId.value = '';
  emit('update:registryModelId', '');
  emit('update:provider', localProvider.value);
}

onMounted(() => {
  if (registryStore.models.length === 0) {
    registryStore.fetchModels();
  }
  // If registryModelId already set (edit mode), sync provider
  if (props.registryModelId) {
    const entry = registryStore.models.find(m => m.id === props.registryModelId);
    if (entry) localProvider.value = entry.provider;
  }
});
</script>
