import { createRouter, createWebHistory } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';

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
