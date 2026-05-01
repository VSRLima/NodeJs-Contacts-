import { reactive, watchEffect } from 'vue';

export type Theme = 'light' | 'dark';

export const themeState = reactive({
  value: (localStorage.getItem('theme') as Theme | null) ?? 'light'
});

export const setTheme = (theme: Theme) => {
  themeState.value = theme;
  localStorage.setItem('theme', theme);
};

watchEffect(() => {
  document.documentElement.dataset.theme = themeState.value;
});
