<template>
  <div class="glass rounded-2xl p-6 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:divide-x sm:divide-surface-highest">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="flex-1 flex flex-col items-center justify-center px-4 py-2"
    >
      <span class="text-onSurface-variant font-label text-xs uppercase tracking-widest mb-1">
        {{ stat.label }}
      </span>
      <span class="text-primary font-headline text-2xl font-bold">
        {{ stat.value }}
      </span>
      <span
        v-if="stat.indicator"
        class="mt-1 flex items-center gap-1 text-xs"
        :class="stat.indicatorClass"
      >
        <span class="inline-block w-2 h-2 rounded-full" :class="stat.dotClass"></span>
        {{ stat.indicator }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRegistryStore } from '../stores/registry';

const registryStore = useRegistryStore();

const stats = computed(() => [
  {
    label: 'Active Models',
    value: registryStore.activeModelCount,
    indicator: null,
    indicatorClass: '',
    dotClass: '',
  },
  {
    label: 'Total Models',
    value: registryStore.totalModelCount,
    indicator: null,
    indicatorClass: '',
    dotClass: '',
  },
  {
    label: 'Providers',
    value: registryStore.providerCount,
    indicator: null,
    indicatorClass: '',
    dotClass: '',
  },
  {
    label: 'Registry Health',
    value: registryStore.hasValidKey ? '✓' : '—',
    indicator: registryStore.registryHealthLabel,
    indicatorClass: registryStore.hasValidKey ? 'text-green-400' : 'text-outline',
    dotClass: registryStore.hasValidKey ? 'bg-green-400' : 'bg-outline',
  },
]);
</script>
