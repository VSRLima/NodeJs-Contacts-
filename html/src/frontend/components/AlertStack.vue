<script setup lang="ts">
import { alertState, closeAlert } from '../services/alerts.js';
</script>

<template>
  <div class="alert-stack" aria-live="polite" aria-atomic="false">
    <article
      v-for="message in alertState.messages"
      :key="message.id"
      class="alert"
      :class="`alert-${message.type}`"
      role="status"
    >
      <span>{{ message.message }}</span>
      <button
        type="button"
        class="alert-close"
        :aria-label="`Close ${message.type} alert`"
        @click="closeAlert(message.id)"
      >
        &times;
      </button>
    </article>
  </div>
</template>
