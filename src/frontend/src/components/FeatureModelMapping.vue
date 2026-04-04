<template>
  <div class="glass rounded-2xl p-6">
    <h3 class="font-headline font-semibold text-onSurface text-lg mb-4">
      Feature-to-Model Mapping
    </h3>

    <!-- Empty state when no models and no mappings yet -->
    <p
      v-if="registryStore.models.length === 0 && rows.length === 0"
      class="text-sm font-body text-onSurface-variant text-center py-4"
    >
      Add models to the registry first, then configure mappings here.
    </p>

    <div v-else class="flex flex-col gap-1">
      <div
        v-for="(row, index) in rows"
        :key="row.featureId"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150"
        :class="index % 2 === 0 ? 'bg-surface-low' : 'bg-surface'"
      >
        <!-- Feature name -->
        <span class="flex-1 font-body text-sm text-onSurface truncate">{{ row.featureName }}</span>

        <!-- Model selector -->
        <div class="relative flex-shrink-0">
          <select
            v-model="row.selectedModel"
            class="appearance-none bg-surface-highest text-onSurface-variant font-label text-xs rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            @change="handleChange(row)"
          >
            <option value="">— none —</option>
            <option
              v-for="model in registryStore.models"
              :key="model.id"
              :value="model.name"
            >
              {{ model.name }}
            </option>
          </select>
          <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-onSurface-variant text-[10px]">
            &#9660;
          </span>
        </div>

        <!-- Save indicator -->
        <span v-if="row.saved" class="text-green-400 font-label text-xs flex-shrink-0">
          Saved
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRegistryStore } from '../stores/registry';

const registryStore = useRegistryStore();

interface FeatureRow {
  featureId: string;
  featureName: string;
  selectedModel: string;
  saved: boolean;
}

// Default feature rows — persisted via store
const defaultFeatures = [
  { featureId: 'core-chat', featureName: 'Core Chat Agent' },
  { featureId: 'report-gen', featureName: 'Report Generator' },
  { featureId: 'web-search', featureName: 'Web Search Assistant' },
];

const rows = ref<FeatureRow[]>(
  defaultFeatures.map((f) => ({ ...f, selectedModel: '', saved: false }))
);

// Sync rows with store mappings when they load
watch(
  () => registryStore.featureMappings,
  (mappings) => {
    for (const row of rows.value) {
      const stored = mappings.find((m) => m.feature_id === row.featureId);
      if (stored) row.selectedModel = stored.model_id;
    }
  },
  { immediate: true }
);

async function handleChange(row: FeatureRow) {
  row.saved = false;
  try {
    await registryStore.upsertFeatureMapping(row.featureId, row.featureName, row.selectedModel);
    row.saved = true;
    setTimeout(() => { row.saved = false; }, 2000);
  } catch {
    // silently fail — store captures error
  }
}
</script>
