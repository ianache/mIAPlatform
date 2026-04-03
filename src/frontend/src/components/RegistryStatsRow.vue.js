/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/props-fallback.d.ts" />
const stats = [
    {
        label: 'Avg Latency',
        value: '245ms',
        indicator: null,
        indicatorClass: '',
        dotClass: '',
    },
    {
        label: 'Cost / 1k Tokens',
        value: '$0.003',
        indicator: null,
        indicatorClass: '',
        dotClass: '',
    },
    {
        label: 'Active Models',
        value: '12',
        indicator: null,
        indicatorClass: '',
        dotClass: '',
    },
    {
        label: 'Registry Health',
        value: '98%',
        indicator: 'Healthy',
        indicatorClass: 'text-green-400',
        dotClass: 'bg-green-400',
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
    ...{ class: "glass rounded-2xl p-6 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:divide-x sm:divide-surface-highest" },
});
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:gap-0']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:divide-x']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:divide-surface-highest']} */ ;
for (const [stat] of __VLS_vFor((__VLS_ctx.stats))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (stat.label),
        ...{ class: "flex-1 flex flex-col items-center justify-center px-4 py-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-onSurface-variant font-label text-xs uppercase tracking-widest mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    (stat.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-primary font-headline text-2xl font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (stat.value);
    if (stat.indicator) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "mt-1 flex items-center gap-1 text-xs" },
            ...{ class: (stat.indicatorClass) },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "inline-block w-2 h-2 rounded-full" },
            ...{ class: (stat.dotClass) },
        });
        /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        (stat.indicator);
    }
    // @ts-ignore
    [stats,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
