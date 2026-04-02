<template>
  <div class="min-h-screen bg-[#091421] flex text-[#D9E3F6]">
    <Sidebar />
    <div class="flex-1 ml-[240px]">
      <TopBar />
      <main class="p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue';
import TopBar from '../components/TopBar.vue';
</script>
