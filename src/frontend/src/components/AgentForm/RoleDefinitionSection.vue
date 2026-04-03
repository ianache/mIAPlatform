<template>
  <div class="space-y-3">
    <div class="space-y-1.5">
      <label class="block text-sm font-label text-onSurface-variant" for="system-prompt">
        System Prompt
      </label>
      <textarea
        id="system-prompt"
        v-model="localSystemPrompt"
        placeholder="You are a helpful assistant that..."
        maxlength="4000"
        :style="{ minHeight: '150px' }"
        class="w-full bg-surface-high text-onSurface font-mono text-sm placeholder-onSurface-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary resize-y transition-all"
      />
      <div class="flex items-start justify-between gap-4">
        <p class="text-xs text-onSurface-variant font-label">
          Define the agent's personality, behavior, and constraints
        </p>
        <p class="text-xs text-onSurface-variant font-label whitespace-nowrap">
          {{ localSystemPrompt?.length ?? 0 }}/4000
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  systemPrompt?: string;
}

interface Emits {
  (e: 'update:systemPrompt', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localSystemPrompt = ref(props.systemPrompt ?? '');

watch(localSystemPrompt, (val) => emit('update:systemPrompt', val));
</script>
