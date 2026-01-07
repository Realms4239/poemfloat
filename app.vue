<script setup lang="ts">
import { useAppStore } from '@/stores/appState'
import { onMounted, computed, ref, watch } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useMouse } from '@vueuse/core'
import CustomCursor from '@/components/CustomCursor.vue'

const appStore = useAppStore()
const { $poemRepository } = useNuxtApp()
const { ambientSound } = useAudio()
const { x, y } = useMouse({ type: 'client' })

// Playground Mode Logic (Global)
const holdTimer = ref<NodeJS.Timeout | null>(null)
const holdProgress = ref(0)
const showPlaygroundNotif = ref(false)
const playgroundActive = computed(() => appStore.isPlaygroundMode)

const startHold = (e: MouseEvent | TouchEvent) => {
  if (holdTimer.value) return
  
  const duration = 2500 
  const startTime = Date.now()
  
  const timer = setTimeout(() => {
    appStore.setPlaygroundMode(!appStore.isPlaygroundMode)
    showPlaygroundNotif.value = true
    setTimeout(() => { showPlaygroundNotif.value = false }, 4000)
    holdTimer.value = null
    holdProgress.value = 0
  }, duration)
  
  holdTimer.value = timer
  
  const updateProgress = () => {
    if (!holdTimer.value) return
    const elapsed = Date.now() - startTime
    holdProgress.value = Math.min(elapsed / duration, 1)
    if (holdProgress.value < 1) {
      requestAnimationFrame(updateProgress)
    }
  }
  
  requestAnimationFrame(updateProgress)
}

const cancelHold = () => {
  if (holdTimer.value) {
    clearTimeout(holdTimer.value)
    holdTimer.value = null
    holdProgress.value = 0
  }
}

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
    <div class="app-interaction-layer"
      @mousedown="startHold" 
      @mouseup="cancelHold" 
      @mouseleave="cancelHold"
      @touchstart="startHold"
      @touchend="cancelHold"
    >
      <NuxtPage />
    </div>

    <!-- Global Playground UI -->
    <Transition name="elegant-fade">
      <div v-if="showPlaygroundNotif" class="playground-notif">
        <span class="notif-text">{{ playgroundActive ? 'ink playground active' : 'ink playground restored' }}</span>
        <div class="notif-line"></div>
      </div>
    </Transition>

    <div v-if="holdProgress > 0" class="hold-indicator-container" :style="{ left: x + 'px', top: y + 'px' }">
      <div class="ink-gooey-container">
        <div class="hold-fill-circle" :style="{ 
          transform: `scale(${holdProgress * 1.5})`, 
          opacity: 0.2 + holdProgress * 0.8,
          filter: `blur(${12 - holdProgress * 8}px)`
        }"></div>
        <div class="hold-fill-circle secondary" :style="{ 
          transform: `scale(${holdProgress * 1.2}) rotate(${holdProgress * 180}deg)`, 
          opacity: 0.1 + holdProgress * 0.5,
          filter: `blur(${15 - holdProgress * 10}px)`
        }"></div>
      </div>
      <div class="hold-pulse-ring" v-if="holdProgress > 0.8"></div>
      <svg class="hold-ring" width="100" height="100" viewBox="0 0 100 100">
        <circle class="hold-ring-bg" cx="50" cy="50" r="46" />
        <circle 
          class="hold-ring-progress" 
          cx="50" cy="50" r="46" 
          :style="{ strokeDasharray: 289, strokeDashoffset: 289 * (1 - holdProgress) }"
        />
      </svg>
    </div>
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

.app-interaction-layer {
  width: 100%;
  min-height: 100vh;
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

canvas {
  position: fixed;
  top: 0;
  left: 0;
  outline: none;
  z-index: 1;
}

// Playground Global Styles
.playground-notif {
  position: fixed;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  .notif-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.2rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #3d5a3a;
    font-weight: 300;
  }

  .notif-line {
    width: 60px;
    height: 1px;
    background: #3d5a3a;
    transform: scaleX(0);
    animation: lineGrow 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  }
}

@keyframes lineGrow {
  to { transform: scaleX(1); }
}

.elegant-fade-enter-active, .elegant-fade-leave-active {
  transition: all 1.2s cubic-bezier(0.23, 1, 0.32, 1);
}
.elegant-fade-enter-from, .elegant-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px) scale(0.95);
  filter: blur(10px);
}

.hold-indicator-container {
  position: fixed;
  transform: translate(-50%, -50%);
  z-index: 20000;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;

  .ink-gooey-container {
    position: absolute;
    filter: contrast(18) brightness(1.2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 300px;
    height: 300px;
    pointer-events: none;
  }
  
  .hold-fill-circle {
    position: absolute;
    width: 100px;
    height: 100px;
    background: #3d5a3a;
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    transform-origin: center;
    
    &.secondary {
      background: #4ea14a;
      width: 80px;
      height: 80px;
    }
  }

  .hold-pulse-ring {
    position: absolute;
    width: 100px;
    height: 100px;
    border: 2px solid #3d5a3a;
    border-radius: 50%;
    animation: pulseGrow 1.5s infinite;
  }
  
  .hold-ring {
    transform: rotate(-90deg);
    position: relative;
    z-index: 2;
  }
  
  .hold-ring-bg {
    fill: none;
    stroke: rgba(61, 90, 58, 0.1);
    stroke-width: 1.5px;
  }
  
  .hold-ring-progress {
    fill: none;
    stroke: #3d5a3a;
    stroke-width: 2.5px;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.1s linear;
  }
}

@keyframes pulseGrow {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.8); opacity: 0; }
}
</style>
