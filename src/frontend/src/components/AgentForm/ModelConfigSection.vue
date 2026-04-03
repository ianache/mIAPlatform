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
            v-for="provider in providers"
            :key="provider.id"
            :value="provider.id"
          >
            {{ provider.label }}
          </option>
        </select>
        <!-- Provider indicator dot -->
        <span
          v-if="localProvider"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          :class="providerDotClass"
          style="left: auto; right: 2.5rem;"
        />
        <svg
          class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onSurface-variant"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Model Dropdown -->
    <div class="space-y-1.5">
      <label class="block text-sm font-label text-onSurface-variant" for="model-select">
        Model <span class="text-error">*</span>
      </label>
      <div v-if="localProvider !== 'other'" class="relative">
        <select
          id="model-select"
          v-model="localModel"
          :disabled="!localProvider"
          class="w-full appearance-none bg-surface-high text-onSurface font-body rounded-lg px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" disabled>Select a model</option>
          <option
            v-for="model in availableModels"
            :key="model"
            :value="model"
          >
            {{ model }}
          </option>
        </select>
        <svg
          class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onSurface-variant"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <input
        v-else
        id="model-custom"
        v-model="localModel"
        type="text"
        placeholder="Enter custom model name"
        class="w-full bg-surface-high text-onSurface font-body placeholder-onSurface-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all"
      />
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
        type="range"
        min="0"
        max="2"
        step="0.1"
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
import { ref, computed, watch } from 'vue';
import type { LLMProvider } from '../../types';

interface Props {
  provider: LLMProvider['id'] | '';
  model: string;
  temperature: number;
}

interface Emits {
  (e: 'update:provider', value: LLMProvider['id'] | ''): void;
  (e: 'update:model', value: string): void;
  (e: 'update:temperature', value: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localProvider = ref<LLMProvider['id'] | ''>(props.provider);
const localModel = ref(props.model);
const localTemperature = ref(props.temperature);

watch(localProvider, (val) => emit('update:provider', val));
watch(localModel, (val) => emit('update:model', val));
watch(localTemperature, (val) => emit('update:temperature', val));

const providers = [
  { id: 'openai' as const, label: 'OpenAI' },
  { id: 'anthropic' as const, label: 'Anthropic' },
  { id: 'google' as const, label: 'Google Gemini' },
  { id: 'other' as const, label: 'Other' },
];

const modelMap: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
};

const availableModels = computed(() =>
  localProvider.value && localProvider.value !== 'other'
    ? modelMap[localProvider.value] ?? []
    : []
);

const providerDotClass = computed(() => {
  switch (localProvider.value) {
    case 'openai':
      return 'bg-primary';
    case 'anthropic':
      return 'bg-tertiary';
    case 'google':
      return 'bg-secondary';
    default:
      return 'bg-outline';
  }
});

function handleProviderChange() {
  localModel.value = '';
  emit('update:model', '');
}
</script>
