<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ContactForm from './ContactForm.vue';
import { api, ApiError, authState, Contact, User } from '../services/api.js';
import { messageFromError, showError, showSuccess } from '../services/alerts.js';
import { t } from '../services/i18n.js';

const route = useRoute();
const router = useRouter();
const id = computed(() => (route.params.id ? String(route.params.id) : null));
const contact = ref<Contact | null>(null);
const users = ref<User[]>([]);
const loading = ref(false);
const serverErrors = ref<Partial<Record<keyof Omit<Contact, 'id'>, string>>>({});

const fieldNames = ['name', 'contact', 'email_address', 'picture', 'created_by'] as const;

const formErrorsFromApi = (err: unknown) => {
  if (!(err instanceof ApiError) || !err.details || typeof err.details !== 'object') {
    return null;
  }

  const details = err.details;
  const errors = fieldNames.reduce<Partial<Record<keyof Omit<Contact, 'id'>, string>>>(
    (accumulator, field) => {
      const message = details[field];

      if (message) {
        accumulator[field] = message;
      }

      return accumulator;
    },
    {}
  );

  return Object.keys(errors).length > 0 ? errors : null;
};

onMounted(async () => {
  try {
    if (authState.user?.role === 'admin') {
      users.value = await api.users();
    }

    if (id.value) {
      contact.value = await api.contact(id.value);
    }
  } catch (err) {
    showError(messageFromError(err, t('error')));
  }
});

const submit = async (payload: Omit<Contact, 'id'>) => {
  loading.value = true;
  serverErrors.value = {};

  try {
    const saved = id.value
      ? await api.updateContact(id.value, payload)
      : await api.createContact(payload);
    showSuccess(id.value ? t('contactUpdated') : t('contactCreated'));
    router.push(`/contacts/${saved.id}`);
  } catch (err) {
    const formErrors = formErrorsFromApi(err);

    if (formErrors) {
      serverErrors.value = formErrors;
      return;
    }

    showError(messageFromError(err, t('error')));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <section class="page-head">
    <h1>{{ id ? t('editContact') : t('addContact') }}</h1>
  </section>
  <ContactForm
    :contact="contact"
    :users="users"
    :loading="loading"
    :server-errors="serverErrors"
    @submit="submit"
    @cancel="router.push('/')"
  />
</template>
