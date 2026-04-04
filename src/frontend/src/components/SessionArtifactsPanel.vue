<template>
  <div class="h-full flex flex-col bg-surface/30 backdrop-blur border-r border-surface-high">
    <!-- Panel Header -->
    <div class="p-4 border-b border-surface-high flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
          <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 class="font-headline font-semibold text-onSurface text-sm">{{ currentModeLabel }}</h2>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="props.artifacts.length > 0" class="text-xs font-label text-onSurface-variant bg-surface-high px-2 py-0.5 rounded-full">
          {{ props.artifacts.length }}
        </span>
        <!-- Switch Mode Button -->
        <button
          class="p-1.5 rounded-lg text-onSurface-variant hover:text-primary hover:bg-primary/10 transition-colors"
          :title="switchButtonTitle"
          @click="toggleMode"
        >
          <svg v-if="currentMode === 'session'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Artifacts List -->
    <div class="flex-1 overflow-y-auto p-3 space-y-3">
      <!-- Empty State -->
      <div v-if="props.artifacts.length === 0" class="text-center py-8 px-2">
        <div class="w-12 h-12 rounded-full bg-surface-high mx-auto mb-3 flex items-center justify-center">
          <svg class="w-6 h-6 text-onSurface-variant opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="text-xs text-onSurface-variant font-label">No artifacts yet</p>
        <p class="text-[10px] text-onSurface-variant/60 mt-1">Artifacts will appear here when the agent creates them</p>
      </div>

      <!-- Artifact Cards -->
      <div
        v-for="artifact in props.artifacts"
        :key="artifact.id"
        class="group relative bg-surface-high/50 rounded-xl border border-surface-high hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
        @click="openArtifact(artifact)"
      >
        <!-- Card Content -->
        <div class="p-3">
          <!-- Header: Icon + Name -->
          <div class="flex items-start gap-2 mb-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :class="getArtifactIconClass(artifact.artifact_type)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="artifact.artifact_type === 'code'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                <path v-else-if="artifact.artifact_type === 'markdown' || artifact.artifact_type === 'text'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                <path v-else-if="artifact.artifact_type === 'json'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-label font-semibold text-onSurface truncate leading-tight">{{ artifact.name }}</h3>
            </div>
          </div>

          <!-- Summary (max 200 chars) -->
          <p v-if="artifact.summary" class="text-xs text-onSurface-variant font-body leading-relaxed mb-2 line-clamp-2">
            {{ truncateSummary(artifact.summary) }}
          </p>

          <!-- Footer: Type Badge + Date -->
          <div class="flex items-center justify-between pt-2 border-t border-surface-high/50">
            <span
              class="text-[10px] px-2 py-0.5 rounded-full font-label uppercase tracking-wider"
              :class="getArtifactBadgeClass(artifact.artifact_type)"
            >
              {{ artifact.artifact_type }}
            </span>
            <span class="text-[10px] text-onSurface-variant/60 font-mono">
              {{ formatDate(artifact.created_at) }}
            </span>
          </div>
        </div>

        <!-- Hover Overlay with View Icon -->
        <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <svg class="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Artifact } from '../types';

type ViewMode = 'session' | 'subproject';

interface Props {
  artifacts?: Artifact[];
  mode?: ViewMode;
  subprojectId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  artifacts: () => [],
  mode: 'session',
  subprojectId: ''
});

const emit = defineEmits<{
  (e: 'update:mode', mode: ViewMode): void;
  (e: 'switch-mode', mode: ViewMode): void;
  (e: 'select-artifact', artifact: Artifact): void;
}>();

const currentMode = computed(() => props.mode);

const currentModeLabel = computed(() => {
  return currentMode.value === 'session' ? 'Session Artifacts' : 'Subproject Artifacts';
});

const switchButtonTitle = computed(() => {
  return currentMode.value === 'session' 
    ? 'Switch to Subproject Artifacts' 
    : 'Switch to Session Artifacts';
});

function toggleMode() {
  const newMode: ViewMode = currentMode.value === 'session' ? 'subproject' : 'session';
  console.log('SessionArtifactsPanel: Toggling mode from', currentMode.value, 'to', newMode);
  emit('update:mode', newMode);
  emit('switch-mode', newMode);
}

function truncateSummary(summary: string): string {
  if (!summary) return '';
  if (summary.length <= 200) return summary;
  return summary.substring(0, 197) + '...';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

function getArtifactIconClass(type: string): string {
  const classes: Record<string, string> = {
    code: 'bg-blue-500/20 text-blue-400',
    markdown: 'bg-purple-500/20 text-purple-400',
    text: 'bg-gray-500/20 text-gray-400',
    json: 'bg-yellow-500/20 text-yellow-400',
    file: 'bg-primary/20 text-primary',
  };
  return classes[type] || classes.file;
}

function getArtifactBadgeClass(type: string): string {
  const classes: Record<string, string> = {
    code: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    markdown: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    text: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    json: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    file: 'bg-primary/10 text-primary border border-primary/20',
  };
  return classes[type] || classes.file;
}



async function openArtifact(artifact: Artifact) {
  console.log('SessionArtifactsPanel: openArtifact called for:', artifact.name, 'ID:', artifact.id);
  // Just emit event to parent to show in center panel
  // The parent (WorkspacePage) will handle loading and displaying the content
  emit('select-artifact', artifact);
  console.log('SessionArtifactsPanel: Emitted select-artifact event');
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  color: var(--onSurface);
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(a) {
  color: var(--primary);
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(pre) {
  background: var(--surface-high);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.markdown-content :deep(code) {
  font-family: monospace;
  font-size: 0.875rem;
}
</style>
