<template>
  <div class="glass rounded-xl p-6 flex gap-6">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="flex-1 flex flex-col gap-1 min-w-0"
    >
      <span class="text-xs font-label text-onSurface-variant uppercase tracking-wider truncate">
        {{ stat.label }}
      </span>
      <span class="text-2xl font-headline font-semibold text-primary truncate">
        {{ stat.value }}
      </span>
      <span v-if="stat.sub" class="text-xs font-label text-onSurface-variant truncate">
        {{ stat.sub }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const stats = [
  { label: 'Total Tokens', value: '—', sub: 'This month' },
  { label: 'Avg Latency', value: '—', sub: 'ms per request' },
  { label: 'Success Rate', value: '—', sub: 'Last 7 days' },
  { label: 'Current Spend', value: '—', sub: 'USD this month' },
];
</script>
