<template>
  <aside
    class="fixed left-0 top-0 h-screen w-[240px] bg-surface-low p-6 flex flex-col transition-transform duration-300 z-40"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <h1 class="text-2xl font-bold text-primary mb-8 font-['Space_Grotesk']">I/A @ Works</h1>

    <nav class="flex flex-col gap-1">
      <template v-for="item in navItems" :key="item.type === 'link' ? item.path : item.name">

        <!-- Regular link -->
        <router-link
          v-if="item.type === 'link'"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-onSurface-variant hover:text-onSurface hover:bg-surface-high transition-colors"
          :class="{ 'bg-primary-selected-item !text-primarySelectedText': isActive(item.path) }"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span class="font-label text-sm">{{ item.name }}</span>
        </router-link>

        <!-- Collapsible group -->
        <div v-else-if="item.type === 'group'">
          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-onSurface-variant hover:text-onSurface hover:bg-surface-high transition-colors"
            :class="{ 'text-primary': isGroupActive(item) }"
            @click="toggleGroup(item.name)"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span class="font-label text-sm flex-1 text-left">{{ item.name }}</span>
            <svg
              class="w-4 h-4 transition-transform duration-200 opacity-60"
              :class="openGroups.has(item.name) ? 'rotate-180' : ''"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Children -->
          <div v-if="openGroups.has(item.name)" class="ml-3 mt-0.5 flex flex-col gap-0.5">
            <router-link
              v-for="child in item.children"
              :key="child.path"
              :to="child.path"
              class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-onSurface-variant hover:text-onSurface hover:bg-surface-high transition-colors"
              :class="{ 'bg-primary-selected-item !text-primarySelectedText': isActive(child.path) }"
            >
              <component :is="child.icon" class="w-4 h-4 flex-shrink-0" />
              <span class="font-label text-sm">{{ child.name }}</span>
            </router-link>
          </div>
        </div>

      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { h, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

defineProps<{ open: boolean }>();

const route = useRoute();

function isActive(path: string) {
  if (path === '/') return route.path === '/';
  return route.path === path || route.path.startsWith(path + '/');
}

function isGroupActive(group: any): boolean {
  return group.children?.some((c: any) => isActive(c.path)) ?? false;
}

const openGroups = ref<Set<string>>(new Set());

function toggleGroup(name: string) {
  if (openGroups.value.has(name)) {
    openGroups.value.delete(name);
  } else {
    openGroups.value.add(name);
  }
  openGroups.value = new Set(openGroups.value);
}

// ── SVG icon components ───────────────────────────────────────────────────────

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

const IconKnowledge = () =>
  h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.8 }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18' }),
  ]);

const IconLibrary = () =>
  h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.8 }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }),
  ]);

const IconNodesCatalog = () =>
  h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.8 }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM18 14v4M16 16h4' }),
  ]);

const IconRegistry = () =>
  h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.8 }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' }),
  ]);

const IconRunsLog = () =>
  h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.8 }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3a2 2 0 012 2v3a2 2 0 01-2 2h-3m0-6v-3' }),
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

const navItems: any[] = [
  { type: 'link',  name: 'Workspace',      path: '/',              icon: IconWorkspace },
  { type: 'link',  name: 'Projects',        path: '/projects',      icon: IconProjects  },
  { type: 'link',  name: 'Agents',          path: '/agents',        icon: IconAgents    },
  {
    type: 'group',
    name: 'Knowledge',
    icon: IconKnowledge,
    children: [
      { name: 'Ingest',        path: '/library',        icon: IconLibrary      },
      { name: 'Runs Log',      path: '/runs-log',        icon: IconRunsLog     },
      { name: 'Nodes Catalog', path: '/nodes-catalog',  icon: IconNodesCatalog },
    ],
  },
  { type: 'link',  name: 'Model Registry',  path: '/model-registry', icon: IconRegistry  },
  { type: 'link',  name: 'Analytics',       path: '/analytics',      icon: IconAnalytics },
  { type: 'link',  name: 'Settings',        path: '/settings',       icon: IconSettings  },
];

// Auto-open group when a child route is active
watch(
  () => route.path,
  () => {
    for (const item of navItems) {
      if (item.type === 'group' && isGroupActive(item)) {
        openGroups.value.add(item.name);
        openGroups.value = new Set(openGroups.value);
      }
    }
  },
  { immediate: true }
);

</script>

<style scoped>
.bg-primary-gradient {
  background: linear-gradient(90deg, #ADC6FF 0%, #749CFF 100%);
}
</style>
