<template>
  <div class="flex flex-col gap-8 max-w-[1200px] mx-auto">
    <!-- Header -->
    <h1 class="text-3xl font-headline font-semibold text-primary">Settings</h1>

    <!-- Two columns: User Profile and System Status -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- User Profile section -->
      <div class="glass rounded-xl p-6 flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <h2 class="text-xl font-headline font-semibold text-onSurface">User Profile</h2>
          <p class="text-sm font-label text-onSurface-variant">
            Your account information and roles.
          </p>
        </div>
        
        <div v-if="authStore.isAuthenticated && userInfo" class="space-y-4">
          <!-- Avatar Upload Section -->
          <div class="flex flex-col items-center gap-3 pb-4 border-b border-surface-high">
            <div class="relative">
              <div
                class="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
                :class="{ 'opacity-50': uploading }"
              >
                <img
                  v-if="displayAvatarUrl"
                  :src="displayAvatarUrl"
                  alt="User avatar"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-2xl font-headline font-semibold text-background"
                  :style="{ background: avatarGradient }"
                >
                  {{ userInitials }}
                </div>
              </div>
              
              <!-- Upload overlay button -->
              <button
                type="button"
                class="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                :disabled="uploading"
                @click="triggerFilePicker"
              >
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              <!-- Loading spinner -->
              <div
                v-if="uploading"
                class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
              >
                <svg class="animate-spin w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </div>
            </div>
            
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
            />
            
            <div class="flex items-center gap-2">
              <span v-if="!uploading" class="text-xs text-onSurface-variant font-label">Click avatar to change</span>
              <span v-else class="text-xs text-primary font-label">Uploading...</span>
              <button
                v-if="authStore.avatarUrl && !uploading"
                type="button"
                class="text-xs text-error font-label hover:opacity-70 transition-opacity"
                @click="clearAvatar"
              >
                Remove
              </button>
            </div>
            
            <p v-if="uploadError" class="text-xs text-error font-label">{{ uploadError }}</p>
          </div>

          <!-- Avatar and Name -->
          <div class="flex items-center gap-4">
            <div>
              <p class="font-headline font-semibold text-onSurface text-lg">{{ userInfo.name || userInfo.preferred_username }}</p>
              <p class="text-sm font-label text-onSurface-variant">{{ userInfo.email }}</p>
            </div>
          </div>

          <!-- User Details -->
          <div class="grid grid-cols-1 gap-3 pt-4 border-t border-surface-high">
            <div>
              <p class="text-xs font-label text-onSurface-variant uppercase tracking-wide">Username</p>
              <p class="text-sm font-label text-onSurface">{{ userInfo.preferred_username }}</p>
            </div>
            <div>
              <p class="text-xs font-label text-onSurface-variant uppercase tracking-wide">Email</p>
              <p class="text-sm font-label text-onSurface">{{ userInfo.email || 'Not provided' }}</p>
            </div>
            <div>
              <p class="text-xs font-label text-onSurface-variant uppercase tracking-wide mb-2">Roles</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="role in userRoles"
                  :key="role"
                  class="px-2 py-1 rounded-md bg-primary-container text-primary text-xs font-label"
                >
                  {{ role }}
                </span>
                <span v-if="userRoles.length === 0" class="text-sm font-label text-onSurface-variant">
                  No roles assigned
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <p class="text-sm font-label text-onSurface-variant">Not logged in</p>
        </div>
      </div>

      <!-- System Status section -->
      <div class="glass rounded-xl p-6 flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-headline font-semibold text-onSurface">System Status</h2>
            <button
              class="text-xs font-label text-primary hover:opacity-70 transition-opacity"
              :disabled="loading"
              @click="fetchHealthStatus"
            >
              <span v-if="loading">Refreshing...</span>
              <span v-else>Refresh</span>
            </button>
          </div>
          <p class="text-sm font-label text-onSurface-variant">
            Health status of backend services and dependencies.
          </p>
        </div>

        <!-- Overall Status -->
        <div class="flex items-center gap-3 p-3 rounded-lg" :class="overallStatusClass">
          <span class="w-3 h-3 rounded-full" :class="overallStatusDot"></span>
          <span class="font-label font-medium text-sm">{{ overallStatusText }}</span>
        </div>

        <!-- Dependencies List -->
        <div class="space-y-2">
          <div
            v-for="(status, service) in healthStatus.dependencies"
            :key="service"
            class="flex items-center justify-between p-2 rounded-lg bg-surface-low"
          >
            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full"
                :class="status.status === 'healthy' ? 'bg-green-400' : status.status === 'unknown' ? 'bg-amber-400' : 'bg-red-400'"
              ></span>
              <span class="text-sm font-label text-onSurface capitalize">{{ service }}</span>
            </div>
            <span class="text-xs font-label" :class="status.status === 'healthy' ? 'text-green-400' : status.status === 'unknown' ? 'text-amber-400' : 'text-red-400'">
              {{ status.status }}
            </span>
          </div>
        </div>

        <!-- Error state -->
        <div v-if="error" class="text-sm text-error font-label">
          {{ error }}
        </div>

        <!-- Last updated -->
        <div class="text-xs text-onSurface-variant font-label text-right">
          Last checked: {{ lastChecked }}
        </div>
      </div>
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
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { apiClient } from '../api/client';
import StatsRow from '../components/StatsRow.vue';

const authStore = useAuthStore();

// Health status
const healthStatus = ref({
  status: 'unknown',
  dependencies: {}
});
const loading = ref(false);
const error = ref('');
const lastChecked = ref('Never');

// Avatar upload
const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const uploadError = ref('');
const imageLoadError = ref(false);

const displayAvatarUrl = computed(() => {
  if (imageLoadError.value) return null;
  return authStore.avatarUrl;
});

// Decode JWT token to get user info
const userInfo = computed(() => {
  if (!authStore.accessToken) return null;
  
  try {
    const parts = authStore.accessToken.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
    const normalized = padded.replace(/-/g, '+').replace(/_/g, '/');
    
    const decoded = JSON.parse(atob(normalized));
    return decoded;
  } catch (e) {
    console.error('Failed to decode token:', e);
    return null;
  }
});

const userInitials = computed(() => {
  const name = userInfo.value?.name || userInfo.value?.preferred_username || '?';
  return name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
});

const avatarGradient = computed(() => {
  const colors = [
    'linear-gradient(135deg, #ADC6FF 0%, #4D8EFF 100%)',
    'linear-gradient(135deg, #FFB786 0%, #DF7412 100%)',
    'linear-gradient(135deg, #B1C6F9 0%, #749CFF 100%)',
    'linear-gradient(135deg, #4D8EFF 0%, #ADC6FF 100%)',
  ];
  const name = userInfo.value?.preferred_username || '';
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
});

const userRoles = computed(() => {
  const roles = userInfo.value?.realm_access?.roles || [];
  return roles.filter((role: string) => !role.startsWith('default-roles-'));
});

// System status computed properties
const overallStatusText = computed(() => {
  const status = healthStatus.value.status;
  if (status === 'healthy') return 'All Systems Operational';
  if (status === 'degraded') return 'Some Services Degraded';
  return 'System Status Unknown';
});

const overallStatusClass = computed(() => {
  const status = healthStatus.value.status;
  if (status === 'healthy') return 'bg-green-400/10';
  if (status === 'degraded') return 'bg-amber-400/10';
  return 'bg-surface-high';
});

const overallStatusDot = computed(() => {
  const status = healthStatus.value.status;
  if (status === 'healthy') return 'bg-green-400';
  if (status === 'degraded') return 'bg-amber-400';
  return 'bg-outline';
});

// Avatar upload functions
function triggerFilePicker() {
  if (uploading.value) return;
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Please select an image file';
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'Image size should be less than 5MB';
    return;
  }
  
  uploadError.value = '';
  uploading.value = true;
  
  try {
    // Upload file to backend
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<{
      filename: string;
      url: string;
      content_type: string;
      size: number;
    }>('/api/v1/upload/avatar', formData);
    
    // Store avatar URL in auth store
    authStore.setAvatarUrl(response.url);
    imageLoadError.value = false;
    
  } catch (err: any) {
    uploadError.value = err?.detail || 'Failed to upload avatar. Please try again.';
    console.error('Avatar upload error:', err);
  } finally {
    uploading.value = false;
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
}

function handleImageError() {
  imageLoadError.value = true;
}

async function clearAvatar() {
  if (!authStore.avatarUrl || uploading.value) return;
  
  // Extract filename from URL
  const filename = authStore.avatarUrl.split('/').pop();
  
  if (filename) {
    try {
      // Delete the file from server
      await apiClient.delete(`/api/v1/upload/avatar/${filename}`);
    } catch (err) {
      console.error('Failed to delete avatar:', err);
      // Continue anyway to clear the reference
    }
  }
  
  authStore.setAvatarUrl('');
  imageLoadError.value = false;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

async function fetchHealthStatus() {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await apiClient.get<{
      status: string;
      dependencies: Record<string, { status: string; message: string }>;
    }>('/api/v1/health/detailed');
    
    healthStatus.value = response;
    lastChecked.value = new Date().toLocaleTimeString();
  } catch (err: any) {
    error.value = err?.detail || 'Failed to fetch system status';
    console.error('Health check error:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchHealthStatus();
});
</script>
