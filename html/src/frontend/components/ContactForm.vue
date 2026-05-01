<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Contact, User, authState } from '../services/api.js';
import { t } from '../services/i18n.js';

type FieldKey = 'name' | 'contact' | 'email_address' | 'picture' | 'created_by';

const props = defineProps<{
  contact?: Contact | null;
  users: User[];
  loading?: boolean;
  serverErrors?: Partial<Record<FieldKey, string>>;
}>();

const emit = defineEmits<{
  submit: [payload: Omit<Contact, 'id'>];
  cancel: [];
}>();

const form = reactive<Omit<Contact, 'id'>>({
  name: '',
  contact: '',
  email_address: '',
  picture: '',
  created_by: authState.user?.id ?? ''
});

const errors = reactive<Record<FieldKey, string>>({
  name: '',
  contact: '',
  email_address: '',
  picture: '',
  created_by: ''
});

const setError = (field: FieldKey, message: string) => {
  errors[field] = message;
};

const clearError = (field: FieldKey) => {
  errors[field] = '';
};

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

watch(
  () => props.contact,
  (contact) => {
    form.name = contact?.name ?? '';
    form.contact = contact?.contact ?? '';
    form.email_address = contact?.email_address ?? '';
    form.picture = contact?.picture ?? '';
    form.created_by = contact?.created_by ?? authState.user?.id ?? '';
    Object.keys(errors).forEach((key) => clearError(key as FieldKey));
  },
  { immediate: true }
);

watch(
  () => props.serverErrors,
  (serverErrors) => {
    Object.keys(errors).forEach((key) => clearError(key as FieldKey));

    if (!serverErrors) {
      return;
    }

    Object.entries(serverErrors).forEach(([field, message]) => {
      if (field in errors && message) {
        setError(field as FieldKey, message);
      }
    });
  },
  { deep: true }
);

const validate = () => {
  let valid = true;

  Object.keys(errors).forEach((key) => clearError(key as FieldKey));

  if (!form.name.trim()) {
    setError('name', t('requiredField'));
    valid = false;
  } else if (form.name.trim().length <= 5) {
    setError('name', t('nameInvalid'));
    valid = false;
  }

  if (!form.contact.trim()) {
    setError('contact', t('requiredField'));
    valid = false;
  } else if (!/^\d{9}$/.test(form.contact.trim())) {
    setError('contact', t('phoneInvalid'));
    valid = false;
  }

  if (!form.email_address.trim()) {
    setError('email_address', t('requiredField'));
    valid = false;
  } else if (!isEmail(form.email_address.trim())) {
    setError('email_address', t('invalidEmail'));
    valid = false;
  }

  if (!form.picture.trim()) {
    setError('picture', t('requiredField'));
    valid = false;
  } else if (!isUrl(form.picture.trim())) {
    setError('picture', t('invalidUrl'));
    valid = false;
  }

  if (authState.user?.role === 'admin' && !form.created_by.trim()) {
    setError('created_by', t('requiredField'));
    valid = false;
  }

  return valid;
};

const submit = () => {
  if (!validate()) {
    return;
  }

  emit('submit', {
    name: form.name.trim(),
    contact: form.contact.trim(),
    email_address: form.email_address.trim(),
    picture: form.picture.trim(),
    created_by: form.created_by
  });
};
</script>

<template>
  <form class="form" novalidate @submit.prevent="submit">
    <p class="hint">{{ t('requiredHint') }}</p>
    <label>
      <span class="field-label">{{ t('name') }} <span class="required-marker">*</span></span>
      <input v-model="form.name" :aria-invalid="Boolean(errors.name)" :aria-label="t('name')" />
      <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
    </label>
    <label>
      <span class="field-label">
        {{ t('phone') }} <span class="required-marker">*</span>
        <span class="field-help" tabindex="0" :aria-label="t('phoneHelp')">?</span>
      </span>
      <input
        v-model="form.contact"
        :aria-invalid="Boolean(errors.contact)"
        :aria-label="t('phone')"
        inputmode="numeric"
        placeholder="912345678"
      />
      <span v-if="errors.contact" class="field-error">{{ errors.contact }}</span>
    </label>
    <label>
      <span class="field-label">{{ t('email') }} <span class="required-marker">*</span></span>
      <input
        v-model="form.email_address"
        :aria-invalid="Boolean(errors.email_address)"
        :aria-label="t('email')"
        type="email"
      />
      <span v-if="errors.email_address" class="field-error">{{ errors.email_address }}</span>
    </label>
    <label>
      <span class="field-label">{{ t('picture') }} <span class="required-marker">*</span></span>
      <input
        v-model="form.picture"
        :aria-invalid="Boolean(errors.picture)"
        :aria-label="t('picture')"
        type="url"
      />
      <span v-if="errors.picture" class="field-error">{{ errors.picture }}</span>
    </label>
    <label v-if="authState.user?.role === 'admin'">
      <span class="field-label">{{ t('owner') }} <span class="required-marker">*</span></span>
      <select
        v-model="form.created_by"
        :aria-invalid="Boolean(errors.created_by)"
        :aria-label="t('owner')"
      >
        <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
      </select>
      <span v-if="errors.created_by" class="field-error">{{ errors.created_by }}</span>
    </label>
    <div class="actions">
      <button class="ghost" type="button" @click="$emit('cancel')">{{ t('cancel') }}</button>
      <button type="submit" :disabled="loading">{{ loading ? t('loading') : t('save') }}</button>
    </div>
  </form>
</template>
