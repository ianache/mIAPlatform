/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAgentStore } from '../stores/agents';
import IdentitySection from '../components/AgentForm/IdentitySection.vue';
import ModelConfigSection from '../components/AgentForm/ModelConfigSection.vue';
import RoleDefinitionSection from '../components/AgentForm/RoleDefinitionSection.vue';
import CapabilitiesSection from '../components/AgentForm/CapabilitiesSection.vue';
const router = useRouter();
const agentStore = useAgentStore();
const identitySectionRef = ref(null);
const successMessage = ref('');
const globalError = ref('');
const validationErrors = reactive({});
const form = reactive({
    name: '',
    description: '',
    avatar_url: '',
    provider: 'openai',
    model: '',
    temperature: 0.7,
    system_prompt: '',
    capabilities: [],
    status: 'active',
});
function handleValidationError(field, hasError) {
    validationErrors[field] = hasError;
}
function validateForm() {
    // Trigger identity section validation
    identitySectionRef.value?.validateName();
    const nameOk = form.name.trim().length >= 3 && form.name.trim().length <= 100;
    if (!nameOk)
        return false;
    return true;
}
async function handleSubmit() {
    globalError.value = '';
    if (!validateForm())
        return;
    try {
        const payload = {
            name: form.name.trim(),
            description: form.description || undefined,
            avatar_url: form.avatar_url || undefined,
            provider: form.provider,
            model: form.model,
            temperature: form.temperature,
            system_prompt: form.system_prompt || undefined,
            capabilities: form.capabilities,
            status: form.status ?? 'active',
        };
        await agentStore.createAgent(payload);
        successMessage.value = 'Agent created successfully!';
        setTimeout(() => {
            router.push('/agents');
        }, 1200);
    }
    catch (err) {
        globalError.value = err?.detail ?? 'Failed to create agent. Please try again.';
    }
}
function handleCancel() {
    router.push('/agents');
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "max-w-6xl mx-auto space-y-8" },
});
/** @type {__VLS_StyleScopedClasses['max-w-6xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "text-3xl font-headline font-semibold text-primary" },
});
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-1 text-sm text-onSurface-variant font-body" },
});
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['font-body']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
transition;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    enterActiveClass: "transition-all duration-300",
    enterFromClass: "opacity-0 translate-y-[-8px]",
    enterToClass: "opacity-100 translate-y-0",
    leaveActiveClass: "transition-all duration-200",
    leaveFromClass: "opacity-100",
    leaveToClass: "opacity-0",
}));
const __VLS_2 = __VLS_1({
    enterActiveClass: "transition-all duration-300",
    enterFromClass: "opacity-0 translate-y-[-8px]",
    enterToClass: "opacity-100 translate-y-0",
    leaveActiveClass: "transition-all duration-200",
    leaveFromClass: "opacity-100",
    leaveToClass: "opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
if (__VLS_ctx.successMessage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed top-6 right-6 z-50 bg-surface-high text-onSurface rounded-lg px-5 py-3 shadow-lg flex items-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        ...{ class: "w-2 h-2 rounded-full bg-primary shrink-0" },
    });
    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-label text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.successMessage);
}
// @ts-ignore
[successMessage, successMessage,];
var __VLS_3;
if (__VLS_ctx.globalError) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-surface-high rounded-lg px-5 py-3 text-error font-label text-sm flex items-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        ...{ class: "w-2 h-2 rounded-full bg-error shrink-0" },
    });
    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    (__VLS_ctx.globalError);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
    ...{ onSubmit: (__VLS_ctx.handleSubmit) },
    novalidate: true,
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-6" },
});
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "glass rounded-2xl p-6 bg-surface/60 backdrop-blur-glass" },
});
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface/60']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-glass']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-lg font-headline font-semibold text-onSurface mb-5" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
const __VLS_6 = IdentitySection;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    ...{ 'onUpdate:name': {} },
    ...{ 'onUpdate:description': {} },
    ...{ 'onUpdate:avatarUrl': {} },
    ...{ 'onValidationError': {} },
    ref: "identitySectionRef",
    name: (__VLS_ctx.form.name),
    description: (__VLS_ctx.form.description),
    avatarUrl: (__VLS_ctx.form.avatar_url),
}));
const __VLS_8 = __VLS_7({
    ...{ 'onUpdate:name': {} },
    ...{ 'onUpdate:description': {} },
    ...{ 'onUpdate:avatarUrl': {} },
    ...{ 'onValidationError': {} },
    ref: "identitySectionRef",
    name: (__VLS_ctx.form.name),
    description: (__VLS_ctx.form.description),
    avatarUrl: (__VLS_ctx.form.avatar_url),
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
let __VLS_11;
const __VLS_12 = ({ 'update:name': {} },
    { 'onUpdate:name': (...[$event]) => {
            __VLS_ctx.form.name = $event;
            // @ts-ignore
            [globalError, globalError, handleSubmit, form, form, form, form,];
        } });
const __VLS_13 = ({ 'update:description': {} },
    { 'onUpdate:description': (...[$event]) => {
            __VLS_ctx.form.description = $event;
            // @ts-ignore
            [form,];
        } });
const __VLS_14 = ({ 'update:avatarUrl': {} },
    { 'onUpdate:avatarUrl': (...[$event]) => {
            __VLS_ctx.form.avatar_url = $event;
            // @ts-ignore
            [form,];
        } });
const __VLS_15 = ({ validationError: {} },
    { onValidationError: (__VLS_ctx.handleValidationError) });
var __VLS_16 = {};
var __VLS_9;
var __VLS_10;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "glass rounded-2xl p-6 bg-surface/60 backdrop-blur-glass" },
});
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface/60']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-glass']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-lg font-headline font-semibold text-onSurface mb-5" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
const __VLS_18 = RoleDefinitionSection;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    ...{ 'onUpdate:systemPrompt': {} },
    systemPrompt: (__VLS_ctx.form.system_prompt),
}));
const __VLS_20 = __VLS_19({
    ...{ 'onUpdate:systemPrompt': {} },
    systemPrompt: (__VLS_ctx.form.system_prompt),
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
let __VLS_23;
const __VLS_24 = ({ 'update:systemPrompt': {} },
    { 'onUpdate:systemPrompt': (...[$event]) => {
            __VLS_ctx.form.system_prompt = $event;
            // @ts-ignore
            [form, form, handleValidationError,];
        } });
var __VLS_21;
var __VLS_22;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-6" },
});
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "glass rounded-2xl p-6 bg-surface/60 backdrop-blur-glass" },
});
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface/60']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-glass']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-lg font-headline font-semibold text-onSurface mb-5" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
const __VLS_25 = ModelConfigSection;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    ...{ 'onUpdate:provider': {} },
    ...{ 'onUpdate:model': {} },
    ...{ 'onUpdate:temperature': {} },
    provider: (__VLS_ctx.form.provider),
    model: (__VLS_ctx.form.model),
    temperature: (__VLS_ctx.form.temperature),
}));
const __VLS_27 = __VLS_26({
    ...{ 'onUpdate:provider': {} },
    ...{ 'onUpdate:model': {} },
    ...{ 'onUpdate:temperature': {} },
    provider: (__VLS_ctx.form.provider),
    model: (__VLS_ctx.form.model),
    temperature: (__VLS_ctx.form.temperature),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
let __VLS_30;
const __VLS_31 = ({ 'update:provider': {} },
    { 'onUpdate:provider': (...[$event]) => {
            __VLS_ctx.form.provider = $event;
            // @ts-ignore
            [form, form, form, form, form,];
        } });
const __VLS_32 = ({ 'update:model': {} },
    { 'onUpdate:model': (...[$event]) => {
            __VLS_ctx.form.model = $event;
            // @ts-ignore
            [form,];
        } });
const __VLS_33 = ({ 'update:temperature': {} },
    { 'onUpdate:temperature': (...[$event]) => {
            __VLS_ctx.form.temperature = $event;
            // @ts-ignore
            [form,];
        } });
var __VLS_28;
var __VLS_29;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "glass rounded-2xl p-6 bg-surface/60 backdrop-blur-glass" },
});
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface/60']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-glass']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-lg font-headline font-semibold text-onSurface mb-5" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
const __VLS_34 = CapabilitiesSection;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
    modelValue: (__VLS_ctx.form.capabilities),
}));
const __VLS_36 = __VLS_35({
    modelValue: (__VLS_ctx.form.capabilities),
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col-reverse']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleCancel) },
    type: "button",
    ...{ class: "w-full sm:w-auto px-6 py-3 rounded-xl font-label text-sm text-onSurface bg-surface-high hover:bg-surface-highest transition-colors" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:w-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-surface-highest']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    type: "submit",
    disabled: (__VLS_ctx.agentStore.loading),
    ...{ class: "w-full sm:w-auto px-8 py-3 rounded-xl font-label text-sm font-semibold bg-primary-gradient text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:w-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-primary-gradient']} */ ;
/** @type {__VLS_StyleScopedClasses['text-background']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:opacity-90']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
if (__VLS_ctx.agentStore.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "animate-spin w-4 h-4" },
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
    });
    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        ...{ class: "opacity-25" },
        cx: "12",
        cy: "12",
        r: "10",
        stroke: "currentColor",
        'stroke-width': "4",
    });
    /** @type {__VLS_StyleScopedClasses['opacity-25']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        ...{ class: "opacity-75" },
        fill: "currentColor",
        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z",
    });
    /** @type {__VLS_StyleScopedClasses['opacity-75']} */ ;
}
(__VLS_ctx.agentStore.loading ? 'Creating...' : 'Create Agent');
// @ts-ignore
var __VLS_17 = __VLS_16;
// @ts-ignore
[form, handleCancel, agentStore, agentStore, agentStore,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
