<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import ConfirmModal from './ConfirmModal.vue';
import { api, authState, Contact } from '../services/api.js';
import { messageFromError, showError, showSuccess } from '../services/alerts.js';
import { t } from '../services/i18n.js';

const contacts = ref<Contact[]>([]);
const loading = ref(true);
const deleting = ref<Contact | null>(null);

const loadContacts = async () => {
  loading.value = true;

  try {
    contacts.value = await api.contacts();
  } catch (err) {
    showError(messageFromError(err, t('error')));
  } finally {
    loading.value = false;
  }
};

const confirmDelete = async () => {
  if (!deleting.value) {
    return;
  }

  try {
    await api.deleteContact(deleting.value.id);
    deleting.value = null;
    showSuccess(t('contactDeleted'));
    await loadContacts();
  } catch (err) {
    showError(messageFromError(err, t('error')));
  }
};

onMounted(loadContacts);
</script>

<template>
  <section class="page-head">
    <div>
      <h1>{{ t('contacts') }}</h1>
      <p>{{ contacts.length }} {{ t('contacts').toLowerCase() }}</p>
    </div>
    <RouterLink v-if="authState.user" class="button" to="/contacts/new">{{
      t('addContact')
    }}</RouterLink>
  </section>

  <p v-if="loading">{{ t('loading') }}</p>
  <p v-else-if="contacts.length === 0" class="empty">{{ t('noContacts') }}</p>

  <section v-else class="contact-grid">
    <article v-for="contact in contacts" :key="contact.id" class="contact-card">
      <img :src="contact.picture" :alt="contact.name" />
      <div>
        <h2>{{ contact.name }}</h2>
        <p class="identifier">{{ contact.id }}</p>
        <p>{{ contact.contact }}</p>
        <p>{{ contact.email_address }}</p>
      </div>
      <div v-if="authState.user" class="card-actions">
        <RouterLink :to="`/contacts/${contact.id}`">{{ t('details') }}</RouterLink>
        <RouterLink :to="`/contacts/${contact.id}/edit`">{{ t('editContact') }}</RouterLink>
        <button class="text-danger" type="button" @click="deleting = contact">
          {{ t('delete') }}
        </button>
      </div>
    </article>
  </section>

  <ConfirmModal
    v-if="deleting"
    :title="t('deleteTitle')"
    :body="t('deleteBody')"
    @cancel="deleting = null"
    @confirm="confirmDelete"
  />
</template>
