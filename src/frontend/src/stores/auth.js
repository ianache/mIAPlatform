import { defineStore } from 'pinia';
export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('orchestra_token'),
        user: null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        setToken(token) {
            this.token = token;
            localStorage.setItem('orchestra_token', token);
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('orchestra_token');
        },
    },
});
