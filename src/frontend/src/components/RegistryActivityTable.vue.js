/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/props-fallback.d.ts" />
const activityRows = [
    {
        id: 1,
        event: 'Model Added',
        model: 'gpt-4o',
        timestamp: '2026-04-02 22:14',
        status: 'Success',
        statusClass: 'text-green-400',
        dotClass: 'bg-green-400',
    },
    {
        id: 2,
        event: 'Temperature Updated',
        model: 'claude-3-5-sonnet',
        timestamp: '2026-04-02 21:50',
        status: 'Success',
        statusClass: 'text-green-400',
        dotClass: 'bg-green-400',
    },
    {
        id: 3,
        event: 'Model Deprecated',
        model: 'gpt-3.5-turbo',
        timestamp: '2026-04-02 20:33',
        status: 'Warning',
        statusClass: 'text-amber-400',
        dotClass: 'bg-amber-400',
    },
    {
        id: 4,
        event: 'Feature Mapping Updated',
        model: 'gemini-1.5-pro',
        timestamp: '2026-04-02 19:08',
        status: 'Success',
        statusClass: 'text-green-400',
        dotClass: 'bg-green-400',
    },
    {
        id: 5,
        event: 'API Key Validated',
        model: 'claude-3-opus',
        timestamp: '2026-04-02 18:42',
        status: 'Success',
        statusClass: 'text-green-400',
        dotClass: 'bg-green-400',
    },
    {
        id: 6,
        event: 'Model Added',
        model: 'gemini-1.5-flash',
        timestamp: '2026-04-02 17:20',
        status: 'Success',
        statusClass: 'text-green-400',
        dotClass: 'bg-green-400',
    },
    {
        id: 7,
        event: 'Health Check',
        model: 'gpt-4o-mini',
        timestamp: '2026-04-02 16:55',
        status: 'Success',
        statusClass: 'text-green-400',
        dotClass: 'bg-green-400',
    },
    {
        id: 8,
        event: 'Rate Limit Warning',
        model: 'gpt-4o',
        timestamp: '2026-04-02 15:30',
        status: 'Warning',
        statusClass: 'text-amber-400',
        dotClass: 'bg-amber-400',
    },
    {
        id: 9,
        event: 'Context Window Updated',
        model: 'claude-3-haiku',
        timestamp: '2026-04-02 14:12',
        status: 'Success',
        statusClass: 'text-green-400',
        dotClass: 'bg-green-400',
    },
    {
        id: 10,
        event: 'Model Added',
        model: 'claude-3-haiku',
        timestamp: '2026-04-02 13:45',
        status: 'Success',
        statusClass: 'text-green-400',
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
    ...{ class: "overflow-auto max-h-[360px]" },
});
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-[360px]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
    ...{ class: "w-full text-sm" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({
    ...{ class: "sticky top-0 bg-surface" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
    ...{ class: "text-onSurface-variant font-label text-xs uppercase tracking-widest" },
});
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
    ...{ class: "text-left py-2 px-3 w-2/5" },
});
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2/5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
    ...{ class: "text-left py-2 px-3 w-1/4" },
});
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1/4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
    ...{ class: "text-left py-2 px-3 w-1/4" },
});
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1/4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
    ...{ class: "text-left py-2 px-3 w-1/8" },
});
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1/8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
for (const [row, index] of __VLS_vFor((__VLS_ctx.activityRows))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
        key: (row.id),
        ...{ class: "transition-colors duration-100" },
        ...{ class: (index % 2 === 0 ? 'bg-surface-low' : 'bg-surface') },
    });
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-100']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
        ...{ class: "py-2.5 px-3 text-onSurface font-body" },
    });
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-body']} */ ;
    (row.event);
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
        ...{ class: "py-2.5 px-3 text-onSurface-variant font-label text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (row.model);
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
        ...{ class: "py-2.5 px-3 text-onSurface-variant font-label text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (row.timestamp);
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
        ...{ class: "py-2.5 px-3" },
    });
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex items-center gap-1.5 font-label text-xs" },
        ...{ class: (row.statusClass) },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" },
        ...{ class: (row.dotClass) },
    });
    /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    (row.status);
    // @ts-ignore
    [activityRows,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
