/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, watch } from 'vue';
const props = defineProps();
const emit = defineEmits();
const localCapabilities = ref([...props.modelValue]);
watch(() => props.modelValue, (val) => {
    localCapabilities.value = [...val];
});
const capabilities = [
    {
        id: 'web_search',
        label: 'Web Search',
        description: 'Allow agent to search the web for up-to-date information',
    },
    {
        id: 'file_analysis',
        label: 'File Analysis',
        description: 'Allow agent to read and analyze uploaded files',
    },
    {
        id: 'code_execution',
        label: 'Code Execution (Sandbox)',
        description: 'Allow agent to run code in an isolated sandbox environment',
    },
];
function isEnabled(id) {
    return localCapabilities.value.includes(id);
}
function toggleCapability(id) {
    if (isEnabled(id)) {
        localCapabilities.value = localCapabilities.value.filter((c) => c !== id);
    }
    else {
        localCapabilities.value = [...localCapabilities.value, id];
    }
    emit('update:modelValue', localCapabilities.value);
}
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
    ...{ class: "space-y-4" },
});
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
for (const [cap] of __VLS_vFor((__VLS_ctx.capabilities))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleCapability(cap.id);
                // @ts-ignore
                [capabilities, toggleCapability,];
            } },
        key: (cap.id),
        ...{ class: "flex items-center justify-between rounded-lg px-4 py-3 transition-all cursor-pointer" },
        ...{ class: (__VLS_ctx.isEnabled(cap.id) ? 'bg-surface-highest' : 'bg-surface-low') },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-0.5 mr-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sm font-label text-onSurface font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (cap.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-label text-onSurface-variant" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    (cap.description);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleCapability(cap.id);
                // @ts-ignore
                [toggleCapability, isEnabled,];
            } },
        type: "button",
        role: "switch",
        'aria-checked': (__VLS_ctx.isEnabled(cap.id)),
        'aria-label': (`Toggle ${cap.label}`),
        ...{ class: "relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary" },
        ...{ class: (__VLS_ctx.isEnabled(cap.id) ? 'bg-primary-container' : 'bg-surface-high') },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-primary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        ...{ class: "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-onSurface transition-transform duration-200 shadow-sm" },
        ...{ class: (__VLS_ctx.isEnabled(cap.id) ? 'translate-x-5 !bg-primary' : 'translate-x-0') },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-onSurface']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    // @ts-ignore
    [isEnabled, isEnabled, isEnabled,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
