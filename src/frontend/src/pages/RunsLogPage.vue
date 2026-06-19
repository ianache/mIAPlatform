<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-sm font-label text-onSurface-variant">
        <button class="hover:text-onSurface transition-colors" @click="router.push('/library')">Knowledge</button>
        <span>/</span>
        <span class="text-onSurface font-semibold">Runs Log</span>
      </div>
    </div>

    <!-- Error banner -->
    <div
      v-if="error"
      class="bg-surface-high rounded-lg px-5 py-3 text-error font-label text-sm flex items-center gap-3"
    >
      <span class="w-2 h-2 rounded-full bg-error shrink-0" />
      {{ error }}
    </div>

    <!-- Filters -->
    <div class="glass rounded-2xl p-6">
      <div class="flex items-center gap-4 flex-wrap">
        <!-- Flow Filter -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs text-onSurface-variant font-label uppercase tracking-wider mb-2">Flow</label>
          <select
            v-model="selectedFlowId"
            class="w-full bg-surface-high rounded-lg px-3 py-2 text-sm font-label text-onSurface focus:outline-none focus:ring-2 focus:ring-primary border border-surface-high"
          >
            <option value="">All flows</option>
            <option v-for="flow in flows" :key="flow.id" :value="flow.id">
              {{ flow.name }}
            </option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="w-40">
          <label class="block text-xs text-onSurface-variant font-label uppercase tracking-wider mb-2">Status</label>
          <select
            v-model="selectedStatus"
            class="w-full bg-surface-high rounded-lg px-3 py-2 text-sm font-label text-onSurface focus:outline-none focus:ring-2 focus:ring-primary border border-surface-high"
          >
            <option value="">All</option>
            <option value="running">Running</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <!-- Clear Filters -->
        <div class="flex items-end">
          <button
            v-if="selectedFlowId || selectedStatus"
            class="px-4 py-2 rounded-lg text-sm font-label text-onSurface-variant hover:bg-surface-high transition-colors"
            @click="clearFilters"
          >
            Clear filters
          </button>
        </div>
      </div>
    </div>

    <!-- Runs List -->
    <div class="glass rounded-2xl overflow-hidden">
      <!-- Loading -->
      <div v-if="loading" class="p-8 text-center">
        <svg class="animate-spin w-8 h-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-onSurface-variant mt-4 font-label">Loading runs...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredRuns.length === 0" class="p-12 text-center">
        <div class="w-16 h-16 rounded-full bg-surface-high mx-auto mb-4 flex items-center justify-center">
          <svg class="w-8 h-8 text-onSurface-variant opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="text-onSurface-variant font-label">No runs found</p>
        <p class="text-onSurface-variant/60 text-sm mt-1">Try adjusting your filters or run a flow from the Library</p>
      </div>

      <!-- Runs Table -->
      <table v-else class="w-full">
        <thead class="bg-surface-high/50 border-b border-surface-high">
          <tr>
            <th class="text-left px-6 py-4 text-xs font-label text-onSurface-variant uppercase tracking-wider">Run ID</th>
            <th class="text-left px-6 py-4 text-xs font-label text-onSurface-variant uppercase tracking-wider">Flow</th>
            <th class="text-left px-6 py-4 text-xs font-label text-onSurface-variant uppercase tracking-wider">Status</th>
            <th class="text-left px-6 py-4 text-xs font-label text-onSurface-variant uppercase tracking-wider">Started</th>
            <th class="text-left px-6 py-4 text-xs font-label text-onSurface-variant uppercase tracking-wider">Duration</th>
            <th class="text-left px-6 py-4 text-xs font-label text-onSurface-variant uppercase tracking-wider">Trigger</th>
            <th class="text-right px-6 py-4 text-xs font-label text-onSurface-variant uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-high">
          <tr
            v-for="run in paginatedRuns"
            :key="run.id"
            class="hover:bg-surface-high/30 transition-colors cursor-pointer"
            @click="selectRun(run)"
          >
            <td class="px-6 py-4">
              <span class="font-mono text-sm text-onSurface">{{ run.id.slice(0, 8) }}...</span>
            </td>
            <td class="px-6 py-4">
              <span class="font-label text-sm text-onSurface">{{ getFlowName(run.flow_id) }}</span>
            </td>
            <td class="px-6 py-4">
              <span
                class="inline-flex items-center gap-1.5 text-xs font-label px-2.5 py-1 rounded-full"
                :class="statusBadgeClass(run.status)"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(run.status)" />
                {{ run.status }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="font-mono text-xs text-onSurface-variant">{{ formatTime(run.started_at) }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="font-mono text-xs text-onSurface-variant">{{ formatDuration(run) }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="text-xs text-onSurface-variant">{{ run.trigger || 'manual' }}</span>
            </td>
            <td class="px-6 py-4 text-right">
              <button
                class="p-2 rounded-lg text-onSurface-variant hover:bg-surface-high transition-colors"
                @click.stop="viewRunLogs(run)"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-surface-high flex items-center justify-between">
        <span class="text-xs text-onSurface-variant font-label">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredRuns.length) }} of {{ filteredRuns.length }} runs
        </span>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-label text-onSurface-variant hover:bg-surface-high transition-colors disabled:opacity-50"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Previous
          </button>
          <span class="text-xs text-onSurface-variant font-label">Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-label text-onSurface-variant hover:bg-surface-high transition-colors disabled:opacity-50"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Run Detail Modal -->
    <div v-if="selectedRun" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" @click.self="selectedRun = null">
      <div class="glass rounded-2xl w-[1000px] max-w-[95vw] max-h-[85vh] overflow-hidden flex flex-col border border-surface-high">
        <div class="p-6 border-b border-surface-high flex items-center justify-between shrink-0">
          <div>
            <h2 class="text-xl font-headline font-semibold text-onSurface">Run Details</h2>
            <p class="text-sm text-onSurface-variant font-mono mt-1">{{ selectedRun.id }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="text-xs font-label px-3 py-1 rounded-full"
              :class="statusBadgeClass(selectedRun.status)"
            >
              {{ selectedRun.status }}
            </span>
            <button
              class="p-2 rounded-lg text-onSurface-variant hover:bg-surface-high transition-colors"
              @click="selectedRun = null"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Run Info -->
        <div class="px-6 py-4 border-b border-surface-high bg-surface-high/30 flex items-center gap-6 text-sm shrink-0">
          <div>
            <span class="text-onSurface-variant font-label">Flow:</span>
            <span class="ml-2 text-onSurface font-label">{{ getFlowName(selectedRun.flow_id) }}</span>
          </div>
          <div>
            <span class="text-onSurface-variant font-label">Started:</span>
            <span class="ml-2 text-onSurface font-mono">{{ formatTime(selectedRun.started_at) }}</span>
          </div>
          <div>
            <span class="text-onSurface-variant font-label">Duration:</span>
            <span class="ml-2 text-onSurface font-mono">{{ formatDuration(selectedRun) }}</span>
          </div>
          <div>
            <span class="text-onSurface-variant font-label">Trigger:</span>
            <span class="ml-2 text-onSurface font-label">{{ selectedRun.trigger || 'manual' }}</span>
          </div>
        </div>

        <!-- Node Execution Timeline -->
        <div class="flex-1 overflow-y-auto p-6">
          <h3 class="text-sm font-label text-onSurface-variant uppercase tracking-wider mb-4">Node Execution Log</h3>
          
          <div v-if="selectedRun.log && selectedRun.log.length > 0" class="space-y-3">
            <div
              v-for="(event, idx) in selectedRun.log"
              :key="idx"
              class="border border-surface-high rounded-xl overflow-hidden"
            >
              <!-- Node Row Header (click to expand) -->
              <div
                class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-high/50 transition-colors"
                :class="{ 'border-l-4': event.status === 'success' ? 'border-l-green-500' : event.status === 'failed' ? 'border-l-red-500' : 'border-l-yellow-500' }"
                @click="toggleNodeExpand(event.node_id)"
              >
                <!-- Status Icon -->
                <span
                  class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  :class="event.status === 'success' ? 'bg-green-500/20 text-green-400' : event.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'"
                >
                  <template v-if="event.status === 'success'">✓</template>
                  <template v-else-if="event.status === 'failed'">✗</template>
                  <template v-else>
                    <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </template>
                </span>

                <!-- Node Name -->
                <span class="flex-1 font-label text-sm text-onSurface">{{ event.node_name || 'Unknown Node' }}</span>

                <!-- Duration -->
                <span class="font-mono text-xs text-onSurface-variant">{{ event.duration_ms }}ms</span>

                <!-- Status Badge -->
                <span
                  class="text-xs font-label px-2 py-0.5 rounded-full"
                  :class="statusBadgeClass(event.status)"
                >
                  {{ event.status }}
                </span>

                <!-- Expand Indicator -->
                <svg
                  class="w-4 h-4 text-onSurface-variant transition-transform"
                  :class="{ 'rotate-180': expandedNodes.has(event.node_id) }"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <!-- Expanded: Input/Output JSON Viewers -->
              <div
                v-if="expandedNodes.has(event.node_id)"
                class="px-4 pb-4 pt-2 border-t border-surface-high/50"
              >
                <!-- Error -->
                <div v-if="event.error" class="mb-4 bg-error/10 border border-error/30 rounded-lg px-3 py-2">
                  <p class="text-xs font-label text-error mb-1">Error</p>
                  <pre class="text-xs font-mono text-error/80 whitespace-pre-wrap">{{ event.error }}</pre>
                </div>

                <!-- Script Executed -->
                <div v-if="event.code" class="mb-4">
                  <p class="text-xs font-label text-onSurface-variant mb-2 uppercase tracking-wide">Script Executed</p>
                  <div class="bg-surface-high/30 rounded-lg border border-surface-high p-3 max-h-60 overflow-auto font-mono text-xs text-onSurface whitespace-pre-wrap">{{ event.code }}</div>
                </div>

                <!-- Input/Output Grid -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- Input -->
                  <div>
                    <p class="text-xs font-label text-onSurface-variant mb-2 uppercase tracking-wide">Input</p>
                    <div class="bg-surface-high/30 rounded-lg border border-surface-high p-3 max-h-64 overflow-auto">
                      <pre class="text-xs font-mono text-onSurface whitespace-pre-wrap">{{ formatJson(event.input) }}</pre>
                    </div>
                  </div>
                  <!-- Output -->
                  <div>
                    <p class="text-xs font-label text-onSurface-variant mb-2 uppercase tracking-wide">Output</p>
                    <div class="bg-surface-high/30 rounded-lg border border-surface-high p-3 max-h-64 overflow-auto">
                      <pre class="text-xs font-mono text-onSurface whitespace-pre-wrap">{{ formatJson(event.output) }}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-onSurface-variant">
            <p class="text-sm font-label">No log entries for this run</p>
          </div>

          <!-- Final Output (⚡ icon) -->
          <div v-if="selectedRun.final_output" class="mt-6 border border-surface-high rounded-xl overflow-hidden">
            <!-- Final Output Header -->
            <div
              class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-high/50 transition-colors"
              @click="toggleNodeExpand('__final_output__')"
            >
              <span class="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                ⚡
              </span>
              <span class="flex-1 font-label text-sm text-onSurface">Final Output</span>
              <svg
                class="w-4 h-4 text-onSurface-variant transition-transform"
                :class="{ 'rotate-180': expandedNodes.has('__final_output__') }"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <!-- Expanded Final Output -->
            <div
              v-if="expandedNodes.has('__final_output__')"
              class="px-4 pb-4 pt-2 border-t border-surface-high/50"
            >
              <div class="bg-surface-high/30 rounded-lg border border-surface-high p-4 max-h-80 overflow-auto">
                <pre class="text-xs font-mono text-onSurface whitespace-pre-wrap">{{ formatJson(selectedRun.final_output) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiClient } from '../api/client';

const router = useRouter();

interface Run {
  id: string;
  flow_id: string;
  status: 'running' | 'success' | 'failed';
  trigger: string;
  started_at: string;
  finished_at?: string;
  final_output?: unknown;
  log?: Array<{
    node_id: string;
    node_name: string;
    status: string;
    duration_ms: number;
    input?: unknown;
    output?: unknown;
    error?: string;
    code?: string | null;
    timestamp: string;
  }>;
}

interface Flow {
  id: string;
  name: string;
}

const loading = ref(false);
const error = ref<string | null>(null);
const runs = ref<Run[]>([]);
const flows = ref<Flow[]>([]);
const selectedFlowId = ref('');
const selectedStatus = ref('');
const selectedRun = ref<Run | null>(null);
const expandedNodes = ref<Set<string>>(new Set());
const currentPage = ref(1);
const pageSize = 20;

const filteredRuns = computed(() => {
  let result = runs.value;

  if (selectedFlowId.value) {
    result = result.filter(r => r.flow_id === selectedFlowId.value);
  }

  if (selectedStatus.value) {
    result = result.filter(r => r.status === selectedStatus.value);
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredRuns.value.length / pageSize));

const paginatedRuns = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredRuns.value.slice(start, start + pageSize);
});

onMounted(async () => {
  await fetchRuns();
  await fetchFlows();
});

async function fetchRuns() {
  loading.value = true;
  error.value = null;
  try {
    // Fetch all flows first to get their runs
    const flowsResponse = await apiClient.get<{ items: Flow[] }>('/api/v1/library/flows');
    const flowsList = flowsResponse.items || [];
    flows.value = flowsList;

    const allRuns: Run[] = [];
    for (const flow of flowsList) {
      try {
        const response = await apiClient.get<{ items: Run[] }>(`/api/v1/library/flows/${flow.id}/runs`);
        if (response.items) {
          allRuns.push(...response.items.map(r => ({ ...r, flow_id: flow.id })));
        }
      } catch {
        // Skip flows that fail
      }
    }

    // Sort by started_at descending
    allRuns.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    runs.value = allRuns;
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch runs';
  } finally {
    loading.value = false;
  }
}

async function fetchFlows() {
  try {
    const response = await apiClient.get<{ items: Flow[] }>('/api/v1/library/flows');
    flows.value = response.items || [];
  } catch (err) {
    console.error('Failed to fetch flows:', err);
  }
}

function getFlowName(flowId: string): string {
  return flows.value.find(f => f.id === flowId)?.name || flowId.slice(0, 8);
}

function selectRun(run: Run) {
  selectedRun.value = run;
  expandedNodes.value = new Set();
  fetchRunDetails(run);
}

async function viewRunLogs(run: Run) {
  selectedRun.value = run;
  expandedNodes.value = new Set();
  fetchRunDetails(run);
}

async function fetchRunDetails(run: Run) {
  try {
    const flowId = run.flow_id;
    const runId = run.id;
    const response = await apiClient.get<Run>(`/api/v1/library/flows/${flowId}/runs/${runId}`);
    if (response && response.log) {
      selectedRun.value = { ...selectedRun.value, ...response, flow_id: flowId };
    }
  } catch (err) {
    console.error('Failed to fetch run details:', err);
  }
}

function toggleNodeExpand(nodeId: string) {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId);
  } else {
    expandedNodes.value.add(nodeId);
  }
  expandedNodes.value = new Set(expandedNodes.value);
}

function clearFilters() {
  selectedFlowId.value = '';
  selectedStatus.value = '';
  currentPage.value = 1;
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'running': return 'bg-yellow-500/20 text-yellow-400';
    case 'success': return 'bg-green-500/20 text-green-400';
    case 'failed': return 'bg-red-500/20 text-red-400';
    default: return 'bg-surface-high text-onSurface-variant';
  }
}

function statusDotClass(status: string): string {
  switch (status) {
    case 'running': return 'bg-yellow-400 animate-pulse';
    case 'success': return 'bg-green-400';
    case 'failed': return 'bg-red-400';
    default: return 'bg-surface-high';
  }
}

function formatTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatDuration(run: Run): string {
  if (!run.started_at || !run.finished_at) return '—';
  const ms = new Date(run.finished_at).getTime() - new Date(run.started_at).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatJson(val: unknown): string {
  if (!val) return '—';
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
}
</script>
