import { ref, computed, watch, onMounted } from 'vue';
import { useRegistryStore } from '../../stores/registry';
const props = defineProps();
const emit = defineEmits();
const registryStore = useRegistryStore();
const localProvider = ref(props.provider);
const localRegistryModelId = ref(props.registryModelId);
const localTemperature = ref(props.temperature);
// Sync props → local (edit mode load)
watch(() => props.provider, (val) => { localProvider.value = val; });
watch(() => props.temperature, (val) => { localTemperature.value = val; });
watch(() => props.registryModelId, (uuid) => {
    localRegistryModelId.value = uuid;
    // Sync localProvider from registry entry (needed on edit mode load)
    if (uuid) {
        const entry = registryStore.models.find(m => m.id === uuid);
        if (entry)
            localProvider.value = entry.provider;
    }
});
// Emit changes
watch(localTemperature, (val) => emit('update:temperature', val));
watch(localRegistryModelId, (uuid) => {
    emit('update:registryModelId', uuid);
    // Derive and emit provider from selected registry entry
    if (uuid) {
        const entry = registryStore.models.find(m => m.id === uuid);
        if (entry) {
            localProvider.value = entry.provider;
            emit('update:provider', entry.provider);
        }
    }
});
const providerLabels = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google Gemini',
    ollama: 'Ollama',
    other: 'Other',
};
// Providers that have at least one active registered model
const availableProviders = computed(() => {
    const seen = new Set();
    registryStore.models.forEach((m) => {
        if (m.status === 'active')
            seen.add(m.provider);
    });
    return Array.from(seen).map((id) => ({
        id: id,
        label: providerLabels[id] ?? id.charAt(0).toUpperCase() + id.slice(1),
    }));
});
// Registry models filtered by selected provider
const filteredModels = computed(() => localProvider.value
    ? registryStore.models.filter((m) => m.provider === localProvider.value && m.status === 'active')
    : []);
const providerDotClass = computed(() => ({
    openai: 'bg-primary',
    anthropic: 'bg-tertiary',
    google: 'bg-secondary',
    ollama: 'bg-outline',
    other: 'bg-outline',
}[localProvider.value] ?? 'bg-outline'));
function handleProviderChange() {
    localRegistryModelId.value = '';
    emit('update:registryModelId', '');
    emit('update:provider', localProvider.value);
}
onMounted(() => {
    if (registryStore.models.length === 0) {
        registryStore.fetchModels();
    }
    // If registryModelId already set (edit mode), sync provider
    if (props.registryModelId) {
        const entry = registryStore.models.find(m => m.id === props.registryModelId);
        if (entry)
            localProvider.value = entry.provider;
    }
});
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
for (const [provider] of __VLS_vFor((__VLS_ctx.availableProviders))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (provider.id),
        value: (provider.id),
    });
    (provider.label);
    // @ts-ignore
    [handleProviderChange, localProvider, availableProviders,];
}
if (__VLS_ctx.localProvider) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        ...{ class: "absolute w-2 h-2 rounded-full top-1/2 -translate-y-1/2" },
        ...{ class: (__VLS_ctx.providerDotClass) },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    id: "model-select",
    value: (__VLS_ctx.localRegistryModelId),
    disabled: (!__VLS_ctx.localProvider || __VLS_ctx.registryStore.loading),
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
(__VLS_ctx.registryStore.loading ? 'Loading models...' : 'Select a model');
for (const [m] of __VLS_vFor((__VLS_ctx.filteredModels))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (m.id),
        value: (m.id),
    });
    (m.name);
    (m.model_id ? ` — ${m.model_id}` : '');
    // @ts-ignore
    [localProvider, localProvider, providerDotClass, localRegistryModelId, registryStore, registryStore, filteredModels,];
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
if (__VLS_ctx.registryStore.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-error mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    (__VLS_ctx.registryStore.error);
}
else if (__VLS_ctx.filteredModels.length === 0 && __VLS_ctx.localProvider && !__VLS_ctx.registryStore.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-onSurface-variant mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
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
[localProvider, registryStore, registryStore, registryStore, filteredModels, localTemperature, localTemperature,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
