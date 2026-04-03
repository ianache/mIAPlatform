import { createRouter, createWebHistory } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import AgentCreationPage from '../pages/AgentCreationPage.vue';
import AgentManagementPage from '../pages/AgentManagementPage.vue';
import ModelRegistryPage from '../pages/ModelRegistryPage.vue';
import SettingsPage from '../pages/SettingsPage.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    children: [
      { path: '', name: 'Workspace', component: { template: '<div class="text-onSurface">Workspace</div>' } },
      { path: 'agents', name: 'Agents', component: AgentManagementPage },
      { path: 'agents/new', name: 'AgentCreate', component: AgentCreationPage },
      { path: 'agents/:id/edit', name: 'AgentEdit', component: { template: '<div class="text-onSurface">Agent Edit</div>' } },
      { path: 'library', name: 'Library', component: { template: '<div class="text-onSurface">Library</div>' } },
      { path: 'model-registry', name: 'ModelRegistry', component: ModelRegistryPage },
      { path: 'analytics', name: 'Analytics', component: { template: '<div class="text-onSurface">Analytics</div>' } },
      { path: 'settings', name: 'Settings', component: SettingsPage },
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
