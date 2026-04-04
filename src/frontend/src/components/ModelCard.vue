<template>
  <div
    class="glass rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-200 hover:bg-surface-high"
  >
    <!-- Header: provider logo + name -->
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center text-background font-headline font-bold text-sm flex-shrink-0"
        :style="{ backgroundColor: providerColor }"
      >
        {{ providerInitial }}
      </div>
      <div class="min-w-0">
        <p class="font-headline font-semibold text-onSurface truncate">{{ model.name }}</p>
        <p class="text-onSurface-variant font-label text-xs mt-0.5">{{ providerLabel }}</p>
      </div>
      <!-- Status badge -->
      <span
        class="ml-auto flex-shrink-0 text-xs font-label px-2 py-0.5 rounded-full"
        :class="statusClass"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- Tags -->
    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="tag in model.tags"
        :key="tag"
        class="bg-surface-highest text-onSurface-variant font-label text-xs px-2 py-0.5 rounded-full"
      >
        {{ tag }}
      </span>
      <span
        v-if="model.context_window"
        class="bg-surface-highest text-onSurface-variant font-label text-xs px-2 py-0.5 rounded-full"
      >
        {{ formatCtx(model.context_window) }} context
      </span>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-1 border-t border-surface-highest">
      <button
        class="text-xs font-label text-onSurface-variant hover:text-primary transition-colors"
        @click="emit('edit')"
      >
        Edit
      </button>
      <button
        class="text-xs font-label text-onSurface-variant hover:text-error transition-colors"
        @click="emit('delete')"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RegistryModel } from '../types';

const props = defineProps<{ model: RegistryModel }>();
const emit = defineEmits<{ edit: []; delete: [] }>();

const providerConfig: Record<string, { initial: string; color: string; label: string }> = {
  openai: { initial: 'O', color: '#10a37f', label: 'OpenAI' },
  anthropic: { initial: 'A', color: '#d97706', label: 'Anthropic' },
  google: { initial: 'G', color: '#4285F4', label: 'Google' },
  other: { initial: '?', color: '#8C909F', label: 'Other' },
};

const providerInitial = computed(() => providerConfig[props.model.provider]?.initial ?? '?');
const providerColor = computed(() => providerConfig[props.model.provider]?.color ?? '#8C909F');
const providerLabel = computed(
  () => providerConfig[props.model.provider]?.label ?? props.model.provider
);

const statusLabel = computed(() => {
  switch (props.model.status) {
    case 'active': return 'Active';
    case 'deprecated': return 'Deprecated';
    case 'beta': return 'Beta';
    default: return props.model.status;
  }
});

const statusClass = computed(() => {
  switch (props.model.status) {
    case 'active': return 'bg-green-900/40 text-green-400';
    case 'deprecated': return 'bg-amber-900/40 text-amber-400';
    case 'beta': return 'bg-primary/10 text-primary';
    default: return 'bg-surface-highest text-onSurface-variant';
  }
});

function formatCtx(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}
</script>
