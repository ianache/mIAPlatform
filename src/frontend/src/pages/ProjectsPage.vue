<template>
  <div class="flex flex-col h-full max-w-[1400px] mx-auto p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-headline font-semibold text-primary">Projects</h1>
        <p class="text-sm text-onSurface-variant font-label mt-1">
          Manage your projects and subprojects
        </p>
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background font-label hover:opacity-90 transition-opacity"
        @click="showNewProjectModal = true"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Project
      </button>
    </div>

    <!-- Search Bar -->
    <div class="glass rounded-xl p-4 mb-6">
      <div class="flex items-center gap-4">
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-onSurface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by project name..."
            class="w-full bg-surface-high rounded-lg pl-10 pr-4 py-3 text-sm font-body text-onSurface placeholder-onSurface-variant focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div class="relative min-w-[200px]">
          <select
            v-model="selectedLabel"
            class="w-full bg-surface-high rounded-lg px-4 py-3 text-sm font-body text-onSurface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none"
          >
            <option value="">All labels</option>
            <option v-for="label in allLabels" :key="label" :value="label">
              {{ label }}
            </option>
          </select>
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onSurface-variant pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Projects Grid -->
    <div v-if="filteredProjects.length === 0" class="flex-1 flex flex-col items-center justify-center text-onSurface-variant">
      <svg class="w-20 h-20 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <p class="font-label text-lg">No projects found</p>
      <p class="text-sm">Create a new project to get started</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="glass rounded-xl p-5 cursor-pointer transition-all hover:bg-surface-high"
        @click="openProject(project)"
      >
        <div class="flex items-start justify-between mb-3">
          <h3 class="font-headline font-semibold text-onSurface text-lg">{{ project.name }}</h3>
          <span class="text-xs font-label px-2 py-1 rounded-full bg-primary-container text-primary">
            {{ project.subproject_count }} subprojects
          </span>
        </div>
        <p class="text-sm text-onSurface-variant font-body mb-4 line-clamp-2">
          {{ project.description || 'No description' }}
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="label in project.labels || []"
            :key="label"
            class="text-xs font-label px-2 py-1 rounded bg-surface-high text-onSurface"
          >
            {{ label }}
          </span>
          <span v-if="!project.labels || project.labels.length === 0" class="text-xs text-onSurface-variant font-label">
            No labels
          </span>
        </div>
      </div>
    </div>

    <!-- New Project Modal -->
    <div v-if="showNewProjectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="glass rounded-xl p-6 w-96 max-w-[90vw]">
        <h2 class="text-xl font-headline font-semibold text-onSurface mb-4">New Project</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-label text-onSurface-variant mb-1">Project Name</label>
            <input
              v-model="newProject.name"
              type="text"
              class="w-full bg-surface-high rounded-lg px-3 py-2 text-sm text-onSurface focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter project name..."
            />
          </div>
          <div>
            <label class="block text-sm font-label text-onSurface-variant mb-1">Description</label>
            <textarea
              v-model="newProject.description"
              rows="2"
              class="w-full bg-surface-high rounded-lg px-3 py-2 text-sm text-onSurface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Enter description..."
            />
          </div>
          <div>
            <label class="block text-sm font-label text-onSurface-variant mb-1">Labels (comma separated)</label>
            <input
              v-model="newProject.labelsInput"
              type="text"
              class="w-full bg-surface-high rounded-lg px-3 py-2 text-sm text-onSurface focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., urgent, review, testing"
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
              :disabled="!newProject.name.trim()"
              @click="createProject"
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiClient } from '../api/client';

const router = useRouter();

// Search and filter
const searchQuery = ref('');
const selectedLabel = ref('');

// Projects with subproject count
const projects = ref<Array<any>>([]);

// Modal states
const showNewProjectModal = ref(false);

// Form data
const newProject = ref({
  name: '',
  description: '',
  labelsInput: ''
});

// Computed
const allLabels = computed(() => {
  const labels = new Set<string>();
  projects.value.forEach((p: any) => {
    (p.labels || []).forEach((label: string) => labels.add(label));
  });
  return Array.from(labels).sort();
});

const filteredProjects = computed(() => {
  return projects.value.filter((project: any) => {
    const matchesSearch = !searchQuery.value ||
      project.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.value.toLowerCase()));
    const matchesLabel = !selectedLabel.value ||
      (project.labels || []).includes(selectedLabel.value);
    return matchesSearch && matchesLabel;
  });
});

onMounted(async () => {
  await fetchProjects();
});

async function fetchProjects() {
  try {
    const projectsResponse = await apiClient.get('/api/v1/workspace/projects');
    const projectsList = projectsResponse.items || [];

    const projectsWithCounts = await Promise.all(
      projectsList.map(async (project: any) => {
        const subprojectsResponse = await apiClient.get(`/api/v1/workspace/subprojects?project_id=${project.id}`);
        return {
          ...project,
          subproject_count: subprojectsResponse.items?.length || 0
        };
      })
    );

    projects.value = projectsWithCounts;
  } catch (err) {
    console.error('Failed to fetch projects:', err);
  }
}

function openProject(project: any) {
  router.push(`/projects/${project.id}/edit`);
}

async function createProject() {
  if (!newProject.value.name.trim()) return;

  try {
    const labels = newProject.value.labelsInput
      .split(',')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    await apiClient.post('/api/v1/workspace/projects', {
      name: newProject.value.name.trim(),
      description: newProject.value.description.trim() || undefined,
      labels: labels.length > 0 ? labels : undefined
    });

    showNewProjectModal.value = false;
    newProject.value = { name: '', description: '', labelsInput: '' };
    await fetchProjects();
  } catch (err) {
    console.error('Failed to create project:', err);
    alert('Failed to create project');
  }
}
</script>
