<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api.js';
import { messageFromError, showError, showSuccess } from '../services/alerts.js';
import { t } from '../services/i18n.js';

const router = useRouter();
const name = ref('admin');
const password = ref('admin123');
const loading = ref(false);

const submit = async () => {
  loading.value = true;

  try {
    await api.login(name.value, password.value);
    showSuccess(t('loginSuccess'));
    router.push('/');
  } catch (err) {
    showError(messageFromError(err, t('error')));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <section class="auth-panel">
    <form class="form compact" @submit.prevent="submit">
      <h1>{{ t('login') }}</h1>
      <label>
        <span>{{ t('username') }}</span>
        <input v-model="name" autocomplete="username" required />
      </label>
      <label>
        <span>{{ t('password') }}</span>
        <input v-model="password" autocomplete="current-password" required type="password" />
      </label>
      <button type="submit" :disabled="loading">{{ loading ? t('loading') : t('login') }}</button>
    </form>
  </section>
</template>
