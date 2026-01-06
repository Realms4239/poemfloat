import { defineStore } from 'pinia';
import type { Poem } from '@/core/domain/entities/Poem';
import type { ShaderMaterial } from 'three';

export const useAppStore = defineStore('app', {
  state: () => ({
    isLoading: true,
    loadingProgress: 0,
    isReady: false,
    loadingComplete: false,
    hasStarted: false,
    introStep: 0,
    currentPoem: null as Poem | null,
    poems: [] as Poem[],
    bgMaterial: null as ShaderMaterial | null
  }),
  actions: {
    setLoadingProgress(progress: number) {
      this.loadingProgress = progress;
      if (progress >= 1) {
        this.loadingComplete = true;
      }
    },
    finishLoading() {
      this.isLoading = false;
      this.isReady = true;
    },
    startIntro() {
      this.hasStarted = true;
      this.introStep = 1;
    },
    setIntroStep(step: number) {
      this.introStep = step;
    },
    setPoems(poems: Poem[]) {
      this.poems = poems;
    },
    setCurrentPoem(poem: Poem | null) {
      this.currentPoem = poem;
    },
    setBgMaterial(material: ShaderMaterial) {
      this.bgMaterial = material;
    }
  }
});
