<script setup lang="ts">
import { useAppStore } from '@/stores/appState'
import { computed, onMounted, ref } from 'vue'
import gsap from 'gsap'

const appStore = useAppStore()
const containerRef = ref<HTMLElement | null>(null)

const loadingProgress = computed(() => appStore.loadingProgress)
const internalProgress = ref(0)

onMounted(() => {
  console.log('LoaderOverlay mounted')
  
  // Safety timeout: if loader is still present after 5 seconds, force finish
  setTimeout(() => {
    if (appStore.isLoading) {
      console.warn('Loader safety timeout reached, forcing finish')
      handleComplete()
    }
  }, 5000)

  // Initial entrance
  gsap.from('.loader-content', {
    autoAlpha: 0,
    y: 10,
    duration: 1.5,
    ease: 'power3.out'
  })

  // Simulate loading progress
  gsap.to(internalProgress, {
    value: 1,
    duration: 1.5,
    ease: 'power1.inOut',
    onUpdate: () => {
      appStore.setLoadingProgress(internalProgress.value)
    },
    onComplete: () => {
      console.log('Loader progress complete')
      handleComplete()
    }
  })
})

const handleComplete = () => {
  console.log('Fading out loader...')
  const el = containerRef.value || document.querySelector('.loader-overlay')
  
  if (el) {
    gsap.to(el, {
      autoAlpha: 0,
      duration: 0.8,
      ease: 'power3.inOut',
      onComplete: () => {
        console.log('Loader fade out complete, finishing loading state')
        appStore.finishLoading()
      }
    })
  } else {
    console.warn('Loader element not found in handleComplete, forcing state update')
    appStore.finishLoading()
  }
}

defineExpose({ handleComplete })
</script>

<template>
  <div ref="containerRef" class="loader-overlay">
    <div class="loader-content">
      <h1 class="loader-text">Une Collection de Poèmes</h1>
      
      <div class="curve-container">
        <svg viewBox="0 0 200 100" class="bezier-curve">
          <path 
            d="M20,50 C60,10 140,90 180,50" 
            fill="none" 
            stroke="#e0e0e0" 
            stroke-width="2" 
            stroke-linecap="round"
          />
          <path 
            ref="curvePath"
            d="M20,50 C60,10 140,90 180,50" 
            fill="none" 
            stroke="#d4af37" 
            stroke-width="3" 
            stroke-linecap="round"
            :style="{
              strokeDasharray: 250,
              strokeDashoffset: 250 - (loadingProgress * 250)
            }"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  background-color: #fdfaf6;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.loader-text {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 300;
  font-size: 14px;
  color: #1a1a1a;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin: 0;
}

.curve-container {
  width: 200px;
  height: 100px;
}

.bezier-curve {
  width: 100%;
  height: 100%;
  
  path {
    transition: stroke-dashoffset 0.3s ease-out;
  }
}
</style>
