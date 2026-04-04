import { defineStore } from 'pinia';
import { apiClient } from '../api/client';
import { useAuthStore } from './auth';
import type { Artifact } from '../types/index';

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

export interface ChatMessage {
  id: string;
  session_id: string;
  sequence_number: number;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  message_metadata: Record<string, any>;
  injected_metadata: Record<string, any>;
  created_at: string;
}

export interface ChatSession {
  id: string;
  tenant_id: string;
  subproject_id: string;
  agent_id: string;
  session_code: string;
  title: string;
  status: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface MetadataProperty {
  key: string;
  value: any;
}

export interface AgentStep {
  id: string;
  step_type: 'thinking' | 'tool_call' | 'tool_result' | 'tool_error' | 'generating' | 'llm_request' | 'user_input_required';
  message: string;
  timestamp: string;
  tool_name?: string;
  tool_args?: Record<string, any>;
  result?: string;
  error?: string;
  model?: string;
}

export const useWorkspaceStore = defineStore('workspace', {
  state: () => ({
    projects: [] as Project[],
    currentProject: null as Project | null,
    subprojects: [] as Subproject[],
    currentSubproject: null as SubprojectWithDetails | null,
    // Chat state
    chatSession: null as ChatSession | null,
    chatMessages: [] as ChatMessage[],
    sessionCode: '' as string,
    lastAssistantMessageId: null as string | null,
    // UI state
    loading: false,
    error: null as string | null,
    rightPanelCollapsed: false,
    promptText: '',
    isRecording: false,
    isExecuting: false,
    // Streaming
    streamingContent: '' as string,
    isStreaming: false,
    // Artifacts
    sessionArtifacts: [] as Artifact[],
    // Agent steps for activity panel
    agentSteps: [] as AgentStep[],
  }),

  getters: {
    activeProjects: (state) => state.projects.filter(p => p.status === 'active'),
    hasRunningExecution: (state) => state.isExecuting || state.isStreaming,
    currentAgent: (state) => state.currentSubproject?.agent,
    messagesForDisplay: (state) => state.chatMessages,
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
      console.log('Store: fetchSubprojectDetails called with:', subprojectId);
      this.loading = true;
      try {
        const subproject = await apiClient.get<SubprojectWithDetails>(`/api/v1/workspace/subprojects/${subprojectId}`);
        console.log('Store: Received subproject:', subproject.name, 'ID:', subproject.id);
        if (subproject.id !== subprojectId) {
          console.error('Store: ID MISMATCH! Requested:', subprojectId, 'Received:', subproject.id);
        }
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

    // Chat functionality
    async fetchChatSession(sessionCode: string) {
      try {
        const session = await apiClient.get<ChatSession>(`/api/v1/chat/sessions/${sessionCode}`);
        this.chatSession = session;
        this.sessionCode = sessionCode;
        return session;
      } catch (err: any) {
        console.error('Failed to fetch chat session:', err);
        return null;
      }
    },

    async fetchChatMessages(sessionCode: string) {
      try {
        const messages = await apiClient.get<ChatMessage[]>(`/api/v1/chat/sessions/${sessionCode}/messages`);
        this.chatMessages = messages;
        return messages;
      } catch (err: any) {
        console.error('Failed to fetch chat messages:', err);
        return [];
      }
    },

    async fetchSessionArtifacts(sessionCode: string) {
      try {
        const artifacts = await apiClient.get<Artifact[]>(`/api/v1/chat/sessions/${sessionCode}/artifacts`);
        this.sessionArtifacts = artifacts;
        return artifacts;
      } catch (err: any) {
        console.error('Failed to fetch session artifacts:', err);
        return [];
      }
    },

    async fetchSubprojectArtifacts(subprojectId: string) {
      console.log('Store: Fetching subproject artifacts for:', subprojectId);
      try {
        const url = `/api/v1/chat/subprojects/${subprojectId}/artifacts`;
        console.log('Store: Calling API:', url);
        const artifacts = await apiClient.get<Artifact[]>(url);
        console.log('Store: Received artifacts:', artifacts.length);
        this.sessionArtifacts = artifacts;
        return artifacts;
      } catch (err: any) {
        console.error('Store: Failed to fetch subproject artifacts:', err);
        return [];
      }
    },

    async sendChatMessage(
      message: string, 
      metadata: MetadataProperty[] = [],
      onChunk?: (chunk: any) => void
    ) {
      if (!this.currentSubproject?.agent) {
        throw new Error('No agent assigned to subproject');
      }

      this.isExecuting = true;
      this.isStreaming = true;
      this.streamingContent = '';

      try {
        // Add user message immediately to UI
        const userMessage: ChatMessage = {
          id: 'temp-' + Date.now(),
          session_id: this.chatSession?.id || '',
          sequence_number: this.chatMessages.length + 1,
          role: 'user',
          content: message,
          message_metadata: {},
          injected_metadata: metadata.reduce((acc, m) => ({ ...acc, [m.key]: m.value }), {}),
          created_at: new Date().toISOString(),
        };
        this.chatMessages.push(userMessage);

        // Prepare request - use agent_id (UUID from database)
        const agentId = this.currentSubproject.agent?.id;
        console.log('Agent ID being sent:', agentId);
        console.log('Agent object:', this.currentSubproject.agent);
        
        if (!agentId) {
          throw new Error('No agent_id available for subproject');
        }
        
        const requestBody = {
          session_code: this.sessionCode || 'new',
          agent_id: agentId,
          message: message,
          metadata: metadata,
          stream: true,
        };
        
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        // Make streaming request with token refresh support
        const authStore = useAuthStore();
        let response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/chat/send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('mia_access_token')}`,
            },
            body: JSON.stringify(requestBody),
          }
        );

        // Handle token expiration
        if (response.status === 401) {
          console.log('Token expired, attempting refresh...');
          const refreshed = await authStore.refreshAccessToken();
          if (refreshed) {
            console.log('Token refreshed successfully, retrying request...');
            // Retry with new token
            response = await fetch(
              `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/chat/send`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('mia_access_token')}`,
                },
                body: JSON.stringify(requestBody),
              }
            );
          } else {
            console.error('Token refresh failed, redirecting to login...');
            throw new Error('Session expired. Please log in again.');
          }
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('Chat request failed:', response.status, errorText);
          throw new Error(`Failed to send message: ${response.status}`);
        }

        // Capture session code from response headers (for new sessions)
        const newSessionCode = response.headers.get('X-Session-Code');
        if (newSessionCode && (!this.sessionCode || this.sessionCode === 'new')) {
          console.log('New session created:', newSessionCode);
          this.sessionCode = newSessionCode;
        }

        // Read stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'content') {
                    assistantContent += data.content || '';
                    this.streamingContent = assistantContent;
                    if (onChunk) onChunk(data);
                  } else if (data.type === 'step') {
                    // Agent step event (thinking, tool_call, tool_result, etc.)
                    try {
                      const stepData = JSON.parse(data.content);
                      const step: AgentStep = {
                        id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        step_type: stepData.step_type,
                        message: stepData.message,
                        timestamp: stepData.timestamp || new Date().toISOString(),
                        tool_name: stepData.tool_name,
                        tool_args: stepData.tool_args,
                        result: stepData.result,
                        error: stepData.error,
                        model: stepData.model,
                      };
                      this.agentSteps.push(step);
                    } catch (e) {
                      console.error('Failed to parse step event:', e);
                    }
                  } else if (data.type === 'artifact') {
                    // New artifact created
                    try {
                      const a = JSON.parse(data.content);
                      this.sessionArtifacts.unshift(a);
                      // Sort artifacts by creation date (newest first)
                      this.sessionArtifacts.sort((a, b) => 
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                      );
                    } catch {}
                  } else if (data.type === 'done') {
                    this.isStreaming = false;
                    // Store the message ID from the backend
                    if (data.content) {
                      this.lastAssistantMessageId = data.content;
                    }
                  } else if (data.type === 'error') {
                    console.error('Stream error:', data.content);
                    this.isStreaming = false;
                  }
                } catch (e) {
                  // Ignore parse errors for incomplete chunks
                }
              }
            }
          }
        }

        // Clear streaming content since message is saved in backend
        this.streamingContent = '';
        
        // Always add the assistant message to the UI with the accumulated content
        if (assistantContent) {
          const assistantMessage: ChatMessage = {
            id: this.lastAssistantMessageId || 'assistant-' + Date.now(),
            session_id: this.chatSession?.id || '',
            sequence_number: this.chatMessages.length + 1,
            role: 'assistant',
            content: assistantContent,
            message_metadata: { model: this.currentSubproject.agent.model },
            injected_metadata: {},
            created_at: new Date().toISOString(),
          };
          this.chatMessages.push(assistantMessage);
        }

        // Clear prompt
        this.promptText = '';
        this.lastAssistantMessageId = null;

        return this.chatMessages[this.chatMessages.length - 1];
      } catch (err: any) {
        this.error = err?.message || 'Failed to send message';
        throw err;
      } finally {
        this.isExecuting = false;
        this.isStreaming = false;
      }
    },

    // Legacy compatibility - redirect to chat
    async createExecution(subprojectId: string, prompt: string) {
      // This now uses the chat system
      return this.sendChatMessage(prompt);
    },

    // Legacy compatibility
    async fetchActions(executionId: string) {
      // No-op - chat system handles this differently
      return [];
    },

    async fetchArtifacts(executionId: string) {
      // No-op - artifacts are handled differently in chat
      return [];
    },

    addMessage(message: ChatMessage) {
      this.chatMessages.push(message);
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
      this.chatSession = null;
      this.chatMessages = [];
      this.sessionCode = '';
      this.promptText = '';
      this.streamingContent = '';
    },

    newSession() {
      this.chatSession = null;
      this.chatMessages = [];
      this.sessionCode = '';
      this.promptText = '';
      this.isExecuting = false;
      this.isStreaming = false;
      this.streamingContent = '';
      this.sessionArtifacts = [];
      this.agentSteps = [];
    },
  },
});
