<template>
  <div class="flex flex-col gap-8">
    <!-- Page header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="font-headline text-3xl font-bold text-primary">Model Registry</h1>
        <p class="text-onSurface-variant font-body text-sm mt-1">
          Manage registered LLM models, feature mappings, and monitor registry health.
        </p>
      </div>
      <button
        class="flex-shrink-0 px-5 py-2.5 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity"
        @click="router.push('/model-registry/new')"
      >
        + Add Model
      </button>
    </div>

    <!-- Stats row -->
    <RegistryStatsRow />

    <!-- Main content: 2-col on lg -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left: Registered Models (2/3) -->
      <div class="flex-1 lg:flex-[2] flex flex-col gap-4">
        <h2 class="font-headline font-semibold text-onSurface text-xl">Registered Models</h2>

        <!-- Loading -->
        <div v-if="registryStore.loading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="n in 4"
            :key="n"
            class="glass rounded-2xl p-5 animate-pulse space-y-3 h-28"
          >
            <div class="h-4 bg-surface-high rounded w-2/3"></div>
            <div class="h-3 bg-surface-high rounded w-1/3"></div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="registryStore.models.length === 0"
          class="glass rounded-2xl p-12 flex flex-col items-center gap-3 text-center"
        >
          <p class="font-headline font-semibold text-onSurface">No models registered yet</p>
          <p class="text-sm text-onSurface-variant font-body">Add your first model to get started.</p>
          <button
            class="mt-2 px-5 py-2 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity"
            @click="router.push('/model-registry/new')"
          >
            + Add Model
          </button>
        </div>

        <!-- Model grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModelCard
            v-for="model in registryStore.models"
            :key="model.id"
            :model="model"
            @edit="router.push(`/model-registry/${model.id}/edit`)"
            @delete="confirmDelete(model)"
          />
        </div>
      </div>

      <!-- Right: Feature Mapping (1/3) -->
      <div class="lg:flex-1 w-full">
        <FeatureModelMapping />
      </div>
    </div>

    <!-- API Key Manager -->
    <div>
      <h2 class="font-headline font-semibold text-onSurface text-xl mb-4">API Keys</h2>
      <APIKeyManager />
    </div>

    <!-- Delete confirmation modal -->
    <transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="deleteTarget"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="deleteTarget = null"
      >
        <div class="glass rounded-2xl p-8 max-w-sm w-full mx-4 space-y-5">
          <h3 class="font-headline font-semibold text-onSurface text-lg">Delete Model</h3>
          <p class="font-body text-sm text-onSurface-variant">
            Are you sure you want to delete
            <span class="text-onSurface font-semibold">{{ deleteTarget?.name }}</span>?
            This action cannot be undone.
          </p>
          <div class="flex gap-3 justify-end">
            <button
              class="px-5 py-2 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors"
              @click="deleteTarget = null"
            >
              Cancel
            </button>
            <button
              class="px-5 py-2 rounded-xl font-label text-sm font-semibold bg-error text-background hover:opacity-80 transition-opacity"
              :disabled="registryStore.loading"
              @click="handleDelete"
            >
              Delete
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
import { useRegistryStore } from '../stores/registry';
import type { RegistryModel } from '../types';
import RegistryStatsRow from '../components/RegistryStatsRow.vue';
import ModelCard from '../components/ModelCard.vue';
import FeatureModelMapping from '../components/FeatureModelMapping.vue';
import APIKeyManager from '../components/APIKeyManager.vue';

const router = useRouter();
const registryStore = useRegistryStore();

const deleteTarget = ref<RegistryModel | null>(null);

onMounted(async () => {
  await Promise.all([
    registryStore.fetchModels(),
    registryStore.fetchApiKeys(),
    registryStore.fetchFeatureMappings(),
  ]);
});

function confirmDelete(model: RegistryModel) {
  deleteTarget.value = model;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  await registryStore.deleteModel(deleteTarget.value.id);
  deleteTarget.value = null;
}
</script>
