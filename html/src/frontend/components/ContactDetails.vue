<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { api, authState, Contact, User } from '../services/api.js';
import { messageFromError, showError } from '../services/alerts.js';
import { t } from '../services/i18n.js';

const route = useRoute();
const contact = ref<Contact | null>(null);
const users = ref<User[]>([]);

const ownerName = computed(() => {
  if (!contact.value) {
    return '';
  }

  if (contact.value.created_by === authState.user?.id) {
    return authState.user.name;
  }

  return (
    users.value.find((user) => user.id === contact.value?.created_by)?.name ??
    contact.value.created_by
  );
});

onMounted(async () => {
  try {
    if (authState.user?.role === 'admin') {
      users.value = await api.users();
    }

    contact.value = await api.contact(String(route.params.id));
  } catch (err) {
    showError(messageFromError(err, t('error')));
  }
});
</script>

<template>
  <p v-if="!contact">{{ t('loading') }}</p>
  <section v-else class="details">
    <img :src="contact.picture" :alt="contact.name" />
    <div>
      <h1>{{ contact.name }}</h1>
      <dl>
        <dt>ID</dt>
        <dd>{{ contact.id }}</dd>
        <dt>{{ t('phone') }}</dt>
        <dd>{{ contact.contact }}</dd>
        <dt>{{ t('email') }}</dt>
        <dd>{{ contact.email_address }}</dd>
        <dt>{{ t('owner') }}</dt>
        <dd>{{ ownerName }}</dd>
      </dl>
      <div class="actions">
        <RouterLink class="button" :to="`/contacts/${contact.id}/edit`">{{
          t('editContact')
        }}</RouterLink>
        <RouterLink class="ghost-link" to="/">{{ t('cancel') }}</RouterLink>
      </div>
    </div>
  </section>
</template>
