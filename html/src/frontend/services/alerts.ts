import { reactive } from 'vue';

export type AlertType = 'success' | 'error';

export interface AlertMessage {
  id: string;
  type: AlertType;
  message: string;
  timeoutId?: ReturnType<typeof setTimeout>;
}

export const alertState = reactive({
  messages: [] as AlertMessage[]
});

export const closeAlert = (id: string) => {
  const index = alertState.messages.findIndex((message) => message.id === id);

  if (index === -1) {
    return;
  }

  const [message] = alertState.messages.splice(index, 1);
  if (message.timeoutId) {
    clearTimeout(message.timeoutId);
  }
};

const showAlert = (type: AlertType, message: string, timeoutMs = 5000) => {
  const id = crypto.randomUUID();
  const alert: AlertMessage = { id, type, message };

  alert.timeoutId = setTimeout(() => closeAlert(id), timeoutMs);
  alertState.messages.push(alert);
};

export const showSuccess = (message: string) => showAlert('success', message);

export const showError = (message: string) => showAlert('error', message, 7000);

export const messageFromError = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;
