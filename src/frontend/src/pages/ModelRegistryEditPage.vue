<template>
  <div class="max-w-3xl mx-auto space-y-8">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-headline font-semibold text-primary">
        {{ isEdit ? 'Edit Model' : 'Add Model' }}
      </h1>
      <p class="mt-1 text-sm text-onSurface-variant font-body">
        {{ isEdit ? 'Update model details in the registry.' : 'Register a new LLM model.' }}
      </p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loadingModel" class="glass rounded-2xl p-6 animate-pulse space-y-4">
      <div class="h-4 bg-surface-high rounded w-1/3"></div>
      <div class="h-10 bg-surface-high rounded"></div>
      <div class="h-10 bg-surface-high rounded"></div>
      <div class="h-10 bg-surface-high rounded"></div>
    </div>

    <!-- Not found -->
    <div
      v-else-if="notFound"
      class="glass rounded-xl p-16 flex flex-col items-center gap-4 text-center"
    >
      <p class="font-headline font-semibold text-onSurface text-xl">Model not found</p>
      <button
        class="text-sm font-label text-primary hover:opacity-70 transition-opacity"
        @click="router.push('/model-registry')"
      >
        Back to Registry
      </button>
    </div>

    <!-- Form -->
    <template v-else-if="modelLoaded">
      <!-- Success toast -->
      <transition
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0 translate-y-[-8px]"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="successMessage"
          class="fixed top-6 right-6 z-50 bg-surface-high text-onSurface rounded-lg px-5 py-3 shadow-lg flex items-center gap-3"
        >
          <span class="w-2 h-2 rounded-full bg-primary shrink-0" />
          <span class="font-label text-sm">{{ successMessage }}</span>
        </div>
      </transition>

      <!-- Global API error -->
      <div
        v-if="globalError"
        class="bg-surface-high rounded-lg px-5 py-3 text-error font-label text-sm flex items-center gap-3"
      >
        <span class="w-2 h-2 rounded-full bg-error shrink-0" />
        {{ globalError }}
      </div>

      <form @submit.prevent="handleSubmit" novalidate>
        <div class="glass rounded-2xl p-6 bg-surface/60 backdrop-blur-glass space-y-5">
          <h2 class="text-lg font-headline font-semibold text-onSurface">Model Details</h2>

          <!-- Name -->
          <div class="space-y-1">
            <label class="font-label text-sm text-onSurface-variant">Name *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. gpt-4o"
              class="w-full bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary"
              :class="{ 'ring-1 ring-error': nameError }"
              @blur="validateName"
            />
            <p v-if="nameError" class="text-xs text-error font-label">Name is required.</p>
          </div>

          <!-- Provider -->
          <div class="space-y-1">
            <label class="font-label text-sm text-onSurface-variant">Provider *</label>
            <div class="relative">
              <select
                v-model="form.provider"
                class="w-full appearance-none bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface focus:outline-none focus:ring-1 focus:ring-primary pr-8"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
                <option value="other">Other</option>
              </select>
              <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-onSurface-variant text-xs">&#9660;</span>
            </div>
          </div>

          <!-- Status -->
          <div class="space-y-1">
            <label class="font-label text-sm text-onSurface-variant">Status</label>
            <div class="relative">
              <select
                v-model="form.status"
                class="w-full appearance-none bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface focus:outline-none focus:ring-1 focus:ring-primary pr-8"
              >
                <option value="active">Active</option>
                <option value="beta">Beta</option>
                <option value="deprecated">Deprecated</option>
              </select>
              <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-onSurface-variant text-xs">&#9660;</span>
            </div>
          </div>

          <!-- Context Window -->
          <div class="space-y-1">
            <label class="font-label text-sm text-onSurface-variant">Context Window (tokens)</label>
            <input
              v-model.number="form.context_window"
              type="number"
              placeholder="e.g. 128000"
              min="1"
              class="w-full bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <!-- Tags -->
          <div class="space-y-1">
            <label class="font-label text-sm text-onSurface-variant">Tags</label>
            <!-- Tag chips -->
            <div class="flex flex-wrap gap-2 mb-2" v-if="form.tags.length">
              <span
                v-for="(tag, i) in form.tags"
                :key="tag"
                class="flex items-center gap-1 bg-surface-highest text-onSurface-variant font-label text-xs px-2 py-1 rounded-full"
              >
                {{ tag }}
                <button
                  type="button"
                  class="text-onSurface-variant hover:text-error transition-colors"
                  @click="removeTag(i)"
                >
                  ×
                </button>
              </span>
            </div>
            <!-- Tag input -->
            <div class="flex gap-2">
              <input
                v-model="tagInput"
                type="text"
                placeholder="Add tag and press Enter"
                class="flex-1 bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary"
                @keydown.enter.prevent="addTag"
              />
              <button
                type="button"
                class="px-4 py-2 rounded-lg bg-surface-highest text-onSurface-variant font-label text-sm hover:bg-surface-high transition-colors"
                @click="addTag"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
          <button
            type="button"
            class="w-full sm:w-auto px-6 py-3 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors"
            @click="router.push('/model-registry')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="registryStore.loading"
            class="w-full sm:w-auto px-8 py-3 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg
              v-if="registryStore.loading"
              class="animate-spin w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ registryStore.loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Model' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRegistryStore } from '../stores/registry';
import type { RegistryModelCreate } from '../types';

const router = useRouter();
const route = useRoute();
const registryStore = useRegistryStore();

const modelId = route.params.id as string | undefined;
const isEdit = computed(() => !!modelId);

const loadingModel = ref(isEdit.value);
const modelLoaded = ref(!isEdit.value); // create mode: immediately ready
const notFound = ref(false);
const successMessage = ref('');
const globalError = ref('');
const nameError = ref(false);
const tagInput = ref('');

const form = reactive<RegistryModelCreate>({
  name: '',
  provider: 'openai',
  status: 'active',
  tags: [],
  context_window: null,
});

onMounted(async () => {
  if (!isEdit.value) return;
  try {
    const model = await registryStore.fetchModelById(modelId!);
    form.name = model.name;
    form.provider = model.provider;
    form.status = model.status;
    form.tags = [...model.tags];
    form.context_window = model.context_window;
    modelLoaded.value = true;
  } catch {
    notFound.value = true;
  } finally {
    loadingModel.value = false;
  }
});

function validateName() {
  nameError.value = form.name.trim().length === 0;
}

function addTag() {
  const tag = tagInput.value.trim();
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag);
  }
  tagInput.value = '';
}

function removeTag(index: number) {
  form.tags.splice(index, 1);
}

async function handleSubmit() {
  validateName();
  if (nameError.value) return;

  globalError.value = '';
  const payload: RegistryModelCreate = {
    name: form.name.trim(),
    provider: form.provider,
    status: form.status,
    tags: form.tags,
    context_window: form.context_window || null,
  };

  try {
    if (isEdit.value) {
      await registryStore.updateModel(modelId!, payload);
      successMessage.value = 'Model updated successfully!';
    } else {
      await registryStore.createModel(payload);
      successMessage.value = 'Model added successfully!';
    }
    setTimeout(() => {
      router.push('/model-registry');
    }, 1200);
  } catch (err: any) {
    globalError.value = err?.detail ?? 'Failed to save model. Please try again.';
  }
}
</script>
