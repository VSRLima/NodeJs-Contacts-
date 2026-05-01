<script setup lang="ts">
import { t } from '../services/i18n.js';

defineProps<{
  title: string;
  body: string;
}>();

defineEmits<{
  cancel: [];
  confirm: [];
}>();
</script>

<template>
  <div class="modal-backdrop" role="presentation">
    <section class="modal" role="dialog" aria-modal="true" :aria-label="title">
      <h2>{{ title }}</h2>
      <p>{{ body }}</p>
      <div class="actions">
        <button class="ghost" type="button" @click="$emit('cancel')">{{ t('cancel') }}</button>
        <button class="danger" type="button" @click="$emit('confirm')">{{ t('delete') }}</button>
      </div>
    </section>
  </div>
</template>
