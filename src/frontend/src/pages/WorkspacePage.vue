<template>
  <div class="flex flex-col h-full w-full bg-background">
    <!-- Top Navigation Bar -->
    <header class="h-14 border-b border-surface-high flex items-center justify-between px-6 bg-surface/50 backdrop-blur">
      <!-- Breadcrumbs -->
      <div class="flex items-center gap-2 text-sm">
        <span class="text-onSurface-variant font-label uppercase tracking-wider text-xs">WORKSPACE</span>
        <span class="text-onSurface-variant">/</span>
        <span class="text-onSurface font-label font-medium">{{ workspaceStore.currentProject?.name || 'MAIN WORKSPACE' }}</span>
        <span v-if="workspaceStore.currentSubproject" class="text-onSurface-variant">/</span>
        <span v-if="workspaceStore.currentSubproject" class="text-onSurface-variant font-label text-xs uppercase tracking-wider">
          SUBPROYECTO: {{ workspaceStore.currentSubproject.name.slice(0, 8).toUpperCase() }}
        </span>
      </div>

      <!-- Right Controls -->
      <div class="flex items-center gap-4">
        <!-- Session ID Badge -->
        <div v-if="workspaceStore.sessionCode" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-high border border-surface">
          <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span class="text-xs font-label text-onSurface-variant">SESSION:</span>
          <span class="text-xs font-mono text-primary font-medium">{{ workspaceStore.sessionCode }}</span>
        </div>

        <!-- Action Buttons -->
        <button class="p-2 rounded-lg text-onSurface-variant hover:bg-surface-high transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <button class="p-2 rounded-lg text-onSurface-variant hover:bg-surface-high transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>

        <button
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background text-sm font-label font-medium hover:opacity-90 transition-opacity"
          @click="startNewSession"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          NEW SESSION
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel: Session Artifacts -->
      <div class="w-[300px] flex-shrink-0">
        <SessionArtifactsPanel 
          :artifacts="workspaceStore.sessionArtifacts" 
          :mode="artifactViewMode"
          :subproject-id="workspaceStore.currentSubproject?.id || ''"
          @switch-mode="handleArtifactModeSwitch"
          @select-artifact="handleArtifactSelect"
        />
      </div>

      <!-- Center Panel: Main Content -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Content Header -->
        <div class="px-8 py-6 border-b border-surface-high/50">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-xs text-onSurface-variant font-label">
              {{ workspaceStore.sessionCode ? `SESSION ID| ${workspaceStore.sessionCode}` : 'No active session' }}
            </span>
          </div>
          <h1 class="text-3xl font-headline font-bold text-onSurface mb-3">
            {{ workspaceStore.currentSubproject?.name || 'Workspace' }}
          </h1>
          <p class="text-onSurface-variant font-body max-w-3xl">
            {{ workspaceStore.currentSubproject?.description || 'Select a project and subproject to begin working with your agent.' }}
          </p>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 overflow-y-auto p-8">
          <!-- Selected Artifact Viewer (Always visible when artifact is selected) -->
          <div v-if="selectedArtifact" class="glass rounded-2xl p-8 mb-8">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-headline font-semibold text-onSurface">{{ selectedArtifact.name }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label uppercase">{{ selectedArtifact.artifact_type }}</span>
                    <span class="text-xs text-onSurface-variant font-mono">{{ formatDateTime(selectedArtifact.created_at) }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <!-- Copy to Clipboard -->
                <button
                  class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-label text-onSurface-variant hover:text-primary hover:bg-primary/10 transition-colors border border-surface-high"
                  @click="copyToClipboard(selectedArtifactContent)"
                  title="Copy to clipboard"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
                <!-- Download as File -->
                <button
                  class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-label text-onSurface-variant hover:text-primary hover:bg-primary/10 transition-colors border border-surface-high"
                  @click="downloadArtifact(selectedArtifact.name, selectedArtifactContent)"
                  title="Download as .md file"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Save
                </button>
                <button
                  class="p-2 rounded-lg text-onSurface-variant hover:text-error hover:bg-error/10 transition-colors"
                  @click="closeArtifactViewer"
                  title="Close"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Summary -->
            <div v-if="selectedArtifact.summary" class="mb-4 p-4 bg-surface-high/50 rounded-lg border border-surface-high">
              <p class="text-sm text-onSurface-variant font-body">{{ selectedArtifact.summary }}</p>
            </div>
            
            <!-- Content -->
            <div class="bg-surface-high/30 rounded-xl border border-surface-high overflow-hidden">
              <div v-if="selectedArtifactLoading" class="flex items-center justify-center py-12">
                <svg class="animate-spin w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </div>
              <div v-else-if="selectedArtifactContent" class="p-6 max-h-[60vh] overflow-y-auto">
                <!-- Code/JSON Display -->
                <pre v-if="selectedArtifact.artifact_type === 'code' || selectedArtifact.artifact_type === 'json'" class="bg-surface rounded-lg p-4 overflow-x-auto text-sm font-mono"><code>{{ selectedArtifactContent }}</code></pre>
                
                <!-- Markdown Display with Enhanced Styling -->
                <div v-else-if="selectedArtifact.artifact_type === 'markdown'" class="markdown-viewer">
                  <div class="markdown-content" v-html="renderMarkdown(selectedArtifactContent)"></div>
                </div>
                
                <!-- Plain Text Display -->
                <div v-else class="whitespace-pre-wrap font-body text-sm text-onSurface">{{ selectedArtifactContent }}</div>
              </div>
              <div v-else class="text-center py-12 text-onSurface-variant">
                <p class="text-sm font-label">No content available</p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="workspaceStore.chatMessages.length === 0 && !selectedArtifact" class="h-full flex flex-col items-center justify-center text-onSurface-variant">
            <div class="w-32 h-32 rounded-full bg-surface-high flex items-center justify-center mb-6">
              <svg class="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 class="text-xl font-headline font-semibold mb-2">Start a Conversation</h2>
            <p class="text-sm max-w-md text-center mb-6">
              Select a project and subproject, then start chatting with your agent.
            </p>
            <button 
              v-if="workspaceStore.currentSubproject?.agent"
              class="px-6 py-3 rounded-lg bg-primary text-background font-label flex items-center gap-2 hover:opacity-90 transition-opacity"
              @click="scrollToInput"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Start Chat
            </button>
          </div>

          <!-- Welcome / Info Panel -->
          <div v-else-if="!selectedArtifact" class="space-y-8">
            <div class="glass rounded-2xl p-8">
              <h3 class="text-xl font-headline font-semibold text-onSurface mb-4">Session Active</h3>
              <p class="text-onSurface-variant font-body">
                Your conversation with <strong class="text-primary">{{ workspaceStore.currentSubproject?.agent?.name }}</strong> is in progress.
                Messages will appear in the right panel.
              </p>
              
              <!-- Visualization Placeholder -->
              <div class="mt-8 p-8 bg-surface-high/50 rounded-xl border border-surface-high">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <p class="text-xs text-onSurface-variant font-label uppercase tracking-wider mb-1">Response Time</p>
                    <div class="flex items-baseline gap-2">
                      <span class="text-4xl font-headline font-bold text-onSurface">42.8ms</span>
                      <span class="text-sm text-green-400 font-label">↓12% avg</span>
                    </div>
                  </div>
                  <div class="flex gap-1">
                    <div v-for="i in 5" :key="i" class="w-1 bg-primary/30 rounded-full" :style="{ height: `${20 + i * 8}px` }"></div>
                  </div>
                </div>
                <div class="h-48 flex items-end gap-2">
                  <div v-for="i in 20" :key="i" class="flex-1 bg-primary/20 rounded-t hover:bg-primary/40 transition-colors" :style="{ height: `${Math.random() * 100}%` }"></div>
                </div>
              </div>
            </div>

            <!-- Bottom Cards -->
            <div class="grid grid-cols-2 gap-6">
              <div class="glass rounded-xl p-6">
                <p class="text-xs text-onSurface-variant font-label uppercase tracking-wider mb-4">Session Info</p>
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <span class="w-5 h-5 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg class="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <p class="text-sm text-onSurface font-body">
                      Agent '{{ workspaceStore.currentSubproject?.agent?.name || 'Agent' }}' is ready to assist.
                    </p>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg class="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    <p class="text-sm text-onSurface font-body">
                      {{ workspaceStore.chatMessages.length }} messages in this session.
                    </p>
                  </div>
                </div>
              </div>

              <div class="glass rounded-xl p-6">
                <p class="text-xs text-onSurface-variant font-label uppercase tracking-wider mb-4">Agent Status</p>
                <div class="flex items-baseline gap-1 mb-2">
                  <span class="text-5xl font-headline font-bold text-onSurface">99.2</span>
                  <span class="text-2xl text-onSurface-variant">%</span>
                </div>
                <div class="h-2 bg-surface-high rounded-full overflow-hidden">
                  <div class="h-full w-[99.2%] bg-primary rounded-full"></div>
                </div>
                <p class="text-xs text-onSurface-variant mt-2">Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Agent Activity -->
      <div class="w-[400px] border-l border-surface-high bg-surface/30 backdrop-blur flex flex-col">
        <!-- Panel Header -->
        <div class="p-4 border-b border-surface-high flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img
              v-if="workspaceStore.currentSubproject?.agent?.avatar_url"
              :src="workspaceStore.currentSubproject.agent.avatar_url"
              class="w-8 h-8 rounded-lg object-cover ring-2 ring-surface-high"
            />
            <div v-else class="w-8 h-8 rounded-lg bg-surface-high flex items-center justify-center ring-2 ring-surface-high">
              <span class="text-sm font-semibold text-primary">
                {{ workspaceStore.currentSubproject?.agent?.name?.charAt(0).toUpperCase() || 'A' }}
              </span>
            </div>
            <div>
              <h2 class="font-headline font-semibold text-onSurface text-sm">
                Agent Activity {{ workspaceStore.currentSubproject?.agent ? '| ' + workspaceStore.currentSubproject.agent.name : '' }}
              </h2>
            </div>
          </div>
          <div v-if="workspaceStore.hasRunningExecution" class="flex items-center gap-2 text-xs text-green-400 font-label">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            ACTIVE NOW
          </div>
        </div>

        <!-- Project/Subproject Selectors -->
        <div class="p-4 border-b border-surface-high space-y-3">
          <!-- Project Selector -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-onSurface-variant font-label uppercase tracking-wider">Project</span>
              <button
                class="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
                @click="showNewProjectModal = true"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <select
              v-model="selectedProjectId"
              class="w-full bg-surface-high rounded-lg px-3 py-2 text-sm font-label text-onSurface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer border border-surface-high"
              @change="handleProjectChange"
            >
              <option value="">Select project...</option>
              <option v-for="project in workspaceStore.projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <!-- Subproject Selector -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-onSurface-variant font-label uppercase tracking-wider">SUBPROYECTO</span>
              <button
                class="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
                :disabled="!workspaceStore.currentProject"
                @click="showNewSubprojectModal = true"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <select
              v-model="selectedSubprojectId"
              class="w-full bg-surface-high rounded-lg px-3 py-2 text-sm font-label text-onSurface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer border border-surface-high disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!workspaceStore.currentProject"
              @change="handleSubprojectChange"
            >
              <option value="">
                {{ !workspaceStore.currentProject ? 'Select project first' : 'Select subproyecto...' }}
              </option>
              <option v-for="sub in projectSubprojects" :key="sub.id" :value="sub.id">
                {{ sub.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Agent Activity Steps -->
        <div v-if="(workspaceStore.agentSteps || []).length > 0" class="px-4 py-3 border-b border-surface-high">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-onSurface-variant font-label uppercase tracking-wider">Activity Log</span>
            <button 
              class="text-[10px] text-onSurface-variant/60 hover:text-primary transition-colors"
              @click="workspaceStore.agentSteps = []"
            >
              Clear
            </button>
          </div>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div 
              v-for="step in (workspaceStore.agentSteps || [])" 
              :key="step.id"
              class="flex items-start gap-2 p-2 rounded-lg bg-surface-high/50 text-xs"
            >
              <!-- Step Icon -->
              <div class="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5" :class="getStepIconClass(step.step_type)">
                <!-- Thinking -->
                <svg v-if="step.step_type === 'thinking'" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <!-- Tool Call -->
                <svg v-else-if="step.step_type === 'tool_call'" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <!-- Tool Result -->
                <svg v-else-if="step.step_type === 'tool_result'" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <!-- Tool Error -->
                <svg v-else-if="step.step_type === 'tool_error'" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <!-- Generating -->
                <svg v-else-if="step.step_type === 'generating'" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <!-- LLM Request -->
                <svg v-else-if="step.step_type === 'llm_request'" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <!-- User Input Required -->
                <svg v-else-if="step.step_type === 'user_input_required'" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <!-- Default -->
                <svg v-else class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <!-- Step Content -->
              <div class="flex-1 min-w-0">
                <p class="font-label text-onSurface leading-tight">{{ step.message }}</p>
                <p v-if="step.tool_name" class="text-[10px] text-onSurface-variant/60 mt-0.5 font-mono">{{ step.tool_name }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Feed - Chat Messages -->
        <div ref="actionsContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Empty State -->
          <div v-if="workspaceStore.chatMessages.length === 0" class="text-center py-8">
            <div class="w-16 h-16 rounded-full bg-surface-high mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-onSurface-variant opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p class="text-sm text-onSurface-variant font-label">Start a conversation with your agent</p>
          </div>

          <!-- Chat Messages -->
          <template v-else>
            <div
              v-for="message in workspaceStore.chatMessages"
              :key="message.id"
              class="group"
            >
              <!-- User Message -->
              <div v-if="message.role === 'user'" class="flex items-start gap-3 mb-4">
                <div class="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-semibold text-onSurface">U</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-label font-medium text-onSurface">You</span>
                    <span class="text-xs text-onSurface-variant font-mono">{{ formatTime(message.created_at) }}</span>
                  </div>
                  <div class="text-sm text-onSurface font-body leading-relaxed whitespace-pre-wrap bg-surface-high/50 rounded-lg p-3">
                    {{ message.content }}
                  </div>
                  <!-- Show injected metadata -->
                  <div v-if="Object.keys(message.injected_metadata).length > 0" class="mt-2 flex flex-wrap gap-1">
                    <span
                      v-for="(value, key) in message.injected_metadata"
                      :key="key"
                      class="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono"
                    >
                      {{ key }}: {{ value }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Assistant Message -->
              <div v-else class="flex items-start gap-3 mb-4">
                <img
                  v-if="workspaceStore.currentSubproject?.agent?.avatar_url"
                  :src="workspaceStore.currentSubproject.agent.avatar_url"
                  class="w-8 h-8 rounded-full object-cover ring-2 ring-surface-high flex-shrink-0"
                />
                <div v-else class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm text-background font-semibold ring-2 ring-surface-high flex-shrink-0">
                  {{ workspaceStore.currentSubproject?.agent?.name?.charAt(0).toUpperCase() || 'A' }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-label font-medium text-onSurface">
                      {{ workspaceStore.currentSubproject?.agent?.name || 'Agent' }}
                    </span>
                    <span class="text-xs text-onSurface-variant font-mono">{{ formatTime(message.created_at) }}</span>
                  </div>
                  <div class="text-sm text-onSurface font-body leading-relaxed whitespace-pre-wrap">
                    {{ message.content }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Streaming Content -->
            <div v-if="workspaceStore.isStreaming && workspaceStore.streamingContent" class="flex items-start gap-3 mb-4">
              <img
                v-if="workspaceStore.currentSubproject?.agent?.avatar_url"
                :src="workspaceStore.currentSubproject.agent.avatar_url"
                class="w-8 h-8 rounded-full object-cover ring-2 ring-surface-high flex-shrink-0"
              />
              <div v-else class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm text-background font-semibold ring-2 ring-surface-high flex-shrink-0">
                {{ workspaceStore.currentSubproject?.agent?.name?.charAt(0).toUpperCase() || 'A' }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-label font-medium text-onSurface">
                    {{ workspaceStore.currentSubproject?.agent?.name || 'Agent' }}
                  </span>
                  <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                </div>
                <div class="text-sm text-onSurface font-body leading-relaxed whitespace-pre-wrap">
                  {{ workspaceStore.streamingContent }}
                </div>
              </div>
            </div>

            <!-- Loading Indicator -->
            <div v-if="workspaceStore.isExecuting && !workspaceStore.streamingContent" class="flex items-center gap-3 py-4">
              <div class="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center">
                <svg class="animate-spin w-4 h-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </div>
              <span class="text-sm text-onSurface-variant font-label">Agent is thinking...</span>
            </div>
          </template>
        </div>

        <!-- Input Area -->
        <div class="p-4 border-t border-surface-high bg-surface/50">
          <div class="relative">
            <textarea
              ref="promptInput"
              v-model="workspaceStore.promptText"
              placeholder="Instruct the agent..."
              rows="1"
              class="w-full bg-surface-high rounded-xl pl-4 pr-14 py-3.5 text-sm font-body text-onSurface placeholder-onSurface-variant resize-none focus:outline-none focus:ring-2 focus:ring-primary border border-surface-high"
              :disabled="!workspaceStore.currentSubproject?.agent || workspaceStore.isExecuting"
              @keydown.enter.prevent="handleEnterKey"
              @input="autoResize"
            />
            <div class="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                class="p-2 rounded-lg text-onSurface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                :class="{ 'text-primary': workspaceStore.isRecording }"
                :disabled="!workspaceStore.currentSubproject?.agent"
                @click="toggleVoice"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <button
                class="p-2 rounded-lg bg-primary text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!canExecute"
                @click="executePrompt"
              >
                <svg v-if="workspaceStore.isExecuting" class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          </div>
          <p class="text-[10px] text-onSurface-variant font-label mt-2 text-center uppercase tracking-wider">
            SYNTHEX OS V2.4.0 • ULTRA LATENCY MODE
          </p>
        </div>
      </div>
    </div>

    <!-- New Project Modal -->
    <div v-if="showNewProjectModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="glass rounded-2xl p-6 w-96 max-w-[90vw] border border-surface-high">
        <h2 class="text-xl font-headline font-semibold text-onSurface mb-4">New Project</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-label text-onSurface-variant uppercase tracking-wider mb-2">Project Name</label>
            <input
              v-model="newProjectName"
              type="text"
              class="w-full bg-surface-high rounded-lg px-3 py-2.5 text-sm text-onSurface focus:outline-none focus:ring-2 focus:ring-primary border border-surface-high"
              placeholder="Enter project name..."
              @keydown.enter="createProject"
            />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              class="px-4 py-2 rounded-lg text-sm font-label text-onSurface-variant hover:bg-surface-high transition-colors"
              @click="showNewProjectModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 rounded-lg text-sm font-label bg-primary text-background hover:opacity-90 transition-opacity disabled:opacity-50"
              :disabled="!newProjectName.trim()"
              @click="createProject"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Subproject Modal -->
    <div v-if="showNewSubprojectModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="glass rounded-2xl p-6 w-96 max-w-[90vw] border border-surface-high">
        <h2 class="text-xl font-headline font-semibold text-onSurface mb-4">New Subproyecto</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-label text-onSurface-variant uppercase tracking-wider mb-2">Subproyecto Name</label>
            <input
              v-model="newSubprojectName"
              type="text"
              class="w-full bg-surface-high rounded-lg px-3 py-2.5 text-sm text-onSurface focus:outline-none focus:ring-2 focus:ring-primary border border-surface-high"
              placeholder="Enter subproyecto name..."
            />
          </div>
          <div>
            <label class="block text-xs font-label text-onSurface-variant uppercase tracking-wider mb-2">Agent</label>
            <select
              v-model="newSubprojectAgentId"
              class="w-full bg-surface-high rounded-lg px-3 py-2.5 text-sm text-onSurface focus:outline-none focus:ring-2 focus:ring-primary border border-surface-high cursor-pointer"
            >
              <option value="">Select agent...</option>
              <option v-for="agent in availableAgents" :key="agent.id" :value="agent.id">
                {{ agent.name }}
              </option>
            </select>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              class="px-4 py-2 rounded-lg text-sm font-label text-onSurface-variant hover:bg-surface-high transition-colors"
              @click="showNewSubprojectModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 rounded-lg text-sm font-label bg-primary text-background hover:opacity-90 transition-opacity disabled:opacity-50"
              :disabled="!newSubprojectName.trim()"
              @click="createSubproject"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWorkspaceStore } from '../stores/workspace';
import { apiClient } from '../api/client';
import SessionArtifactsPanel from '../components/SessionArtifactsPanel.vue';

const route = useRoute();
const router = useRouter();
const workspaceStore = useWorkspaceStore();
const actionsContainer = ref<HTMLElement | null>(null);
const promptInput = ref<HTMLTextAreaElement | null>(null);

// Local state
const selectedProjectId = ref('');
const selectedSubprojectId = ref('');
const projectSubprojects = ref<Array<any>>([]);
const showNewProjectModal = ref(false);
const showNewSubprojectModal = ref(false);
const newProjectName = ref('');
const newSubprojectName = ref('');
const newSubprojectAgentId = ref('');
const availableAgents = ref<Array<{ id: string; name: string }>>([]);
const artifactViewMode = ref<'session' | 'subproject'>('session');
const selectedArtifact = ref<Artifact | null>(null);
const selectedArtifactContent = ref<string>('');
const selectedArtifactLoading = ref(false);

const canExecute = computed(() => {
  return workspaceStore.promptText.trim().length > 0 && 
         !workspaceStore.isExecuting && 
         workspaceStore.currentSubproject?.agent;
});

// Scroll to bottom when new messages are added
watch(() => workspaceStore.chatMessages.length, () => {
  nextTick(() => {
    if (actionsContainer.value) {
      actionsContainer.value.scrollTop = actionsContainer.value.scrollHeight;
    }
  });
});

// Fetch artifacts when session code changes (e.g. after first message creates a new session)
watch(() => workspaceStore.sessionCode, async (newCode) => {
  if (newCode && artifactViewMode.value === 'session') {
    await workspaceStore.fetchSessionArtifacts(newCode);
  } else if (!newCode) {
    workspaceStore.sessionArtifacts = [];
  }
});

onMounted(async () => {
  await workspaceStore.fetchProjects();
  await fetchAgents();
  
  const subprojectId = route.params.subprojectId as string;
  if (subprojectId) {
    await loadWorkspace(subprojectId);
  }
});

// Watch for route changes to handle navigation between subprojects
watch(() => route.params.subprojectId, async (newSubprojectId) => {
  if (newSubprojectId && newSubprojectId !== selectedSubprojectId.value) {
    console.log('Route subprojectId changed to:', newSubprojectId);
    await loadWorkspace(newSubprojectId as string);
    // Reset selected artifact when switching subprojects
    selectedArtifact.value = null;
    selectedArtifactContent.value = '';
  }
});

async function fetchAgents() {
  try {
    const response = await apiClient.get<{ items: any[]; total: number }>('/api/v1/agents');
    availableAgents.value = response.items || [];
  } catch (err) {
    console.error('Failed to fetch agents:', err);
  }
}

async function loadWorkspace(subprojectId: string) {
  console.log('loadWorkspace called with subprojectId:', subprojectId);
  await workspaceStore.fetchSubprojectDetails(subprojectId);
  
  console.log('After fetchSubprojectDetails - currentSubproject:', workspaceStore.currentSubproject?.name, 'ID:', workspaceStore.currentSubproject?.id);

  if (workspaceStore.currentProject) {
    selectedProjectId.value = workspaceStore.currentProject.id;
    await fetchProjectSubprojects(workspaceStore.currentProject.id);
  }

  // Only update selectedSubprojectId if it doesn't match what we expect
  if (workspaceStore.currentSubproject && workspaceStore.currentSubproject.id !== subprojectId) {
    console.warn('Mismatch! Expected subprojectId:', subprojectId, 'but got:', workspaceStore.currentSubproject.id);
  }
  
  // Always ensure selectedSubprojectId matches what we loaded
  if (workspaceStore.currentSubproject) {
    selectedSubprojectId.value = workspaceStore.currentSubproject.id;
    console.log('Updated selectedSubprojectId to:', selectedSubprojectId.value);
  }

  // Check if there's an existing chat session for this subproject
  try {
    const sessions = await apiClient.get<{ items: any[] }>(`/api/v1/chat/sessions?subproject_id=${subprojectId}`);
    if (sessions.items && sessions.items.length > 0) {
      // Use most recent session
      const recentSession = sessions.items[0];
      workspaceStore.sessionCode = recentSession.session_code;
      await workspaceStore.fetchChatMessages(recentSession.session_code);
      // Load artifacts based on current view mode
      if (artifactViewMode.value === 'session') {
        await workspaceStore.fetchSessionArtifacts(recentSession.session_code);
      }
    }
    // If in subproject mode, load subproject artifacts
    if (artifactViewMode.value === 'subproject') {
      await workspaceStore.fetchSubprojectArtifacts(subprojectId);
    }
  } catch (err) {
    // No existing session, will create new one on first message
    console.log('No existing chat session found');
  }
}

async function fetchProjectSubprojects(projectId: string) {
  try {
    const response = await apiClient.get<{ items: any[]; total: number }>(`/api/v1/workspace/subprojects?project_id=${projectId}`);
    projectSubprojects.value = response.items || [];
  } catch (err) {
    console.error('Failed to fetch subprojects:', err);
  }
}

async function handleProjectChange() {
  if (!selectedProjectId.value) {
    workspaceStore.currentProject = null;
    workspaceStore.currentSubproject = null;
    selectedSubprojectId.value = '';
    return;
  }
  
  const project = workspaceStore.projects.find(p => p.id === selectedProjectId.value);
  if (project) {
    workspaceStore.currentProject = project;
    await fetchProjectSubprojects(project.id);
    selectedSubprojectId.value = '';
    workspaceStore.currentSubproject = null;
  }
}

async function handleSubprojectChange() {
  console.log('handleSubprojectChange called with selectedSubprojectId:', selectedSubprojectId.value);
  
  if (!selectedSubprojectId.value) {
    console.log('No subproject selected, clearing currentSubproject');
    workspaceStore.currentSubproject = null;
    return;
  }
  
  // Find the selected subproject in the list to verify ID matches name
  const selectedSubproject = projectSubprojects.value.find(s => s.id === selectedSubprojectId.value);
  console.log('Selected subproject from dropdown:', selectedSubproject?.name, 'ID:', selectedSubproject?.id);
  
  await loadWorkspace(selectedSubprojectId.value);
  router.push(`/workspace/${selectedSubprojectId.value}`);
}

function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

function getStepIconClass(stepType: string): string {
  const classes: Record<string, string> = {
    thinking: 'bg-yellow-500/20 text-yellow-400',
    tool_call: 'bg-blue-500/20 text-blue-400',
    tool_result: 'bg-green-500/20 text-green-400',
    tool_error: 'bg-red-500/20 text-red-400',
    generating: 'bg-purple-500/20 text-purple-400',
    llm_request: 'bg-cyan-500/20 text-cyan-400',
    user_input_required: 'bg-orange-500/20 text-orange-400',
  };
  return classes[stepType] || 'bg-gray-500/20 text-gray-400';
}

async function handleArtifactModeSwitch(mode: 'session' | 'subproject') {
  console.log('Switching artifact mode to:', mode);
  console.log('Current subproject:', workspaceStore.currentSubproject?.name, 'ID:', workspaceStore.currentSubproject?.id);
  artifactViewMode.value = mode;
  
  if (mode === 'session' && workspaceStore.sessionCode) {
    console.log('Fetching session artifacts for:', workspaceStore.sessionCode);
    await workspaceStore.fetchSessionArtifacts(workspaceStore.sessionCode);
  } else if (mode === 'subproject' && workspaceStore.currentSubproject?.id) {
    console.log('Fetching subproject artifacts for:', workspaceStore.currentSubproject.id);
    const artifacts = await workspaceStore.fetchSubprojectArtifacts(workspaceStore.currentSubproject.id);
    console.log('Fetched subproject artifacts:', artifacts.length);
  } else {
    console.log('Cannot fetch artifacts - missing sessionCode or subprojectId. currentSubproject:', workspaceStore.currentSubproject);
  }
}

async function handleArtifactSelect(artifact: any) {
  console.log('handleArtifactSelect called with artifact:', artifact?.name, 'ID:', artifact?.id);
  selectedArtifact.value = artifact;
  console.log('selectedArtifact set to:', selectedArtifact.value?.name);
  selectedArtifactContent.value = '';
  selectedArtifactLoading.value = true;
  
  // First try to use the content field if available
  if (artifact.content && artifact.content.trim().length > 0) {
    selectedArtifactContent.value = artifact.content;
    selectedArtifactLoading.value = false;
    return;
  }
  
  // Fetch content from file_url if available
  if (artifact.file_url) {
    try {
      const url = `http://localhost:8000${artifact.file_url}`;
      const response = await fetch(url);
      if (response.ok) {
        selectedArtifactContent.value = await response.text();
      }
    } catch (err) {
      console.error('Error loading artifact content:', err);
    }
  }
  
  selectedArtifactLoading.value = false;
}

function closeArtifactViewer() {
  selectedArtifact.value = null;
  selectedArtifactContent.value = '';
}

function renderMarkdown(content: string): string {
  let html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Tables - must be processed before line breaks
  html = html.replace(/\|([^\n]*)\|\r?\n\|[-:\s|]+\|\r?\n((?:\|[^\n]*\|\r?\n?)+)/g, (match, header, body) => {
    // Parse header
    const headerCells = header.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell);
    const headerHtml = headerCells.map((cell: string) => `<th class="px-4 py-2 text-left font-semibold border-b border-surface-high">${cell}</th>`).join('');
    
    // Parse body rows
    const rows = body.trim().split('\n');
    const bodyHtml = rows.map((row: string) => {
      const cells = row.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell);
      const cellsHtml = cells.map((cell: string) => `<td class="px-4 py-2 border-b border-surface-high/50">${cell}</td>`).join('');
      return `<tr>${cellsHtml}</tr>`;
    }).join('');
    
    return `<table class="w-full my-4 border-collapse"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
  });

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-semibold mt-4 mb-2">$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-surface-high rounded-lg p-3 my-2 overflow-x-auto"><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-surface-high px-1.5 py-0.5 rounded text-sm">$1</code>');
  
  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
  
  // Line breaks (only outside of tables)
  html = html.replace(/\n/g, '<br>');

  return html;
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function copyToClipboard(content: string) {
  try {
    await navigator.clipboard.writeText(content);
    alert('Content copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard');
  }
}

function downloadArtifact(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function autoResize() {
  if (promptInput.value) {
    promptInput.value.style.height = 'auto';
    promptInput.value.style.height = promptInput.value.scrollHeight + 'px';
  }
}

function scrollToInput() {
  promptInput.value?.focus();
}

async function createProject() {
  if (!newProjectName.value.trim()) return;
  
  try {
    const project = await workspaceStore.createProject({
      name: newProjectName.value.trim()
    });
    
    showNewProjectModal.value = false;
    newProjectName.value = '';
    workspaceStore.currentProject = project;
    selectedProjectId.value = project.id;
    showNewSubprojectModal.value = true;
  } catch (err) {
    console.error('Failed to create project:', err);
    alert('Failed to create project');
  }
}

async function createSubproject() {
  if (!newSubprojectName.value.trim() || !workspaceStore.currentProject) return;
  
  try {
    const subproject = await workspaceStore.createSubproject({
      project_id: workspaceStore.currentProject.id,
      name: newSubprojectName.value.trim(),
      agent_id: newSubprojectAgentId.value || undefined
    });
    
    showNewSubprojectModal.value = false;
    newSubprojectName.value = '';
    newSubprojectAgentId.value = '';
    
    await fetchProjectSubprojects(workspaceStore.currentProject.id);
    selectedSubprojectId.value = subproject.id;
    await handleSubprojectChange();
  } catch (err) {
    console.error('Failed to create subproject:', err);
    alert('Failed to create session');
  }
}

async function executePrompt() {
  if (!canExecute.value || !workspaceStore.currentSubproject) return;
  
  try {
    // Example metadata - in production this could come from UI inputs
    const metadata = [
      { key: 'timestamp', value: new Date().toISOString() },
      { key: 'subproject', value: workspaceStore.currentSubproject.name },
    ];
    
    await workspaceStore.sendChatMessage(
      workspaceStore.promptText,
      metadata
    );
    
    // Reset input height
    if (promptInput.value) {
      promptInput.value.style.height = 'auto';
    }
  } catch (err) {
    console.error('Failed to execute:', err);
  }
}

function handleEnterKey(event: KeyboardEvent) {
  if (event.shiftKey) return;
  executePrompt();
}

function startNewSession() {
  workspaceStore.newSession();
  nextTick(() => promptInput.value?.focus());
}

function toggleVoice() {
  workspaceStore.toggleRecording();
  alert('Voice input not yet implemented');
}
</script>

<style scoped>
.markdown-viewer {
  background: var(--surface);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.markdown-content :deep(h1) {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--onSurface);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--surface-high);
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--onSurface);
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--surface-high);
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--onSurface);
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(p) {
  color: var(--onSurface-variant);
  line-height: 1.75;
  margin-bottom: 1rem;
}

.markdown-content :deep(strong) {
  color: var(--onSurface);
  font-weight: 600;
}

.markdown-content :deep(em) {
  color: var(--onSurface-variant);
  font-style: italic;
}

.markdown-content :deep(code) {
  background: var(--surface-high);
  color: var(--primary);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
}

.markdown-content :deep(pre) {
  background: var(--surface-high);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
  border: 1px solid var(--surface-high);
}

.markdown-content :deep(pre code) {
  background: transparent;
  color: var(--onSurface);
  padding: 0;
}

.markdown-content :deep(ul), .markdown-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  color: var(--onSurface-variant);
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.markdown-content :deep(a) {
  color: var(--primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.markdown-content :deep(a:hover) {
  border-bottom-color: var(--primary);
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--primary);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--onSurface-variant);
  font-style: italic;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--surface-high);
}

.markdown-content :deep(th) {
  font-weight: 600;
  color: var(--onSurface);
  background: var(--surface-high);
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 2px solid var(--surface-high);
  margin: 2rem 0;
}
</style>
