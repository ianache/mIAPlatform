<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-headline font-semibold text-primary">Nodes Catalog</h1>
        <p class="mt-1 text-sm text-onSurface-variant font-body">
          Define reusable node types for your ingestion flows.
        </p>
      </div>
      <button
        class="px-5 py-2.5 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity"
        @click="showCreateModal = true"
      >
        + New Node Type
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="store.loading && store.nodeTypes.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in 3" :key="n" class="glass rounded-2xl p-6 animate-pulse space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-surface-high rounded-xl"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-surface-high rounded w-2/3"></div>
            <div class="h-3 bg-surface-high rounded w-1/3"></div>
          </div>
        </div>
        <div class="h-3 bg-surface-high rounded w-full"></div>
        <div class="h-3 bg-surface-high rounded w-3/4"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="bg-surface-high rounded-lg px-5 py-3 text-error font-label text-sm flex items-center gap-3">
      <span class="w-2 h-2 rounded-full bg-error shrink-0" />{{ store.error }}
    </div>

    <!-- Empty state -->
    <div v-else-if="store.nodeTypes.length === 0" class="glass rounded-2xl p-16 flex flex-col items-center gap-4 text-center">
      <div class="text-5xl">🧩</div>
      <p class="font-headline font-semibold text-onSurface text-xl">No node types yet</p>
      <p class="text-sm text-onSurface-variant font-body max-w-sm">
        Create custom node types to use in your flows. Each type defines its inputs, outputs, and implementation.
      </p>
      <button
        class="mt-2 px-5 py-2.5 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity"
        @click="showCreateModal = true"
      >+ New Node Type</button>
    </div>

    <!-- Grid by category -->
    <template v-else>
      <div v-for="cat in categories" :key="cat.key">
        <div v-if="byCategory(cat.key).length > 0" class="space-y-3">
          <h2 class="text-xs font-label uppercase tracking-widest text-onSurface-variant/60 flex items-center gap-2">
            <span>{{ cat.icon }}</span> {{ cat.label }}
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="nt in byCategory(cat.key)"
              :key="nt.id"
              class="glass rounded-2xl p-5 flex flex-col gap-3"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-high flex items-center justify-center text-xl flex-shrink-0">
                  {{ nt.icon || '📦' }}
                </div>
                <div class="min-w-0">
                  <p class="font-label font-semibold text-onSurface text-sm truncate">{{ nt.name }}</p>
                  <p class="text-[10px] uppercase tracking-wide text-onSurface-variant/60">
                    {{ nt.properties.length }} props · {{ nt.language }}
                  </p>
                </div>
              </div>
              <p v-if="nt.description" class="text-xs text-onSurface-variant font-body line-clamp-2">{{ nt.description }}</p>
              <div class="flex gap-2 mt-auto pt-1">
                <button
                  class="flex-1 px-3 py-1.5 rounded-lg font-label text-xs font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity"
                  @click="router.push(`/nodes-catalog/${nt.id}/edit`)"
                >Edit</button>
                <button
                  class="px-3 py-1.5 rounded-lg font-label text-xs text-error bg-surface-high hover:bg-surface-highest transition-colors"
                  @click="toDelete = nt"
                >Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Create modal -->
    <transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="closeModal">
        <div class="glass rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-5">
          <h2 class="font-headline font-semibold text-onSurface text-xl">New Node Type</h2>
          <div class="space-y-1">
            <label class="text-xs font-label text-onSurface-variant uppercase tracking-wide">Name *</label>
            <input v-model="newName" type="text" placeholder="My Custom Node"
              class="w-full bg-surface-high rounded-xl px-4 py-2.5 text-sm font-body text-onSurface outline-none focus:ring-2 focus:ring-primary/40"
              @keydown.enter="handleCreate" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-label text-onSurface-variant uppercase tracking-wide">Category *</label>
              <select v-model="newCategory" class="w-full bg-surface-high rounded-xl px-4 py-2.5 text-sm font-body text-onSurface outline-none focus:ring-2 focus:ring-primary/40">
                <option value="source">Source</option>
                <option value="processor">Processor</option>
                <option value="sink">Sink</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-label text-onSurface-variant uppercase tracking-wide">Icon</label>
              <input v-model="newIcon" type="text" placeholder="📦"
                class="w-full bg-surface-high rounded-xl px-4 py-2.5 text-sm font-body text-onSurface outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div v-if="createError" class="text-sm text-error font-label">{{ createError }}</div>
          <div class="flex justify-end gap-3 pt-1">
            <button class="px-5 py-2.5 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors" @click="closeModal">Cancel</button>
            <button :disabled="!newName.trim() || store.loading"
              class="px-5 py-2.5 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity disabled:opacity-50"
              @click="handleCreate">{{ store.loading ? 'Creating…' : 'Create' }}</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete confirm -->
    <transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="toDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="toDelete = null">
        <div class="glass rounded-2xl p-8 w-full max-w-sm shadow-2xl space-y-5">
          <h2 class="font-headline font-semibold text-onSurface text-lg">Delete Node Type?</h2>
          <p class="text-sm text-onSurface-variant font-body">"<strong>{{ toDelete.name }}</strong>" will be permanently deleted.</p>
          <div class="flex justify-end gap-3">
            <button class="px-5 py-2.5 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors" @click="toDelete = null">Cancel</button>
            <button :disabled="store.loading"
              class="px-5 py-2.5 rounded-xl font-label text-sm font-semibold bg-error text-background hover:opacity-90 transition-opacity disabled:opacity-50"
              @click="handleDelete">{{ store.loading ? 'Deleting…' : 'Delete' }}</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNodeTypesStore } from '../stores/nodeTypes';
import type { NodeType } from '../types';

const router = useRouter();
const store = useNodeTypesStore();

const showCreateModal = ref(false);
const newName = ref('');
const newCategory = ref<'source' | 'processor' | 'sink'>('source');
const newIcon = ref('📦');
const createError = ref('');
const toDelete = ref<NodeType | null>(null);

const categories = [
  { key: 'source',    label: 'Sources',    icon: '🟢' },
  { key: 'processor', label: 'Processors', icon: '🟡' },
  { key: 'sink',      label: 'Sinks',      icon: '🔵' },
];

onMounted(() => store.fetchNodeTypes());

function byCategory(cat: string) {
  return store.nodeTypes.filter((n) => n.category === cat);
}

function closeModal() {
  showCreateModal.value = false;
  newName.value = '';
  newIcon.value = '📦';
  newCategory.value = 'source';
  createError.value = '';
}

async function handleCreate() {
  if (!newName.value.trim()) return;
  createError.value = '';
  try {
    const nt = await store.createNodeType({
      name: newName.value.trim(),
      icon: newIcon.value || '📦',
      category: newCategory.value,
      description: undefined,
      properties: [],
      language: 'javascript',
      code: undefined,
    });
    closeModal();
    router.push(`/nodes-catalog/${nt.id}/edit`);
  } catch (err: any) {
    createError.value = err?.detail ?? 'Failed to create';
  }
}

async function handleDelete() {
  if (!toDelete.value) return;
  try {
    await store.deleteNodeType(toDelete.value.id);
    toDelete.value = null;
  } catch {}
}
</script>
