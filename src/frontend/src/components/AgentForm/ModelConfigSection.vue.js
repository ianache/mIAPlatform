/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, watch } from 'vue';
const props = defineProps();
const emit = defineEmits();
const localProvider = ref(props.provider);
const localModel = ref(props.model);
const localTemperature = ref(props.temperature);
watch(localProvider, (val) => emit('update:provider', val));
watch(localModel, (val) => emit('update:model', val));
watch(localTemperature, (val) => emit('update:temperature', val));
const providers = [
    { id: 'openai', label: 'OpenAI' },
    { id: 'anthropic', label: 'Anthropic' },
    { id: 'google', label: 'Google Gemini' },
    { id: 'other', label: 'Other' },
];
const modelMap = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
};
const availableModels = computed(() => localProvider.value && localProvider.value !== 'other'
    ? modelMap[localProvider.value] ?? []
    : []);
const providerDotClass = computed(() => {
    switch (localProvider.value) {
        case 'openai':
            return 'bg-primary';
        case 'anthropic':
            return 'bg-tertiary';
        case 'google':
            return 'bg-secondary';
        default:
            return 'bg-outline';
    }
});
function handleProviderChange() {
    localModel.value = '';
    emit('update:model', '');
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
    ...{ class: "space-y-6" },
});
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-1.5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-sm font-label text-onSurface-variant" },
    for: "provider-select",
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-error" },
});
/** @type {__VLS_StyleScopedClasses['text-error']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    ...{ onChange: (__VLS_ctx.handleProviderChange) },
    id: "provider-select",
    value: (__VLS_ctx.localProvider),
    ...{ class: "w-full appearance-none bg-surface-high text-onSurface font-body rounded-lg px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['appearance-none']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['font-body']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-10']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "",
    disabled: true,
});
for (const [provider] of __VLS_vFor((__VLS_ctx.providers))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (provider.id),
        value: (provider.id),
    });
    (provider.label);
    // @ts-ignore
    [handleProviderChange, localProvider, providers,];
}
if (__VLS_ctx.localProvider) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        ...{ class: "absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" },
        ...{ class: (__VLS_ctx.providerDotClass) },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    ...{ class: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onSurface-variant" },
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
});
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['right-3']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "2",
    d: "M19 9l-7 7-7-7",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-1.5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-sm font-label text-onSurface-variant" },
    for: "model-select",
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-error" },
});
/** @type {__VLS_StyleScopedClasses['text-error']} */ ;
if (__VLS_ctx.localProvider !== 'other') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        id: "model-select",
        value: (__VLS_ctx.localModel),
        disabled: (!__VLS_ctx.localProvider),
        ...{ class: "w-full appearance-none bg-surface-high text-onSurface font-body rounded-lg px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['appearance-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-body']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
        disabled: true,
    });
    for (const [model] of __VLS_vFor((__VLS_ctx.availableModels))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (model),
            value: (model),
        });
        (model);
        // @ts-ignore
        [localProvider, localProvider, localProvider, providerDotClass, localModel, availableModels,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onSurface-variant" },
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
    });
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M19 9l-7 7-7-7",
    });
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        id: "model-custom",
        value: (__VLS_ctx.localModel),
        type: "text",
        placeholder: "Enter custom model name",
        ...{ class: "w-full bg-surface-high text-onSurface font-body placeholder-onSurface-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all" },
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
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-2" },
});
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-sm font-label text-onSurface-variant" },
    for: "temperature-slider",
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-sm font-label text-primary bg-surface-high px-2 py-0.5 rounded-md" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
(__VLS_ctx.localTemperature.toFixed(1));
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    id: "temperature-slider",
    type: "range",
    min: "0",
    max: "2",
    step: "0.1",
    ...{ class: "w-full accent-primary cursor-pointer" },
});
(__VLS_ctx.localTemperature);
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['accent-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-between text-xs text-onSurface-variant font-label" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[localModel, localTemperature, localTemperature,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
