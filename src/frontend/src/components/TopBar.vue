<template>
  <header class="sticky top-0 z-50 flex items-center justify-between px-4 py-3 glass">

    <!-- Left: hamburger + home + breadcrumbs -->
    <div class="flex items-center gap-2 min-w-0">

      <!-- Hamburger -->
      <button
        class="p-2 rounded-lg text-onSurface-variant hover:text-onSurface hover:bg-surface-high transition-colors flex-shrink-0"
        aria-label="Toggle sidebar"
        @click="emit('toggle-sidebar')"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Home -->
      <button
        class="p-2 rounded-lg text-onSurface-variant hover:text-onSurface hover:bg-surface-high transition-colors flex-shrink-0"
        aria-label="Go home"
        @click="router.push('/')"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>

      <!-- Separator -->
      <span class="text-surface-highest font-label text-sm select-none flex-shrink-0">/</span>

      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-1 min-w-0 overflow-hidden" aria-label="Breadcrumb">
        <template v-for="(crumb, i) in breadcrumbs" :key="crumb.path">
          <span
            v-if="i > 0"
            class="text-onSurface-variant font-label text-sm select-none flex-shrink-0"
          >›</span>
          <button
            v-if="i < breadcrumbs.length - 1"
            class="font-label text-sm text-onSurface-variant hover:text-onSurface transition-colors truncate"
            @click="router.push(crumb.path)"
          >
            {{ crumb.label }}
          </button>
          <span
            v-else
            class="font-label text-sm text-onSurface font-medium truncate"
          >
            {{ crumb.label }}
          </span>
        </template>
      </nav>
    </div>

    <!-- Right: User Avatar with Dropdown -->
    <div class="relative flex-shrink-0" ref="dropdownRef">
      <button
        class="w-9 h-9 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:ring-2 hover:ring-primary/50"
        :class="{ 'ring-2 ring-primary': showDropdown }"
        @click="toggleDropdown"
      >
        <img
          v-if="authStore.avatarUrl"
          :src="authStore.avatarUrl"
          alt="User avatar"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-xs font-headline font-semibold text-background"
          :style="{ background: avatarGradient }"
        >
          {{ userInitials }}
        </div>
      </button>

      <!-- Dropdown -->
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="showDropdown"
          class="absolute right-0 mt-2 w-48 rounded-lg bg-surface-high shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50"
        >
          <button
            class="w-full flex items-center gap-3 px-4 py-3 text-sm font-label text-onSurface hover:bg-surface transition-colors"
            @click="goToSettings"
          >
            <svg class="w-5 h-5 text-onSurface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>

          <div class="border-t border-surface my-1"></div>

          <button
            class="w-full flex items-center gap-3 px-4 py-3 text-sm font-label text-error hover:bg-surface transition-colors"
            @click="logout"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const emit = defineEmits<{ 'toggle-sidebar': [] }>();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const showDropdown = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// ── Breadcrumbs ───────────────────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  '':               'Workspace',
  'projects':       'Projects',
  'agents':         'Agents',
  'library':        'Library',
  'model-registry': 'Model Registry',
  'analytics':      'Analytics',
  'settings':       'Settings',
  'new':            'New',
  'edit':           'Edit',
};

const breadcrumbs = computed(() => {
  const segments = route.path.replace(/^\//, '').split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'Workspace', path: '/' }];

  return segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    // If segment looks like a UUID, label it as "Edit"
    const isId = /^[0-9a-f-]{36}$/i.test(seg);
    const label = isId ? 'Edit' : (ROUTE_LABELS[seg] ?? seg);
    return { label, path };
  });
});

// ── User avatar ───────────────────────────────────────────────────────────────

const userInitials = computed(() => {
  if (!authStore.accessToken) return '?';
  try {
    const parts = authStore.accessToken.split('.');
    if (parts.length !== 3) return '?';
    const payload = parts[1];
    const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
    const decoded = JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')));
    const name = decoded.name || decoded.preferred_username || '?';
    return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  } catch {
    return '?';
  }
});

const avatarGradient = computed(() => {
  const colors = [
    'linear-gradient(135deg, #ADC6FF 0%, #4D8EFF 100%)',
    'linear-gradient(135deg, #FFB786 0%, #DF7412 100%)',
    'linear-gradient(135deg, #B1C6F9 0%, #749CFF 100%)',
    'linear-gradient(135deg, #4D8EFF 0%, #ADC6FF 100%)',
  ];
  if (!authStore.accessToken) return colors[0];
  try {
    const parts = authStore.accessToken.split('.');
    const padded = parts[1].padEnd(parts[1].length + (4 - (parts[1].length % 4)) % 4, '=');
    const decoded = JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')));
    const username = decoded.preferred_username || '';
    let hash = 0;
    for (const c of username) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
    return colors[Math.abs(hash) % colors.length];
  } catch {
    return colors[0];
  }
});

// ── Dropdown ──────────────────────────────────────────────────────────────────

function toggleDropdown() { showDropdown.value = !showDropdown.value; }
function goToSettings() { showDropdown.value = false; router.push('/settings'); }
function logout() { showDropdown.value = false; authStore.logout(); }

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false;
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>
