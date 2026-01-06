<script setup lang="ts">
import { useAppStore } from '@/stores/appState'
import { onMounted, computed, watch } from 'vue'
import { useAudio } from '@/composables/useAudio'
import CustomCursor from '@/components/CustomCursor.vue'
import MainScene from '@/components/canvas/MainScene.vue'
import LoaderOverlay from '@/presentation/components/ui/LoaderOverlay.vue'

const appStore = useAppStore()
const { $poemRepository } = useNuxtApp()
const { ambientSound } = useAudio()

useHead({
  bodyAttrs: {
    class: computed(() => appStore.isLoading ? 'is-loading' : '')
  }
})

onMounted(async () => {
  console.log('App mounted, loading poems...')
  try {
    const poems = await $poemRepository.getAllPoems()
    appStore.setPoems(poems)
    
    if (poems.length > 0) {
      appStore.setCurrentPoem(poems[0])
    }
  } catch (error) {
    console.error('Failed to load poems:', error)
  }
})
</script>

<template>
  <div class="app-root">
    <LoaderOverlay v-if="appStore.isLoading" />
    
    <CustomCursor />
    
    <!-- 3D World (Canvas Layer) -->
    <ClientOnly>
      <div class="canvas-container">
        <TresCanvas window-size clear-color="#050505">
          <TresPerspectiveCamera :position="[0, 0, 10]" :look-at="[0, 0, 0]" />
          <MainScene />
        </TresCanvas>
      </div>
    </ClientOnly>

    <!-- DOM/HTML (UI Layer) -->
    <NuxtPage />
  </div>
</template>

<style lang="scss">
@use "@/assets/styles/_variables.scss" as *;

:root {
  --cream: #fdfaf6;
  --dark: #1a1a1a;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--cream);
  color: var(--dark);
  font-family: 'Playfair Display', serif;
  overflow-x: hidden;
  
  &.is-loading {
    overflow: hidden;
  }
}

.app-root {
  width: 100vw;
  min-height: 100vh;
  position: relative;
}

.canvas-container {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

canvas {
  outline: none;
}
</style>
