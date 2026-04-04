<template>
  <div class="flex flex-col gap-8">

    <!-- ── Static Providers ─────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        v-for="provider in STATIC_PROVIDERS"
        :key="provider.id"
        class="glass rounded-xl p-5 flex flex-col gap-3"
      >
        <!-- Header -->
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-headline font-bold text-background flex-shrink-0"
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

        <!-- Key input -->
        <div class="flex gap-2 items-center">
          <input
            :type="revealed[provider.id] ? 'text' : 'password'"
            :placeholder="`${provider.keyHint}`"
            :value="inputKeys[provider.id] || ''"
            class="flex-1 min-w-0 bg-surface-low rounded-lg px-3 py-2 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary"
            autocomplete="off"
            @input="inputKeys[provider.id] = ($event.target as HTMLInputElement).value"
          />
          <button
            class="text-xs font-label text-onSurface-variant hover:text-onSurface transition-colors px-2 flex-shrink-0"
            @click="revealed[provider.id] = !revealed[provider.id]"
          >{{ revealed[provider.id] ? 'Hide' : 'Show' }}</button>
        </div>

        <!-- Saved key masked -->
        <p v-if="storedKey(provider.id)" class="text-xs font-label text-onSurface-variant">
          Saved: <span class="font-mono">{{ storedKey(provider.id) }}</span>
        </p>
        <p v-if="lastValidated(provider.id)" class="text-xs font-label text-onSurface-variant">
          Last validated: {{ lastValidated(provider.id) }}
        </p>
        <p v-if="errors[provider.id]" class="text-xs font-label text-error">{{ errors[provider.id] }}</p>

        <!-- Actions -->
        <div class="flex gap-4">
          <button
            class="text-sm font-label font-medium text-primary hover:opacity-70 transition-opacity disabled:opacity-40"
            :disabled="saving[provider.id] || !inputKeys[provider.id]?.trim()"
            @click="saveKey(provider.id)"
          >{{ saving[provider.id] ? 'Saving…' : 'Save' }}</button>
          <button
            class="text-sm font-label font-medium text-onSurface-variant hover:opacity-70 transition-opacity disabled:opacity-40"
            :disabled="validating[provider.id] || !storedKey(provider.id)"
            @click="validateKey(provider.id)"
          >{{ validating[provider.id] ? 'Validating…' : 'Validate' }}</button>
        </div>
      </div>
    </div>

    <!-- ── Other / Custom Providers ─────────────────────────────────────── -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-headline font-semibold text-onSurface">Other Providers</h3>
          <p class="text-xs text-onSurface-variant font-label mt-0.5">
            API keys for custom or self-hosted providers (Ollama, Mistral, Together, etc.).
            Keys are stored but not automatically verified.
          </p>
        </div>
        <button
          class="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-label font-medium bg-surface-high text-onSurface hover:bg-surface-highest transition-colors"
          @click="showAddForm = !showAddForm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ showAddForm ? 'Cancel' : 'Add Provider' }}
        </button>
      </div>

      <!-- Add new custom provider form -->
      <transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showAddForm" class="glass rounded-xl p-5 flex flex-col gap-3 border border-primary/20">
          <p class="text-xs font-label text-onSurface-variant uppercase tracking-wider">New provider key</p>
          <div class="flex gap-2">
            <input
              v-model="newProviderName"
              type="text"
              placeholder="Provider ID (e.g. groq, ollama, mistral)"
              class="w-40 bg-surface-low rounded-lg px-3 py-2 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary"
              @keydown.enter="addCustomKey"
            />
            <input
              v-model="newProviderKey"
              type="password"
              placeholder="API Key"
              class="flex-1 min-w-0 bg-surface-low rounded-lg px-3 py-2 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary"
              @keydown.enter="addCustomKey"
            />
          </div>
          <p v-if="addError" class="text-xs font-label text-error">{{ addError }}</p>
          <div class="flex justify-end">
            <button
              class="px-4 py-2 rounded-lg text-sm font-label font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity disabled:opacity-40"
              :disabled="!newProviderName.trim() || !newProviderKey.trim() || addingSaving"
              @click="addCustomKey"
            >{{ addingSaving ? 'Saving…' : 'Save Key' }}</button>
          </div>
        </div>
      </transition>

      <!-- Existing custom provider cards -->
      <div v-if="customProviderKeys.length === 0 && !showAddForm" class="text-sm text-onSurface-variant font-label py-2">
        No custom provider keys saved yet.
      </div>

      <div
        v-for="record in customProviderKeys"
        :key="record.provider"
        class="glass rounded-xl p-5 flex flex-col gap-3"
      >
        <!-- Header -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-surface-high flex items-center justify-center text-xs font-headline font-bold text-onSurface flex-shrink-0">
            {{ record.provider.slice(0, 2).toUpperCase() }}
          </div>
          <span class="font-headline font-semibold text-onSurface capitalize">{{ record.provider }}</span>
          <span class="ml-auto flex items-center gap-1.5 text-xs font-label text-onSurface-variant">
            <span class="w-2 h-2 rounded-full bg-outline"></span>
            Stored (unverified)
          </span>
        </div>

        <!-- Key input -->
        <div class="flex gap-2 items-center">
          <input
            :type="revealed[record.provider] ? 'text' : 'password'"
            :placeholder="`New key for ${record.provider}…`"
            :value="inputKeys[record.provider] || ''"
            class="flex-1 min-w-0 bg-surface-low rounded-lg px-3 py-2 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary"
            autocomplete="off"
            @input="inputKeys[record.provider] = ($event.target as HTMLInputElement).value"
          />
          <button
            class="text-xs font-label text-onSurface-variant hover:text-onSurface transition-colors px-2 flex-shrink-0"
            @click="revealed[record.provider] = !revealed[record.provider]"
          >{{ revealed[record.provider] ? 'Hide' : 'Show' }}</button>
        </div>

        <p class="text-xs font-label text-onSurface-variant">
          Saved: <span class="font-mono">{{ record.key_masked }}</span>
        </p>
        <p v-if="errors[record.provider]" class="text-xs font-label text-error">{{ errors[record.provider] }}</p>

        <!-- Actions -->
        <div class="flex gap-4">
          <button
            class="text-sm font-label font-medium text-primary hover:opacity-70 transition-opacity disabled:opacity-40"
            :disabled="saving[record.provider] || !inputKeys[record.provider]?.trim()"
            @click="saveKey(record.provider)"
          >{{ saving[record.provider] ? 'Saving…' : 'Update' }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRegistryStore } from '../stores/registry';

const registryStore = useRegistryStore();

// ── Static providers ────────────────────────────────────────────────────────

const STATIC_PROVIDERS = [
  { id: 'openai',    name: 'OpenAI',         abbr: 'OA', keyHint: 'sk-…',   color: 'linear-gradient(135deg, #ADC6FF 0%, #4D8EFF 100%)' },
  { id: 'anthropic', name: 'Anthropic',       abbr: 'AN', keyHint: 'sk-ant-…', color: 'linear-gradient(135deg, #FFB786 0%, #DF7412 100%)' },
  { id: 'google',    name: 'Google Gemini',   abbr: 'GG', keyHint: 'AIza…',  color: 'linear-gradient(135deg, #B1C6F9 0%, #749CFF 100%)' },
  { id: 'groq',      name: 'Groq',            abbr: 'GQ', keyHint: 'gsk_…',  color: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' },
] as const;

const STATIC_IDS = new Set(STATIC_PROVIDERS.map((p) => p.id));

// ── Shared state for all providers ──────────────────────────────────────────

const inputKeys  = reactive<Record<string, string>>({});
const revealed   = reactive<Record<string, boolean>>({});
const saving     = reactive<Record<string, boolean>>({});
const validating = reactive<Record<string, boolean>>({});
const errors     = reactive<Record<string, string>>({});

// ── Custom providers (keys in DB not in static list) ────────────────────────

const customProviderKeys = computed(() =>
  registryStore.apiKeys.filter((k) => !STATIC_IDS.has(k.provider as any))
);

// ── Add-new-provider form ────────────────────────────────────────────────────

const showAddForm    = ref(false);
const newProviderName = ref('');
const newProviderKey  = ref('');
const addError        = ref('');
const addingSaving    = ref(false);

async function addCustomKey() {
  const id  = newProviderName.value.trim().toLowerCase();
  const key = newProviderKey.value.trim();
  if (!id || !key) return;

  // Prevent duplicating a static provider via the custom form
  if (STATIC_IDS.has(id as any)) {
    addError.value = `Use the "${id}" card above to set this key.`;
    return;
  }

  addError.value  = '';
  addingSaving.value = true;
  try {
    await registryStore.saveApiKey(id, key);
    newProviderName.value = '';
    newProviderKey.value  = '';
    showAddForm.value = false;
  } catch (err: any) {
    addError.value = err?.detail ?? 'Failed to save key.';
  } finally {
    addingSaving.value = false;
  }
}

// ── Helpers for static provider cards ────────────────────────────────────────

function getRecord(id: string) {
  return registryStore.apiKeys.find((k) => k.provider === id) ?? null;
}

function storedKey(id: string): string {
  return getRecord(id)?.key_masked ?? '';
}

function lastValidated(id: string): string {
  const r = getRecord(id);
  if (!r?.last_validated) return '';
  return new Date(r.last_validated).toLocaleString();
}

function statusLabel(id: string): string {
  const r = getRecord(id);
  if (!r) return 'Not configured';
  if (r.is_valid) return 'Valid';
  if (r.last_validated) return 'Invalid';
  return 'Not tested';
}

function dotClass(id: string): string {
  const r = getRecord(id);
  if (!r) return 'bg-outline';
  if (r.is_valid) return 'bg-green-400';
  if (r.last_validated) return 'bg-error';
  return 'bg-outline';
}

function statusClass(id: string): string {
  const r = getRecord(id);
  if (!r) return 'text-outline';
  if (r.is_valid) return 'text-green-400';
  if (r.last_validated) return 'text-error';
  return 'text-outline';
}

// ── Actions ───────────────────────────────────────────────────────────────────

async function saveKey(id: string) {
  const key = inputKeys[id]?.trim();
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

async function validateKey(id: string) {
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
