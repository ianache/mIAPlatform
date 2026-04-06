<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-headline font-semibold text-primary">Library</h1>
        <p class="mt-1 text-sm text-onSurface-variant font-body">
          Manage content ingestion flows: connect sources, processors, and sinks.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="px-5 py-2.5 rounded-xl font-label text-sm font-semibold text-onSurface bg-surface-high hover:bg-surface-highest transition-colors flex items-center gap-2"
          @click="triggerImport"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import
        </button>
        <input
          ref="importFileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleImport"
        />
        <button
          class="px-5 py-2.5 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity"
          @click="showCreateModal = true"
        >
          + New Flow
        </button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="store.loading && store.flows.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in 3" :key="n" class="glass rounded-2xl p-6 animate-pulse space-y-4">
        <div class="h-4 bg-surface-high rounded w-1/2"></div>
        <div class="h-3 bg-surface-high rounded w-3/4"></div>
        <div class="h-3 bg-surface-high rounded w-1/3"></div>
        <div class="flex gap-2 mt-4">
          <div class="h-8 bg-surface-high rounded-lg flex-1"></div>
          <div class="h-8 bg-surface-high rounded-lg w-16"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="store.error"
      class="bg-surface-high rounded-lg px-5 py-3 text-error font-label text-sm flex items-center gap-3"
    >
      <span class="w-2 h-2 rounded-full bg-error shrink-0" />
      {{ store.error }}
    </div>
    
    <!-- Import Error -->
    <div
      v-if="importError"
      class="bg-surface-high rounded-lg px-5 py-3 text-error font-label text-sm flex items-center gap-3"
    >
      <span class="w-2 h-2 rounded-full bg-error shrink-0" />
      {{ importError }}
    </div>

    <!-- Empty state -->
    <div
      v-else-if="store.flows.length === 0"
      class="glass rounded-2xl p-16 flex flex-col items-center gap-4 text-center"
    >
      <div class="text-5xl">⚡</div>
      <p class="font-headline font-semibold text-onSurface text-xl">No flows yet</p>
      <p class="text-sm text-onSurface-variant font-body max-w-sm">
        Create your first ingestion flow to connect data sources to vector stores or databases.
      </p>
      <button
        class="mt-2 px-5 py-2.5 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity"
        @click="showCreateModal = true"
      >
        + New Flow
      </button>
    </div>

    <!-- Flow cards grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="flow in store.flows"
        :key="flow.id"
        class="glass rounded-2xl p-6 flex flex-col gap-3"
      >
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-headline font-semibold text-onSurface text-base leading-snug">
            {{ flow.title }}
          </h3>
          <span class="shrink-0 text-xs font-label bg-surface-high text-onSurface-variant rounded-full px-2 py-0.5">
            {{ nodeCount(flow) }} nodes
          </span>
        </div>
        <p v-if="flow.description" class="text-sm text-onSurface-variant font-body line-clamp-2">
          {{ flow.description }}
        </p>
        <p v-else class="text-sm text-onSurface-variant/50 font-body italic">No description</p>
        <div class="flex gap-2 mt-auto pt-2">
          <button
            class="flex-1 px-4 py-2 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity"
            @click="router.push(`/library/${flow.id}/edit`)"
          >
            Edit Flow
          </button>
          <button
            class="px-3 py-2 rounded-xl font-label text-sm text-error bg-surface-high hover:bg-surface-highest transition-colors"
            @click="confirmDelete(flow)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Create Flow Modal -->
    <transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="closeCreateModal"
      >
        <div class="glass rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-5">
          <h2 class="font-headline font-semibold text-onSurface text-xl">New Flow</h2>

          <div class="space-y-1">
            <label class="text-xs font-label text-onSurface-variant uppercase tracking-wide">Title *</label>
            <input
              v-model="newTitle"
              type="text"
              placeholder="My ingestion flow"
              class="w-full bg-surface-high rounded-xl px-4 py-2.5 text-sm font-body text-onSurface placeholder-onSurface-variant/50 outline-none focus:ring-2 focus:ring-primary/40"
              @keydown.enter="handleCreate"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-label text-onSurface-variant uppercase tracking-wide">Description</label>
            <textarea
              v-model="newDescription"
              rows="3"
              placeholder="Optional description…"
              class="w-full bg-surface-high rounded-xl px-4 py-2.5 text-sm font-body text-onSurface placeholder-onSurface-variant/50 outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div v-if="createError" class="text-sm text-error font-label">{{ createError }}</div>

          <div class="flex justify-end gap-3 pt-1">
            <button
              class="px-5 py-2.5 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors"
              @click="closeCreateModal"
            >
              Cancel
            </button>
            <button
              :disabled="!newTitle.trim() || store.loading"
              class="px-5 py-2.5 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleCreate"
            >
              {{ store.loading ? 'Creating…' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirm Modal -->
    <transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="flowToDelete"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="flowToDelete = null"
      >
        <div class="glass rounded-2xl p-8 w-full max-w-sm shadow-2xl space-y-5">
          <h2 class="font-headline font-semibold text-onSurface text-lg">Delete Flow?</h2>
          <p class="text-sm text-onSurface-variant font-body">
            "<strong>{{ flowToDelete.title }}</strong>" will be permanently deleted. This cannot be undone.
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="px-5 py-2.5 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors"
              @click="flowToDelete = null"
            >
              Cancel
            </button>
            <button
              :disabled="store.loading"
              class="px-5 py-2.5 rounded-xl font-label text-sm font-semibold bg-error text-background hover:opacity-90 transition-opacity disabled:opacity-50"
              @click="handleDelete"
            >
              {{ store.loading ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLibraryStore } from '../stores/library';
import type { Flow } from '../types';

const router = useRouter();
const store = useLibraryStore();

const showCreateModal = ref(false);
const newTitle = ref('');
const newDescription = ref('');
const createError = ref('');
const flowToDelete = ref<Flow | null>(null);
const importFileInput = ref<HTMLInputElement | null>(null);
const importError = ref('');

onMounted(() => store.fetchFlows());

function nodeCount(flow: Flow): number {
  return flow.graph?.nodes?.length ?? 0;
}

function closeCreateModal() {
  showCreateModal.value = false;
  newTitle.value = '';
  newDescription.value = '';
  createError.value = '';
}

async function handleCreate() {
  if (!newTitle.value.trim()) return;
  createError.value = '';
  try {
    const flow = await store.createFlow({
      title: newTitle.value.trim(),
      description: newDescription.value.trim() || undefined,
      graph: { nodes: [], edges: [] },
    });
    closeCreateModal();
    router.push(`/library/${flow.id}/edit`);
  } catch (err: any) {
    createError.value = err?.detail ?? 'Failed to create flow';
  }
}

function confirmDelete(flow: Flow) {
  flowToDelete.value = flow;
}

async function handleDelete() {
  if (!flowToDelete.value) return;
  try {
    await store.deleteFlow(flowToDelete.value.id);
    flowToDelete.value = null;
  } catch {
    // error shown via store.error
  }
}

function triggerImport() {
  importFileInput.value?.click();
}

async function handleImport(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  
  importError.value = '';
  
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate required fields
    if (!data.title || !data.graph) {
      importError.value = 'Invalid flow file: missing title or graph';
      return;
    }
    
    // Create the flow
    const flow = await store.createFlow({
      title: data.title,
      description: data.description || undefined,
      graph: data.graph,
    });
    
    // Reset input
    target.value = '';
    
    // Navigate to edit page
    router.push(`/library/${flow.id}/edit`);
  } catch (err: any) {
    importError.value = err?.detail ?? 'Failed to import flow. Please check the file format.';
    target.value = '';
  }
}
</script>
