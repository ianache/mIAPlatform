/// <reference types="C:/Users/ianache/Desktop/DATA/01-DOCUMENTOS/02-PROYECTOS/104-mIAPlatform/mIAPlatform/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/ianache/Desktop/DATA/01-DOCUMENTOS/02-PROYECTOS/104-mIAPlatform/mIAPlatform/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
const props = defineProps();
const router = useRouter();
const avatarError = ref(false);
const hasAvatar = computed(() => {
    return !!props.agent.avatar_url && !avatarError.value;
});
const initials = computed(() => {
    return props.agent.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
});
// Simple deterministic color from name
const avatarColor = computed(() => {
    const colors = [
        'linear-gradient(135deg, #ADC6FF 0%, #4D8EFF 100%)',
        'linear-gradient(135deg, #FFB786 0%, #DF7412 100%)',
        'linear-gradient(135deg, #B1C6F9 0%, #749CFF 100%)',
        'linear-gradient(135deg, #4D8EFF 0%, #ADC6FF 100%)',
    ];
    let hash = 0;
    for (const c of props.agent.name)
        hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
    return colors[Math.abs(hash) % colors.length];
});
const avatarStyle = computed(() => {
    if (hasAvatar.value) {
        return { background: 'transparent' };
    }
    return { background: avatarColor.value };
});
const statusLabel = computed(() => {
    switch (props.agent.status) {
        case 'active': return 'Active';
        case 'inactive': return 'Inactive';
        case 'archived': return 'Archived';
        default: return props.agent.status;
    }
});
const dotClass = computed(() => {
    switch (props.agent.status) {
        case 'active': return 'bg-green-400';
        case 'inactive': return 'bg-amber-400';
        case 'archived': return 'bg-outline';
        default: return 'bg-outline';
    }
});
const statusClass = computed(() => {
    switch (props.agent.status) {
        case 'active': return 'text-green-400';
        case 'inactive': return 'text-amber-400';
        case 'archived': return 'text-outline';
        default: return 'text-outline';
    }
});
const providerLabel = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
    other: 'Other',
};
const modelLabel = computed(() => {
    const provider = providerLabel[props.agent.provider] ?? props.agent.provider;
    return `${props.agent.model} · ${provider}`;
});
const capabilityLabel = computed(() => {
    const count = props.agent.capabilities.length;
    return count === 1 ? '1 capability' : `${count} capabilities`;
});
function handleAvatarError() {
    avatarError.value = true;
}
function handleEdit() {
    router.push(`/agents/${props.agent.id}/edit`);
}
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
    ...{ class: "glass rounded-xl p-6 flex flex-col gap-4 cursor-default transition-colors duration-200 hover:bg-surface-high" },
});
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
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
    ...{ class: "w-10 h-10 rounded-full flex items-center justify-center text-sm font-headline font-semibold text-background shrink-0 overflow-hidden" },
    ...{ style: (__VLS_ctx.avatarStyle) },
});
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-background']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
if (__VLS_ctx.hasAvatar) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        ...{ onError: (__VLS_ctx.handleAvatarError) },
        src: (__VLS_ctx.agent.avatar_url),
        alt: "Agent avatar",
        ...{ class: "w-full h-full object-cover" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
}
else {
    (__VLS_ctx.initials);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1 min-w-0" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "font-headline font-semibold text-onSurface truncate" },
});
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
(__VLS_ctx.agent.name);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "flex items-center gap-1.5 text-xs font-label shrink-0" },
    ...{ class: (__VLS_ctx.statusClass) },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "w-2 h-2 rounded-full" },
    ...{ class: (__VLS_ctx.dotClass) },
});
/** @type {__VLS_StyleScopedClasses['w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
(__VLS_ctx.statusLabel);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-sm font-label text-onSurface-variant" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
(__VLS_ctx.modelLabel);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-xs font-label text-onSurface-variant" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
(__VLS_ctx.capabilityLabel);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleEdit) },
    ...{ class: "text-sm font-label font-medium text-primary transition-opacity duration-200 hover:opacity-70" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:opacity-70']} */ ;
// @ts-ignore
[avatarStyle, hasAvatar, handleAvatarError, agent, agent, initials, statusClass, dotClass, statusLabel, modelLabel, capabilityLabel, handleEdit,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
