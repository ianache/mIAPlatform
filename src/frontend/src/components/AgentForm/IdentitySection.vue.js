import { ref, watch, computed } from 'vue';
import { apiClient } from '../../api/client';
const props = defineProps();
const emit = defineEmits();
const fileInput = ref(null);
const localName = ref(props.name);
const localDescription = ref(props.description ?? '');
const localAvatarUrl = ref(props.avatarUrl ?? '');
const nameError = ref('');
const imageLoadError = ref(false);
const uploading = ref(false);
const uploadError = ref('');
// Watch for prop changes (for edit mode)
watch(() => props.name, (val) => { localName.value = val; });
watch(() => props.description, (val) => { localDescription.value = val ?? ''; });
watch(() => props.avatarUrl, (val) => {
    localAvatarUrl.value = val ?? '';
    imageLoadError.value = false;
});
// Emit changes
watch(localName, (val) => emit('update:name', val));
watch(localDescription, (val) => emit('update:description', val));
watch(localAvatarUrl, (val) => {
    emit('update:avatarUrl', val);
    imageLoadError.value = false;
});
// Computed property to determine what avatar to display
const displayAvatarUrl = computed(() => {
    if (imageLoadError.value)
        return null;
    return localAvatarUrl.value || null;
});
function triggerFilePicker() {
    if (uploading.value)
        return;
    fileInput.value?.click();
}
async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file)
        return;
    // Validate file type
    if (!file.type.startsWith('image/')) {
        uploadError.value = 'Please select an image file';
        return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        uploadError.value = 'Image size should be less than 5MB';
        return;
    }
    uploadError.value = '';
    uploading.value = true;
    try {
        // Upload file to backend
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post('/api/v1/upload/avatar', formData);
        // Update avatar URL with the permanent URL from server
        console.log('Upload response:', response);
        localAvatarUrl.value = response.url;
        imageLoadError.value = false;
        console.log('Avatar URL set to:', localAvatarUrl.value);
    }
    catch (err) {
        uploadError.value = err?.detail || 'Failed to upload avatar. Please try again.';
        console.error('Avatar upload error:', err);
    }
    finally {
        uploading.value = false;
        // Reset file input
        if (fileInput.value) {
            fileInput.value.value = '';
        }
    }
}
function handleImageError() {
    imageLoadError.value = true;
}
async function clearAvatar() {
    if (!localAvatarUrl.value || uploading.value)
        return;
    // Extract filename from URL
    const filename = localAvatarUrl.value.split('/').pop();
    if (filename) {
        try {
            // Delete the file from server
            await apiClient.delete(`/api/v1/upload/avatar/${filename}`);
        }
        catch (err) {
            console.error('Failed to delete avatar:', err);
            // Continue anyway to clear the reference
        }
    }
    localAvatarUrl.value = '';
    imageLoadError.value = false;
    if (fileInput.value) {
        fileInput.value.value = '';
    }
}
function validateName() {
    if (!localName.value || localName.value.trim().length === 0) {
        nameError.value = 'Name is required';
        emit('validation-error', 'name', true);
    }
    else if (localName.value.trim().length < 3) {
        nameError.value = 'Name must be at least 3 characters';
        emit('validation-error', 'name', true);
    }
    else {
        nameError.value = '';
        emit('validation-error', 'name', false);
    }
}
function clearNameError() {
    if (nameError.value && localName.value.trim().length >= 3) {
        nameError.value = '';
        emit('validation-error', 'name', false);
    }
}
const __VLS_exposed = { validateName };
defineExpose(__VLS_exposed);
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
    ...{ class: "flex flex-col items-center gap-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.triggerFilePicker) },
    type: "button",
    ...{ class: "w-20 h-20 rounded-full bg-surface-high flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all" },
    ...{ class: ({ 'opacity-50 cursor-not-allowed': __VLS_ctx.uploading }) },
    'aria-label': "Upload avatar",
});
/** @type {__VLS_StyleScopedClasses['w-20']} */ ;
/** @type {__VLS_StyleScopedClasses['h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:ring-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-not-allowed']} */ ;
if (__VLS_ctx.displayAvatarUrl) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        ...{ onError: (__VLS_ctx.handleImageError) },
        src: (__VLS_ctx.displayAvatarUrl),
        alt: "Agent avatar",
        ...{ class: "w-full h-full object-cover" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        ...{ class: "w-8 h-8 text-onSurface-variant" },
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
    });
    /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "1.5",
        d: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
    });
}
if (__VLS_ctx.uploading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 flex items-center justify-center bg-surface-high bg-opacity-80" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-opacity-80']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "animate-spin w-6 h-6 text-primary" },
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
    });
    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle, __VLS_intrinsics.circle)({
        ...{ class: "opacity-25" },
        cx: "12",
        cy: "12",
        r: "10",
        stroke: "currentColor",
        'stroke-width': "4",
    });
    /** @type {__VLS_StyleScopedClasses['opacity-25']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path, __VLS_intrinsics.path)({
        ...{ class: "opacity-75" },
        fill: "currentColor",
        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z",
    });
    /** @type {__VLS_StyleScopedClasses['opacity-75']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
if (!__VLS_ctx.uploading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs text-onSurface-variant font-label" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs text-primary font-label" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
}
if (__VLS_ctx.localAvatarUrl && !__VLS_ctx.uploading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.clearAvatar) },
        type: "button",
        ...{ class: "text-xs text-error font-label hover:opacity-70 transition-opacity" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:opacity-70']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onChange: (__VLS_ctx.handleFileChange) },
    ref: "fileInput",
    type: "file",
    accept: "image/*",
    ...{ class: "hidden" },
    disabled: (__VLS_ctx.uploading),
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
if (__VLS_ctx.uploadError) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-error font-label" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    (__VLS_ctx.uploadError);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-1.5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-sm font-label text-onSurface-variant" },
    for: "agent-name",
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-error" },
});
/** @type {__VLS_StyleScopedClasses['text-error']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onBlur: (__VLS_ctx.validateName) },
    ...{ onInput: (__VLS_ctx.clearNameError) },
    id: "agent-name",
    value: (__VLS_ctx.localName),
    type: "text",
    placeholder: "Give your agent a name",
    maxlength: "100",
    ...{ class: "w-full bg-surface-high text-onSurface font-headline placeholder-onSurface-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all" },
    ...{ class: ({ 'ring-2 ring-error': __VLS_ctx.nameError }) },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-high']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface']} */ ;
/** @type {__VLS_StyleScopedClasses['font-headline']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-error']} */ ;
if (__VLS_ctx.nameError) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-error font-label" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-label']} */ ;
    (__VLS_ctx.nameError);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-1.5" },
});
/** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-sm font-label text-onSurface-variant" },
    for: "agent-description",
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
    id: "agent-description",
    value: (__VLS_ctx.localDescription),
    placeholder: "What does this agent do?",
    maxlength: "500",
    rows: "3",
    ...{ class: "w-full bg-surface-high text-onSurface font-body placeholder-onSurface-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary resize-none transition-all" },
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
/** @type {__VLS_StyleScopedClasses['resize-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-xs text-onSurface-variant font-label text-right" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-onSurface-variant']} */ ;
/** @type {__VLS_StyleScopedClasses['font-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
(__VLS_ctx.localDescription?.length ?? 0);
// @ts-ignore
[triggerFilePicker, uploading, uploading, uploading, uploading, uploading, displayAvatarUrl, displayAvatarUrl, handleImageError, localAvatarUrl, clearAvatar, handleFileChange, uploadError, uploadError, validateName, clearNameError, localName, nameError, nameError, nameError, localDescription, localDescription,];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => (__VLS_exposed),
    __typeEmits: {},
    __typeProps: {},
});
export default {};
