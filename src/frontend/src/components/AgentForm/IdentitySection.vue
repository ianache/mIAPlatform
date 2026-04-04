<template>
  <div class="space-y-6">
    <!-- Avatar Upload -->
    <div class="flex flex-col items-center gap-3">
      <button
        type="button"
        class="w-20 h-20 rounded-full bg-surface-high flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
        :class="{ 'opacity-50 cursor-not-allowed': uploading }"
        @click="triggerFilePicker"
        aria-label="Upload avatar"
      >
        <img
          v-if="displayAvatarUrl"
          :src="displayAvatarUrl"
          alt="Agent avatar"
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="w-8 h-8 text-onSurface-variant"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
        
        <!-- Uploading indicator -->
        <div
          v-if="uploading"
          class="absolute inset-0 flex items-center justify-center bg-surface-high bg-opacity-80"
        >
          <svg class="animate-spin w-6 h-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      </button>
      
      <div class="flex items-center gap-2">
        <span v-if="!uploading" class="text-xs text-onSurface-variant font-label">Click to change avatar</span>
        <span v-else class="text-xs text-primary font-label">Uploading...</span>
        <button
          v-if="localAvatarUrl && !uploading"
          type="button"
          class="text-xs text-error font-label hover:opacity-70 transition-opacity"
          @click="clearAvatar"
        >
          Remove
        </button>
      </div>
      
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        :disabled="uploading"
        @change="handleFileChange"
      />
      
      <!-- Error message -->
      <p v-if="uploadError" class="text-xs text-error font-label">{{ uploadError }}</p>
    </div>

    <!-- Name Input -->
    <div class="space-y-1.5">
      <label class="block text-sm font-label text-onSurface-variant" for="agent-name">
        Name <span class="text-error">*</span>
      </label>
      <input
        id="agent-name"
        v-model="localName"
        type="text"
        placeholder="Give your agent a name"
        maxlength="100"
        class="w-full bg-surface-high text-onSurface font-headline placeholder-onSurface-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all"
        :class="{ 'ring-2 ring-error': nameError }"
        @blur="validateName"
        @input="clearNameError"
      />
      <p v-if="nameError" class="text-xs text-error font-label">{{ nameError }}</p>
    </div>

    <!-- Description Textarea -->
    <div class="space-y-1.5">
      <label class="block text-sm font-label text-onSurface-variant" for="agent-description">
        Description
      </label>
      <textarea
        id="agent-description"
        v-model="localDescription"
        placeholder="What does this agent do?"
        maxlength="500"
        rows="3"
        class="w-full bg-surface-high text-onSurface font-body placeholder-onSurface-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
      />
      <p class="text-xs text-onSurface-variant font-label text-right">
        {{ localDescription?.length ?? 0 }}/500
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { apiClient } from '../../api/client';

interface Props {
  name: string;
  description?: string;
  avatarUrl?: string;
}

interface Emits {
  (e: 'update:name', value: string): void;
  (e: 'update:description', value: string): void;
  (e: 'update:avatarUrl', value: string): void;
  (e: 'validation-error', field: string, hasError: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement | null>(null);
const localName = ref(props.name);
const localDescription = ref(props.description ?? '');
const localAvatarUrl = ref(props.avatarUrl ?? '');
const nameError = ref('');
const imageLoadError = ref(false);
const uploading = ref(false);
const uploadError = ref('');

// Watch for prop changes (for edit mode)
watch(() => props.name, (val) => { localName.value = val; });
watch(() => props.description, (val) => { localDescription.value = val ?? ''; });
watch(() => props.avatarUrl, (val) => { 
  localAvatarUrl.value = val ?? ''; 
  imageLoadError.value = false;
});

// Emit changes
watch(localName, (val) => emit('update:name', val));
watch(localDescription, (val) => emit('update:description', val));
watch(localAvatarUrl, (val) => {
  emit('update:avatarUrl', val);
  imageLoadError.value = false;
});

// Computed property to determine what avatar to display
const displayAvatarUrl = computed(() => {
  if (imageLoadError.value) return null;
  return localAvatarUrl.value || null;
});

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
    
    // Update avatar URL with the permanent URL from server
    console.log('Upload response:', response);
    localAvatarUrl.value = response.url;
    imageLoadError.value = false;
    console.log('Avatar URL set to:', localAvatarUrl.value);
    
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
  if (!localAvatarUrl.value || uploading.value) return;
  
  // Extract filename from URL
  const filename = localAvatarUrl.value.split('/').pop();
  
  if (filename) {
    try {
      // Delete the file from server
      await apiClient.delete(`/api/v1/upload/avatar/${filename}`);
    } catch (err) {
      console.error('Failed to delete avatar:', err);
      // Continue anyway to clear the reference
    }
  }
  
  localAvatarUrl.value = '';
  imageLoadError.value = false;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function validateName() {
  if (!localName.value || localName.value.trim().length === 0) {
    nameError.value = 'Name is required';
    emit('validation-error', 'name', true);
  } else if (localName.value.trim().length < 3) {
    nameError.value = 'Name must be at least 3 characters';
    emit('validation-error', 'name', true);
  } else {
    nameError.value = '';
    emit('validation-error', 'name', false);
  }
}

function clearNameError() {
  if (nameError.value && localName.value.trim().length >= 3) {
    nameError.value = '';
    emit('validation-error', 'name', false);
  }
}

defineExpose({ validateName });
</script>
