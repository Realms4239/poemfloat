import { MockPoemRepository } from '@/infrastructure/repositories/MockPoemRepository';
import { useAppStore } from '@/stores/appState';

export default defineNuxtPlugin(async (nuxtApp) => {
  const poemRepository = new MockPoemRepository();
  const appStore = useAppStore();

  // Initial load logic can be placed here or in app.vue
  // For now, providing the repository
  return {
    provide: {
      poemRepository
    }
  };
});
