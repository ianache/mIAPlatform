/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import { useAgentStore } from '../stores/agents';
const agentStore = useAgentStore();
const features = ref([
    { id: 'core-chat', name: 'Core Chat Agent', selectedModel: 'gpt-4o', saved: false },
    { id: 'report-gen', name: 'Report Generator', selectedModel: 'claude-3-5-sonnet', saved: false },
    { id: 'web-search', name: 'Web Search Assistant', selectedModel: 'gemini-1.5-pro', saved: false },
]);
const availableModels = [
    { id: 'gpt-4o', label: 'GPT-4o' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-opus', label: 'Claude 3 Opus' },
    { id: 'claude-3-haiku', label: 'Claude 3 Haiku' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
];
function handleChange(feature) {
    feature.saved = false;
    // Simulate save after short debounce
    setTimeout(() => {
        feature.saved = true;
        setTimeout(() => { feature.saved = false; }, 2000);
    }, 300);
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "glass rounded-2xl p-6" },
});
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "font-headline font-semibold text-onSurface text-lg mb-4" },
});
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col gap-1" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
for (const [feature, index] of __VLS_vFor((__VLS_ctx.features))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (feature.id),
        ...{ class: "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150" },
        ...{ class: (index % 2 === 0 ? 'bg-surface-low' : 'bg-surface') },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-150']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex-1 font-body text-sm text-onSurface truncate" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-body']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    (feature.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative flex-shrink-0" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        ...{ onChange: (...[$event]) => {
                __VLS_ctx.handleChange(feature);
                // @ts-ignore
                [features, handleChange,];
            } },
        value: (feature.selectedModel),
        ...{ class: "appearance-none bg-surface-highest text-onSurface-variant font-label text-xs rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['appearance-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-highest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    for (const [model] of __VLS_vFor((__VLS_ctx.availableModels))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (model.id),
            value: (model.id),
        });
        (model.label);
        // @ts-ignore
        [availableModels,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-onSurface-variant text-[10px]" },
    });
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    if (feature.saved) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-green-400 font-label text-xs flex-shrink-0" },
        });
        /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
