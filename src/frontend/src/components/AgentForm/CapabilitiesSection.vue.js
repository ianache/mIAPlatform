/// <reference types="C:/Users/ianache/Desktop/DATA/01-DOCUMENTOS/02-PROYECTOS/104-mIAPlatform/mIAPlatform/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/ianache/Desktop/DATA/01-DOCUMENTOS/02-PROYECTOS/104-mIAPlatform/mIAPlatform/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, watch, onMounted } from 'vue';
import { useSkillsStore } from '../../stores/skills';
const props = defineProps();
const emit = defineEmits();
const skillsStore = useSkillsStore();
const localCapabilities = ref([...props.modelValue]);
// Watch for prop changes
watch(() => props.modelValue, (val) => {
    localCapabilities.value = [...val];
});
// Fetch skills on mount
onMounted(() => {
    skillsStore.fetchSkills();
});
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
if (__VLS_ctx.skillsStore.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    for (const [n] of __VLS_vFor((3))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (n),
            ...{ class: "flex items-center justify-between rounded-lg px-4 py-3 bg-surface-low animate-pulse" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-low']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col gap-1 mr-4 flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-4 bg-surface-high rounded w-1/3" },
        });
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-1/3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-3 bg-surface-high rounded w-2/3" },
        });
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-2/3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-11 h-6 bg-surface-high rounded-full" },
        });
        /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        // @ts-ignore
        [skillsStore,];
    }
}
else if (__VLS_ctx.skillsStore.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rounded-lg px-4 py-3 bg-surface-high text-error text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.skillsStore.error);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.skillsStore.loading))
                    return;
                if (!(__VLS_ctx.skillsStore.error))
                    return;
                __VLS_ctx.skillsStore.fetchSkills();
                // @ts-ignore
                [skillsStore, skillsStore, skillsStore,];
            } },
        ...{ class: "ml-2 text-primary hover:opacity-70 transition-opacity" },
    });
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:opacity-70']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
}
else if (__VLS_ctx.skillsStore.skills.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rounded-lg px-4 py-3 bg-surface-high text-onSurface-variant text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: (__VLS_ctx.skillsStore.skills[0]?.github_url || 'https://github.com/ianache/skills-catalog'),
        target: "_blank",
        ...{ class: "text-primary hover:opacity-70 transition-opacity" },
    });
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:opacity-70']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    for (const [skill] of __VLS_vFor((__VLS_ctx.skillsStore.skills))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.skillsStore.loading))
                        return;
                    if (!!(__VLS_ctx.skillsStore.error))
                        return;
                    if (!!(__VLS_ctx.skillsStore.skills.length === 0))
                        return;
                    __VLS_ctx.toggleCapability(skill.id);
                    // @ts-ignore
                    [skillsStore, skillsStore, skillsStore, toggleCapability,];
                } },
            key: (skill.id),
            ...{ class: "flex items-center justify-between rounded-lg px-4 py-3 transition-all cursor-pointer" },
            ...{ class: (__VLS_ctx.isEnabled(skill.id) ? 'bg-surface-highest' : 'bg-surface-low') },
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
            ...{ class: "flex flex-col gap-0.5 mr-4 flex-1 min-w-0" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-sm font-label text-onSurface font-medium truncate" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        (skill.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs font-label text-onSurface-variant bg-surface-high px-1.5 py-0.5 rounded" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        (skill.version);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs font-label text-onSurface-variant line-clamp-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
        /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
        (skill.description);
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            ...{ onClick: () => { } },
            href: (skill.github_url),
            target: "_blank",
            ...{ class: "text-xs font-label text-primary hover:opacity-70 transition-opacity mt-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:opacity-70']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.skillsStore.loading))
                        return;
                    if (!!(__VLS_ctx.skillsStore.error))
                        return;
                    if (!!(__VLS_ctx.skillsStore.skills.length === 0))
                        return;
                    __VLS_ctx.toggleCapability(skill.id);
                    // @ts-ignore
                    [toggleCapability, isEnabled,];
                } },
            type: "button",
            role: "switch",
            'aria-checked': (__VLS_ctx.isEnabled(skill.id)),
            'aria-label': (`Toggle ${skill.name}`),
            ...{ class: "relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary" },
            ...{ class: (__VLS_ctx.isEnabled(skill.id) ? 'bg-primary-container' : 'bg-surface-high') },
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
            ...{ class: (__VLS_ctx.isEnabled(skill.id) ? 'translate-x-5 !bg-primary' : 'translate-x-0') },
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
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between text-xs text-onSurface-variant font-label pt-2 border-t border-surface-high" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-surface-high']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.skillsStore.skills.length);
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://github.com/ianache/skills-catalog/blob/main/catalog.yaml",
    target: "_blank",
    ...{ class: "text-primary hover:opacity-70 transition-opacity" },
});
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:opacity-70']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
// @ts-ignore
[skillsStore,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
