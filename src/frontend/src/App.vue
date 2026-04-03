<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  if (code) {
    await auth.handleCallback(code)
    // Clean URL after token exchange
    window.history.replaceState({}, document.title, '/')
    router.push('/agents')
  }
})
</script>
