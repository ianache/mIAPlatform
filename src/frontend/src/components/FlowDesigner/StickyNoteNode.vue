<template>
  <div
    class="sticky-note rounded-lg shadow-lg overflow-hidden"
    :class="[`bg-${data.color || 'yellow'}`]"
    :style="{ width: `${data.width || 200}px`, minHeight: `${data.height || 150}px`, zIndex: 0 }"
  >
    <!-- Toolbar -->
    <div class="flex items-center justify-between px-2 py-1 bg-black/10">
      <div class="flex items-center gap-1">
        <button
          v-for="color in colors"
          :key="color"
          class="w-4 h-4 rounded-full border border-black/20 hover:scale-110 transition-transform"
          :class="`bg-${color}`"
          :style="{ backgroundColor: getColorValue(color) }"
          @click.stop="changeColor(color)"
          :title="`Change to ${color}`"
        />
      </div>
      <button
        class="p-1 hover:bg-black/10 rounded transition-colors"
        @click.stop="deleteNote"
        title="Delete note"
      >
        <svg class="w-4 h-4 text-black/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="p-3">
      <div
        v-if="!isEditing"
        class="prose prose-sm max-w-none cursor-text"
        :class="`prose-${data.color || 'yellow'}`"
        @dblclick="startEditing"
        v-html="renderedMarkdown"
      />
      <textarea
        v-else
        ref="textareaRef"
        v-model="editContent"
        class="w-full h-full min-h-[100px] bg-transparent resize-none outline-none text-sm font-body"
        :class="`text-${data.color || 'yellow'}-text`"
        @blur="saveEdit"
        @keydown.esc="cancelEdit"
        placeholder="Enter markdown text..."
      />
    </div>

    <!-- Resize handle -->
    <div
      class="absolute bottom-1 right-1 w-3 h-3 cursor-se-resize opacity-30 hover:opacity-60"
      @mousedown.stop="startResize"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-black/50">
        <path d="M22 22H20V20H22V22ZM22 18H18V22H20V20H22V18ZM22 14H14V22H16V20H18V18H20V16H22V14Z"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useVueFlow } from '@vue-flow/core';

interface Props {
  id: string;
  data: {
    content?: string;
    color?: string;
    width?: number;
    height?: number;
  };
}

const props = defineProps<Props>();
const { updateNode, removeNodes } = useVueFlow();

const isEditing = ref(false);
const editContent = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const colors = ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'];

const colorMap: Record<string, string> = {
  yellow: '#fef3c7',
  blue: '#dbeafe',
  green: '#dcfce7',
  pink: '#fce7f3',
  purple: '#f3e8ff',
  orange: '#ffedd5',
};

function getColorValue(color: string): string {
  return colorMap[color] || colorMap.yellow;
}

const renderedMarkdown = computed(() => {
  const content = props.data.content || '';
  // Simple markdown rendering
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold mt-2 mb-1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold mt-2 mb-1">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold mt-2 mb-1">$1</h1>')
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-black/10 px-1 rounded text-xs">$1</code>')
    .replace(/^- (.*$)/gim, '<li class="ml-3">$1</li>')
    .replace(/\n/g, '<br>');
});

function startEditing() {
  isEditing.value = true;
  editContent.value = props.data.content || '';
  nextTick(() => {
    textareaRef.value?.focus();
  });
}

function saveEdit() {
  updateNode(props.id, {
    data: {
      ...props.data,
      content: editContent.value,
    },
  });
  isEditing.value = false;
}

function cancelEdit() {
  isEditing.value = false;
  editContent.value = props.data.content || '';
}

function changeColor(color: string) {
  updateNode(props.id, {
    data: {
      ...props.data,
      color,
    },
  });
}

function deleteNote() {
  removeNodes([props.id]);
}

function startResize(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  
  const startX = event.clientX;
  const startY = event.clientY;
  const startWidth = props.data.width || 200;
  const startHeight = props.data.height || 150;

  function onMouseMove(e: MouseEvent) {
    const newWidth = Math.max(150, startWidth + (e.clientX - startX));
    const newHeight = Math.max(100, startHeight + (e.clientY - startY));
    
    updateNode(props.id, {
      data: {
        ...props.data,
        width: newWidth,
        height: newHeight,
      },
    });
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}
</script>

<style scoped>
.sticky-note {
  position: relative;
}

.bg-yellow { background-color: #fef3c7; }
.bg-blue { background-color: #dbeafe; }
.bg-green { background-color: #dcfce7; }
.bg-pink { background-color: #fce7f3; }
.bg-purple { background-color: #f3e8ff; }
.bg-orange { background-color: #ffedd5; }

.text-yellow-text { color: #1f2937; }
.text-blue-text { color: #1f2937; }
.text-green-text { color: #1f2937; }
.text-pink-text { color: #1f2937; }
.text-purple-text { color: #1f2937; }
.text-orange-text { color: #1f2937; }

.prose-yellow :deep(h1),
.prose-yellow :deep(h2),
.prose-yellow :deep(h3) {
  color: #92400e;
}

.prose-blue :deep(h1),
.prose-blue :deep(h2),
.prose-blue :deep(h3) {
  color: #1e40af;
}

.prose-green :deep(h1),
.prose-green :deep(h2),
.prose-green :deep(h3) {
  color: #166534;
}

.prose-pink :deep(h1),
.prose-pink :deep(h2),
.prose-pink :deep(h3) {
  color: #9d174d;
}

.prose-purple :deep(h1),
.prose-purple :deep(h2),
.prose-purple :deep(h3) {
  color: #6b21a8;
}

.prose-orange :deep(h1),
.prose-orange :deep(h2),
.prose-orange :deep(h3) {
  color: #9a3412;
}
</style>