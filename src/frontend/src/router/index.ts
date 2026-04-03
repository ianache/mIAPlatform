import { createRouter, createWebHistory } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    children: [
      { path: '', name: 'Workspace', component: { template: '<div>Workspace</div>' } },
      { path: 'agents', name: 'Agents', component: { template: '<div>Agents</div>' } },
      { path: 'agents/new', name: 'AgentCreate', component: { template: '<div>Agent Create</div>' } },
      { path: 'agents/:id/edit', name: 'AgentEdit', component: { template: '<div>Agent Edit</div>' } },
      { path: 'library', name: 'Library', component: { template: '<div>Library</div>' } },
      { path: 'analytics', name: 'Analytics', component: { template: '<div>Analytics</div>' } },
      { path: 'settings', name: 'Settings', component: { template: '<div>Settings</div>' } },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard: redirect unauthenticated users to Keycloak login
// '/' is public so the PKCE callback can land and exchange the code
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  const publicRoutes = ['/'];
  if (!auth.isAuthenticated && !publicRoutes.includes(to.path)) {
    auth.login();
  } else {
    next();
  }
});
