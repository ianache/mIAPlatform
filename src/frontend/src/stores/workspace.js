import { defineStore } from 'pinia';
import { apiClient } from '../api/client';
import { useAuthStore } from './auth';
export const useWorkspaceStore = defineStore('workspace', {
    state: () => ({
        projects: [],
        currentProject: null,
        subprojects: [],
        currentSubproject: null,
        // Chat state
        chatSession: null,
        chatMessages: [],
        sessionCode: '',
        lastAssistantMessageId: null,
        // UI state
        loading: false,
        error: null,
        rightPanelCollapsed: false,
        promptText: '',
        isRecording: false,
        isExecuting: false,
        // Streaming
        streamingContent: '',
        isStreaming: false,
        // Artifacts
        sessionArtifacts: [],
        // Agent steps for activity panel
        agentSteps: [],
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
                const response = await apiClient.get('/api/v1/workspace/projects');
                this.projects = response.items;
            }
            catch (err) {
                this.error = err?.detail || 'Failed to fetch projects';
            }
            finally {
                this.loading = false;
            }
        },
        async createProject(data) {
            this.loading = true;
            try {
                const project = await apiClient.post('/api/v1/workspace/projects', data);
                this.projects.unshift(project);
                return project;
            }
            catch (err) {
                this.error = err?.detail || 'Failed to create project';
                throw err;
            }
            finally {
                this.loading = false;
            }
        },
        // Subprojects
        async fetchSubprojects(projectId) {
            this.loading = true;
            this.error = null;
            try {
                const url = projectId
                    ? `/api/v1/workspace/subprojects?project_id=${projectId}`
                    : '/api/v1/workspace/subprojects';
                const response = await apiClient.get(url);
                this.subprojects = response.items;
            }
            catch (err) {
                this.error = err?.detail || 'Failed to fetch subprojects';
            }
            finally {
                this.loading = false;
            }
        },
        async fetchSubprojectDetails(subprojectId) {
            this.loading = true;
            try {
                const subproject = await apiClient.get(`/api/v1/workspace/subprojects/${subprojectId}`);
                this.currentSubproject = subproject;
                if (subproject.project) {
                    this.currentProject = subproject.project;
                }
                return subproject;
            }
            catch (err) {
                this.error = err?.detail || 'Failed to fetch subproject details';
                throw err;
            }
            finally {
                this.loading = false;
            }
        },
        async createSubproject(data) {
            this.loading = true;
            try {
                const subproject = await apiClient.post('/api/v1/workspace/subprojects', data);
                this.subprojects.unshift(subproject);
                return subproject;
            }
            catch (err) {
                this.error = err?.detail || 'Failed to create subproject';
                throw err;
            }
            finally {
                this.loading = false;
            }
        },
        // Chat functionality
        async fetchChatSession(sessionCode) {
            try {
                const session = await apiClient.get(`/api/v1/chat/sessions/${sessionCode}`);
                this.chatSession = session;
                this.sessionCode = sessionCode;
                return session;
            }
            catch (err) {
                console.error('Failed to fetch chat session:', err);
                return null;
            }
        },
        async fetchChatMessages(sessionCode) {
            try {
                const messages = await apiClient.get(`/api/v1/chat/sessions/${sessionCode}/messages`);
                this.chatMessages = messages;
                return messages;
            }
            catch (err) {
                console.error('Failed to fetch chat messages:', err);
                return [];
            }
        },
        async fetchSessionArtifacts(sessionCode) {
            try {
                const artifacts = await apiClient.get(`/api/v1/chat/sessions/${sessionCode}/artifacts`);
                this.sessionArtifacts = artifacts;
                return artifacts;
            }
            catch (err) {
                console.error('Failed to fetch session artifacts:', err);
                return [];
            }
        },
        async fetchSubprojectArtifacts(subprojectId) {
            try {
                const url = `/api/v1/chat/subprojects/${subprojectId}/artifacts`;
                const artifacts = await apiClient.get(url);
                this.sessionArtifacts = artifacts;
                return artifacts;
            }
            catch (err) {
                console.error('Failed to fetch subproject artifacts:', err);
                return [];
            }
        },
        async sendChatMessage(message, metadata = [], onChunk) {
            if (!this.currentSubproject?.agent) {
                throw new Error('No agent assigned to subproject');
            }
            this.isExecuting = true;
            this.isStreaming = true;
            this.streamingContent = '';
            try {
                // Add user message immediately to UI
                const userMessage = {
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
                let response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/chat/send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('mia_access_token')}`,
                    },
                    body: JSON.stringify(requestBody),
                });
                // Handle token expiration
                if (response.status === 401) {
                    console.log('Token expired, attempting refresh...');
                    const refreshed = await authStore.refreshAccessToken();
                    if (refreshed) {
                        console.log('Token refreshed successfully, retrying request...');
                        // Retry with new token
                        response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/chat/send`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('mia_access_token')}`,
                            },
                            body: JSON.stringify(requestBody),
                        });
                    }
                    else {
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
                        if (done)
                            break;
                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const data = JSON.parse(line.slice(6));
                                    if (data.type === 'content') {
                                        assistantContent += data.content || '';
                                        this.streamingContent = assistantContent;
                                        if (onChunk)
                                            onChunk(data);
                                    }
                                    else if (data.type === 'step') {
                                        // Agent step event (thinking, tool_call, tool_result, etc.)
                                        try {
                                            const stepData = JSON.parse(data.content);
                                            const step = {
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
                                        }
                                        catch (e) {
                                            console.error('Failed to parse step event:', e);
                                        }
                                    }
                                    else if (data.type === 'artifact') {
                                        // New artifact created
                                        try {
                                            const a = JSON.parse(data.content);
                                            this.sessionArtifacts.unshift(a);
                                            // Sort artifacts by creation date (newest first)
                                            this.sessionArtifacts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                                        }
                                        catch { }
                                    }
                                    else if (data.type === 'done') {
                                        this.isStreaming = false;
                                        // Store the message ID from the backend
                                        if (data.content) {
                                            this.lastAssistantMessageId = data.content;
                                        }
                                    }
                                    else if (data.type === 'error') {
                                        console.error('Stream error:', data.content);
                                        this.isStreaming = false;
                                    }
                                }
                                catch (e) {
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
                    const assistantMessage = {
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
            }
            catch (err) {
                this.error = err?.message || 'Failed to send message';
                throw err;
            }
            finally {
                this.isExecuting = false;
                this.isStreaming = false;
            }
        },
        // Legacy compatibility - redirect to chat
        async createExecution(subprojectId, prompt) {
            // This now uses the chat system
            return this.sendChatMessage(prompt);
        },
        // Legacy compatibility
        async fetchActions(executionId) {
            // No-op - chat system handles this differently
            return [];
        },
        async fetchArtifacts(executionId) {
            // No-op - artifacts are handled differently in chat
            return [];
        },
        addMessage(message) {
            this.chatMessages.push(message);
        },
        // UI State
        toggleRightPanel() {
            this.rightPanelCollapsed = !this.rightPanelCollapsed;
        },
        setPromptText(text) {
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
