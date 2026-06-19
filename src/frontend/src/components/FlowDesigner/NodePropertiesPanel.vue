<template>
  <aside class="w-[280px] shrink-0 bg-surface-low border-l border-white/5 overflow-y-auto flex flex-col">
    <!-- No selection -->
    <div v-if="!node" class="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
      <span class="text-3xl opacity-30">🖱️</span>
      <p class="text-sm text-onSurface-variant font-body">Select a node to edit its properties</p>
    </div>

    <template v-else>
      <div class="p-4 border-b border-white/5 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">{{ nodeType?.icon ?? '📦' }}</span>
          <div>
            <p class="text-[10px] uppercase tracking-wide text-onSurface-variant/60 font-label">{{ nodeType?.name ?? node.data.node_type_id }}</p>
            <p class="text-sm font-label font-semibold text-onSurface">Properties</p>
          </div>
        </div>
        <button class="text-onSurface-variant hover:text-onSurface transition-colors text-lg leading-none" @click="$emit('deselect')">×</button>
      </div>

      <div class="p-4 space-y-4 flex-1">
        <!-- Label -->
        <div class="space-y-1">
          <label class="text-[10px] uppercase tracking-wide text-onSurface-variant/60 font-label">Label</label>
          <input :value="node.data.label" type="text"
            class="w-full bg-surface-high rounded-lg px-3 py-2 text-sm font-body text-onSurface outline-none focus:ring-2 focus:ring-primary/40"
            @input="updateLabel(($event.target as HTMLInputElement).value)" />
        </div>

        <!-- No node type found -->
        <div v-if="!nodeType" class="text-xs text-onSurface-variant/60 font-body italic">
          Node type not found in catalog. Edit in
          <router-link to="/nodes-catalog" class="text-primary/70 hover:text-primary underline">Nodes Catalog</router-link>.
        </div>

        <!-- Dynamic config from catalog properties -->
        <template v-else-if="nodeType.properties.length > 0">
          <div v-for="prop in nodeType.properties" :key="prop.name" class="space-y-1">
            <label class="text-[10px] uppercase tracking-wide text-onSurface-variant/60 font-label flex items-center gap-1">
              {{ prop.name }}
              <span v-if="prop.required" class="text-error/70">*</span>
            </label>
            <p v-if="prop.description" class="text-[10px] text-onSurface-variant/50 font-body leading-snug">{{ prop.description }}</p>

            <textarea v-if="prop.data_type === 'code' || prop.data_type === 'json'"
              :value="node.data.config[prop.name] ?? ''"
              rows="5"
              class="w-full bg-surface-high rounded-lg px-3 py-2 text-xs font-mono text-onSurface outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              @input="updateConfig(prop.name, ($event.target as HTMLTextAreaElement).value)" />

            <input v-else-if="prop.data_type === 'boolean'" type="checkbox"
              :checked="!!node.data.config[prop.name]"
              class="accent-primary w-4 h-4"
              @change="updateConfig(prop.name, ($event.target as HTMLInputElement).checked)" />

            <input v-else-if="prop.data_type === 'number'" type="number"
              :value="node.data.config[prop.name] ?? ''"
              class="w-full bg-surface-high rounded-lg px-3 py-2 text-sm font-body text-onSurface outline-none focus:ring-2 focus:ring-primary/40"
              @input="updateConfig(prop.name, Number(($event.target as HTMLInputElement).value))" />

            <input v-else type="text"
              :value="node.data.config[prop.name] ?? ''"
              class="w-full bg-surface-high rounded-lg px-3 py-2 text-sm font-body text-onSurface outline-none focus:ring-2 focus:ring-primary/40"
              @input="updateConfig(prop.name, ($event.target as HTMLInputElement).value)" />
          </div>
        </template>

        <div v-else class="text-xs text-onSurface-variant/50 font-body italic">No properties defined for this node type.</div>
      </div>

      <div class="p-4 border-t border-white/5">
        <button class="w-full px-4 py-2 rounded-xl text-sm font-label text-error bg-surface-high hover:bg-surface-highest transition-colors"
          @click="$emit('delete-node', node.id)">Delete Node</button>
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNodeTypesStore } from '../../stores/nodeTypes';

interface VFNode {
  id: string
  data: { node_type_id?: string; label: string; config: Record<string, any> }
}

const props = defineProps<{ node: VFNode | null }>();
const emit = defineEmits<{
  (e: 'update:node', patch: { label?: string; config?: Record<string, any> }): void
  (e: 'delete-node', nodeId: string): void
  (e: 'deselect'): void
}>();

const ntStore = useNodeTypesStore();

const nodeType = computed(() => {
  if (!props.node?.data.node_type_id) return null;
  return ntStore.byId(props.node.data.node_type_id);
});

function updateLabel(value: string) {
  emit('update:node', { label: value });
}

function updateConfig(key: string, value: any) {
  const config = { ...(props.node?.data.config ?? {}), [key]: value };
  emit('update:node', { config });
}
</script>
