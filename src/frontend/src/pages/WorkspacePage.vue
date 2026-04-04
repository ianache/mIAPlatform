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
        <div v-if="workspaceStore.currentExecution" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-high border border-surface">
          <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span class="text-xs font-label text-onSurface-variant">AGENT SESSION ID:</span>
          <span class="text-xs font-mono text-primary font-medium">{{ workspaceStore.currentExecution.id.slice(0, 6).toUpperCase() }}</span>
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
      <!-- Left Panel: Main Content / Artifacts -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Content Header -->
        <div class="px-8 py-6 border-b border-surface-high/50">
          <div class="flex items-center gap-3 mb-3">
            <span v-if="currentArtifact" class="px-2 py-1 rounded bg-surface-high text-xs font-mono text-primary">
              {{ currentArtifact.name }}
            </span>
            <span class="text-xs text-onSurface-variant font-label">
              Generated {{ formatTime(currentArtifact?.created_at) }}
            </span>
          </div>
          <h1 class="text-3xl font-headline font-bold text-onSurface mb-3">
            {{ currentArtifact?.name || workspaceStore.currentSubproject?.name || 'Workspace' }}
          </h1>
          <p class="text-onSurface-variant font-body max-w-3xl">
            {{ currentArtifact?.description || workspaceStore.currentSubproject?.description || 'Select a project and subproject to begin working with your agent.' }}
          </p>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 overflow-y-auto p-8">
          <!-- Empty State -->
          <div v-if="!currentArtifact && workspaceStore.artifacts.length === 0" class="h-full flex flex-col items-center justify-center text-onSurface-variant">
            <div class="w-32 h-32 rounded-full bg-surface-high flex items-center justify-center mb-6">
              <svg class="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 class="text-xl font-headline font-semibold mb-2">No Artifacts Yet</h2>
            <p class="text-sm max-w-md text-center mb-6">
              Start a conversation with your agent to generate reports, analysis, and insights.
            </p>
          </div>

          <!-- Artifact Content -->
          <div v-else-if="currentArtifact" class="space-y-8">
            <!-- Main Artifact Display -->
            <div class="glass rounded-2xl p-8">
              <div v-if="currentArtifact.content" class="prose prose-invert max-w-none">
                <pre class="bg-surface-high rounded-xl p-6 overflow-x-auto text-sm font-mono text-onSurface">{{ currentArtifact.content }}</pre>
              </div>
              
              <!-- Visualization Placeholder -->
              <div class="mt-8 p-8 bg-surface-high/50 rounded-xl border border-surface-high">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <p class="text-xs text-onSurface-variant font-label uppercase tracking-wider mb-1">Inference Latency</p>
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
                <p class="text-xs text-onSurface-variant font-label uppercase tracking-wider mb-4">Strategic Insights</p>
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <span class="w-5 h-5 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg class="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <p class="text-sm text-onSurface font-body">
                      Agent '{{ workspaceStore.currentSubproject?.agent?.name || 'Echo-7' }}' successfully optimized the vector storage indices, reducing query time by 18%.
                    </p>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg class="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    <p class="text-sm text-onSurface font-body">
                      Resource allocation shifted to Cluster Delta during peak demand window (14:00 - 16:00 UTC).
                    </p>
                  </div>
                </div>
              </div>

              <div class="glass rounded-xl p-6">
                <p class="text-xs text-onSurface-variant font-label uppercase tracking-wider mb-4">Confidence Score</p>
                <div class="flex items-baseline gap-1 mb-2">
                  <span class="text-5xl font-headline font-bold text-onSurface">99.2</span>
                  <span class="text-2xl text-onSurface-variant">%</span>
                </div>
                <div class="h-2 bg-surface-high rounded-full overflow-hidden">
                  <div class="h-full w-[99.2%] bg-primary rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Artifacts List (when no artifact selected but some exist) -->
          <div v-else class="grid grid-cols-1 gap-4">
            <div
              v-for="artifact in workspaceStore.artifacts"
              :key="artifact.id"
              class="glass rounded-xl p-6 cursor-pointer hover:bg-surface-high/50 transition-colors"
              @click="selectArtifact(artifact)"
            >
              <div class="flex items-center justify-between">
                <div>
                  <span class="px-2 py-1 rounded bg-surface-high text-xs font-mono text-primary mb-2 inline-block">
                    {{ artifact.artifact_type.toUpperCase() }}
                  </span>
                  <h3 class="font-headline font-semibold text-onSurface text-lg">{{ artifact.name }}</h3>
                  <p class="text-sm text-onSurface-variant mt-1">{{ artifact.content?.slice(0, 100) }}...</p>
                </div>
                <svg class="w-5 h-5 text-onSurface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
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

        <!-- Activity Feed -->
        <div ref="actionsContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Empty State -->
          <div v-if="workspaceStore.actions.length === 0" class="text-center py-8">
            <div class="w-16 h-16 rounded-full bg-surface-high mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-onSurface-variant opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p class="text-sm text-onSurface-variant font-label">Agent activity will appear here</p>
          </div>

          <!-- Activity Items -->
          <template v-else>
            <div
              v-for="action in workspaceStore.actions"
              :key="action.id"
              class="group"
            >
              <!-- Agent Header -->
              <div class="flex items-center gap-3 mb-2">
                <img
                  v-if="workspaceStore.currentSubproject?.agent?.avatar_url"
                  :src="workspaceStore.currentSubproject.agent.avatar_url"
                  class="w-8 h-8 rounded-full object-cover ring-2 ring-surface-high"
                />
                <div v-else class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm text-background font-semibold ring-2 ring-surface-high">
                  {{ workspaceStore.currentSubproject?.agent?.name?.charAt(0).toUpperCase() || 'A' }}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-label font-medium text-onSurface">
                    {{ workspaceStore.currentSubproject?.agent?.name || 'Agent' }}
                  </p>
                </div>
                <span class="text-xs text-onSurface-variant font-mono">
                  {{ formatTime(action.created_at) }}
                </span>
              </div>

              <!-- Action Content -->
              <div class="ml-11">
                <!-- Thinking State -->
                <div v-if="action.action_type === 'think'" class="flex items-center gap-2 text-onSurface-variant">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span class="text-xs font-label uppercase tracking-wider">Thinking...</span>
                </div>

                <!-- Code/Query Block -->
                <div v-else-if="action.action_type === 'tool_call'" class="bg-surface-high rounded-lg p-3 border border-surface-high">
                  <div class="flex items-center gap-2 mb-2 text-xs text-onSurface-variant font-mono">
                    <span class="text-primary">➜</span>
                    <span>EXECUTING QUERY:</span>
                  </div>
                  <code class="text-xs font-mono text-onSurface block">{{ action.content }}</code>
                  <div class="mt-2 pt-2 border-t border-surface flex items-center gap-2 text-xs text-green-400">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Response received successfully</span>
                  </div>
                </div>

                <!-- Message/Response -->
                <div v-else-if="action.action_type === 'message'" class="text-sm text-onSurface font-body leading-relaxed">
                  {{ action.content }}
                </div>

                <!-- Error -->
                <div v-else-if="action.action_type === 'error'" class="bg-error/10 rounded-lg p-3 border border-error/20">
                  <div class="flex items-center gap-2 text-error text-sm">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ action.content }}</span>
                  </div>
                </div>

                <!-- Default -->
                <div v-else class="text-sm text-onSurface font-body">
                  {{ action.content }}
                </div>
              </div>
            </div>

            <!-- Loading Indicator -->
            <div v-if="workspaceStore.isExecuting || workspaceStore.hasRunningExecution" class="flex items-center gap-3 py-4">
              <div class="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center">
                <svg class="animate-spin w-4 h-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </div>
              <span class="text-sm text-onSurface-variant font-label">Agent is processing...</span>
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

const route = useRoute();
const router = useRouter();
const workspaceStore = useWorkspaceStore();
const actionsContainer = ref<HTMLElement | null>(null);
const promptInput = ref<HTMLTextAreaElement | null>(null);

// Local state
const currentArtifact = ref<any>(null);
const selectedProjectId = ref('');
const selectedSubprojectId = ref('');
const projectSubprojects = ref<Array<any>>([]);
const showNewProjectModal = ref(false);
const showNewSubprojectModal = ref(false);
const newProjectName = ref('');
const newSubprojectName = ref('');
const newSubprojectAgentId = ref('');
const availableAgents = ref<Array<{ id: string; name: string }>>([]);

const canExecute = computed(() => {
  return workspaceStore.promptText.trim().length > 0 && 
         !workspaceStore.isExecuting && 
         workspaceStore.currentSubproject?.agent;
});

// Scroll to bottom of actions when new actions are added
watch(() => workspaceStore.actions.length, () => {
  nextTick(() => {
    if (actionsContainer.value) {
      actionsContainer.value.scrollTop = actionsContainer.value.scrollHeight;
    }
  });
});

onMounted(async () => {
  await workspaceStore.fetchProjects();
  await fetchAgents();
  
  const subprojectId = route.params.subprojectId as string;
  if (subprojectId) {
    await loadWorkspace(subprojectId);
  }
});

async function fetchAgents() {
  try {
    const response = await apiClient.get('/api/v1/agents');
    availableAgents.value = response.items || [];
  } catch (err) {
    console.error('Failed to fetch agents:', err);
  }
}

async function loadWorkspace(subprojectId: string) {
  await workspaceStore.fetchSubprojectDetails(subprojectId);
  
  if (workspaceStore.currentProject) {
    selectedProjectId.value = workspaceStore.currentProject.id;
    await fetchProjectSubprojects(workspaceStore.currentProject.id);
  }
  
  if (workspaceStore.currentSubproject) {
    selectedSubprojectId.value = workspaceStore.currentSubproject.id;
  }
  
  await workspaceStore.fetchExecutions(subprojectId);
  
  if (workspaceStore.currentExecution) {
    await workspaceStore.fetchActions(workspaceStore.currentExecution.id);
    await workspaceStore.fetchArtifacts(workspaceStore.currentExecution.id);
    
    // Set first artifact as current
    if (workspaceStore.artifacts.length > 0) {
      currentArtifact.value = workspaceStore.artifacts[0];
    }
  }
}

async function fetchProjectSubprojects(projectId: string) {
  try {
    const response = await apiClient.get(`/api/v1/workspace/subprojects?project_id=${projectId}`);
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
  if (!selectedSubprojectId.value) {
    workspaceStore.currentSubproject = null;
    return;
  }
  
  await loadWorkspace(selectedSubprojectId.value);
  router.push(`/workspace/${selectedSubprojectId.value}`);
}

function selectArtifact(artifact: any) {
  currentArtifact.value = artifact;
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
    await workspaceStore.createExecution(
      workspaceStore.currentSubproject.id,
      workspaceStore.promptText
    );
    
    // Reset input height
    if (promptInput.value) {
      promptInput.value.style.height = 'auto';
    }
    
    startPollingActions();
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
  currentArtifact.value = null;
  nextTick(() => promptInput.value?.focus());
}

function toggleVoice() {
  workspaceStore.toggleRecording();
  alert('Voice input not yet implemented');
}

function startPollingActions() {
  if (!workspaceStore.currentExecution) return;
  
  const executionId = workspaceStore.currentExecution.id;
  const interval = setInterval(async () => {
    if (!workspaceStore.hasRunningExecution) {
      clearInterval(interval);
      return;
    }
    await workspaceStore.fetchActions(executionId);
    await workspaceStore.fetchArtifacts(executionId);
  }, 2000);
}
</script>
