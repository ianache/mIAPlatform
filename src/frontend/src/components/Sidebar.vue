<template>
  <aside
    class="fixed left-0 top-0 h-screen w-[240px] bg-[#121C2A] p-6 flex flex-col transition-transform duration-300 z-40"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <h1 class="text-2xl font-bold text-primary mb-8 font-['Space_Grotesk']">Orchestra</h1>
    <nav class="flex flex-col gap-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-[#D9E3F6] transition-colors hover:bg-surface-high"
        :class="{ 'bg-primary-gradient !text-[#091421]': isActive(item.path) }"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span class="font-label text-sm">{{ item.name }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { useRoute } from 'vue-router';

defineProps<{ open: boolean }>();

const route = useRoute();

function isActive(path: string) {
  if (path === '/') return route.path === '/';
  return route.path === path || route.path.startsWith(path + '/');
}

// ── Inline SVG icon components ────────────────────────────────────────────────

const IconWorkspace = () =>
  h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.8 }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' }),
  ]);

const IconProjects = () =>
  h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.8 }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z' }),
  ]);

const IconAgents = () =>
  h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.8 }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M17 20h5v-1a4 4 0 00-5.916-3.519M9 20H4v-1a4 4 0 015.916-3.519M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }),
  ]);

const IconLibrary = () =>
  h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.8 }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }),
  ]);

const IconRegistry = () =>
  h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.8 }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' }),
  ]);

const IconAnalytics = () =>
  h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.8 }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }),
  ]);

const IconSettings = () =>
  h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.8 }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' }),
  ]);

const navItems = [
  { name: 'Workspace',      path: '/',               icon: IconWorkspace },
  { name: 'Projects',       path: '/projects',        icon: IconProjects  },
  { name: 'Agents',         path: '/agents',          icon: IconAgents    },
  { name: 'Library',        path: '/library',         icon: IconLibrary   },
  { name: 'Model Registry', path: '/model-registry',  icon: IconRegistry  },
  { name: 'Analytics',      path: '/analytics',       icon: IconAnalytics },
  { name: 'Settings',       path: '/settings',        icon: IconSettings  },
];
</script>

<style scoped>
.bg-primary-gradient {
  background: linear-gradient(90deg, #ADC6FF 0%, #749CFF 100%);
}
</style>
