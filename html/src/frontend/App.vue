<script setup lang="ts">
import { useRouter } from 'vue-router';
import { authState, api } from './services/api.js';
import { i18nState, Locale, setLocale, t } from './services/i18n.js';
import { setTheme, themeState, Theme } from './composables/theme.js';
import AlertStack from './components/AlertStack.vue';

const router = useRouter();

const changeTheme = (event: Event) => {
  setTheme((event.target as HTMLSelectElement).value as Theme);
};

const changeLocale = (event: Event) => {
  setLocale((event.target as HTMLSelectElement).value as Locale);
};

const logout = () => {
  api.logout();
  router.push('/login');
};
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <RouterLink class="brand" to="/">{{ t('appName') }}</RouterLink>

      <nav v-if="authState.user" class="nav">
        <RouterLink v-if="authState.user.role === 'admin'" to="/users">{{ t('users') }}</RouterLink>
      </nav>

      <div class="toolbar">
        <label>
          <span>{{ t('theme') }}</span>
          <select :value="themeState.value" @change="changeTheme">
            <option value="light">{{ t('light') }}</option>
            <option value="dark">{{ t('dark') }}</option>
          </select>
        </label>
        <label>
          <span>{{ t('locale') }}</span>
          <select :value="i18nState.locale" @change="changeLocale">
            <option value="en-US">en-US</option>
            <option value="pt-PT">pt-PT</option>
          </select>
        </label>
        <button v-if="authState.user" class="ghost" type="button" @click="logout">
          {{ t('logout') }}
        </button>
      </div>
    </header>

    <main>
      <RouterView />
    </main>

    <AlertStack />
  </div>
</template>
