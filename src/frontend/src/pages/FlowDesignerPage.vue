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
        @dragover.prevent
        @drop="onDrop"
      >
        <VueFlow
          id="main-flow"
          v-model:nodes="vfNodes"
          v-model:edges="vfEdges"
          :node-types="nodeTypes"
          :delete-key-code="['Delete', 'Backspace']"
          fit-view-on-init
          class="w-full h-full"
          :default-edge-options="{ animated: false, style: { stroke: '#4B6BFB', strokeWidth: 2 } }"
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

const router = useRouter();
const route = useRoute();
const store = useLibraryStore();
const { project } = useVueFlow('main-flow');

const flowId = route.params.id as string;
const flow = ref<Flow | null>(null);
const loading = ref(true);
const saving = ref(false);
const successMessage = ref('');
const selectedNodeId = ref<string | null>(null);
const canvasRef = ref<HTMLDivElement | null>(null);

// VueFlow state
const vfNodes = ref<any[]>([]);
const vfEdges = ref<any[]>([]);

// Register custom node types
const nodeTypes: Record<string, any> = {
  source: markRaw(SourceNode),
  processor: markRaw(ProcessorNode),
  sink: markRaw(SinkNode),
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
  vfNodes.value = (data.graph?.nodes ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: { node_type: n.node_type, node_type_id: n.node_type_id, label: n.label, config: n.config ?? {} },
  }));
  vfEdges.value = (data.graph?.edges ?? []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
  }));
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

  const { category, node_type_id, name, properties } = JSON.parse(raw) as {
    category: string; node_type_id: string; name: string; icon: string; properties?: NodeTypeProperty[]
  };

  const bounds = canvasRef.value?.getBoundingClientRect();
  if (!bounds) return;

  const clientX = event.clientX - bounds.left;
  const clientY = event.clientY - bounds.top;
  const position = project({ x: clientX, y: clientY });

  const id = `${node_type_id}-${Date.now()}`;
  const defaultConfig = buildDefaultConfig(properties);
  vfNodes.value.push({
    id,
    type: category,
    position,
    data: { node_type_id, label: name, config: defaultConfig },
  });
}

async function handleSave() {
  if (!flow.value) return;
  saving.value = true;
  try {
    const graph = {
      nodes: vfNodes.value.map((n) => ({
        id: n.id,
        type: n.type,
        node_type: n.data.node_type,
        node_type_id: n.data.node_type_id,
        label: n.data.label,
        position: n.position,
        config: n.data.config ?? {},
      })),
      edges: vfEdges.value.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
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
</script>
