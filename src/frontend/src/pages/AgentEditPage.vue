<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-headline font-semibold text-primary">Edit Agent</h1>
      <p class="mt-1 text-sm text-onSurface-variant font-body">
        Update your agent's identity, model, role, and capabilities.
      </p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loadingAgent" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="n in 4" :key="n" class="glass rounded-2xl p-6 animate-pulse space-y-4">
        <div class="h-4 bg-surface-high rounded w-1/3"></div>
        <div class="h-10 bg-surface-high rounded"></div>
        <div class="h-10 bg-surface-high rounded"></div>
      </div>
    </div>

    <!-- Not found -->
    <div
      v-else-if="notFound"
      class="glass rounded-xl p-16 flex flex-col items-center gap-4 text-center"
    >
      <p class="font-headline font-semibold text-onSurface text-xl">Agent not found</p>
      <button
        class="text-sm font-label text-primary hover:opacity-70 transition-opacity"
        @click="router.push('/agents')"
      >
        Back to Agents
      </button>
    </div>

    <!-- Form — only rendered after agent data is loaded -->
    <template v-else-if="agentLoaded">
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
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left column: Identity + Role Definition -->
          <div class="space-y-6">
            <div class="glass rounded-2xl p-6 bg-surface/60 backdrop-blur-glass">
              <h2 class="text-lg font-headline font-semibold text-onSurface mb-5">Identity</h2>
              <IdentitySection
                ref="identitySectionRef"
                :name="form.name"
                :description="form.description"
                :avatar-url="form.avatar_url"
                @update:name="form.name = $event"
                @update:description="form.description = $event"
                @update:avatar-url="form.avatar_url = $event"
                @validation-error="handleValidationError"
              />
            </div>

            <div class="glass rounded-2xl p-6 bg-surface/60 backdrop-blur-glass">
              <h2 class="text-lg font-headline font-semibold text-onSurface mb-5">Role Definition</h2>
              <RoleDefinitionSection
                :system-prompt="form.system_prompt"
                @update:system-prompt="form.system_prompt = $event"
              />
            </div>
          </div>

          <!-- Right column: Model Config + Capabilities -->
          <div class="space-y-6">
            <div class="glass rounded-2xl p-6 bg-surface/60 backdrop-blur-glass">
              <h2 class="text-lg font-headline font-semibold text-onSurface mb-5">Model Configuration</h2>
              <ModelConfigSection
                :provider="form.provider"
                :model="form.model"
                :temperature="form.temperature"
                @update:provider="form.provider = $event as typeof form.provider"
                @update:model="form.model = $event"
                @update:temperature="form.temperature = $event"
              />
            </div>

            <div class="glass rounded-2xl p-6 bg-surface/60 backdrop-blur-glass">
              <h2 class="text-lg font-headline font-semibold text-onSurface mb-5">Capabilities</h2>
              <CapabilitiesSection v-model="form.capabilities" />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
          <button
            type="button"
            class="w-full sm:w-auto px-6 py-3 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors"
            @click="router.push('/agents')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="agentStore.loading"
            class="w-full sm:w-auto px-8 py-3 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg
              v-if="agentStore.loading"
              class="animate-spin w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ agentStore.loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAgentStore } from '../stores/agents';
import type { AgentCreate } from '../types';
import IdentitySection from '../components/AgentForm/IdentitySection.vue';
import ModelConfigSection from '../components/AgentForm/ModelConfigSection.vue';
import RoleDefinitionSection from '../components/AgentForm/RoleDefinitionSection.vue';
import CapabilitiesSection from '../components/AgentForm/CapabilitiesSection.vue';

const router = useRouter();
const route = useRoute();
const agentStore = useAgentStore();

const agentId = route.params.id as string;

const identitySectionRef = ref<InstanceType<typeof IdentitySection> | null>(null);
const loadingAgent = ref(true);
const agentLoaded = ref(false);
const notFound = ref(false);
const successMessage = ref('');
const globalError = ref('');
const validationErrors = reactive<Record<string, boolean>>({});

const form = reactive<AgentCreate & { avatar_url?: string; system_prompt?: string }>({
  name: '',
  description: '',
  avatar_url: '',
  provider: 'openai',
  model: '',
  temperature: 0.7,
  system_prompt: '',
  capabilities: [],
  status: 'active',
});

onMounted(async () => {
  try {
    const agent = await agentStore.fetchAgentById(agentId);
    form.name = agent.name;
    form.description = agent.description ?? '';
    form.avatar_url = agent.avatar_url ?? '';
    form.provider = agent.provider;
    form.model = agent.model;
    form.temperature = agent.temperature;
    form.system_prompt = agent.system_prompt ?? '';
    form.capabilities = [...agent.capabilities];
    form.status = agent.status;
    agentLoaded.value = true;
  } catch {
    notFound.value = true;
  } finally {
    loadingAgent.value = false;
  }
});

function handleValidationError(field: string, hasError: boolean) {
  validationErrors[field] = hasError;
}

function validateForm(): boolean {
  identitySectionRef.value?.validateName();
  return form.name.trim().length >= 3 && form.name.trim().length <= 100;
}

async function handleSubmit() {
  globalError.value = '';
  if (!validateForm()) return;

  try {
    const payload: AgentCreate = {
      name: form.name.trim(),
      description: form.description || undefined,
      avatar_url: form.avatar_url || undefined,
      provider: form.provider,
      model: form.model,
      temperature: form.temperature,
      system_prompt: form.system_prompt || undefined,
      capabilities: form.capabilities,
      status: form.status ?? 'active',
    };
    await agentStore.updateAgent(agentId, payload);
    successMessage.value = 'Agent updated successfully!';
    setTimeout(() => {
      router.push('/agents');
    }, 1200);
  } catch (err: any) {
    globalError.value = err?.detail ?? 'Failed to update agent. Please try again.';
  }
}
</script>
