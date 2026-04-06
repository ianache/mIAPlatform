import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiClient } from '../api/client';

export interface NodeEvent {
  node_id: string;
  node_name: string;
  status: 'success' | 'failed';
  duration_ms: number;
  input?: unknown;
  output?: unknown;
  error?: string;
  timestamp: string;
}
export interface RunSummary {
  id: string;
  status: 'running' | 'success' | 'failed';
  trigger: string;
  started_at: string;
  finished_at?: string;
  final_output?: unknown;
}
export interface RunDetail extends RunSummary {
  log: NodeEvent[];
}

export const useFlowRunsStore = defineStore('flowRuns', () => {
  const runs = ref<RunSummary[]>([]);
  const activeRun = ref<RunDetail | null>(null);
  const liveEvents = ref<NodeEvent[]>([]); // events from current WS session
  const isRunning = ref(false);
  const error = ref<string | null>(null);
  let _ws: WebSocket | null = null;

  async function fetchRuns(flowId: string) {
    const data = await apiClient.get<{ items: RunSummary[] }>(`/api/v1/library/flows/${flowId}/runs`);
    runs.value = data.items ?? (data as unknown as RunSummary[]);
  }

  async function fetchRun(flowId: string, runId: string) {
    const data = await apiClient.get<RunDetail>(`/api/v1/library/flows/${flowId}/runs/${runId}`);
    activeRun.value = data;
  }

  async function executeFlow(flowId: string): Promise<string> {
    isRunning.value = true;
    liveEvents.value = [];
    error.value = null;
    const result = await apiClient.post<{ run_id: string; status: string }>(`/api/v1/library/flows/${flowId}/execute`, {});
    return result.run_id;
  }

  function connectWebSocket(runId: string) {
    disconnectWebSocket();
    const token = localStorage.getItem('mia_access_token') ?? '';
    const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
    const wsUrl = baseUrl.replace(/^http/, 'ws') + `/api/v1/library/runs/ws/${runId}?token=${token}`;
    _ws = new WebSocket(wsUrl);

    _ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'node_complete' || msg.type === 'node_failed') {
        liveEvents.value.push(msg as NodeEvent);
      }
      if (msg.type === 'run_complete' || msg.type === 'run_failed') {
        isRunning.value = false;
        if (msg.type === 'run_failed') error.value = msg.error;
        disconnectWebSocket();
      }
    };
    _ws.onerror = () => { isRunning.value = false; };
    _ws.onclose = () => { /* no-op */ };
  }

  function disconnectWebSocket() {
    if (_ws) { _ws.close(); _ws = null; }
  }

  return { runs, activeRun, liveEvents, isRunning, error, fetchRuns, fetchRun, executeFlow, connectWebSocket, disconnectWebSocket };
});
