<template>
  <div class="flex flex-col gap-6">
    <div
      v-for="provider in providers"
      :key="provider.id"
      class="glass rounded-xl p-6 flex flex-col gap-4"
    >
      <!-- Provider header -->
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-headline font-bold text-background"
          :style="{ background: provider.color }"
        >
          {{ provider.abbr }}
        </div>
        <span class="font-headline font-semibold text-onSurface">{{ provider.name }}</span>
        <span class="ml-auto flex items-center gap-1.5 text-xs font-label" :class="statusClass(provider.id)">
          <span class="w-2 h-2 rounded-full" :class="dotClass(provider.id)"></span>
          {{ statusLabel(provider.id) }}
        </span>
      </div>

      <!-- Key input row -->
      <div class="flex gap-3 items-center">
        <input
          :type="revealed[provider.id] ? 'text' : 'password'"
          :placeholder="`sk-... (${provider.name} API Key)`"
          :value="keys[provider.id]"
          class="flex-1 bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary"
          autocomplete="off"
          @input="handleInput(provider.id, ($event.target as HTMLInputElement).value)"
        />
        <button
          class="text-xs font-label text-onSurface-variant hover:text-onSurface transition-colors px-2"
          @click="toggleReveal(provider.id)"
        >
          {{ revealed[provider.id] ? 'Hide' : 'Show' }}
        </button>
      </div>

      <!-- Last validated -->
      <p v-if="lastValidated[provider.id]" class="text-xs font-label text-onSurface-variant">
        Last validated: {{ lastValidated[provider.id] }}
      </p>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          class="text-sm font-label font-medium text-primary transition-opacity hover:opacity-70"
          @click="saveKey(provider.id)"
        >
          Save
        </button>
        <button
          class="text-sm font-label font-medium text-onSurface-variant transition-opacity hover:opacity-70"
          @click="validateKey(provider.id)"
        >
          Validate
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

type ProviderId = 'openai' | 'anthropic' | 'google';
type ValidationStatus = 'valid' | 'invalid' | 'untested';

const providers = [
  { id: 'openai' as ProviderId, name: 'OpenAI', abbr: 'OA', color: 'linear-gradient(135deg, #ADC6FF 0%, #4D8EFF 100%)' },
  { id: 'anthropic' as ProviderId, name: 'Anthropic', abbr: 'AN', color: 'linear-gradient(135deg, #FFB786 0%, #DF7412 100%)' },
  { id: 'google' as ProviderId, name: 'Google Gemini', abbr: 'GG', color: 'linear-gradient(135deg, #B1C6F9 0%, #749CFF 100%)' },
];

// Client-side key storage (Phase 5 will add Vault integration for secure storage)
const keys = reactive<Record<ProviderId, string>>({
  openai: '',
  anthropic: '',
  google: '',
});

const savedKeys = reactive<Record<ProviderId, string>>({
  openai: '',
  anthropic: '',
  google: '',
});

const validationStatus = reactive<Record<ProviderId, ValidationStatus>>({
  openai: 'untested',
  anthropic: 'untested',
  google: 'untested',
});

const lastValidated = reactive<Record<ProviderId, string>>({
  openai: '',
  anthropic: '',
  google: '',
});

const revealed = reactive<Record<ProviderId, boolean>>({
  openai: false,
  anthropic: false,
  google: false,
});

function handleInput(id: ProviderId, value: string) {
  keys[id] = value;
}

function toggleReveal(id: ProviderId) {
  revealed[id] = !revealed[id];
}

function saveKey(id: ProviderId) {
  savedKeys[id] = keys[id];
  // Reset reveal after save (key now masked)
  revealed[id] = false;
  validationStatus[id] = 'untested';
}

function validateKey(id: ProviderId) {
  // Placeholder — will connect to backend validation endpoint in Phase 1 Vault integration
  const hasKey = (savedKeys[id] || keys[id]).length > 0;
  validationStatus[id] = hasKey ? 'valid' : 'invalid';
  lastValidated[id] = new Date().toLocaleString();
}

function statusLabel(id: ProviderId): string {
  switch (validationStatus[id]) {
    case 'valid': return 'Valid';
    case 'invalid': return 'Invalid';
    default: return 'Not tested';
  }
}

function dotClass(id: ProviderId): string {
  switch (validationStatus[id]) {
    case 'valid': return 'bg-green-400';
    case 'invalid': return 'bg-error';
    default: return 'bg-outline';
  }
}

function statusClass(id: ProviderId): string {
  switch (validationStatus[id]) {
    case 'valid': return 'text-green-400';
    case 'invalid': return 'text-error';
    default: return 'text-outline';
  }
}
</script>
