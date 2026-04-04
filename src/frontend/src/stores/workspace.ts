import { defineStore } from 'pinia';
import { apiClient } from '../api/client';

export interface Project {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Subproject {
  id: string;
  project_id: string;
  tenant_id: string;
  name: string;
  description?: string;
  agent_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SubprojectWithDetails extends Subproject {
  project?: Project;
  agent?: {
    id: string;
    name: string;
    avatar_url?: string;
    provider: string;
    model: string;
  };
}

export interface AgentExecution {
  id: string;
  subproject_id: string;
  tenant_id: string;
  prompt: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
}

export interface AgentAction {
  id: string;
  execution_id: string;
  action_type: 'think' | 'tool_call' | 'message' | 'error';
  content: string;
  metadata_json?: string;
  created_at: string;
}

export interface AgentArtifact {
  id: string;
  execution_id: string;
  name: string;
  artifact_type: 'file' | 'code' | 'text' | 'json';
  content?: string;
  file_url?: string;
  created_at: string;
}

export const useWorkspaceStore = defineStore('workspace', {
  state: () => ({
    projects: [] as Project[],
    currentProject: null as Project | null,
    subprojects: [] as Subproject[],
    currentSubproject: null as SubprojectWithDetails | null,
    executions: [] as AgentExecution[],
    currentExecution: null as AgentExecution | null,
    actions: [] as AgentAction[],
    artifacts: [] as AgentArtifact[],
    loading: false,
    error: null as string | null,
    // Panel state
    rightPanelCollapsed: false,
    promptText: '',
    isRecording: false,
    isExecuting: false,
  }),

  getters: {
    activeProjects: (state) => state.projects.filter(p => p.status === 'active'),
    hasRunningExecution: (state) => state.currentExecution?.status === 'running',
    currentAgent: (state) => state.currentSubproject?.agent,
  },

  actions: {
    // Projects
    async fetchProjects() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get<{ items: Project[]; total: number }>('/api/v1/workspace/projects');
        this.projects = response.items;
      } catch (err: any) {
        this.error = err?.detail || 'Failed to fetch projects';
      } finally {
        this.loading = false;
      }
    },

    async createProject(data: { name: string; description?: string }) {
      this.loading = true;
      try {
        const project = await apiClient.post<Project>('/api/v1/workspace/projects', data);
        this.projects.unshift(project);
        return project;
      } catch (err: any) {
        this.error = err?.detail || 'Failed to create project';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Subprojects
    async fetchSubprojects(projectId?: string) {
      this.loading = true;
      this.error = null;
      try {
        const url = projectId 
          ? `/api/v1/workspace/subprojects?project_id=${projectId}`
          : '/api/v1/workspace/subprojects';
        const response = await apiClient.get<{ items: Subproject[]; total: number }>(url);
        this.subprojects = response.items;
      } catch (err: any) {
        this.error = err?.detail || 'Failed to fetch subprojects';
      } finally {
        this.loading = false;
      }
    },

    async fetchSubprojectDetails(subprojectId: string) {
      this.loading = true;
      try {
        const subproject = await apiClient.get<SubprojectWithDetails>(`/api/v1/workspace/subprojects/${subprojectId}`);
        this.currentSubproject = subproject;
        if (subproject.project) {
          this.currentProject = subproject.project;
        }
        return subproject;
      } catch (err: any) {
        this.error = err?.detail || 'Failed to fetch subproject details';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createSubproject(data: { project_id: string; name: string; description?: string; agent_id?: string }) {
      this.loading = true;
      try {
        const subproject = await apiClient.post<Subproject>('/api/v1/workspace/subprojects', data);
        this.subprojects.unshift(subproject);
        return subproject;
      } catch (err: any) {
        this.error = err?.detail || 'Failed to create subproject';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Executions
    async fetchExecutions(subprojectId: string) {
      try {
        const response = await apiClient.get<{ items: AgentExecution[]; total: number }>(
          `/api/v1/workspace/subprojects/${subprojectId}/executions`
        );
        this.executions = response.items;
        // Set current execution to the most recent running or completed one
        const running = response.items.find(e => e.status === 'running');
        if (running) {
          this.currentExecution = running;
        } else if (response.items.length > 0) {
          this.currentExecution = response.items[0];
        }
      } catch (err: any) {
        console.error('Failed to fetch executions:', err);
      }
    },

    async createExecution(subprojectId: string, prompt: string) {
      this.isExecuting = true;
      try {
        const execution = await apiClient.post<AgentExecution>(
          `/api/v1/workspace/subprojects/${subprojectId}/executions`,
          { subproject_id: subprojectId, prompt }
        );
        this.currentExecution = execution;
        this.executions.unshift(execution);
        this.promptText = '';
        return execution;
      } catch (err: any) {
        this.error = err?.detail || 'Failed to start execution';
        throw err;
      } finally {
        this.isExecuting = false;
      }
    },

    // Actions (streaming updates)
    async fetchActions(executionId: string) {
      try {
        const actions = await apiClient.get<AgentAction[]>(
          `/api/v1/workspace/executions/${executionId}/actions`
        );
        this.actions = actions;
      } catch (err: any) {
        console.error('Failed to fetch actions:', err);
      }
    },

    addAction(action: AgentAction) {
      this.actions.push(action);
    },

    // Artifacts
    async fetchArtifacts(executionId: string) {
      try {
        const artifacts = await apiClient.get<AgentArtifact[]>(
          `/api/v1/workspace/executions/${executionId}/artifacts`
        );
        this.artifacts = artifacts;
      } catch (err: any) {
        console.error('Failed to fetch artifacts:', err);
      }
    },

    addArtifact(artifact: AgentArtifact) {
      this.artifacts.push(artifact);
    },

    // UI State
    toggleRightPanel() {
      this.rightPanelCollapsed = !this.rightPanelCollapsed;
    },

    setPromptText(text: string) {
      this.promptText = text;
    },

    toggleRecording() {
      this.isRecording = !this.isRecording;
    },

    clearWorkspace() {
      this.currentProject = null;
      this.currentSubproject = null;
      this.currentExecution = null;
      this.actions = [];
      this.artifacts = [];
      this.promptText = '';
    },

    newSession() {
      this.currentExecution = null;
      this.actions = [];
      this.artifacts = [];
      this.promptText = '';
      this.isExecuting = false;
    },
  },
});
