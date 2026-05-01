<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import ConfirmModal from './ConfirmModal.vue';
import { api, authState, Role, User } from '../services/api.js';
import { messageFromError, showError, showSuccess } from '../services/alerts.js';
import { t } from '../services/i18n.js';

const users = ref<User[]>([]);
const editing = ref<{ id: string; name: string; password: string; role: Role } | null>(null);
const deleting = ref<User | null>(null);
const form = reactive({
  name: '',
  password: '',
  role: 'basic' as Role
});
const formErrors = reactive({
  name: '',
  password: '',
  role: ''
});
const editErrors = reactive({
  name: '',
  password: '',
  role: ''
});

const clearFormErrors = () => {
  formErrors.name = '';
  formErrors.password = '';
  formErrors.role = '';
};

const clearEditErrors = () => {
  editErrors.name = '';
  editErrors.password = '';
  editErrors.role = '';
};

const validateUserForm = () => {
  let valid = true;
  clearFormErrors();

  if (!form.name.trim()) {
    formErrors.name = t('requiredField');
    valid = false;
  }

  if (!form.password.trim()) {
    formErrors.password = t('requiredField');
    valid = false;
  } else if (form.password.length < 6) {
    formErrors.password = t('passwordInvalid');
    valid = false;
  }

  if (!form.role) {
    formErrors.role = t('requiredField');
    valid = false;
  }

  return valid;
};

const validateEditForm = () => {
  if (!editing.value) {
    return false;
  }

  let valid = true;
  clearEditErrors();

  if (!editing.value.name.trim()) {
    editErrors.name = t('requiredField');
    valid = false;
  }

  if (!editing.value.role) {
    editErrors.role = t('requiredField');
    valid = false;
  }

  if (editing.value.password && editing.value.password.length < 6) {
    editErrors.password = t('passwordInvalid');
    valid = false;
  }

  return valid;
};

const load = async () => {
  try {
    users.value = await api.users();
  } catch (err) {
    showError(messageFromError(err, t('error')));
  }
};

const startEdit = (user: User) => {
  clearEditErrors();
  editing.value = {
    id: user.id,
    name: user.name,
    password: '',
    role: user.role
  };
};

const cancelEdit = () => {
  clearEditErrors();
  editing.value = null;
};

const createUser = async () => {
  if (!validateUserForm()) {
    return;
  }

  try {
    await api.createUser({
      name: form.name.trim(),
      password: form.password,
      role: form.role
    });
    form.name = '';
    form.password = '';
    form.role = 'basic';
    clearFormErrors();
    showSuccess(t('userCreated'));
    await load();
  } catch (err) {
    showError(messageFromError(err, t('error')));
  }
};

const updateUser = async () => {
  if (!editing.value) {
    return;
  }

  if (!validateEditForm()) {
    return;
  }

  const payload = {
    name: editing.value.name.trim(),
    role: editing.value.role,
    ...(editing.value.password ? { password: editing.value.password } : {})
  };

  try {
    await api.updateUser(editing.value.id, payload);
    editing.value = null;
    showSuccess(t('userUpdated'));
    await load();
  } catch (err) {
    showError(messageFromError(err, t('error')));
  }
};

const confirmDelete = async () => {
  if (!deleting.value) {
    return;
  }

  try {
    await api.deleteUser(deleting.value.id);
    deleting.value = null;
    showSuccess(t('userDeleted'));
    await load();
  } catch (err) {
    showError(messageFromError(err, t('error')));
  }
};

onMounted(load);
</script>

<template>
  <section class="page-head">
    <h1>{{ t('users') }}</h1>
  </section>

  <form class="form inline" novalidate @submit.prevent="createUser">
    <h2>{{ t('newUser') }}</h2>
    <label>
      <span class="field-label">{{ t('username') }} <span class="required-marker">*</span></span>
      <input
        v-model="form.name"
        :aria-invalid="Boolean(formErrors.name)"
        :aria-label="t('username')"
      />
      <span class="field-error">{{ formErrors.name }}</span>
    </label>
    <label>
      <span class="field-label">{{ t('password') }} <span class="required-marker">*</span></span>
      <input
        v-model="form.password"
        :aria-invalid="Boolean(formErrors.password)"
        :aria-label="t('password')"
        type="password"
      />
      <span class="field-error">{{ formErrors.password }}</span>
    </label>
    <label>
      <span class="field-label">{{ t('role') }} <span class="required-marker">*</span></span>
      <select v-model="form.role" :aria-invalid="Boolean(formErrors.role)" :aria-label="t('role')">
        <option value="basic">{{ t('basic') }}</option>
        <option value="admin">{{ t('admin') }}</option>
      </select>
      <span class="field-error">{{ formErrors.role }}</span>
    </label>
    <button type="submit">{{ t('create') }}</button>
  </form>

  <section class="table">
    <div class="table-row heading">
      <span>{{ t('name') }}</span>
      <span>{{ t('role') }}</span>
      <span></span>
    </div>
    <div v-for="user in users" :key="user.id" class="table-row">
      <template v-if="editing?.id === user.id">
        <label>
          <span class="field-label"
            >{{ t('username') }} <span class="required-marker">*</span></span
          >
          <input
            v-model="editing.name"
            :aria-invalid="Boolean(editErrors.name)"
            :aria-label="t('username')"
          />
          <span class="field-error">{{ editErrors.name }}</span>
        </label>
        <div class="edit-user-fields">
          <label>
            <span class="field-label">{{ t('role') }} <span class="required-marker">*</span></span>
            <select
              v-model="editing.role"
              :aria-invalid="Boolean(editErrors.role)"
              :aria-label="t('role')"
            >
              <option value="basic">{{ t('basic') }}</option>
              <option value="admin">{{ t('admin') }}</option>
            </select>
            <span class="field-error">{{ editErrors.role }}</span>
          </label>
          <label>
            <span class="field-label">{{ t('password') }}</span>
            <input
              v-model="editing.password"
              :aria-invalid="Boolean(editErrors.password)"
              :aria-label="t('password')"
              :placeholder="t('password')"
              type="password"
            />
            <span class="field-error">{{ editErrors.password }}</span>
          </label>
        </div>
        <div class="row-actions">
          <button type="button" @click="updateUser">{{ t('save') }}</button>
          <button class="ghost" type="button" @click="cancelEdit">{{ t('cancel') }}</button>
        </div>
      </template>
      <template v-else>
        <span>{{ user.name }}</span>
        <span>{{ user.role }}</span>
        <div class="row-actions">
          <button class="ghost" type="button" @click="startEdit(user)">{{ t('edit') }}</button>
          <button
            class="text-danger"
            type="button"
            :disabled="user.id === authState.user?.id"
            @click="deleting = user"
          >
            {{ t('delete') }}
          </button>
        </div>
      </template>
    </div>
  </section>

  <ConfirmModal
    v-if="deleting"
    :title="t('deleteUserTitle')"
    :body="t('deleteUserBody')"
    @cancel="deleting = null"
    @confirm="confirmDelete"
  />
</template>
