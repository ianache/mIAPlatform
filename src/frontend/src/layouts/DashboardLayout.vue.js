/// <reference types="C:/Users/ianache/Desktop/DATA/01-DOCUMENTOS/02-PROYECTOS/104-mIAPlatform/mIAPlatform/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/ianache/Desktop/DATA/01-DOCUMENTOS/02-PROYECTOS/104-mIAPlatform/mIAPlatform/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import TopBar from '../components/TopBar.vue';
const sidebarOpen = ref(true);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen bg-[#091421] flex text-[#D9E3F6]" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#091421]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#D9E3F6]']} */ ;
const __VLS_0 = Sidebar;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    open: (__VLS_ctx.sidebarOpen),
}));
const __VLS_2 = __VLS_1({
    open: (__VLS_ctx.sidebarOpen),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
/** @ts-ignore @type {typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
transition;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    enterActiveClass: "transition-opacity duration-300",
    enterFromClass: "opacity-0",
    enterToClass: "opacity-100",
    leaveActiveClass: "transition-opacity duration-300",
    leaveFromClass: "opacity-100",
    leaveToClass: "opacity-0",
}));
const __VLS_7 = __VLS_6({
    enterActiveClass: "transition-opacity duration-300",
    enterFromClass: "opacity-0",
    enterToClass: "opacity-100",
    leaveActiveClass: "transition-opacity duration-300",
    leaveFromClass: "opacity-100",
    leaveToClass: "opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const { default: __VLS_10 } = __VLS_8.slots;
if (__VLS_ctx.sidebarOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.sidebarOpen))
                    return;
                __VLS_ctx.sidebarOpen = false;
                // @ts-ignore
                [sidebarOpen, sidebarOpen, sidebarOpen,];
            } },
        ...{ class: "fixed inset-0 z-30 bg-black/40 lg:hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-30']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:hidden']} */ ;
}
// @ts-ignore
[];
var __VLS_8;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1 min-w-0 transition-all duration-300" },
    ...{ class: (__VLS_ctx.sidebarOpen ? 'lg:ml-[240px]' : 'ml-0') },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
const __VLS_11 = TopBar;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    ...{ 'onToggleSidebar': {} },
}));
const __VLS_13 = __VLS_12({
    ...{ 'onToggleSidebar': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
let __VLS_16;
const __VLS_17 = ({ toggleSidebar: {} },
    { onToggleSidebar: (...[$event]) => {
            __VLS_ctx.sidebarOpen = !__VLS_ctx.sidebarOpen;
            // @ts-ignore
            [sidebarOpen, sidebarOpen, sidebarOpen,];
        } });
var __VLS_14;
var __VLS_15;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "p-8" },
});
/** @type {__VLS_StyleScopedClasses['p-8']} */ ;
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.routerView | typeof __VLS_components.RouterView} */
routerView;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({}));
const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
