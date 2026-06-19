import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme;
    localStorage.setItem('theme', newTheme);
    applyTheme();
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light');
  }

  function applyTheme() {
    const isLight = theme.value === 'light';
    if (isLight) {
      document.documentElement.classList.add('light');
      if (document.body) {
        document.body.classList.add('light');
      }
    } else {
      document.documentElement.classList.remove('light');
      if (document.body) {
        document.body.classList.remove('light');
      }
    }
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    applyTheme,
  };
});
