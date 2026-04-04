<template>
  <div class="space-y-4">
    <!-- Loading state -->
    <div v-if="skillsStore.loading" class="space-y-3">
      <div
        v-for="n in 3"
        :key="n"
        class="flex items-center justify-between rounded-lg px-4 py-3 bg-surface-low animate-pulse"
      >
        <div class="flex flex-col gap-1 mr-4 flex-1">
          <div class="h-4 bg-surface-high rounded w-1/3"></div>
          <div class="h-3 bg-surface-high rounded w-2/3"></div>
        </div>
        <div class="w-11 h-6 bg-surface-high rounded-full"></div>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="skillsStore.error"
      class="rounded-lg px-4 py-3 bg-surface-high text-error text-sm"
    >
      {{ skillsStore.error }}
      <button
        class="ml-2 text-primary hover:opacity-70 transition-opacity"
        @click="skillsStore.fetchSkills()"
      >
        Retry
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="skillsStore.skills.length === 0"
      class="rounded-lg px-4 py-3 bg-surface-high text-onSurface-variant text-sm"
    >
      No skills available in catalog. 
      <a
        :href="skillsStore.skills[0]?.github_url || 'https://github.com/ianache/skills-catalog'"
        target="_blank"
        class="text-primary hover:opacity-70 transition-opacity"
      >
        View catalog
      </a>
    </div>

    <!-- Skills list -->
    <div v-else class="space-y-3">
      <div
        v-for="skill in skillsStore.skills"
        :key="skill.id"
        class="flex items-center justify-between rounded-lg px-4 py-3 transition-all cursor-pointer"
        :class="isEnabled(skill.id) ? 'bg-surface-highest' : 'bg-surface-low'"
        @click="toggleCapability(skill.id)"
      >
        <div class="flex flex-col gap-0.5 mr-4 flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-label text-onSurface font-medium truncate">{{ skill.name }}</span>
            <span class="text-xs font-label text-onSurface-variant bg-surface-high px-1.5 py-0.5 rounded">
              v{{ skill.version }}
            </span>
          </div>
          <span class="text-xs font-label text-onSurface-variant line-clamp-2">{{ skill.description }}</span>
          <a
            :href="skill.github_url"
            target="_blank"
            class="text-xs font-label text-primary hover:opacity-70 transition-opacity mt-1"
            @click.stop
          >
            View source →
          </a>
        </div>
        <!-- Toggle switch -->
        <button
          type="button"
          role="switch"
          :aria-checked="isEnabled(skill.id)"
          :aria-label="`Toggle ${skill.name}`"
          class="relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
          :class="isEnabled(skill.id) ? 'bg-primary-container' : 'bg-surface-high'"
          @click.stop="toggleCapability(skill.id)"
        >
          <span
            class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-onSurface transition-transform duration-200 shadow-sm"
            :class="isEnabled(skill.id) ? 'translate-x-5 !bg-primary' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>

    <!-- Catalog info -->
    <div class="flex items-center justify-between text-xs text-onSurface-variant font-label pt-2 border-t border-surface-high">
      <span>{{ skillsStore.skills.length }} skills available</span>
      <a
        href="https://github.com/ianache/skills-catalog/blob/main/catalog.yaml"
        target="_blank"
        class="text-primary hover:opacity-70 transition-opacity"
      >
        Browse catalog →
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useSkillsStore } from '../../stores/skills';

interface Props {
  modelValue: string[];
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const skillsStore = useSkillsStore();
const localCapabilities = ref<string[]>([...props.modelValue]);

// Watch for prop changes
watch(
  () => props.modelValue,
  (val) => {
    localCapabilities.value = [...val];
  }
);

// Fetch skills on mount
onMounted(() => {
  skillsStore.fetchSkills();
});

function isEnabled(id: string): boolean {
  return localCapabilities.value.includes(id);
}

function toggleCapability(id: string) {
  if (isEnabled(id)) {
    localCapabilities.value = localCapabilities.value.filter((c) => c !== id);
  } else {
    localCapabilities.value = [...localCapabilities.value, id];
  }
  emit('update:modelValue', localCapabilities.value);
}
</script>
