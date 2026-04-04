<template>
  <div class="max-w-7xl mx-auto space-y-6">

    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-headline font-semibold text-primary">Edit Project</h1>
      <p class="mt-1 text-sm text-onSurface-variant font-body">
        Update project details and manage its subprojects.
      </p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-6">
      <div class="glass rounded-2xl p-6 animate-pulse space-y-4">
        <div class="h-4 bg-surface-high rounded w-1/4"></div>
        <div class="h-10 bg-surface-high rounded"></div>
        <div class="h-10 bg-surface-high rounded"></div>
      </div>
      <div class="glass rounded-2xl p-6 animate-pulse h-40"></div>
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="glass rounded-xl p-16 flex flex-col items-center gap-4 text-center">
      <p class="font-headline font-semibold text-onSurface text-xl">Project not found</p>
      <button class="text-sm font-label text-primary hover:opacity-70 transition-opacity" @click="router.push('/projects')">
        Back to Projects
      </button>
    </div>

    <template v-else-if="projectLoaded">

      <!-- Success toast -->
      <transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 translate-y-[-8px]"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="successMessage"
          class="fixed top-6 right-6 z-50 bg-surface-high text-onSurface rounded-lg px-5 py-3 shadow-lg flex items-center gap-3">
          <span class="w-2 h-2 rounded-full bg-primary shrink-0" />
          <span class="font-label text-sm">{{ successMessage }}</span>
        </div>
      </transition>

      <!-- Global error -->
      <div v-if="globalError"
        class="bg-surface-high rounded-lg px-5 py-3 text-error font-label text-sm flex items-center gap-3">
        <span class="w-2 h-2 rounded-full bg-error shrink-0" />
        {{ globalError }}
      </div>

      <!-- Two-column layout: Project Details (left) + Subprojects (right) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        <!-- Project Info Card -->
        <div class="glass rounded-2xl p-6 space-y-5">
          <h2 class="text-lg font-headline font-semibold text-onSurface">Project Details</h2>

          <!-- Name -->
          <div class="space-y-1">
            <label class="font-label text-sm text-onSurface-variant">Name *</label>
            <input v-model="form.name" type="text" placeholder="Project name"
              class="w-full bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary"
              :class="{ 'ring-1 ring-error': nameError }" @blur="nameError = form.name.trim().length === 0" />
            <p v-if="nameError" class="text-xs text-error font-label">Name is required.</p>
          </div>

          <!-- Description -->
          <div class="space-y-1">
            <label class="font-label text-sm text-onSurface-variant">Description</label>
            <textarea v-model="form.description" rows="3" placeholder="Describe this project..."
              class="w-full bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>

          <!-- Labels -->
          <div class="space-y-1">
            <label class="font-label text-sm text-onSurface-variant">Labels</label>
            <div class="flex flex-wrap gap-2 mb-2" v-if="form.labels.length">
              <span v-for="(label, i) in form.labels" :key="label"
                class="flex items-center gap-1 bg-surface-highest text-onSurface-variant font-label text-xs px-2 py-1 rounded-full">
                {{ label }}
                <button type="button" class="hover:text-error transition-colors" @click="form.labels.splice(i, 1)">×</button>
              </span>
            </div>
            <div class="flex gap-2">
              <input v-model="labelInput" type="text" placeholder="Add label and press Enter"
                class="flex-1 bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary"
                @keydown.enter.prevent="addLabel" />
              <button type="button"
                class="px-4 py-2 rounded-lg bg-surface-highest text-onSurface-variant font-label text-sm hover:bg-surface-high transition-colors"
                @click="addLabel">Add</button>
            </div>
          </div>

          <!-- Actions row -->
          <div class="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
            <button
              class="px-5 py-2.5 rounded-xl font-label text-sm text-error border border-error/30 hover:bg-error/10 transition-colors"
              @click="confirmDeleteProject = true">
              Delete Project
            </button>
            <div class="flex gap-3 justify-end">
              <button
                class="px-6 py-2.5 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors"
                @click="router.push('/projects')">
                Cancel
              </button>
              <button :disabled="saving"
                class="px-8 py-2.5 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                @click="saveProject">
                <svg v-if="saving" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Subprojects Card -->
        <div class="glass rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-headline font-semibold text-onSurface">Subprojects</h2>
            <button
              class="flex items-center gap-2 px-4 py-2 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity"
              @click="openSubprojectModal(null)">
              + New Subproject
            </button>
          </div>

          <!-- Empty -->
          <div v-if="subprojects.length === 0" class="py-10 text-center text-onSurface-variant">
            <p class="font-label">No subprojects yet.</p>
            <p class="text-sm mt-1">Create one to start working.</p>
          </div>

          <!-- List -->
          <div v-else class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            <div v-for="sub in subprojects" :key="sub.id"
              class="bg-surface-low rounded-xl p-4 flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <p class="font-headline font-semibold text-onSurface truncate">{{ sub.name }}</p>
                <p class="text-sm text-onSurface-variant font-body mt-0.5 truncate">
                  {{ sub.description || 'No description' }}
                </p>
                <!-- Agent badge -->
                <div v-if="sub.agentName" class="mt-2 inline-flex items-center gap-1.5 text-xs font-label bg-surface-highest px-2 py-1 rounded-full text-onSurface-variant">
                  <span class="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[9px] text-background font-bold">
                    {{ sub.agentName.charAt(0).toUpperCase() }}
                  </span>
                  {{ sub.agentName }}
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <button
                  class="px-3 py-1.5 rounded-lg text-xs font-label text-primary border border-primary/30 hover:bg-primary/10 transition-colors"
                  @click="router.push('/workspace/' + sub.id)">
                  Open →
                </button>
                <button
                  class="p-1.5 rounded-lg text-onSurface-variant hover:text-onSurface hover:bg-surface-high transition-colors"
                  title="Edit" @click="openSubprojectModal(sub)">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  class="p-1.5 rounded-lg text-error hover:bg-error/10 transition-colors"
                  title="Delete" @click="deleteSubprojectTarget = sub; confirmDeleteSubproject = true">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </template>

    <!-- ── Subproject Modal ─────────────────────────────────────────── -->
    <transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showSubprojectModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="showSubprojectModal = false">
        <div class="glass rounded-2xl p-6 max-w-md w-full mx-4 space-y-4">
          <h3 class="font-headline font-semibold text-onSurface text-lg">
            {{ subprojectForm.id ? 'Edit Subproject' : 'New Subproject' }}
          </h3>

          <div class="space-y-1">
            <label class="font-label text-sm text-onSurface-variant">Name *</label>
            <input v-model="subprojectForm.name" type="text" placeholder="Subproject name"
              class="w-full bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div class="space-y-1">
            <label class="font-label text-sm text-onSurface-variant">Description</label>
            <textarea v-model="subprojectForm.description" rows="2" placeholder="Optional description..."
              class="w-full bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>

          <div class="space-y-1">
            <label class="font-label text-sm text-onSurface-variant">Assign Agent</label>
            <div class="relative">
              <select v-model="subprojectForm.agent_id"
                class="w-full appearance-none bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface focus:outline-none focus:ring-1 focus:ring-primary pr-8">
                <option value="">— No agent —</option>
                <option v-for="agent in availableAgents" :key="agent.id" :value="agent.id">
                  {{ agent.name }}
                </option>
              </select>
              <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-onSurface-variant text-xs">&#9660;</span>
            </div>
          </div>

          <p v-if="subprojectError" class="text-xs text-error font-label">{{ subprojectError }}</p>

          <div class="flex justify-end gap-3 pt-1">
            <button
              class="px-5 py-2 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors"
              @click="showSubprojectModal = false">Cancel</button>
            <button :disabled="subprojectSaving"
              class="px-6 py-2 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity disabled:opacity-50"
              @click="saveSubproject">
              {{ subprojectSaving ? 'Saving...' : (subprojectForm.id ? 'Save' : 'Create') }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ── Delete Project Confirm ──────────────────────────────────── -->
    <transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="confirmDeleteProject"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="confirmDeleteProject = false">
        <div class="glass rounded-2xl p-8 max-w-sm w-full mx-4 space-y-4">
          <h3 class="font-headline font-semibold text-onSurface text-lg">Delete Project</h3>
          <p class="font-body text-sm text-onSurface-variant">
            Are you sure you want to delete <span class="text-onSurface font-semibold">{{ form.name }}</span>? This will also delete all its subprojects.
          </p>
          <div class="flex gap-3 justify-end">
            <button class="px-5 py-2 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors"
              @click="confirmDeleteProject = false">Cancel</button>
            <button class="px-5 py-2 rounded-xl font-label text-sm font-semibold bg-error text-background hover:opacity-80 transition-opacity"
              @click="deleteProject">Delete</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ── Delete Subproject Confirm ──────────────────────────────── -->
    <transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="confirmDeleteSubproject"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="confirmDeleteSubproject = false">
        <div class="glass rounded-2xl p-8 max-w-sm w-full mx-4 space-y-4">
          <h3 class="font-headline font-semibold text-onSurface text-lg">Delete Subproject</h3>
          <p class="font-body text-sm text-onSurface-variant">
            Are you sure you want to delete <span class="text-onSurface font-semibold">{{ deleteSubprojectTarget?.name }}</span>?
          </p>
          <div class="flex gap-3 justify-end">
            <button class="px-5 py-2 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors"
              @click="confirmDeleteSubproject = false">Cancel</button>
            <button class="px-5 py-2 rounded-xl font-label text-sm font-semibold bg-error text-background hover:opacity-80 transition-opacity"
              @click="deleteSubproject">Delete</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apiClient } from '../api/client';

const router = useRouter();
const route = useRoute();
const projectId = route.params.id as string;

// Page state
const loading = ref(true);
const notFound = ref(false);
const projectLoaded = ref(false);
const saving = ref(false);
const successMessage = ref('');
const globalError = ref('');
const nameError = ref(false);
const labelInput = ref('');

// Confirm dialogs
const confirmDeleteProject = ref(false);
const confirmDeleteSubproject = ref(false);
const deleteSubprojectTarget = ref<any>(null);

// Project form
const form = reactive({ name: '', description: '', labels: [] as string[] });

// Subprojects
interface SubprojectRow {
  id: string;
  name: string;
  description: string;
  agent_id: string;
  agentName: string;
}
const subprojects = ref<SubprojectRow[]>([]);

// Agents list for selects
const availableAgents = ref<Array<{ id: string; name: string }>>([]);

// Subproject modal
const showSubprojectModal = ref(false);
const subprojectSaving = ref(false);
const subprojectError = ref('');
const subprojectForm = reactive({ id: '', name: '', description: '', agent_id: '' });

// ── Load ──────────────────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    const [projectRes, subsRes, agentsRes] = await Promise.all([
      apiClient.get<any>(`/api/v1/workspace/projects/${projectId}`),
      apiClient.get<any>(`/api/v1/workspace/subprojects?project_id=${projectId}`),
      apiClient.get<any>('/api/v1/agents'),
    ]);

    form.name = projectRes.name;
    form.description = projectRes.description ?? '';
    form.labels = projectRes.labels ?? [];

    availableAgents.value = agentsRes.items ?? [];

    const agentMap = new Map(availableAgents.value.map((a) => [a.id, a.name]));
    subprojects.value = (subsRes.items ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? '',
      agent_id: s.agent_id ?? '',
      agentName: s.agent_id ? (agentMap.get(s.agent_id) ?? '') : '',
    }));

    projectLoaded.value = true;
  } catch {
    notFound.value = true;
  } finally {
    loading.value = false;
  }
});

// ── Labels ────────────────────────────────────────────────────────────────────

function addLabel() {
  const tag = labelInput.value.trim();
  if (tag && !form.labels.includes(tag)) form.labels.push(tag);
  labelInput.value = '';
}

// ── Save project ──────────────────────────────────────────────────────────────

async function saveProject() {
  nameError.value = form.name.trim().length === 0;
  if (nameError.value) return;
  globalError.value = '';
  saving.value = true;
  try {
    await apiClient.patch(`/api/v1/workspace/projects/${projectId}`, {
      name: form.name.trim(),
      description: form.description.trim() || null,
      labels: form.labels,
    });
    successMessage.value = 'Project saved successfully!';
    setTimeout(() => { successMessage.value = ''; }, 2500);
  } catch (err: any) {
    globalError.value = err?.detail ?? 'Failed to save project.';
  } finally {
    saving.value = false;
  }
}

// ── Delete project ────────────────────────────────────────────────────────────

async function deleteProject() {
  try {
    await apiClient.delete(`/api/v1/workspace/projects/${projectId}`);
    router.push('/projects');
  } catch (err: any) {
    globalError.value = err?.detail ?? 'Failed to delete project.';
    confirmDeleteProject.value = false;
  }
}

// ── Subproject modal ──────────────────────────────────────────────────────────

function openSubprojectModal(sub: SubprojectRow | null) {
  subprojectError.value = '';
  if (sub) {
    Object.assign(subprojectForm, { id: sub.id, name: sub.name, description: sub.description, agent_id: sub.agent_id });
  } else {
    Object.assign(subprojectForm, { id: '', name: '', description: '', agent_id: '' });
  }
  showSubprojectModal.value = true;
}

async function saveSubproject() {
  if (!subprojectForm.name.trim()) { subprojectError.value = 'Name is required.'; return; }
  subprojectError.value = '';
  subprojectSaving.value = true;
  try {
    const agentMap = new Map(availableAgents.value.map((a) => [a.id, a.name]));
    if (subprojectForm.id) {
      // update
      await apiClient.patch(`/api/v1/workspace/subprojects/${subprojectForm.id}`, {
        name: subprojectForm.name.trim(),
        description: subprojectForm.description.trim() || null,
        agent_id: subprojectForm.agent_id || null,
      });
      const idx = subprojects.value.findIndex((s) => s.id === subprojectForm.id);
      if (idx !== -1) {
        subprojects.value[idx] = {
          id: subprojectForm.id,
          name: subprojectForm.name.trim(),
          description: subprojectForm.description.trim(),
          agent_id: subprojectForm.agent_id,
          agentName: subprojectForm.agent_id ? (agentMap.get(subprojectForm.agent_id) ?? '') : '',
        };
      }
    } else {
      // create
      const created = await apiClient.post<any>('/api/v1/workspace/subprojects', {
        project_id: projectId,
        name: subprojectForm.name.trim(),
        description: subprojectForm.description.trim() || null,
        agent_id: subprojectForm.agent_id || null,
      });
      subprojects.value.push({
        id: created.id,
        name: created.name,
        description: created.description ?? '',
        agent_id: created.agent_id ?? '',
        agentName: created.agent_id ? (agentMap.get(created.agent_id) ?? '') : '',
      });
    }
    showSubprojectModal.value = false;
  } catch (err: any) {
    subprojectError.value = err?.detail ?? 'Failed to save subproject.';
  } finally {
    subprojectSaving.value = false;
  }
}

// ── Delete subproject ─────────────────────────────────────────────────────────

async function deleteSubproject() {
  if (!deleteSubprojectTarget.value) return;
  try {
    await apiClient.delete(`/api/v1/workspace/subprojects/${deleteSubprojectTarget.value.id}`);
    subprojects.value = subprojects.value.filter((s) => s.id !== deleteSubprojectTarget.value.id);
  } catch (err: any) {
    globalError.value = err?.detail ?? 'Failed to delete subproject.';
  } finally {
    confirmDeleteSubproject.value = false;
    deleteSubprojectTarget.value = null;
  }
}
</script>
