<template>
  <div class="flex flex-col gap-8">
    <!-- Page header -->
    <div>
      <h1 class="font-headline text-3xl font-bold text-primary">Model Registry</h1>
      <p class="text-onSurface-variant font-body text-sm mt-1">
        Manage registered LLM models, feature mappings, and monitor registry health.
      </p>
    </div>

    <!-- Stats row -->
    <RegistryStatsRow />

    <!-- Main content: 2-col on lg -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left: Registered Models (2/3) -->
      <div class="flex-1 lg:flex-[2] flex flex-col gap-4">
        <h2 class="font-headline font-semibold text-onSurface text-xl">Registered Models</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModelCard v-for="model in models" :key="model.name" :model="model" />
        </div>
      </div>

      <!-- Right: Feature Mapping (1/3) -->
      <div class="lg:flex-1 w-full">
        <FeatureModelMapping />
      </div>
    </div>

    <!-- Activity table (full width) -->
    <RegistryActivityTable />
  </div>
</template>

<script setup lang="ts">
import RegistryStatsRow from '../components/RegistryStatsRow.vue';
import ModelCard from '../components/ModelCard.vue';
import FeatureModelMapping from '../components/FeatureModelMapping.vue';
import RegistryActivityTable from '../components/RegistryActivityTable.vue';

interface ModelInfo {
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
  status: 'Active' | 'Deprecated' | 'Beta';
  tags: string[];
}

const models: ModelInfo[] = [
  // OpenAI
  {
    name: 'gpt-4o',
    provider: 'openai',
    status: 'Active',
    tags: ['vision', 'function-calling', '128k context'],
  },
  {
    name: 'gpt-4o-mini',
    provider: 'openai',
    status: 'Active',
    tags: ['fast', '128k context'],
  },
  {
    name: 'gpt-3.5-turbo',
    provider: 'openai',
    status: 'Deprecated',
    tags: ['fast', '16k context'],
  },
  // Anthropic
  {
    name: 'claude-3-5-sonnet',
    provider: 'anthropic',
    status: 'Active',
    tags: ['reasoning', '200k context'],
  },
  {
    name: 'claude-3-opus',
    provider: 'anthropic',
    status: 'Active',
    tags: ['reasoning', '200k context'],
  },
  {
    name: 'claude-3-haiku',
    provider: 'anthropic',
    status: 'Active',
    tags: ['fast', '200k context'],
  },
  // Google
  {
    name: 'gemini-1.5-pro',
    provider: 'google',
    status: 'Active',
    tags: ['multimodal', '1M context'],
  },
  {
    name: 'gemini-1.5-flash',
    provider: 'google',
    status: 'Active',
    tags: ['fast', '1M context'],
  },
];
</script>
