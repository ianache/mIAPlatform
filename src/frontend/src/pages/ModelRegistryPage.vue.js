/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import RegistryStatsRow from '../components/RegistryStatsRow.vue';
import ModelCard from '../components/ModelCard.vue';
import FeatureModelMapping from '../components/FeatureModelMapping.vue';
import RegistryActivityTable from '../components/RegistryActivityTable.vue';
const models = [
    // OpenAI
    {
        name: 'gpt-4o',
        provider: 'openai',
        status: 'Active',
        tags: ['vision', 'function-calling', '128k context'],
    },
    {
        name: 'gpt-4o-mini',
        provider: 'openai',
        status: 'Active',
        tags: ['fast', '128k context'],
    },
    {
        name: 'gpt-3.5-turbo',
        provider: 'openai',
        status: 'Deprecated',
        tags: ['fast', '16k context'],
    },
    // Anthropic
    {
        name: 'claude-3-5-sonnet',
        provider: 'anthropic',
        status: 'Active',
        tags: ['reasoning', '200k context'],
    },
    {
        name: 'claude-3-opus',
        provider: 'anthropic',
        status: 'Active',
        tags: ['reasoning', '200k context'],
    },
    {
        name: 'claude-3-haiku',
        provider: 'anthropic',
        status: 'Active',
        tags: ['fast', '200k context'],
    },
    // Google
    {
        name: 'gemini-1.5-pro',
        provider: 'google',
        status: 'Active',
        tags: ['multimodal', '1M context'],
    },
    {
        name: 'gemini-1.5-flash',
        provider: 'google',
        status: 'Active',
        tags: ['fast', '1M context'],
    },
];
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col gap-8" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "font-headline text-3xl font-bold text-primary" },
});
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-onSurface-variant font-body text-sm mt-1" },
});
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['font-body']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
const __VLS_0 = RegistryStatsRow;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col lg:flex-row gap-6" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1 lg:flex-[2] flex flex-col gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex-[2]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "font-headline font-semibold text-onSurface text-xl" },
});
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
for (const [model] of __VLS_vFor((__VLS_ctx.models))) {
    const __VLS_5 = ModelCard;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        key: (model.name),
        model: (model),
    }));
    const __VLS_7 = __VLS_6({
        key: (model.name),
        model: (model),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    // @ts-ignore
    [models,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "lg:flex-1 w-full" },
});
/** @type {__VLS_StyleScopedClasses['lg:flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
const __VLS_10 = FeatureModelMapping;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({}));
const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
const __VLS_15 = RegistryActivityTable;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({}));
const __VLS_17 = __VLS_16({}, ...__VLS_functionalComponentArgsRest(__VLS_16));
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
