/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, watch } from 'vue';
const props = defineProps();
const emit = defineEmits();
const localSystemPrompt = ref(props.systemPrompt ?? '');
watch(localSystemPrompt, (val) => emit('update:systemPrompt', val));
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-3" },
});
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-1.5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-sm font-label text-onSurface-variant" },
    for: "system-prompt",
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
    id: "system-prompt",
    value: (__VLS_ctx.localSystemPrompt),
    placeholder: "You are a helpful assistant that...",
    maxlength: "4000",
    ...{ style: ({ minHeight: '150px' }) },
    ...{ class: "w-full bg-surface-high text-onSurface font-mono text-sm placeholder-onSurface-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary resize-y transition-all" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['resize-y']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-start justify-between gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-xs text-onSurface-variant font-label" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-xs text-onSurface-variant font-label whitespace-nowrap" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
(__VLS_ctx.localSystemPrompt?.length ?? 0);
// @ts-ignore
[localSystemPrompt, localSystemPrompt,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
