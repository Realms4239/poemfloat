<script setup lang="ts">
import { useAppStore } from '@/stores/appState'
import { onMounted, computed } from 'vue'
import { useAudio } from '@/composables/useAudio'
import CustomCursor from '@/components/CustomCursor.vue'

const appStore = useAppStore()
const { $poemRepository } = useNuxtApp()
const { ambientSound } = useAudio()

useHead({
  bodyAttrs: {
    class: appStore.isLoading ? 'is-loading' : ''
  }
})

watch(() => appStore.isLoading, (loading) => {
  useHead({
    bodyAttrs: {
      class: loading ? 'is-loading' : ''
    }
  })
}, { immediate: true })

onMounted(async () => {
  console.log('App mounted, loading poems...')
  try {
    const poems = await $poemRepository.getAllPoems()
    appStore.setPoems(poems)
    
    if (poems.length > 0) {
      appStore.setCurrentPoem(poems[0])
    }
    
    appStore.setLoadingProgress(0.5)
    setTimeout(() => {
      appStore.setLoadingProgress(1)
      console.log('Loading complete')
    }, 3000)
  } catch (error) {
    console.error('Failed to load poems:', error)
    appStore.setLoadingProgress(1)
  }
})
</script>

<template>
    <div class="app-root">
      <CustomCursor />
      <!-- 3D World (Canvas Layer) -->
      <ClientOnly>
      <TresCanvas window-size clear-color="#0a0a09">
        <TresPerspectiveCamera :position="[0, 0, 10]" :look-at="[0, 0, 0]" />
        <MainScene />
      </TresCanvas>
    </ClientOnly>

    <!-- DOM/HTML (UI Layer) -->
    <NuxtPage />
  </div>
</template>

<style lang="scss">
@use "@/assets/styles/_variables.scss" as *;

:root {
  --cream: #fdfaf6;
  --dark: #0a0a09;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--dark);
  color: var(--cream);
  font-family: 'Cormorant Garamond', serif;
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

canvas {
  position: fixed;
  top: 0;
  left: 0;
  outline: none;
  z-index: 1;
}
</style>
