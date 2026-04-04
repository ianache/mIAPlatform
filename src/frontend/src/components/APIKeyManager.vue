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

      <!-- Saved key display or input -->
      <div class="flex gap-3 items-center">
        <input
          :type="revealed[provider.id] ? 'text' : 'password'"
          :placeholder="`sk-... (${provider.name} API Key)`"
          :value="inputKeys[provider.id]"
          class="flex-1 bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary"
          autocomplete="off"
          @input="inputKeys[provider.id] = ($event.target as HTMLInputElement).value"
        />
        <button
          class="text-xs font-label text-onSurface-variant hover:text-onSurface transition-colors px-2"
          @click="revealed[provider.id] = !revealed[provider.id]"
        >
          {{ revealed[provider.id] ? 'Hide' : 'Show' }}
        </button>
      </div>

      <!-- Saved key masked display -->
      <p v-if="storedKey(provider.id)" class="text-xs font-label text-onSurface-variant">
        Saved: {{ storedKey(provider.id) }}
      </p>

      <!-- Last validated -->
      <p v-if="lastValidated(provider.id)" class="text-xs font-label text-onSurface-variant">
        Last validated: {{ lastValidated(provider.id) }}
      </p>

      <!-- Error -->
      <p v-if="errors[provider.id]" class="text-xs font-label text-error">
        {{ errors[provider.id] }}
      </p>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          class="text-sm font-label font-medium text-primary transition-opacity hover:opacity-70 disabled:opacity-40"
          :disabled="saving[provider.id]"
          @click="saveKey(provider.id)"
        >
          {{ saving[provider.id] ? 'Saving...' : 'Save' }}
        </button>
        <button
          class="text-sm font-label font-medium text-onSurface-variant transition-opacity hover:opacity-70 disabled:opacity-40"
          :disabled="validating[provider.id] || !storedKey(provider.id)"
          @click="validateKey(provider.id)"
        >
          {{ validating[provider.id] ? 'Validating...' : 'Validate' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRegistryStore } from '../stores/registry';

type ProviderId = 'openai' | 'anthropic' | 'google';

const registryStore = useRegistryStore();

const providers = [
  { id: 'openai' as ProviderId, name: 'OpenAI', abbr: 'OA', color: 'linear-gradient(135deg, #ADC6FF 0%, #4D8EFF 100%)' },
  { id: 'anthropic' as ProviderId, name: 'Anthropic', abbr: 'AN', color: 'linear-gradient(135deg, #FFB786 0%, #DF7412 100%)' },
  { id: 'google' as ProviderId, name: 'Google Gemini', abbr: 'GG', color: 'linear-gradient(135deg, #B1C6F9 0%, #749CFF 100%)' },
];

const inputKeys = reactive<Record<ProviderId, string>>({ openai: '', anthropic: '', google: '' });
const revealed = reactive<Record<ProviderId, boolean>>({ openai: false, anthropic: false, google: false });
const saving = reactive<Record<ProviderId, boolean>>({ openai: false, anthropic: false, google: false });
const validating = reactive<Record<ProviderId, boolean>>({ openai: false, anthropic: false, google: false });
const errors = reactive<Record<ProviderId, string>>({ openai: '', anthropic: '', google: '' });

function getRecord(id: ProviderId) {
  return registryStore.apiKeys.find((k) => k.provider === id) ?? null;
}

function storedKey(id: ProviderId): string {
  return getRecord(id)?.key_masked ?? '';
}

function lastValidated(id: ProviderId): string {
  const r = getRecord(id);
  if (!r?.last_validated) return '';
  return new Date(r.last_validated).toLocaleString();
}

function statusLabel(id: ProviderId): string {
  const r = getRecord(id);
  if (!r) return 'Not configured';
  if (r.is_valid) return 'Valid';
  if (r.last_validated) return 'Invalid';
  return 'Not tested';
}

function dotClass(id: ProviderId): string {
  const r = getRecord(id);
  if (!r) return 'bg-outline';
  if (r.is_valid) return 'bg-green-400';
  if (r.last_validated) return 'bg-error';
  return 'bg-outline';
}

function statusClass(id: ProviderId): string {
  const r = getRecord(id);
  if (!r) return 'text-outline';
  if (r.is_valid) return 'text-green-400';
  if (r.last_validated) return 'text-error';
  return 'text-outline';
}

async function saveKey(id: ProviderId) {
  const key = inputKeys[id].trim();
  if (!key) return;
  errors[id] = '';
  saving[id] = true;
  try {
    await registryStore.saveApiKey(id, key);
    inputKeys[id] = '';
    revealed[id] = false;
  } catch (err: any) {
    errors[id] = err?.detail ?? 'Failed to save key.';
  } finally {
    saving[id] = false;
  }
}

async function validateKey(id: ProviderId) {
  errors[id] = '';
  validating[id] = true;
  try {
    await registryStore.validateApiKey(id);
  } catch (err: any) {
    errors[id] = err?.detail ?? 'Validation failed.';
  } finally {
    validating[id] = false;
  }
}
</script>
