<template>
  <div class="min-h-screen bg-[#091421] flex text-[#D9E3F6]">
    <Sidebar :open="sidebarOpen" />

    <!-- Overlay for mobile when sidebar is open -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-30 bg-black/40 lg:hidden"
        @click="sidebarOpen = false"
      />
    </transition>

    <div
      class="flex-1 min-w-0 transition-all duration-300"
      :class="sidebarOpen ? 'lg:ml-[240px]' : 'ml-0'"
    >
      <TopBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import TopBar from '../components/TopBar.vue';

const sidebarOpen = ref(true);
</script>
