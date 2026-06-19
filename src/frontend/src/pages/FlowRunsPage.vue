<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- TopBar breadcrumb -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-sm font-label text-onSurface-variant">
        <button class="hover:text-onSurface transition-colors" @click="router.push('/library')">Library</button>
        <span>/</span>
        <span class="text-onSurface font-semibold truncate max-w-[260px]">{{ flowTitle || '…' }}</span>
        <span>/</span>
        <span class="text-primary font-semibold">Runs</span>
      </div>
      <button
        class="px-5 py-2.5 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity flex items-center gap-2"
        @click="handleRunNow"
        :disabled="store.isRunning"
      >
        <svg v-if="store.isRunning" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ store.isRunning ? 'Executing…' : 'Run Now' }}
      </button>
    </div>

    <!-- Error banner -->
    <div
      v-if="store.error"
      class="bg-surface-high rounded-lg px-5 py-3 text-error font-label text-sm flex items-center gap-3"
    >
      <span class="w-2 h-2 rounded-full bg-error shrink-0" />
      Flow failed: {{ store.error }}
    </div>

    <!-- Two-column layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Run history list -->
      <div class="glass rounded-2xl p-6 space-y-4">
        <h2 class="font-headline font-semibold text-onSurface text-lg">Run History</h2>

        <!-- Loading skeleton -->
        <div v-if="loadingRuns" class="space-y-3">
          <div v-for="n in 3" :key="n" class="h-16 bg-surface-high rounded-xl animate-pulse" />
        </div>

        <!-- Empty state -->
        <div v-else-if="store.runs.length === 0" class="text-center py-8 text-onSurface-variant">
          <p class="text-sm font-body">No runs yet. Click "Run Now" to execute.</p>
        </div>

        <!-- Run list -->
        <div v-else class="space-y-2">
          <div
            v-for="run in store.runs"
            :key="run.id"
            class="p-3 rounded-xl cursor-pointer transition-colors"
            :class="selectedRunId === run.id ? 'bg-surface-highest' : 'bg-surface-high hover:bg-surface-highest'"
            @click="selectRun(run)"
          >
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="font-label text-xs text-onSurface-variant truncate max-w-[120px]">
                {{ run.id.slice(0, 8) }}…
              </span>
              <span
                class="shrink-0 text-xs font-label px-2 py-0.5 rounded-full"
                :class="statusBadgeClass(run.status)"
              >
                {{ run.status }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs text-onSurface-variant">
              <span>{{ run.trigger || 'manual' }}</span>
              <span>·</span>
              <span>{{ formatTime(run.started_at) }}</span>
              <span v-if="run.finished_at">·</span>
              <span v-if="run.finished_at">{{ formatDuration(run) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Active/Selected run timeline -->
      <div class="lg:col-span-2 glass rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-headline font-semibold text-onSurface text-lg">
            <span v-if="store.isRunning" class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Live execution
            </span>
            <span v-else-if="selectedRunId">Run {{ selectedRunId.slice(0, 8) }}…</span>
            <span v-else class="text-onSurface-variant">Select a run</span>
          </h2>
          <span v-if="store.isRunning" class="text-xs font-label text-yellow-500 animate-pulse">Executing…</span>
        </div>

        <!-- Loading -->
        <div v-if="loadingRunDetail" class="space-y-3">
          <div v-for="n in 4" :key="n" class="h-12 bg-surface-high rounded-xl animate-pulse" />
        </div>

        <!-- No run selected -->
        <div v-else-if="!store.isRunning && !selectedRunId" class="text-center py-12 text-onSurface-variant">
          <p class="text-sm font-body">Select a run from the history or start a new execution.</p>
        </div>

        <!-- Timeline: live events or selected run log -->
        <div v-else class="space-y-2">
          <!-- Live events -->
          <template v-if="store.isRunning && store.liveEvents.length === 0">
            <div class="text-center py-8 text-onSurface-variant">
              <p class="text-sm font-body animate-pulse">Waiting for node events…</p>
            </div>
          </template>

          <template v-else>
            <div
              v-for="(event, idx) in (store.isRunning ? store.liveEvents : selectedRunLog)"
              :key="idx"
              class="border border-white/5 rounded-xl overflow-hidden"
            >
              <!-- Node row header (click to expand) -->
              <div
                class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-high transition-colors"
                @click="toggleExpand(event.node_id)"
              >
                <!-- Status icon -->
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  :class="nodeStatusIconClass(event)"
                >
                  <template v-if="event.status === 'success'">✓</template>
                  <template v-else-if="event.status === 'failed'">✗</template>
                  <template v-else>
                    <svg class="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </template>
                </span>

                <!-- Node name -->
                <span class="flex-1 font-label text-sm text-onSurface truncate">{{ event.node_name }}</span>

                <!-- Duration -->
                <span class="font-mono text-xs text-onSurface-variant">{{ event.duration_ms }}ms</span>

                <!-- Status badge -->
                <span
                  class="text-xs font-label px-2 py-0.5 rounded-full"
                  :class="statusBadgeClass(event.status)"
                >
                  {{ event.status }}
                </span>

                <!-- Expand indicator -->
                <svg
                  class="w-4 h-4 text-onSurface-variant transition-transform"
                  :class="{ 'rotate-180': expandedNodes.has(event.node_id) }"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <!-- Expanded: input/output/error -->
              <div
                v-if="expandedNodes.has(event.node_id)"
                class="px-4 pb-4 pt-2 space-y-3 border-t border-white/5"
              >
                <!-- Error -->
                <div v-if="event.error" class="bg-error/10 border border-error/30 rounded-lg px-3 py-2">
                  <p class="text-xs font-label text-error mb-1">Error</p>
                  <p class="text-xs font-mono text-error/80">{{ event.error }}</p>
                </div>

                <!-- Input -->
                <div v-if="event.input !== undefined">
                  <p class="text-xs font-label text-onSurface-variant mb-1 uppercase tracking-wide">Input</p>
                  <pre class="text-xs font-mono text-onSurface bg-surface rounded-lg px-3 py-2 max-h-48 overflow-auto">{{ formatJson(event.input) }}</pre>
                </div>

                <!-- Script Executed -->
                <div v-if="event.code">
                  <p class="text-xs font-label text-onSurface-variant mb-1 uppercase tracking-wide">Script Executed</p>
                  <pre class="text-xs font-mono text-onSurface bg-surface rounded-lg px-3 py-2 max-h-48 overflow-auto">{{ event.code }}</pre>
                </div>

                <!-- Output -->
                <div v-if="event.output !== undefined">
                  <p class="text-xs font-label text-onSurface-variant mb-1 uppercase tracking-wide">Output</p>
                  <pre class="text-xs font-mono text-onSurface bg-surface rounded-lg px-3 py-2 max-h-48 overflow-auto">{{ formatJson(event.output) }}</pre>
                </div>
              </div>
            </div>
          </template>

          <!-- Final output for completed runs -->
          <div v-if="!store.isRunning && selectedRunDetail?.final_output" class="border border-white/5 rounded-xl overflow-hidden">
            <div
              class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-high transition-colors"
              @click="toggleExpand('__final_output__')"
            >
              <span class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">⚡</span>
              <span class="flex-1 font-label text-sm text-onSurface">Final Output</span>
              <svg
                class="w-4 h-4 text-onSurface-variant transition-transform"
                :class="{ 'rotate-180': expandedNodes.has('__final_output__') }"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div
              v-if="expandedNodes.has('__final_output__')"
              class="px-4 pb-4 pt-2 border-t border-white/5"
            >
              <pre class="text-xs font-mono text-onSurface bg-surface rounded-lg px-3 py-2 max-h-48 overflow-auto">{{ formatJson(selectedRunDetail.final_output) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useFlowRunsStore, type RunSummary, type RunDetail } from '../stores/flowRuns';

const router = useRouter();
const route = useRoute();
const store = useFlowRunsStore();

const flowId = route.params.id as string;
const flowTitle = ref('');
const selectedRunId = ref<string | null>(null);
const selectedRunDetail = ref<RunDetail | null>(null);
const loadingRuns = ref(false);
const loadingRunDetail = ref(false);
const expandedNodes = ref<Set<string>>(new Set());

onMounted(async () => {
  loadingRuns.value = true;
  try {
    await store.fetchRuns(flowId);
    // Try to get flow title from the first run or use ID
    if (store.runs.length > 0) {
      flowTitle.value = `Flow ${flowId.slice(0, 8)}`;
    }
    // Check for ?run= query param
    const runParam = route.query.run as string;
    if (runParam) {
      selectedRunId.value = runParam;
      await loadRunDetail(runParam);
      // If still running, connect WS
      const run = store.runs.find((r) => r.id === runParam);
      if (run?.status === 'running') {
        store.connectWebSocket(runParam);
      }
    }
  } finally {
    loadingRuns.value = false;
  }
});

onUnmounted(() => {
  store.disconnectWebSocket();
});

watch(() => route.query.run, async (runId) => {
  if (runId && typeof runId === 'string') {
    selectedRunId.value = runId;
    await loadRunDetail(runId);
    if (store.runs.find((r) => r.id === runId)?.status === 'running') {
      store.connectWebSocket(runId);
    }
  }
});

async function handleRunNow() {
  try {
    const runId = await store.executeFlow(flowId);
    selectedRunId.value = runId;
    store.connectWebSocket(runId);
    // Refresh runs list
    await store.fetchRuns(flowId);
    // Update URL without navigation
    router.replace({ query: { run: runId } });
  } catch (err) {
    console.error('Failed to execute flow:', err);
  }
}

async function selectRun(run: RunSummary) {
  selectedRunId.value = run.id;
  await loadRunDetail(run.id);
  // If run is still running, connect WS
  if (run.status === 'running') {
    store.connectWebSocket(run.id);
  }
}

async function loadRunDetail(runId: string) {
  loadingRunDetail.value = true;
  try {
    await store.fetchRun(flowId, runId);
    selectedRunDetail.value = store.activeRun;
  } finally {
    loadingRunDetail.value = false;
  }
}

const selectedRunLog = computed(() => selectedRunDetail.value?.log ?? []);

function toggleExpand(nodeId: string) {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId);
  } else {
    expandedNodes.value.add(nodeId);
  }
  // Trigger reactivity
  expandedNodes.value = new Set(expandedNodes.value);
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'running':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'success':
      return 'bg-green-500/20 text-green-400';
    case 'failed':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-surface-high text-onSurface-variant';
  }
}

function nodeStatusIconClass(event: any): string {
  if (event.status === 'success') return 'bg-green-500/20 text-green-400';
  if (event.status === 'failed') return 'bg-red-500/20 text-red-400';
  return 'bg-yellow-500/20 text-yellow-400';
}

function formatTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDuration(run: RunSummary): string {
  if (!run.started_at || !run.finished_at) return '—';
  const ms = new Date(run.finished_at).getTime() - new Date(run.started_at).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatJson(val: unknown): string {
  if (val === undefined || val === null) return '—';
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
}
</script>
