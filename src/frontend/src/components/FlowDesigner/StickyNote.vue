<template>
  <div
    ref="noteRef"
    class="sticky-note rounded-lg shadow-lg overflow-hidden cursor-move select-none"
    :class="[`bg-${note.color || 'yellow'}`]"
    :style="{
      position: 'absolute',
      left: `${note.position.x}px`,
      top: `${note.position.y}px`,
      width: `${note.width || 200}px`,
      minHeight: `${note.height || 150}px`,
      zIndex: 0,
    }"
    @mousedown="startDrag"
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
        @click.stop="$emit('delete', note.id)"
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
        :class="`prose-${note.color || 'yellow'}`"
        @click.stop="startEditing"
        v-html="renderedMarkdown"
      />
      <textarea
        v-else
        ref="textareaRef"
        v-model="editContent"
        class="w-full h-full min-h-[100px] bg-transparent resize-none outline-none text-sm font-body"
        :class="`text-${note.color || 'yellow'}-text`"
        @blur="saveEdit"
        @keydown.esc="cancelEdit"
        @click.stop
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

export interface StickyNote {
  id: string;
  position: { x: number; y: number };
  content?: string;
  color?: string;
  width?: number;
  height?: number;
}

interface Props {
  note: StickyNote;
  zoom?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [note: StickyNote];
  delete: [id: string];
}>();

const noteRef = ref<HTMLDivElement | null>(null);
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
  const content = props.note.content || '';
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
  editContent.value = props.note.content || '';
  nextTick(() => {
    textareaRef.value?.focus();
  });
}

function saveEdit() {
  emit('update', {
    ...props.note,
    content: editContent.value,
  });
  isEditing.value = false;
}

function cancelEdit() {
  isEditing.value = false;
  editContent.value = props.note.content || '';
}

function changeColor(color: string) {
  emit('update', {
    ...props.note,
    color,
  });
}

// Drag functionality
function startDrag(event: MouseEvent) {
  // Don't drag if clicking on interactive elements
  const target = event.target as HTMLElement;
  if (target.tagName === 'BUTTON' || target.tagName === 'TEXTAREA' || target.closest('button')) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const startX = event.clientX;
  const startY = event.clientY;
  const startPosX = props.note.position.x;
  const startPosY = props.note.position.y;
  const zoom = props.zoom || 1;

  function onMouseMove(e: MouseEvent) {
    const deltaX = (e.clientX - startX) / zoom;
    const deltaY = (e.clientY - startY) / zoom;

    emit('update', {
      ...props.note,
      position: {
        x: startPosX + deltaX,
        y: startPosY + deltaY,
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

// Resize functionality
function startResize(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();

  const startX = event.clientX;
  const startY = event.clientY;
  const startWidth = props.note.width || 200;
  const startHeight = props.note.height || 150;
  const zoom = props.zoom || 1;

  function onMouseMove(e: MouseEvent) {
    const deltaX = (e.clientX - startX) / zoom;
    const deltaY = (e.clientY - startY) / zoom;
    const newWidth = Math.max(150, startWidth + deltaX);
    const newHeight = Math.max(100, startHeight + deltaY);

    emit('update', {
      ...props.note,
      width: newWidth,
      height: newHeight,
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
  position: absolute;
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