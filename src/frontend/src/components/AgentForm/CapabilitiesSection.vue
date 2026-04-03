<template>
  <div class="space-y-4">
    <div
      v-for="cap in capabilities"
      :key="cap.id"
      class="flex items-center justify-between rounded-lg px-4 py-3 transition-all cursor-pointer"
      :class="isEnabled(cap.id) ? 'bg-surface-highest' : 'bg-surface-low'"
      @click="toggleCapability(cap.id)"
    >
      <div class="flex flex-col gap-0.5 mr-4">
        <span class="text-sm font-label text-onSurface font-medium">{{ cap.label }}</span>
        <span class="text-xs font-label text-onSurface-variant">{{ cap.description }}</span>
      </div>
      <!-- Toggle switch -->
      <button
        type="button"
        role="switch"
        :aria-checked="isEnabled(cap.id)"
        :aria-label="`Toggle ${cap.label}`"
        class="relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
        :class="isEnabled(cap.id) ? 'bg-primary-container' : 'bg-surface-high'"
        @click.stop="toggleCapability(cap.id)"
      >
        <span
          class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-onSurface transition-transform duration-200 shadow-sm"
          :class="isEnabled(cap.id) ? 'translate-x-5 !bg-primary' : 'translate-x-0'"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  modelValue: string[];
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localCapabilities = ref<string[]>([...props.modelValue]);

watch(
  () => props.modelValue,
  (val) => {
    localCapabilities.value = [...val];
  }
);

const capabilities = [
  {
    id: 'web_search',
    label: 'Web Search',
    description: 'Allow agent to search the web for up-to-date information',
  },
  {
    id: 'file_analysis',
    label: 'File Analysis',
    description: 'Allow agent to read and analyze uploaded files',
  },
  {
    id: 'code_execution',
    label: 'Code Execution (Sandbox)',
    description: 'Allow agent to run code in an isolated sandbox environment',
  },
];

function isEnabled(id: string): boolean {
  return localCapabilities.value.includes(id);
}

function toggleCapability(id: string) {
  if (isEnabled(id)) {
    localCapabilities.value = localCapabilities.value.filter((c) => c !== id);
  } else {
    localCapabilities.value = [...localCapabilities.value, id];
  }
  emit('update:modelValue', localCapabilities.value);
}
</script>
