<template>
  <div class="max-w-5xl mx-auto space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-headline font-semibold text-primary">
          {{ form.name || 'Node Type Editor' }}
        </h1>
        <p class="mt-1 text-sm text-onSurface-variant font-body">Define properties and implementation code.</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="n in 4" :key="n" class="glass rounded-2xl p-6 animate-pulse space-y-4">
        <div class="h-4 bg-surface-high rounded w-1/3"></div>
        <div class="h-10 bg-surface-high rounded"></div>
      </div>
    </div>

    <template v-else>
      <!-- Toast -->
      <transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="toast" class="fixed top-6 right-6 z-50 bg-surface-high text-onSurface rounded-lg px-5 py-3 shadow-lg flex items-center gap-3">
          <span class="w-2 h-2 rounded-full bg-primary shrink-0" />
          <span class="font-label text-sm">{{ toast }}</span>
        </div>
      </transition>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Identity card -->
        <div class="glass rounded-2xl p-6 space-y-5">
          <h2 class="text-lg font-headline font-semibold text-onSurface">Identity</h2>
          <div class="flex gap-4 items-start">
            <div class="space-y-1 w-20 shrink-0">
              <label class="text-xs font-label text-onSurface-variant uppercase tracking-wide">Icon</label>
              <input v-model="form.icon" type="text" maxlength="4"
                class="w-full bg-surface-high rounded-xl px-3 py-2.5 text-2xl text-center outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div class="space-y-1 flex-1">
              <label class="text-xs font-label text-onSurface-variant uppercase tracking-wide">Name *</label>
              <input v-model="form.name" type="text" placeholder="My Node Type"
                class="w-full bg-surface-high rounded-xl px-4 py-2.5 text-sm font-body text-onSurface outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-label text-onSurface-variant uppercase tracking-wide">Category *</label>
            <select v-model="form.category"
              class="w-full bg-surface-high rounded-xl px-4 py-2.5 text-sm font-body text-onSurface outline-none focus:ring-2 focus:ring-primary/40">
              <option value="source">Source</option>
              <option value="processor">Processor</option>
              <option value="sink">Sink</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-label text-onSurface-variant uppercase tracking-wide">Description</label>
            <textarea v-model="form.description" rows="3" placeholder="What does this node do?"
              class="w-full bg-surface-high rounded-xl px-4 py-2.5 text-sm font-body text-onSurface outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
          </div>
        </div>

        <!-- Properties card -->
        <div class="glass rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-headline font-semibold text-onSurface">Properties</h2>
            <button
              class="text-xs font-label text-primary hover:opacity-70 transition-opacity"
              @click="addProperty">+ Add property</button>
          </div>

          <div v-if="form.properties.length === 0" class="text-center py-8 text-sm text-onSurface-variant/60 font-body">
            No properties yet. Click "+ Add property" to define inputs.
          </div>

          <div v-else class="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            <div
              v-for="(prop, i) in form.properties"
              :key="i"
              class="bg-surface-high rounded-xl p-3 space-y-2"
            >
              <div class="flex gap-2">
                <input v-model="prop.name" type="text" placeholder="property_name"
                  class="flex-1 bg-background/40 rounded-lg px-3 py-1.5 text-xs font-mono text-onSurface outline-none focus:ring-1 focus:ring-primary/40" />
                <select v-model="prop.data_type"
                  class="bg-background/40 rounded-lg px-2 py-1.5 text-xs font-label text-onSurface outline-none focus:ring-1 focus:ring-primary/40">
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="code">code</option>
                  <option value="json">json</option>
                </select>
                <label class="flex items-center gap-1 text-xs font-label text-onSurface-variant cursor-pointer">
                  <input type="checkbox" v-model="prop.required" class="accent-primary" />
                  req
                </label>
                <button class="text-error/70 hover:text-error transition-colors text-lg leading-none px-1" @click="removeProperty(i)">×</button>
              </div>
              <input v-model="prop.description" type="text" placeholder="Description (optional)"
                class="w-full bg-background/40 rounded-lg px-3 py-1.5 text-xs font-body text-onSurface/70 outline-none focus:ring-1 focus:ring-primary/40" />
              <input v-model="prop.default_value" type="text" placeholder="Default value (optional)"
                class="w-full bg-background/40 rounded-lg px-3 py-1.5 text-xs font-mono text-onSurface/70 outline-none focus:ring-1 focus:ring-primary/40" />
            </div>
          </div>
        </div>
      </div>

      <!-- Implementation card (full width) -->
      <div class="glass rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-headline font-semibold text-onSurface">Implementation</h2>
          <div class="flex rounded-lg overflow-hidden border border-white/10">
            <button
              v-for="lang in ['javascript', 'python']"
              :key="lang"
              class="px-4 py-1.5 text-xs font-label transition-colors"
              :class="form.language === lang
                ? 'bg-primary/20 text-primary'
                : 'text-onSurface-variant hover:bg-surface-high'"
              @click="form.language = lang as 'javascript' | 'python'"
            >{{ lang === 'javascript' ? 'JavaScript' : 'Python' }}</button>
          </div>
        </div>
        <div class="text-xs text-onSurface-variant/60 font-body">
          Receives <code class="bg-surface-high px-1 rounded">config</code> (object with property values) and
          <code class="bg-surface-high px-1 rounded">input</code> (data from upstream nodes).
        </div>
        <textarea
          v-model="form.code"
          rows="14"
          :placeholder="codePlaceholder"
          class="w-full bg-[#0D1520] rounded-xl px-4 py-3 text-sm font-mono text-onSurface outline-none focus:ring-2 focus:ring-primary/40 resize-none leading-relaxed"
        />
      </div>

      <!-- Actions -->
      <div class="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pb-8">
        <button
          class="px-6 py-3 rounded-xl font-label text-sm text-error bg-surface-high hover:bg-surface-highest transition-colors"
          @click="confirmDelete = true"
        >Delete Node Type</button>
        <div class="flex gap-3">
          <button class="px-6 py-3 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors"
            @click="router.push('/nodes-catalog')">Cancel</button>
          <button :disabled="!form.name.trim() || store.loading"
            class="px-8 py-3 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            @click="handleSave">
            <svg v-if="store.loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ store.loading ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </template>

    <!-- Delete confirm -->
    <transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="confirmDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="confirmDelete = false">
        <div class="glass rounded-2xl p-8 w-full max-w-sm shadow-2xl space-y-5">
          <h2 class="font-headline font-semibold text-onSurface text-lg">Delete Node Type?</h2>
          <p class="text-sm text-onSurface-variant">This will permanently delete "<strong>{{ form.name }}</strong>".</p>
          <div class="flex justify-end gap-3">
            <button class="px-5 py-2.5 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors" @click="confirmDelete = false">Cancel</button>
            <button class="px-5 py-2.5 rounded-xl font-label text-sm font-semibold bg-error text-background hover:opacity-90 transition-opacity" @click="handleDelete">Delete</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useNodeTypesStore } from '../stores/nodeTypes';
import type { NodeTypeProperty } from '../types';

const router = useRouter();
const route = useRoute();
const store = useNodeTypesStore();

const ntId = route.params.id as string;
const loading = ref(true);
const toast = ref('');
const confirmDelete = ref(false);

const form = reactive({
  name: '',
  icon: '📦',
  description: '',
  category: 'source' as 'source' | 'processor' | 'sink',
  properties: [] as NodeTypeProperty[],
  language: 'javascript' as 'javascript' | 'python',
  code: '',
});

const codePlaceholder = computed(() =>
  form.language === 'javascript'
    ? `async function execute(config, input) {\n  // config has your property values\n  // input is data from upstream nodes\n  return { result: [] };\n}`
    : `async def execute(config, input):\n    # config has your property values\n    # input is data from upstream nodes\n    return {"result": []}`
);

onMounted(async () => {
  try {
    const nt = await store.fetchNodeTypeById(ntId);
    form.name = nt.name;
    form.icon = nt.icon ?? '📦';
    form.description = nt.description ?? '';
    form.category = nt.category as typeof form.category;
    form.properties = nt.properties.map((p) => ({ ...p }));
    form.language = nt.language as typeof form.language;
    form.code = nt.code ?? '';
  } catch {
    router.push('/nodes-catalog');
  } finally {
    loading.value = false;
  }
});

function addProperty() {
  form.properties.push({ name: '', data_type: 'string', description: '', required: false });
}

function removeProperty(i: number) {
  form.properties.splice(i, 1);
}

async function handleSave() {
  try {
    await store.updateNodeType(ntId, {
      name: form.name.trim(),
      icon: form.icon || '📦',
      description: form.description || undefined,
      category: form.category,
      properties: form.properties,
      language: form.language,
      code: form.code || undefined,
    });
    toast.value = 'Saved successfully!';
    setTimeout(() => { toast.value = ''; }, 2500);
  } catch {}
}

async function handleDelete() {
  await store.deleteNodeType(ntId);
  router.push('/nodes-catalog');
}
</script>
