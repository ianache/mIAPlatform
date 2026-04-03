<template>
  <div class="glass rounded-2xl p-6">
    <h3 class="font-headline font-semibold text-onSurface text-lg mb-4">
      Feature-to-Model Mapping
    </h3>

    <div class="flex flex-col gap-1">
      <div
        v-for="(feature, index) in features"
        :key="feature.id"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150"
        :class="index % 2 === 0 ? 'bg-surface-low' : 'bg-surface'"
      >
        <!-- Feature name -->
        <span class="flex-1 font-body text-sm text-onSurface truncate">{{ feature.name }}</span>

        <!-- Model selector -->
        <div class="relative flex-shrink-0">
          <select
            v-model="feature.selectedModel"
            class="appearance-none bg-surface-highest text-onSurface-variant font-label text-xs rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            @change="handleChange(feature)"
          >
            <option
              v-for="model in availableModels"
              :key="model.id"
              :value="model.id"
            >
              {{ model.label }}
            </option>
          </select>
          <!-- dropdown arrow -->
          <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-onSurface-variant text-[10px]">
            &#9660;
          </span>
        </div>

        <!-- Save indicator -->
        <span
          v-if="feature.saved"
          class="text-green-400 font-label text-xs flex-shrink-0"
        >
          Saved
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAgentStore } from '../stores/agents';

const agentStore = useAgentStore();

interface FeatureRow {
  id: string;
  name: string;
  selectedModel: string;
  saved: boolean;
}

const features = ref<FeatureRow[]>([
  { id: 'core-chat', name: 'Core Chat Agent', selectedModel: 'gpt-4o', saved: false },
  { id: 'report-gen', name: 'Report Generator', selectedModel: 'claude-3-5-sonnet', saved: false },
  { id: 'web-search', name: 'Web Search Assistant', selectedModel: 'gemini-1.5-pro', saved: false },
]);

const availableModels = agentStore.availableModels;

function handleChange(feature: FeatureRow) {
  feature.saved = false;
  // Simulate save after short debounce
  setTimeout(() => {
    feature.saved = true;
    setTimeout(() => { feature.saved = false; }, 2000);
  }, 300);
}
</script>
