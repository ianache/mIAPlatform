import { ref, watch } from 'vue';
const props = defineProps();
const emit = defineEmits();
const fileInput = ref(null);
const avatarPreview = ref(props.avatarUrl ?? '');
const localName = ref(props.name);
const localDescription = ref(props.description ?? '');
const nameError = ref('');
watch(localName, (val) => emit('update:name', val));
watch(localDescription, (val) => emit('update:description', val));
function triggerFilePicker() {
    fileInput.value?.click();
}
function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file)
        return;
    const url = URL.createObjectURL(file);
    avatarPreview.value = url;
    emit('update:avatarUrl', url);
}
function validateName() {
    if (!localName.value || localName.value.trim().length === 0) {
        nameError.value = 'Name is required';
        emit('validation-error', 'name', true);
    }
    else if (localName.value.trim().length < 3) {
        nameError.value = 'Name must be at least 3 characters';
        emit('validation-error', 'name', true);
    }
    else {
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
const __VLS_exposed = { validateName };
defineExpose(__VLS_exposed);
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
    ...{ class: "space-y-6" },
});
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col items-center gap-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.triggerFilePicker) },
    type: "button",
    ...{ class: "w-20 h-20 rounded-full bg-surface-high flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all" },
    'aria-label': "Upload avatar",
});
/** @type {__VLS_StyleScopedClasses['w-20']} */ ;
/** @type {__VLS_StyleScopedClasses['h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:ring-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
if (__VLS_ctx.avatarPreview) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.avatarPreview),
        alt: "Agent avatar preview",
        ...{ class: "w-full h-full object-cover" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        ...{ class: "w-8 h-8 text-onSurface-variant" },
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
    });
    /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "1.5",
        d: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
    });
}
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-xs text-onSurface-variant font-label" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onChange: (__VLS_ctx.handleFileChange) },
    ref: "fileInput",
    type: "file",
    accept: "image/*",
    ...{ class: "hidden" },
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-1.5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-sm font-label text-onSurface-variant" },
    for: "agent-name",
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-error" },
});
/** @type {__VLS_StyleScopedClasses['text-error']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onBlur: (__VLS_ctx.validateName) },
    ...{ onInput: (__VLS_ctx.clearNameError) },
    id: "agent-name",
    value: (__VLS_ctx.localName),
    type: "text",
    placeholder: "Give your agent a name",
    maxlength: "100",
    ...{ class: "w-full bg-surface-high text-onSurface font-headline placeholder-onSurface-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all" },
    ...{ class: ({ 'ring-2 ring-error': __VLS_ctx.nameError }) },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-error']} */ ;
if (__VLS_ctx.nameError) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-error font-label" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    (__VLS_ctx.nameError);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-1.5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-sm font-label text-onSurface-variant" },
    for: "agent-description",
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
    id: "agent-description",
    value: (__VLS_ctx.localDescription),
    placeholder: "What does this agent do?",
    maxlength: "500",
    rows: "3",
    ...{ class: "w-full bg-surface-high text-onSurface font-body placeholder-onSurface-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary resize-none transition-all" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['font-body']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['resize-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-xs text-onSurface-variant font-label text-right" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
(__VLS_ctx.localDescription?.length ?? 0);
// @ts-ignore
[triggerFilePicker, avatarPreview, avatarPreview, handleFileChange, validateName, clearNameError, localName, nameError, nameError, nameError, localDescription, localDescription,];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => (__VLS_exposed),
    __typeEmits: {},
    __typeProps: {},
});
export default {};
