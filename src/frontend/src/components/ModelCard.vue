<template>
  <div
    class="glass rounded-2xl p-5 flex flex-col gap-3 cursor-default transition-colors duration-200 hover:bg-surface-high"
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
        {{ model.status }}
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ModelInfo {
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
  status: 'Active' | 'Deprecated' | 'Beta';
  tags: string[];
}

const props = defineProps<{ model: ModelInfo }>();

const providerConfig: Record<string, { initial: string; color: string; label: string }> = {
  openai: { initial: 'O', color: '#10a37f', label: 'OpenAI' },
  anthropic: { initial: 'A', color: '#d97706', label: 'Anthropic' },
  google: { initial: 'G', color: '#4285F4', label: 'Google' },
};

const providerInitial = computed(() => providerConfig[props.model.provider]?.initial ?? '?');
const providerColor = computed(() => providerConfig[props.model.provider]?.color ?? '#8C909F');
const providerLabel = computed(() => providerConfig[props.model.provider]?.label ?? props.model.provider);

const statusClass = computed(() => {
  switch (props.model.status) {
    case 'Active':
      return 'bg-green-900/40 text-green-400';
    case 'Deprecated':
      return 'bg-amber-900/40 text-amber-400';
    case 'Beta':
      return 'bg-primary/10 text-primary';
    default:
      return 'bg-surface-highest text-onSurface-variant';
  }
});
</script>
