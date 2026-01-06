<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Color } from 'three'
import { useAppStore } from '@/stores/appState'
import { useScrollWorld } from '@/composables/useScrollWorld'

const appStore = useAppStore()
const { lenis } = useScrollWorld()
const containerRef = ref<HTMLElement>()

onMounted(() => {
  if (!containerRef.value) return

  // Phase 2: Scrollytelling GSAP Logic
  const zones = [
    { id: 'green-pulse', slug: 'green-pulse', primary: '#e8f5e9', secondary: '#c8e6c9', turbulence: 0.3 },
    { id: 'black-breath', slug: 'dark-breath', primary: '#050505', secondary: '#1a1a1a', turbulence: 0.1 },
    { id: 'cat-tail', slug: 'moonlight-path', primary: '#1a1a2e', secondary: '#ffffff', turbulence: 0.6 },
    { id: 'secrets-stones', slug: 'secrets', primary: '#2d3436', secondary: '#636e72', turbulence: 0.4 },
    { id: 'resolution', slug: 'elegant-way', primary: '#fdfaf6', secondary: '#e8f5e9', turbulence: 0.2 }
  ]

  // Main Header Fade Out on Scroll
  ScrollTrigger.create({
    trigger: '.haiku-intro',
    start: 'top top',
    onEnter: () => {
      appStore.hasStarted = true
      gsap.to('.main-header', { opacity: 0, duration: 1, pointerEvents: 'none' })
    },
    onLeaveBack: () => {
      appStore.hasStarted = false
      gsap.to('.main-header', { opacity: 1, pointerEvents: 'auto' })
    }
  })

  // Zone Transitions
  zones.forEach(zone => {
    ScrollTrigger.create({
      trigger: `#${zone.id}`,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        if (appStore.bgMaterial?.uniforms?.uColorA) {
          const uniforms = appStore.bgMaterial.uniforms
          gsap.to(uniforms.uColorA.value, {
            r: new Color(zone.primary).r,
            g: new Color(zone.primary).g,
            b: new Color(zone.primary).b,
            duration: 2
          })
          gsap.to(uniforms.uColorB.value, {
            r: new Color(zone.secondary).r,
            g: new Color(zone.secondary).g,
            b: new Color(zone.secondary).b,
            duration: 2
          })
          gsap.to(uniforms.uTurbulence, {
            value: zone.turbulence,
            duration: 2.5
          })
        }
      },
      onEnterBack: () => {
        if (appStore.bgMaterial?.uniforms?.uColorA) {
          const uniforms = appStore.bgMaterial.uniforms
          gsap.to(uniforms.uColorA.value, {
            r: new Color(zone.primary).r,
            g: new Color(zone.primary).g,
            b: new Color(zone.primary).b,
            duration: 2
          })
        }
      }
    })

    // Animate Text
    gsap.fromTo(`#${zone.id} .poem-line`, 
      { opacity: 0, y: 30, filter: 'blur(10px)' },
      {
        scrollTrigger: {
          trigger: `#${zone.id}`,
          start: 'top 70%',
          end: 'top 30%',
          scrub: true
        },
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        stagger: 0.2
      }
    )
  })

  // White Stripe Animation
  gsap.fromTo('.white-stripe', 
    { scaleX: 0, opacity: 0 },
    {
      scrollTrigger: {
        trigger: '#cat-tail',
        start: 'top center',
        end: 'center center',
        scrub: true
      },
      scaleX: 1,
      opacity: 0.4
    }
  )
})

// Transition from Loading to Intro
watch(() => appStore.isReady, (ready) => {
  if (ready) {
    // Initial sequence: Start dark, then fade in the title or first content
    gsap.to('.main-header', { opacity: 1, duration: 2, ease: 'power2.inOut' })
  }
})
</script>

<template>
  <div class="page-home" ref="containerRef">
    <div class="film-grain"></div>

    <div class="content-overlay">
      <!-- Phase 1: Loading & Title -->
      <header class="main-header" :class="{ 'is-loading': appStore.isLoading, 'has-started': appStore.hasStarted }">
        <div class="title-container">
          <h1>Une Collection De Poèmes</h1>
        </div>
        <!-- Progress display for debugging/visual feedback if needed -->
        <div v-if="appStore.isLoading" class="progress-text">
          {{ Math.round(appStore.loadingProgress * 100) }}%
        </div>
      </header>

      <!-- Phase 2: Scrollytelling -->
      <section v-if="appStore.isReady" class="haiku-intro">
        <div class="zone" id="green-pulse">
          <p class="poem-line">Spinning pulse of green</p>
        </div>
        
        <div class="zone" id="black-breath">
          <p class="poem-line">an unfolding breath on black</p>
        </div>

        <div class="zone" id="cat-tail">
          <div class="white-stripe"></div>
          <p class="poem-line">a cat’s tail plaits through moonlight</p>
        </div>
        
        <div class="zone" id="secrets-stones">
          <p class="poem-line">unworried as secrets</p>
          <p class="poem-line">I hold questions like stones</p>
          <p class="poem-line">they tremble on my tongue</p>
        </div>

        <div class="zone" id="resolution">
          <p class="poem-line">This is a quiet orbit of change</p>
          <p class="poem-line">and my way of transience.</p>
        </div>
      </section>

      <section v-if="appStore.isReady" class="gallery-start">
        <p>Explore the Collection</p>
      </section>
    </div>
  </div>
</template>

<style lang="scss">
@use "@/assets/styles/_variables.scss" as *;

.page-home {
  width: 100%;
  height: 1000vh;
  background: transparent;
}

.content-overlay {
  position: relative;
  z-index: 10;
  pointer-events: none;

  .main-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    opacity: 0; // Starts hidden, fades in after loading
    transition: opacity 1.5s ease;
    z-index: 20;

    &.is-loading {
      opacity: 1;
      .title-container {
        transform: translateY(-50px);
      }
    }

    &.has-started {
      opacity: 0 !important;
      pointer-events: none;
    }

    .title-container {
      transition: transform 1.5s ease;
    }

    h1 {
      font-family: 'Playfair Display', serif;
      font-weight: 300;
      font-size: clamp(2.5rem, 8vw, 6rem);
      color: #fdfaf6; // Light color on dark background
      margin: 0;
      line-height: 1;
      font-style: italic;
    }

    .progress-text {
      position: absolute;
      bottom: 20%;
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem;
      letter-spacing: 0.5em;
      color: rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
    }
  }
  
  .haiku-intro {
    .zone {
      height: 150vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      text-align: center;
      padding: 0 20%;

      .poem-line {
        font-family: 'Playfair Display', serif;
        font-size: clamp(1.8rem, 4vw, 3rem);
        color: #fdfaf6;
        margin: 0.8rem 0;
        font-weight: 300;
      }
    }
    
    #green-pulse, #resolution {
      .poem-line {
        color: #1a1a1a;
      }
    }
  }

  .gallery-start {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-size: 0.9rem;
    color: #1a1a1a;
  }
}

.film-grain {
  position: fixed;
  inset: 0;
  z-index: 99;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
</style>
