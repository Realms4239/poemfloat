<script setup lang="ts">
import { useAppStore } from '@/stores/appState'
import { onMounted, ref, watch, nextTick, onUnmounted, computed } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PoemMiniature from '@/components/PoemMiniature.vue'
import type { Poem } from '@/core/domain/entities/Poem'

const appStore = useAppStore()
const haikuStage = ref<HTMLElement | null>(null)
const introStarted = ref(false)
const isTransporting = ref(false)

const scrollToCollection = () => {
    const totalScrollHeight = 16000
    const duration = 5000
    const startPosition = window.scrollY
    const distance = totalScrollHeight + 200 - startPosition
    let startTime: number | null = null
    
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }
    
    const animateScroll = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeInOutCubic(progress)
      window.scrollTo(0, startPosition + distance * easedProgress)
      if (progress < 1) requestAnimationFrame(animateScroll)
    }
    requestAnimationFrame(animateScroll)
  }


if (process.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const showScrollPrompt = computed(() => appStore.isReady && appStore.introStep === 0 && introStarted.value)
const showGallerySection = computed(() => appStore.introStep >= 8)

const handlePoemSelect = (poem: Poem) => {
  isTransporting.value = true
  appStore.setCurrentPoem(poem)
  setTimeout(() => { isTransporting.value = false }, 1500)
}

const wrapChars = (text: string) => {
  return text.split('').map(char => {
    if (char === ' ') return `<span class="char space">&nbsp;</span>`
    return `<span class="char">${char}</span>`
  }).join('')
}

onMounted(async () => {
  if (!process.client) return
  await nextTick()

  watch(() => appStore.isReady, (ready) => {
    if (ready && !introStarted.value) {
      introStarted.value = true
      setTimeout(() => setupPinnedTimeline(), 200)
    }
  }, { immediate: true })
})

function setupPinnedTimeline() {
  const stage = haikuStage.value
  if (!stage) return

  ScrollTrigger.getAll().forEach(st => st.kill())
  
  const lines = stage.querySelectorAll('.poem-line')
  gsap.set(lines, { autoAlpha: 0, y: 30, display: 'none', visibility: 'hidden' })

  const mainTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=16000',
        pin: true,
        scrub: 1.5,
        onUpdate: (self) => {
          const p = self.progress
          if (p < 0.05) appStore.setIntroStep(0)
          else if (p < 0.18) appStore.setIntroStep(1)
          else if (p < 0.32) appStore.setIntroStep(2)
          else if (p < 0.46) appStore.setIntroStep(3)
          else if (p < 0.60) appStore.setIntroStep(4)
          else if (p < 0.74) appStore.setIntroStep(5)
          else if (p < 0.88) appStore.setIntroStep(6)
          else if (p < 0.94) appStore.setIntroStep(7)
          else appStore.setIntroStep(8)
        }
      }

  })

  gsap.fromTo('.scroll-prompt', { autoAlpha: 0 }, { autoAlpha: 1, duration: 2, delay: 1.5 })

    const animateIn = (selector: string, startTime: number) => {
      const el = stage.querySelector(selector)
      if (!el) return
      const chars = el.querySelectorAll('.char')
      if (chars.length === 0) return
      
      mainTimeline
        .set(el, { display: 'flex', visibility: 'visible' }, startTime)
        .to(el, { autoAlpha: 1, duration: 0.01 }, startTime)
        .fromTo(chars, {
          opacity: 0,
          filter: 'blur(30px)',
          scale: 1.8,
          y: 60
        }, {
          opacity: 1,
          filter: 'blur(0px)',
          scale: 1,
          y: 0,
          duration: 0.05,
          stagger: 0.002,
          ease: 'expo.out'
        }, startTime + 0.002)
    }

    const animateOut = (selector: string, startTime: number) => {
      const el = stage.querySelector(selector)
      if (!el) return
      const chars = el.querySelectorAll('.char')
      
      if (chars.length > 0) {
        mainTimeline.to(chars, {
          opacity: 0, 
          filter: 'blur(20px)',
          y: -60,
          scale: 0.8,
          duration: 0.04,
          stagger: 0.0015,
          ease: 'power2.in'
        }, startTime)
      }
      
      mainTimeline
        .to(el, { autoAlpha: 0, duration: 0.02 }, startTime + 0.03)
        .set(el, { display: 'none', visibility: 'hidden' }, startTime + 0.05)
    }


  // REFINED SEQUENCE - ABSOLUTELY NO OVERLAP
  // Step 1: Spinning pulse
  animateIn('.line-1', 0.05)
  animateOut('.line-1', 0.16)

  // Step 2: Unfolding breath
  animateIn('.line-2', 0.19)
  animateOut('.line-2', 0.30)

  // Step 3: Cat's tail
  animateIn('.line-3', 0.33)
  animateOut('.line-3', 0.44)

  // Step 4: Unworried
  animateIn('.stanza-a', 0.47)
  animateOut('.stanza-a', 0.58)

  // Step 5: Stones
  animateIn('.stanza-b', 0.61)
  animateOut('.stanza-b', 0.72)

  // Step 6: Tremble
  const stanzaC = stage.querySelector('.stanza-c')
  if (stanzaC) {
    mainTimeline.set(stanzaC, { display: 'flex', visibility: 'visible' }, 0.75)
    mainTimeline.to(stanzaC, { autoAlpha: 1, duration: 0.01 }, 0.75)
    mainTimeline.fromTo(stanzaC.querySelectorAll('.char, .char-tremble'), {
      opacity: 0,
      filter: 'blur(30px)',
      y: 40
    }, {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      duration: 0.04,
      stagger: 0.002,
      ease: 'power3.out'
    }, 0.752)
    
    const trembleChars = stanzaC.querySelectorAll('.char-tremble')
    trembleChars.forEach((char, i) => {
      mainTimeline.to(char, {
        x: 'random(-6, 6)',
        y: 'random(-6, 6)',
        duration: 0.005,
        repeat: 10,
        yoyo: true,
        ease: 'none'
      }, 0.80 + (i * 0.001))
    })
    animateOut('.stanza-c', 0.85)
  }

    // Step 7: FINALE - GODLIKE TRANSITION
    const finale = stage.querySelector('.line-finale')
    if (finale) {
      mainTimeline.set(finale, { display: 'flex', visibility: 'visible' }, 0.89)
      mainTimeline.to(finale, { autoAlpha: 1, duration: 0.01 }, 0.89)
      
      // "This is"
      mainTimeline.fromTo(finale.querySelectorAll('.finale-1 .char'), {
        opacity: 0,
        filter: 'blur(15px)',
        y: 40
      }, {
        opacity: 0.8,
        filter: 'blur(0px)',
        y: 0,
        color: '#444', 
        duration: 0.02,
        stagger: 0.002,
        ease: 'power2.out'
      }, 0.895)
      
      // "a quiet orbit of changes"
      mainTimeline.fromTo(finale.querySelectorAll('.finale-2 .char'), {
        opacity: 0,
        filter: 'blur(40px)',
        y: 60,
        scale: 1.5
      }, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        scale: 1,
        duration: 0.04,
        stagger: 0.002,
        ease: 'expo.out'
      }, 0.915) 

      // THE BUMP - Visual impact and pause
      mainTimeline.to('.haiku-stage', {
        scale: 1.05,
        duration: 0.01,
        ease: 'power4.out',
        yoyo: true,
        repeat: 1
      }, 0.935)
      
      // "and my way of" - TRACING EFFECT
      mainTimeline.fromTo(finale.querySelectorAll('.finale-3-part .char'), {
        opacity: 0,
        filter: 'blur(10px)',
        x: -20,
        skewX: -20
      }, {
        opacity: 1,
        filter: 'blur(0px)',
        x: 0,
        skewX: 0,
        color: '#1a1a1a', 
        duration: 0.04,
        stagger: 0.003,
        ease: 'back.out(1.7)'
      }, 0.945) 
      
      // "transience" - TRACING UP / SURFACE EFFECT
      mainTimeline.fromTo(finale.querySelectorAll('.transience-word .char'), {
        opacity: 0,
        filter: 'blur(20px)',
        y: 100,
        rotateX: -90,
        scaleY: 2
      }, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        rotateX: 0,
        scaleY: 1,
        color: '#1a1a1a',
        duration: 0.06,
        stagger: 0.005,
        ease: 'expo.out'
      }, 0.958)
      
      // Climax Bloom & Disintegration Start
      mainTimeline.to(finale.querySelectorAll('.transience-word .char'), {
        color: '#2d5a27', 
        textShadow: '0 0 50px rgba(45, 90, 39, 0.8)',
        scale: 1.2,
        duration: 0.03,
        stagger: 0.002,
        ease: 'power4.inOut'
      }, 0.985)

      // DISINTEGRATE - The words fade and blur as particles take over in 3D
      mainTimeline.to(finale.querySelectorAll('.char'), {
        opacity: 0,
        filter: 'blur(30px) brightness(2)',
        scale: 1.5,
        y: -100,
        stagger: {
          each: 0.001,
          from: 'random'
        },
        duration: 0.02
      }, 0.995)
  
      mainTimeline.to(finale, { autoAlpha: 0, duration: 0.005 }, 0.999)
    }

}

onUnmounted(() => {
  ScrollTrigger.getAll().forEach(st => st.kill())
})
</script>

<template>
  <div class="page-home">
    <div v-if="appStore.introStep === 0 && introStarted" class="collection-nav" @click="scrollToCollection">
      <img src="/eni-icon.svg" alt="Logo" class="nav-logo" />
      <span class="collection-label">COLLECTION</span>
    </div>

    <div v-show="showScrollPrompt" class="scroll-prompt">
      <span>Scroll to begin</span>
    </div>

    <div ref="haikuStage" class="haiku-stage" v-show="introStarted">
      <div class="haiku-container">
        <div class="poem-line line-1 center-left">
          <p v-html="wrapChars('spinning pulse of green')"></p>
        </div>
        <div class="poem-line line-2 center-right">
          <p v-html="wrapChars('an unfolding breath on black')"></p>
        </div>
        
        <div class="poem-line line-3 top-center">
          <p v-html="wrapChars(`a cat's tail plaits through moonlight`)"></p>
        </div>
        
        <div class="poem-line stanza-a dead-center">
          <p v-html="wrapChars('unworried as secrets')"></p>
        </div>
        <div class="poem-line stanza-b dead-center heavy">
          <p v-html="wrapChars('I hold questions like stones')"></p>
        </div>
        <div class="poem-line stanza-c dead-center">
          <p>
            <span v-html="wrapChars('they ')"></span>
            <span class="tremble-wrap">
              <span v-for="(char, i) in 'tremble'" :key="i" class="char char-tremble">{{ char }}</span>
            </span>
            <span v-html="wrapChars(' on my tongue')"></span>
          </p>
        </div>
        
        <div class="poem-line line-finale dead-center hero">
          <div class="finale-1 faint" v-html="wrapChars('This is')"></div>
          <div class="finale-2 greeny-text" v-html="wrapChars('a quiet orbit of changes')"></div>
          <div class="finale-3 smoke-text">
            <span class="finale-3-part" v-html="wrapChars('and my way of ')"></span>
            <span class="transience-word" v-html="wrapChars('transience')"></span>
          </div>
        </div>
      </div>
    </div>

    <section v-if="showGallerySection" class="gallery-section">
      <div class="gallery-content">
        <div class="gallery-header">
          <h2 class="gallery-title">The Collection</h2>
          <p class="gallery-subtitle">A gathering of verse</p>
        </div>
        
        <div class="miniatures-wrapper">
          <div class="miniatures-scroll">
            <PoemMiniature 
              v-for="poem in appStore.poems" 
              :key="poem.id" 
              :poem="poem"
              @select="handlePoemSelect"
            />
          </div>
        </div>
      </div>
    </section>

    <div v-if="isTransporting" class="transport-overlay">
      <div class="transport-line"></div>
    </div>

    <div class="film-grain"></div>
  </div>
</template>

<style lang="scss" scoped>
.page-home {
  width: 100%;
  min-height: 100vh;
  position: relative;
  z-index: 10;
}

.scroll-prompt {
  position: fixed;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  pointer-events: none;
  
  span {
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.4em;
    color: #1a1a1a;
    opacity: 0.6;
  }
}

.haiku-stage {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  z-index: 20;
}

.haiku-container {
  position: relative;
  width: 100%;
  height: 100%;
}

  .poem-line {
  position: absolute;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 300;
  font-size: clamp(1.1rem, 2.6vw, 1.8rem);
  color: #fafafa;
  line-height: 1.6;
  max-width: 80ch;
  will-change: transform, opacity, filter;
  opacity: 0;
  visibility: hidden;
  display: none;
  
  p { margin: 0; }
  
  :deep(.char) {
    display: inline-block;
    will-change: transform, filter, opacity;
    &.space { width: 0.35em; }
  }

  &.center-left { top: 50%; left: 10%; transform: translateY(-50%); text-align: left; }
  &.center-right { top: 50%; right: 10%; transform: translateY(-50%); text-align: right; }
  &.top-center { top: 25%; left: 50%; transform: translateX(-50%); text-align: center; }
  &.dead-center { top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
  &.heavy { font-weight: 500; letter-spacing: -0.01em; }
  &.hero {
    font-size: clamp(1.5rem, 4.5vw, 2.6rem);
    width: 90%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
  }
}

.faint {
  opacity: 0.5;
  font-size: 0.4em;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  color: #fafafa;
}

.smoke-text {
  font-style: italic;
  font-weight: 300;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3em;
  margin-top: 0.5rem;
  text-shadow: 0 4px 25px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5); // Stronger contrast
  color: #fff;
}

.greeny-text {
  color: #4ea14a;
  text-shadow: 0 0 25px rgba(78, 161, 74, 0.5), 0 0 50px rgba(0,0,0,0.5);
  font-weight: 400;
}

.transience-word {
  display: inline-block;
  will-change: transform, filter, opacity, color;
  color: #fafafa;
  font-weight: 400;
  :deep(.char) {
    text-shadow: 0 0 20px rgba(250, 250, 250, 0.4);
  }
}

.finale-3-part {
  display: inline-block;
  color: #f0f0f0; // Slightly off-white for better contrast
  font-weight: 300;
  text-shadow: 0 2px 10px rgba(0,0,0,0.4);
}

.char-tremble { display: inline-block; }
.tremble-wrap { display: inline-block; font-style: italic; }

.gallery-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: transparent;
  padding: 15vh 0;
  
  .gallery-header {
    text-align: center;
    margin-bottom: 6rem;
    .gallery-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(4rem, 12vw, 8rem);
      font-weight: 300;
      color: #1a1a1a;
      letter-spacing: -0.02em;
    }
    .gallery-subtitle {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.5rem;
      font-style: italic;
      color: #333;
      letter-spacing: 0.2em;
      opacity: 0.8;
    }
  }

  .miniatures-wrapper {
    width: 100%;
    overflow-x: auto;
    padding: 4rem 0;
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  .miniatures-scroll {
    display: flex;
    padding: 0 15vw;
    width: max-content;
    gap: 5vw;
  }
}

.transport-overlay {
  position: fixed;
  inset: 0;
  background: #faf8f5;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  .transport-line {
    width: 2px;
    height: 0;
    background: #1a1a1a;
    animation: transportGrow 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards;
  }
}

@keyframes transportGrow {
  0% { height: 0; opacity: 1; }
  50% { height: 100vh; opacity: 1; }
  100% { height: 100vh; opacity: 0; }
}

.film-grain {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  opacity: 0.1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.collection-nav {
  position: fixed;
  top: 3rem;
  right: 4rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  z-index: 100;
  cursor: pointer;
  mix-blend-mode: difference;
  
  &:hover {
    .collection-label { color: #4ea14a; }
    .nav-logo {
      filter: brightness(1.2) sepia(1) hue-rotate(70deg) saturate(2);
      transform: scale(1.1);
    }
  }

  .nav-logo {
    width: 36px;
    height: 36px;
    object-fit: contain;
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
    filter: brightness(2) invert(1);
  }

  .collection-label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.9rem;
    font-weight: 300;
    letter-spacing: 0.45em;
    color: #fafafa;
    transition: color 0.5s ease;
  }
}
</style>
