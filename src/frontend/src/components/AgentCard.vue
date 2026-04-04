<template>
  <div
    class="glass rounded-xl p-6 flex flex-col gap-4 cursor-default transition-colors duration-200 hover:bg-surface-high"
  >
    <!-- Top row: avatar + name + status badge -->
    <div class="flex items-center gap-3">
      <!-- Avatar: Image or Initials -->
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-headline font-semibold text-background shrink-0 overflow-hidden"
        :style="avatarStyle"
      >
        <img
          v-if="hasAvatar"
          :src="agent.avatar_url"
          alt="Agent avatar"
          class="w-full h-full object-cover"
          @error="handleAvatarError"
        />
        <template v-else>
          {{ initials }}
        </template>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-headline font-semibold text-onSurface truncate">{{ agent.name }}</p>
      </div>
      <span
        class="flex items-center gap-1.5 text-xs font-label shrink-0"
        :class="statusClass"
      >
        <span class="w-2 h-2 rounded-full" :class="dotClass"></span>
        {{ statusLabel }}
      </span>
    </div>

    <!-- Middle: model + provider -->
    <p class="text-sm font-label text-onSurface-variant">
      {{ modelLabel }}
    </p>

    <!-- Bottom: capability count + edit action -->
    <div class="flex items-center justify-between">
      <span class="text-xs font-label text-onSurface-variant">
        {{ capabilityLabel }}
      </span>
      <button
        class="text-sm font-label font-medium text-primary transition-opacity duration-200 hover:opacity-70"
        @click="handleEdit"
      >
        Edit
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Agent } from '../types';

const props = defineProps<{ agent: Agent }>();
const router = useRouter();

const avatarError = ref(false);

const hasAvatar = computed(() => {
  return !!props.agent.avatar_url && !avatarError.value;
});

const initials = computed(() => {
  return props.agent.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
});

// Simple deterministic color from name
const avatarColor = computed(() => {
  const colors = [
    'linear-gradient(135deg, #ADC6FF 0%, #4D8EFF 100%)',
    'linear-gradient(135deg, #FFB786 0%, #DF7412 100%)',
    'linear-gradient(135deg, #B1C6F9 0%, #749CFF 100%)',
    'linear-gradient(135deg, #4D8EFF 0%, #ADC6FF 100%)',
  ];
  let hash = 0;
  for (const c of props.agent.name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
});

const avatarStyle = computed(() => {
  if (hasAvatar.value) {
    return { background: 'transparent' };
  }
  return { background: avatarColor.value };
});

const statusLabel = computed(() => {
  switch (props.agent.status) {
    case 'active': return 'Active';
    case 'inactive': return 'Inactive';
    case 'archived': return 'Archived';
    default: return props.agent.status;
  }
});

const dotClass = computed(() => {
  switch (props.agent.status) {
    case 'active': return 'bg-green-400';
    case 'inactive': return 'bg-amber-400';
    case 'archived': return 'bg-outline';
    default: return 'bg-outline';
  }
});

const statusClass = computed(() => {
  switch (props.agent.status) {
    case 'active': return 'text-green-400';
    case 'inactive': return 'text-amber-400';
    case 'archived': return 'text-outline';
    default: return 'text-outline';
  }
});

const providerLabel: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  other: 'Other',
};

const modelLabel = computed(() => {
  const provider = providerLabel[props.agent.provider] ?? props.agent.provider;
  return `${props.agent.model} · ${provider}`;
});

const capabilityLabel = computed(() => {
  const count = props.agent.capabilities.length;
  return count === 1 ? '1 capability' : `${count} capabilities`;
});

function handleAvatarError() {
  avatarError.value = true;
}

function handleEdit() {
  router.push(`/agents/${props.agent.id}/edit`);
}
</script>
