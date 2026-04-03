<template>
  <div class="space-y-6">
    <!-- Avatar Upload -->
    <div class="flex flex-col items-center gap-3">
      <button
        type="button"
        class="w-20 h-20 rounded-full bg-surface-high flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
        @click="triggerFilePicker"
        aria-label="Upload avatar"
      >
        <img
          v-if="avatarPreview"
          :src="avatarPreview"
          alt="Agent avatar preview"
          class="w-full h-full object-cover"
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
      </button>
      <span class="text-xs text-onSurface-variant font-label">Click to upload avatar</span>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      />
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
import { ref, watch } from 'vue';

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
const avatarPreview = ref<string>(props.avatarUrl ?? '');
const localName = ref(props.name);
const localDescription = ref(props.description ?? '');
const nameError = ref('');

watch(localName, (val) => emit('update:name', val));
watch(localDescription, (val) => emit('update:description', val));

function triggerFilePicker() {
  fileInput.value?.click();
}

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  avatarPreview.value = url;
  emit('update:avatarUrl', url);
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
