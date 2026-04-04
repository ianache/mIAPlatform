import { createRouter, createWebHistory } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import AgentCreationPage from '../pages/AgentCreationPage.vue';
import AgentEditPage from '../pages/AgentEditPage.vue';
import AgentManagementPage from '../pages/AgentManagementPage.vue';
import ModelRegistryPage from '../pages/ModelRegistryPage.vue';
import ModelRegistryEditPage from '../pages/ModelRegistryEditPage.vue';
import SettingsPage from '../pages/SettingsPage.vue';
import WorkspacePage from '../pages/WorkspacePage.vue';
import ProjectsPage from '../pages/ProjectsPage.vue';
import ProjectEditPage from '../pages/ProjectEditPage.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    children: [
      { path: '', name: 'Workspace', component: WorkspacePage },
      { path: 'workspace/:subprojectId', name: 'WorkspaceSubproject', component: WorkspacePage },
      { path: 'projects', name: 'Projects', component: ProjectsPage },
      { path: 'projects/:id/edit', name: 'ProjectEdit', component: ProjectEditPage },
      { path: 'agents', name: 'Agents', component: AgentManagementPage },
      { path: 'agents/new', name: 'AgentCreate', component: AgentCreationPage },
      { path: 'agents/:id/edit', name: 'AgentEdit', component: AgentEditPage },
      { path: 'library', name: 'Library', component: { template: '<div class="text-onSurface">Library</div>' } },
      { path: 'model-registry', name: 'ModelRegistry', component: ModelRegistryPage },
      { path: 'model-registry/new', name: 'ModelRegistryCreate', component: ModelRegistryEditPage },
      { path: 'model-registry/:id/edit', name: 'ModelRegistryEdit', component: ModelRegistryEditPage },
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
router.beforeEach(async (to) => {
  const auth = useAuthStore();
  const publicRoutes = ['/'];
  if (!auth.isAuthenticated && !publicRoutes.includes(to.path)) {
    await auth.login();
    return false;
  }
});
