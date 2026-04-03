/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="D:/02-PERSONAL/01-PROJECTS/22-mIAPlatform/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { reactive } from 'vue';
const providers = [
    { id: 'openai', name: 'OpenAI', abbr: 'OA', color: 'linear-gradient(135deg, #ADC6FF 0%, #4D8EFF 100%)' },
    { id: 'anthropic', name: 'Anthropic', abbr: 'AN', color: 'linear-gradient(135deg, #FFB786 0%, #DF7412 100%)' },
    { id: 'google', name: 'Google Gemini', abbr: 'GG', color: 'linear-gradient(135deg, #B1C6F9 0%, #749CFF 100%)' },
];
// Client-side key storage (Phase 5 will add Vault integration for secure storage)
const keys = reactive({
    openai: '',
    anthropic: '',
    google: '',
});
const savedKeys = reactive({
    openai: '',
    anthropic: '',
    google: '',
});
const validationStatus = reactive({
    openai: 'untested',
    anthropic: 'untested',
    google: 'untested',
});
const lastValidated = reactive({
    openai: '',
    anthropic: '',
    google: '',
});
const revealed = reactive({
    openai: false,
    anthropic: false,
    google: false,
});
function handleInput(id, value) {
    keys[id] = value;
}
function toggleReveal(id) {
    revealed[id] = !revealed[id];
}
function saveKey(id) {
    savedKeys[id] = keys[id];
    // Reset reveal after save (key now masked)
    revealed[id] = false;
    validationStatus[id] = 'untested';
}
function validateKey(id) {
    // Placeholder — will connect to backend validation endpoint in Phase 1 Vault integration
    const hasKey = (savedKeys[id] || keys[id]).length > 0;
    validationStatus[id] = hasKey ? 'valid' : 'invalid';
    lastValidated[id] = new Date().toLocaleString();
}
function statusLabel(id) {
    switch (validationStatus[id]) {
        case 'valid': return 'Valid';
        case 'invalid': return 'Invalid';
        default: return 'Not tested';
    }
}
function dotClass(id) {
    switch (validationStatus[id]) {
        case 'valid': return 'bg-green-400';
        case 'invalid': return 'bg-error';
        default: return 'bg-outline';
    }
}
function statusClass(id) {
    switch (validationStatus[id]) {
        case 'valid': return 'text-green-400';
        case 'invalid': return 'text-error';
        default: return 'text-outline';
    }
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col gap-6" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
for (const [provider] of __VLS_vFor((__VLS_ctx.providers))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (provider.id),
        ...{ class: "glass rounded-xl p-6 flex flex-col gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['glass']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-headline font-bold text-background" },
        ...{ style: ({ background: provider.color }) },
    });
    /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-background']} */ ;
    (provider.abbr);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-headline font-semibold text-onSurface" },
    });
    /** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
    (provider.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ml-auto flex items-center gap-1.5 text-xs font-label" },
        ...{ class: (__VLS_ctx.statusClass(provider.id)) },
    });
    /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "w-2 h-2 rounded-full" },
        ...{ class: (__VLS_ctx.dotClass(provider.id)) },
    });
    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    (__VLS_ctx.statusLabel(provider.id));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex gap-3 items-center" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onInput: (...[$event]) => {
                __VLS_ctx.handleInput(provider.id, $event.target.value);
                // @ts-ignore
                [providers, statusClass, dotClass, statusLabel, handleInput,];
            } },
        type: (__VLS_ctx.revealed[provider.id] ? 'text' : 'password'),
        placeholder: (`sk-... (${provider.name} API Key)`),
        value: (__VLS_ctx.keys[provider.id]),
        ...{ class: "flex-1 bg-surface-low rounded-lg px-4 py-2.5 text-sm font-label text-onSurface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary" },
        autocomplete: "off",
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-low']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
    /** @type {__VLS_StyleScopedClasses['placeholder-outline']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-primary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleReveal(provider.id);
                // @ts-ignore
                [revealed, keys, toggleReveal,];
            } },
        ...{ class: "text-xs font-label text-onSurface-variant hover:text-onSurface transition-colors px-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-onSurface']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    (__VLS_ctx.revealed[provider.id] ? 'Hide' : 'Show');
    if (__VLS_ctx.lastValidated[provider.id]) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs font-label text-onSurface-variant" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
        (__VLS_ctx.lastValidated[provider.id]);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.saveKey(provider.id);
                // @ts-ignore
                [revealed, lastValidated, lastValidated, saveKey,];
            } },
        ...{ class: "text-sm font-label font-medium text-primary transition-opacity hover:opacity-70" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:opacity-70']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.validateKey(provider.id);
                // @ts-ignore
                [validateKey,];
            } },
        ...{ class: "text-sm font-label font-medium text-onSurface-variant transition-opacity hover:opacity-70" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:opacity-70']} */ ;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
