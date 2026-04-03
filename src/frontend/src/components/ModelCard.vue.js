/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
const props = defineProps();
const providerConfig = {
    openai: { initial: 'O', color: '#10a37f', label: 'OpenAI' },
    anthropic: { initial: 'A', color: '#d97706', label: 'Anthropic' },
    google: { initial: 'G', color: '#4285F4', label: 'Google' },
};
const providerInitial = computed(() => providerConfig[props.model.provider]?.initial ?? '?');
const providerColor = computed(() => providerConfig[props.model.provider]?.color ?? '#8C909F');
const providerLabel = computed(() => providerConfig[props.model.provider]?.label ?? props.model.provider);
const statusClass = computed(() => {
    switch (props.model.status) {
        case 'Active':
            return 'bg-green-900/40 text-green-400';
        case 'Deprecated':
            return 'bg-amber-900/40 text-amber-400';
        case 'Beta':
            return 'bg-primary/10 text-primary';
        default:
            return 'bg-surface-highest text-onSurface-variant';
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "glass rounded-2xl p-5 flex flex-col gap-3 cursor-default transition-colors duration-200 hover:bg-surface-high" },
});
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-default']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-surface-high']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-10 h-10 rounded-full flex items-center justify-center text-background font-headline font-bold text-sm flex-shrink-0" },
    ...{ style: ({ backgroundColor: __VLS_ctx.providerColor }) },
});
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-background']} */ ;
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
(__VLS_ctx.providerInitial);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-w-0" },
});
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "font-headline font-semibold text-onSurface truncate" },
});
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
(__VLS_ctx.model.name);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-onSurface-variant font-label text-xs mt-0.5" },
});
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
(__VLS_ctx.providerLabel);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "ml-auto flex-shrink-0 text-xs font-label px-2 py-0.5 rounded-full" },
    ...{ class: (__VLS_ctx.statusClass) },
});
/** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
(__VLS_ctx.model.status);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-wrap gap-1.5" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
for (const [tag] of __VLS_vFor((__VLS_ctx.model.tags))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        key: (tag),
        ...{ class: "bg-surface-highest text-onSurface-variant font-label text-xs px-2 py-0.5 rounded-full" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-surface-highest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    (tag);
    // @ts-ignore
    [providerColor, providerInitial, model, model, model, providerLabel, statusClass,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
