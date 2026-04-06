<template>
  <aside class="w-[220px] shrink-0 bg-[#121C2A] border-r border-white/5 overflow-y-auto flex flex-col gap-4 p-4">
    <!-- Loading -->
    <div v-if="store.loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="space-y-2">
        <div class="h-3 bg-surface-high rounded w-1/2 animate-pulse"></div>
        <div v-for="m in 2" :key="m" class="h-8 bg-surface-high rounded-xl animate-pulse"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="store.nodeTypes.length === 0" class="flex flex-col items-center justify-center flex-1 gap-2 text-center px-2">
      <span class="text-2xl opacity-30">🧩</span>
      <p class="text-xs text-onSurface-variant/60 font-body">
        No node types defined.<br/>
        <router-link to="/nodes-catalog" class="text-primary/70 hover:text-primary underline">Add in Nodes Catalog</router-link>
      </p>
    </div>

    <!-- Sections by category -->
    <template v-else>
      <div v-for="section in sections" :key="section.key">
        <div v-if="section.nodes.length > 0" class="space-y-1.5">
          <p class="text-[10px] font-label uppercase tracking-widest text-onSurface-variant/60 px-1">
            {{ section.label }}
          </p>
          <div
            v-for="nt in section.nodes"
            :key="nt.id"
            draggable="true"
            class="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-high hover:bg-surface-highest cursor-grab active:cursor-grabbing transition-colors select-none"
            @dragstart="onDragStart($event, nt)"
          >
            <span class="text-base leading-none">{{ nt.icon || '📦' }}</span>
            <span class="text-sm font-label text-onSurface truncate">{{ nt.name }}</span>
          </div>
        </div>
      </div>

      <!-- Miscelánea Section -->
      <div class="space-y-1.5 mt-4 pt-4 border-t border-white/10">
        <p class="text-[10px] font-label uppercase tracking-widest text-onSurface-variant/60 px-1">
          Miscelánea
        </p>
        <div
          draggable="true"
          class="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-high hover:bg-surface-highest cursor-grab active:cursor-grabbing transition-colors select-none"
          @dragstart="onStickyNoteDragStart($event)"
        >
          <span class="text-base leading-none">📝</span>
          <span class="text-sm font-label text-onSurface truncate">Nota Adhesiva</span>
        </div>
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useNodeTypesStore } from '../../stores/nodeTypes';
import type { NodeType } from '../../types';

const store = useNodeTypesStore();

onMounted(() => {
  if (store.nodeTypes.length === 0) store.fetchNodeTypes();
});

const sections = computed(() => [
  { key: 'source',    label: 'Sources',    nodes: store.nodeTypes.filter((n) => n.category === 'source')    },
  { key: 'processor', label: 'Processors', nodes: store.nodeTypes.filter((n) => n.category === 'processor') },
  { key: 'sink',      label: 'Sinks',      nodes: store.nodeTypes.filter((n) => n.category === 'sink')      },
]);

function onDragStart(event: DragEvent, nt: NodeType) {
  event.dataTransfer?.setData('application/vueflow', JSON.stringify({
    category: nt.category,
    node_type_id: nt.id,
    name: nt.name,
    icon: nt.icon ?? '📦',
    properties: nt.properties,
  }));
  event.dataTransfer!.effectAllowed = 'move';
}

function onStickyNoteDragStart(event: DragEvent) {
  event.dataTransfer?.setData('application/vueflow', JSON.stringify({
    category: 'sticky_note',
    node_type_id: 'sticky-note',
    name: 'Nota Adhesiva',
    icon: '📝',
    isStickyNote: true,
  }));
  event.dataTransfer!.effectAllowed = 'move';
}
</script>
