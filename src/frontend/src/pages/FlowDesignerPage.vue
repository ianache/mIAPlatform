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
          class="px-4 py-2 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors flex items-center gap-2"
          @click="exportToPNG"
          title="Export diagram as PNG"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          PNG
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
          class="px-4 py-2 rounded-xl font-label text-sm bg-primary-gradient text-background hover:opacity-90 transition-opacity flex items-center gap-2"
          @click="handleRun"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Run
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
        <!-- VueFlow renders ALL nodes (regular + misc).
             Misc nodes have zIndex=0, regular nodes have zIndex=1,
             so misc always appears behind. -->
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

      <!-- Right: Node Properties (only for regular nodes) -->
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
import { toPng } from 'html-to-image';
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

// z-index constants: misc nodes always behind regular nodes
const ZINDEX_MISC    = 0;
const ZINDEX_REGULAR = 1;

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

const zoomPercent = computed(() => {
  const zoom = viewport.value?.zoom ?? 1;
  return Math.round(zoom * 100);
});

// All nodes in one VueFlow array.
// Regular nodes (source/processor/sink) have zIndex=ZINDEX_REGULAR.
// Misc nodes (sticky notes, etc.) have zIndex=ZINDEX_MISC → always behind.
const vfNodes = ref<any[]>([]);
const vfEdges = ref<any[]>([]);

// Register custom node types.
// 'misc' maps to StickyNoteNode — fully self-contained with inline editing.
const nodeTypes: Record<string, any> = {
  source:    markRaw(SourceNode),
  processor: markRaw(ProcessorNode),
  sink:      markRaw(SinkNode),
  misc:      markRaw(StickyNoteNode),
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
  // Regular flow nodes
  const regularNodes = (data.graph?.nodes ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    zIndex: ZINDEX_REGULAR,
    data: { node_type: n.node_type, node_type_id: n.node_type_id, label: n.label, config: n.config ?? {}, icon: n.icon },
  }));

  // Misc nodes from misc_nodes array (new format)
  const miscNodes = ((data.graph as any)?.misc_nodes ?? []).map((n: any) => ({
    id: n.id,
    type: 'misc',
    position: n.position,
    zIndex: ZINDEX_MISC,
    data: { content: n.content ?? '', color: n.color ?? 'yellow', width: n.width ?? 200, height: n.height ?? 150 },
  }));

  // Backward-compatible: load legacy sticky_notes as misc nodes
  const legacyMiscNodes = ((data.graph as any)?.sticky_notes ?? []).map((n: any) => ({
    id: n.id,
    type: 'misc',
    position: n.position,
    zIndex: ZINDEX_MISC,
    data: { content: n.content ?? '', color: n.color ?? 'yellow', width: n.width ?? 200, height: n.height ?? 150 },
  }));

  vfNodes.value = [...regularNodes, ...miscNodes, ...legacyMiscNodes];

  vfEdges.value = (data.graph?.edges ?? []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
  }));

  setTimeout(() => setViewport({ zoom: 1, x: 0, y: 0 }), 0);
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
  // Misc nodes are fully edited inline — do NOT open the properties panel.
  if (node.type === 'misc') return;
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
      ...(patch.label  !== undefined ? { label:  patch.label  } : {}),
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
      if (prop.data_type === 'number') {
        config[prop.name] = parseFloat(prop.default_value) || 0;
      } else if (prop.data_type === 'boolean') {
        config[prop.name] = prop.default_value.toLowerCase() === 'true';
      } else if (prop.data_type === 'json') {
        try { config[prop.name] = JSON.parse(prop.default_value); } catch { config[prop.name] = {}; }
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
    category: string; node_type_id: string; name: string; icon: string;
    properties?: NodeTypeProperty[]; isMisc?: boolean;
  };

  const bounds = canvasRef.value?.getBoundingClientRect();
  if (!bounds) return;

  let position = project({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
  if (gridMode.value) {
    position = { x: snapToGrid(position.x), y: snapToGrid(position.y) };
  }

  // Misc nodes: stored in their own list, rendered behind regular nodes via zIndex
  if (dragData.isMisc) {
    const id = `misc-${Date.now()}`;
    vfNodes.value.push({
      id,
      type: 'misc',
      position,
      zIndex: ZINDEX_MISC,
      data: { content: '', color: 'yellow', width: 200, height: 150 },
    });
    return;
  }

  const id = `${dragData.node_type_id}-${Date.now()}`;
  const defaultConfig = buildDefaultConfig(dragData.properties);
  vfNodes.value.push({
    id,
    type: dragData.category,
    position,
    zIndex: ZINDEX_REGULAR,
    data: { node_type_id: dragData.node_type_id, label: dragData.name, config: defaultConfig, icon: dragData.icon },
  });
}

// ── Helpers to split vfNodes into regular / misc on save ──

function buildGraph() {
  const regularNodes = vfNodes.value
    .filter((n) => n.type !== 'misc')
    .map((n) => ({
      id: n.id,
      type: n.type,
      node_type: n.data.node_type,
      node_type_id: n.data.node_type_id,
      label: n.data.label,
      position: n.position,
      config: n.data.config ?? {},
      icon: n.data.icon,
    }));

  const miscNodes = vfNodes.value
    .filter((n) => n.type === 'misc')
    .map((n) => ({
      id: n.id,
      position: n.position,
      content: n.data.content,
      color: n.data.color,
      width: n.data.width,
      height: n.data.height,
    }));

  return {
    nodes: regularNodes,
    edges: vfEdges.value.map((e) => ({ id: e.id, source: e.source, target: e.target })),
    misc_nodes: miscNodes,
  };
}

async function handleSave() {
  if (!flow.value) return;
  saving.value = true;
  try {
    await store.updateFlow(flowId, { graph: buildGraph() });
    successMessage.value = 'Flow saved successfully!';
    setTimeout(() => { successMessage.value = ''; }, 2500);
  } catch {
    // store.error is set
  } finally {
    saving.value = false;
  }
}

function exportFlow() {
  if (!flow.value) return;
  const exportData = { title: flow.value.title, description: flow.value.description, graph: buildGraph() };
  const filename = flow.value.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.json';
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

function handleRun() {
  router.push(`/library/${flowId}/runs`);
}

async function exportToPNG() {
  const canvasElement = document.querySelector('#main-flow .vue-flow__viewport') as HTMLElement;
  if (!canvasElement) {
    successMessage.value = 'Could not find diagram canvas';
    setTimeout(() => { successMessage.value = ''; }, 2500);
    return;
  }
  try {
    successMessage.value = 'Generating PNG...';
    const dataUrl = await toPng(canvasElement, { backgroundColor: '#0D1520', pixelRatio: 2 });
    const filename = (flow.value?.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ?? 'flow-diagram') + '.png';
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    successMessage.value = `Exported to ${filename}`;
    setTimeout(() => { successMessage.value = ''; }, 2500);
  } catch (err) {
    console.error('Failed to export PNG:', err);
    successMessage.value = 'Failed to export PNG';
    setTimeout(() => { successMessage.value = ''; }, 2500);
  }
}
</script>

<style scoped>
.grid-enabled {
  background-image:
    linear-gradient(to right,  rgba(75, 107, 251, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(75, 107, 251, 0.08) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
