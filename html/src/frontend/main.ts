import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import ContactDetails from './components/ContactDetails.vue';
import ContactFormPage from './components/ContactFormPage.vue';
import ContactsList from './components/ContactsList.vue';
import LoginPage from './components/LoginPage.vue';
import UsersPage from './components/UsersPage.vue';
import { authState } from './services/api.js';
import './styles/app.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginPage },
    { path: '/', component: ContactsList },
    { path: '/contacts/new', component: ContactFormPage },
    { path: '/contacts/:id', component: ContactDetails },
    { path: '/contacts/:id/edit', component: ContactFormPage },
    { path: '/users', component: UsersPage }
  ]
});

router.beforeEach((to) => {
  const isPublicRoute = to.path === '/' || to.path === '/login';

  if (!isPublicRoute && !authState.accessToken) {
    return '/login';
  }

  if (to.path === '/login' && authState.accessToken) {
    return '/';
  }

  return true;
});

createApp(App).use(router).mount('#app');
