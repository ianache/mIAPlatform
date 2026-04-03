<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-headline font-semibold text-primary">Agents</h1>
      <button
        class="px-5 py-2.5 rounded-lg bg-primary-gradient text-background text-sm font-label font-semibold transition-opacity duration-200 hover:opacity-90"
        @click="router.push('/agents/new')"
      >
        New Agent
      </button>
    </div>

    <!-- Stats row -->
    <StatsRow />

    <!-- Loading state: skeleton cards -->
    <div v-if="agentStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="n in 6"
        :key="n"
        class="glass rounded-xl p-6 flex flex-col gap-4 animate-pulse"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-surface-high"></div>
          <div class="h-4 bg-surface-high rounded flex-1"></div>
        </div>
        <div class="h-3 bg-surface-high rounded w-2/3"></div>
        <div class="flex justify-between">
          <div class="h-3 bg-surface-high rounded w-1/3"></div>
          <div class="h-3 bg-surface-high rounded w-1/6"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="agentStore.error"
      class="glass rounded-xl p-8 text-center text-error"
    >
      <p class="font-label">{{ agentStore.error }}</p>
      <button
        class="mt-4 text-sm text-primary font-label hover:opacity-70 transition-opacity"
        @click="agentStore.fetchAgents()"
      >
        Retry
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="agentStore.agents.length === 0"
      class="glass rounded-xl p-16 flex flex-col items-center gap-6 text-center"
    >
      <div class="w-20 h-20 rounded-full bg-surface-high flex items-center justify-center">
        <span class="text-3xl font-headline text-onSurface-variant">+</span>
      </div>
      <div class="flex flex-col gap-2">
        <p class="font-headline font-semibold text-onSurface text-xl">No agents yet</p>
        <p class="text-sm font-label text-onSurface-variant">
          Get started by creating your first agent.
        </p>
      </div>
      <button
        class="px-5 py-2.5 rounded-lg bg-primary-gradient text-background text-sm font-label font-semibold transition-opacity duration-200 hover:opacity-90"
        @click="router.push('/agents/new')"
      >
        Create your first agent
      </button>
    </div>

    <!-- Agent grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AgentCard
        v-for="agent in agentStore.agents"
        :key="agent.id"
        :agent="agent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAgentStore } from '../stores/agents';
import AgentCard from '../components/AgentCard.vue';
import StatsRow from '../components/StatsRow.vue';

const router = useRouter();
const agentStore = useAgentStore();

onMounted(() => {
  agentStore.fetchAgents();
});
</script>
