<template>
  <div class="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#121C2A] shrink-0 gap-4">
      <div class="flex items-center gap-2 text-sm font-label text-onSurface-variant">
        <button class="hover:text-onSurface transition-colors" @click="router.push('/library')">Library</button>
        <span>/</span>
        <span class="text-onSurface font-semibold truncate max-w-[260px]">
          {{ flow?.title ?? '…' }}
        </span>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <span class="text-xs font-mono text-onSurface-variant min-w-[50px] text-right">
          {{ zoomPercent }}%
        </span>
        <button
          class="px-3 py-2 rounded-xl font-label text-sm flex items-center gap-2 transition-colors"
          :class="gridMode ? 'bg-primary/20 text-primary' : 'text-onSurface bg-surface-high hover:bg-surface-highest'"
          @click="gridMode = !gridMode"
          title="Toggle grid snap"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Grid {{ gridMode ? 'On' : 'Off' }}
        </button>
        <button
          class="px-4 py-2 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors"
          @click="exportFlow"
        >
          <svg class="w-4 h-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
        <button
          class="px-4 py-2 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors"
          @click="router.push('/library')"
        >
          Back
        </button>
        <button
          :disabled="saving || !flow"
          class="px-5 py-2 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          @click="handleSave"
        >
          <svg v-if="saving" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>

    <!-- Success toast -->
    <transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-y-[-8px]"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="successMessage"
        class="fixed top-6 right-6 z-50 bg-surface-high text-onSurface rounded-lg px-5 py-3 shadow-lg flex items-center gap-3"
      >
        <span class="w-2 h-2 rounded-full bg-primary shrink-0" />
        <span class="font-label text-sm">{{ successMessage }}</span>
      </div>
    </transition>

    <!-- Loading state -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3 text-onSurface-variant">
        <svg class="animate-spin w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span class="text-sm font-label">Loading flow…</span>
      </div>
    </div>

    <!-- 3-panel layout -->
    <div v-else class="flex flex-1 overflow-hidden">
      <!-- Left: Node Palette -->
      <NodePalette />

      <!-- Center: Flow Canvas -->
      <div
        ref="canvasRef"
        class="flex-1 overflow-hidden relative bg-[#0D1520]"
        :class="{ 'grid-enabled': gridMode }"
        @dragover.prevent
        @drop="onDrop"
      >
        <VueFlow
          id="main-flow"
          v-model:nodes="vfNodes"
          v-model:edges="vfEdges"
          :node-types="nodeTypes"
          :delete-key-code="['Delete', 'Backspace']"
          class="w-full h-full"
          :default-edge-options="{ animated: false, style: { stroke: '#4B6BFB', strokeWidth: 2 } }"
          :snap-grid="gridMode ? [GRID_SIZE, GRID_SIZE] : undefined"
          :snap-to-grid="gridMode"
          :min-zoom="0.2"
          :max-zoom="4"
          :default-viewport="{ zoom: 0.7, x: 0, y: 0 }"
          @connect="onConnect"
          @node-click="onNodeClick"
          @pane-click="selectedNodeId = null"
          @nodes-change="onNodesChange"
        />

        <!-- Empty canvas hint -->
        <div
          v-if="vfNodes.length === 0"
          class="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div class="flex flex-col items-center gap-2 text-center opacity-40">
            <span class="text-4xl">⬅️</span>
            <p class="text-sm font-label text-onSurface-variant">Drag nodes from the palette</p>
          </div>
        </div>
      </div>

      <!-- Right: Node Properties -->
      <NodePropertiesPanel
        v-if="selectedVFNode"
        :node="selectedVFNode"
        @update:node="onNodeUpdate"
        @delete-node="onDeleteNode"
        @deselect="selectedNodeId = null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';

import { useLibraryStore } from '../stores/library';
import type { Flow, NodeTypeProperty } from '../types';
import NodePalette from '../components/FlowDesigner/NodePalette.vue';
import NodePropertiesPanel from '../components/FlowDesigner/NodePropertiesPanel.vue';
import SourceNode from '../components/FlowDesigner/SourceNode.vue';
import ProcessorNode from '../components/FlowDesigner/ProcessorNode.vue';
import SinkNode from '../components/FlowDesigner/SinkNode.vue';
import StickyNoteNode from '../components/FlowDesigner/StickyNoteNode.vue';

const router = useRouter();
const route = useRoute();
const store = useLibraryStore();
const { project, viewport, setViewport } = useVueFlow('main-flow');

const flowId = route.params.id as string;
const flow = ref<Flow | null>(null);
const loading = ref(true);
const saving = ref(false);
const successMessage = ref('');
const selectedNodeId = ref<string | null>(null);
const canvasRef = ref<HTMLDivElement | null>(null);

// Grid configuration
const GRID_SIZE = 20;
const gridMode = ref(true);

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

// Zoom percentage display
const zoomPercent = computed(() => {
  const zoom = viewport.value?.zoom ?? 1;
  return Math.round(zoom * 100);
});

// VueFlow state
const vfNodes = ref<any[]>([]);
const vfEdges = ref<any[]>([]);

// Register custom node types
const nodeTypes: Record<string, any> = {
  source: markRaw(SourceNode),
  processor: markRaw(ProcessorNode),
  sink: markRaw(SinkNode),
  sticky_note: markRaw(StickyNoteNode),
};

const selectedVFNode = computed(() => {
  if (!selectedNodeId.value) return null;
  return vfNodes.value.find((n) => n.id === selectedNodeId.value) ?? null;
});

onMounted(async () => {
  try {
    const data = await store.fetchFlowById(flowId);
    flow.value = data;
    loadGraph(data);
  } finally {
    loading.value = false;
  }
});

function loadGraph(data: Flow) {
  // Load regular flow nodes
  const regularNodes = (data.graph?.nodes ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: { node_type: n.node_type, node_type_id: n.node_type_id, label: n.label, config: n.config ?? {} },
  }));
  
  // Load sticky notes from separate field
  const stickyNotes = (data.graph as any)?.sticky_notes ?? [];
  const stickyNodes = stickyNotes.map((n: any) => ({
    id: n.id,
    type: 'sticky_note',
    position: n.position,
    data: { 
      content: n.content,
      color: n.color,
      width: n.width,
      height: n.height,
    },
  }));
  
  // Combine all nodes - sticky notes first so they render behind
  vfNodes.value = [...stickyNodes, ...regularNodes];
  
  vfEdges.value = (data.graph?.edges ?? []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
  }));
  
  // Set default zoom to 100% after loading
  setTimeout(() => {
    setViewport({ zoom: 1, x: 0, y: 0 });
  }, 0);
}

function onConnect(connection: any) {
  vfEdges.value.push({
    id: `e-${connection.source}-${connection.target}-${Date.now()}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle ?? null,
    targetHandle: connection.targetHandle ?? null,
  });
}

function onNodeClick({ node }: { node: any }) {
  selectedNodeId.value = node.id;
}

function onNodeUpdate(patch: { label?: string; config?: Record<string, any> }) {
  if (!selectedNodeId.value) return;
  const idx = vfNodes.value.findIndex((n) => n.id === selectedNodeId.value);
  if (idx === -1) return;
  const node = vfNodes.value[idx];
  vfNodes.value[idx] = {
    ...node,
    data: {
      ...node.data,
      ...(patch.label !== undefined ? { label: patch.label } : {}),
      ...(patch.config !== undefined ? { config: patch.config } : {}),
    },
  };
}

function onDeleteNode(nodeId: string) {
  vfNodes.value = vfNodes.value.filter((n) => n.id !== nodeId);
  vfEdges.value = vfEdges.value.filter((e) => e.source !== nodeId && e.target !== nodeId);
  selectedNodeId.value = null;
}

function onNodesChange(changes: any[]) {
  const removedIds = changes.filter((c) => c.type === 'remove').map((c) => c.id);
  if (removedIds.includes(selectedNodeId.value ?? '')) {
    selectedNodeId.value = null;
  }
}

function buildDefaultConfig(properties: NodeTypeProperty[] | undefined): Record<string, any> {
  if (!properties) return {};
  const config: Record<string, any> = {};
  for (const prop of properties) {
    if (prop.default_value !== undefined && prop.default_value !== null && prop.default_value !== '') {
      // Parse default value based on data_type
      if (prop.data_type === 'number') {
        config[prop.name] = parseFloat(prop.default_value) || 0;
      } else if (prop.data_type === 'boolean') {
        config[prop.name] = prop.default_value.toLowerCase() === 'true';
      } else if (prop.data_type === 'json') {
        try {
          config[prop.name] = JSON.parse(prop.default_value);
        } catch {
          config[prop.name] = {};
        }
      } else {
        config[prop.name] = prop.default_value;
      }
    }
  }
  return config;
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  const raw = event.dataTransfer?.getData('application/vueflow');
  if (!raw) return;

  const dragData = JSON.parse(raw) as {
    category: string; node_type_id: string; name: string; icon: string; properties?: NodeTypeProperty[]; isStickyNote?: boolean
  };

  const bounds = canvasRef.value?.getBoundingClientRect();
  if (!bounds) return;

  const clientX = event.clientX - bounds.left;
  const clientY = event.clientY - bounds.top;
  let position = project({ x: clientX, y: clientY });
  
  // Snap to grid if grid mode is enabled
  if (gridMode.value) {
    position = {
      x: snapToGrid(position.x),
      y: snapToGrid(position.y),
    };
  }

  // Handle sticky notes
  if (dragData.isStickyNote) {
    const id = `sticky-${Date.now()}`;
    // Insert at beginning so it renders behind other nodes
    vfNodes.value.unshift({
      id,
      type: 'sticky_note',
      position,
      data: { 
        content: '',
        color: 'yellow',
        width: 200,
        height: 150,
      },
    });
    return;
  }

  const id = `${dragData.node_type_id}-${Date.now()}`;
  const defaultConfig = buildDefaultConfig(dragData.properties);
  vfNodes.value.push({
    id,
    type: dragData.category,
    position,
    data: { node_type_id: dragData.node_type_id, label: dragData.name, config: defaultConfig },
  });
}

async function handleSave() {
  if (!flow.value) return;
  saving.value = true;
  try {
    // Separate regular nodes from sticky notes
    const regularNodes = vfNodes.value
      .filter((n) => n.type !== 'sticky_note')
      .map((n) => ({
        id: n.id,
        type: n.type,
        node_type: n.data.node_type,
        node_type_id: n.data.node_type_id,
        label: n.data.label,
        position: n.position,
        config: n.data.config ?? {},
      }));
    
    const stickyNotes = vfNodes.value
      .filter((n) => n.type === 'sticky_note')
      .map((n) => ({
        id: n.id,
        position: n.position,
        content: n.data.content,
        color: n.data.color,
        width: n.data.width,
        height: n.data.height,
      }));
    
    const graph = {
      nodes: regularNodes,
      edges: vfEdges.value.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
      sticky_notes: stickyNotes,
    };
    await store.updateFlow(flowId, { graph });
    successMessage.value = 'Flow saved successfully!';
    setTimeout(() => { successMessage.value = ''; }, 2500);
  } catch {
    // ignore — store.error is set
  } finally {
    saving.value = false;
  }
}

function exportFlow() {
  if (!flow.value) return;
  
  // Separate regular nodes from sticky notes
  const regularNodes = vfNodes.value
    .filter((n) => n.type !== 'sticky_note')
    .map((n) => ({
      id: n.id,
      type: n.type,
      node_type: n.data.node_type,
      node_type_id: n.data.node_type_id,
      label: n.data.label,
      position: n.position,
      config: n.data.config ?? {},
    }));
  
  const stickyNotes = vfNodes.value
    .filter((n) => n.type === 'sticky_note')
    .map((n) => ({
      id: n.id,
      position: n.position,
      content: n.data.content,
      color: n.data.color,
      width: n.data.width,
      height: n.data.height,
    }));
  
  const graph = {
    nodes: regularNodes,
    edges: vfEdges.value.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
    sticky_notes: stickyNotes,
  };
  
  const exportData = {
    title: flow.value.title,
    description: flow.value.description,
    graph,
  };
  
  // Generate filename: lowercase, spaces to hyphens, .json extension
  const filename = flow.value.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    + '.json';
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  successMessage.value = `Exported to ${filename}`;
  setTimeout(() => { successMessage.value = ''; }, 2500);
}
</script>

<style scoped>
.grid-enabled {
  background-image: 
    linear-gradient(to right, rgba(75, 107, 251, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(75, 107, 251, 0.08) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
