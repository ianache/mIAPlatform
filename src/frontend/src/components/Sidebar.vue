<template>
  <aside class="fixed left-0 top-0 h-screen w-[240px] bg-[#121C2A] p-6 flex flex-col">
    <h1 class="text-2xl font-bold text-primary mb-8 font-['Space_Grotesk']">Orchestra</h1>
    <nav class="flex flex-col gap-2">
      <router-link v-for="item in navItems" :key="item.path" :to="item.path"
        class="px-4 py-3 rounded-lg text-[#D9E3F6] transition-colors"
        :class="{ 'bg-primary-gradient': route.path === item.path }">
        {{ item.name }}
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const navItems = [
  { name: 'Workspace', path: '/' },
  { name: 'Agents', path: '/agents' },
  { name: 'Library', path: '/library' },
  { name: 'Model Registry', path: '/model-registry' },
  { name: 'Analytics', path: '/analytics' },
  { name: 'Settings', path: '/settings' },
];
</script>

<style scoped>
.bg-primary-gradient {
  background: linear-gradient(90deg, #ADC6FF 0%, #749CFF 100%);
  color: #091421;
}
</style>
