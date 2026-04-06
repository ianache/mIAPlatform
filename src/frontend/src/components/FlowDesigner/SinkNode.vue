<template>
  <div
    class="group rounded-xl bg-surface-high px-4 py-3 text-sm font-label shadow-md min-w-[140px] relative"
    :class="{ 'ring-2 ring-primary': selected }"
  >
    <button
      class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-surface-highest text-onSurface-variant hover:bg-error hover:text-background flex items-center justify-center text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity z-10"
      @click.stop="removeNodes([id])"
    >×</button>
    <Handle type="target" :position="Position.Left" class="!bg-onSurface-variant !w-3 !h-3 !border-2 !border-background" />
    <div class="flex items-center gap-2">
      <span class="text-base leading-none">{{ icon }}</span>
      <div class="flex flex-col min-w-0">
        <span class="text-[10px] text-onSurface-variant/60 uppercase tracking-wide leading-none mb-0.5">
          {{ data.node_type }}
        </span>
        <span class="text-onSurface truncate leading-snug">{{ data.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position, useVueFlow } from '@vue-flow/core';

const props = defineProps<{
  id: string
  data: { node_type: string; label: string; config: Record<string, any>; icon?: string }
  selected?: boolean
}>()

const { removeNodes } = useVueFlow('main-flow');

const iconMap: Record<string, string> = {
  qdrant:   '🔵',
  neo4j:    '🕸',
  api:      '🌐',
  postgres: '🐘',
};

const icon = computed(() => props.data.icon ?? iconMap[props.data.node_type] ?? '🗄️');
</script>
