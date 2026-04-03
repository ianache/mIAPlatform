<template>
  <div class="flex flex-col gap-8 max-w-[800px] mx-auto">
    <!-- Header -->
    <h1 class="text-3xl font-headline font-semibold text-primary">Settings</h1>

    <!-- API Keys section -->
    <div class="glass rounded-xl p-6 flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-xl font-headline font-semibold text-onSurface">API Keys</h2>
        <p class="text-sm font-label text-onSurface-variant">
          Configure LLM provider API keys. Keys are stored client-side for now;
          secure Vault integration is planned for a future release.
        </p>
      </div>
      <APIKeyManager />
    </div>

    <!-- Platform Stats section -->
    <div class="glass rounded-xl p-6 flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-xl font-headline font-semibold text-onSurface">Platform Stats</h2>
        <p class="text-sm font-label text-onSurface-variant">
          Usage metrics across all agents and providers.
        </p>
      </div>
      <StatsRow />
    </div>
  </div>
</template>

<script setup lang="ts">
import APIKeyManager from '../components/APIKeyManager.vue';
import StatsRow from '../components/StatsRow.vue';
</script>
