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
            else if (p < 0.16) appStore.setIntroStep(1)
            else if (p < 0.28) appStore.setIntroStep(2)
            else if (p < 0.40) appStore.setIntroStep(3)
            else if (p < 0.52) appStore.setIntroStep(4)
            else if (p < 0.64) appStore.setIntroStep(5)
                    else if (p < 0.76) appStore.setIntroStep(5)
                    else if (p < 0.83) appStore.setIntroStep(6) // Hold black for "This is a quiet orbit of"
                    else if (p < 0.98) appStore.setIntroStep(7) // Unfold exactly when "change" is shown
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
            duration: 0.06,
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
            duration: 0.05,
            stagger: 0.0015,
            ease: 'power2.in'
          }, startTime)
        }
        
        mainTimeline
          .to(el, { autoAlpha: 0, duration: 0.02 }, startTime + 0.04)
          .set(el, { display: 'none', visibility: 'hidden' }, startTime + 0.06)
      }


    // REFINED SEQUENCE - BALANCED SPACING
    animateIn('.line-1', 0.05)
    animateOut('.line-1', 0.14)

    animateIn('.line-2', 0.17)
    animateOut('.line-2', 0.26)

    animateIn('.line-3', 0.29)
    animateOut('.line-3', 0.38)

    animateIn('.stanza-a', 0.41)
    animateOut('.stanza-a', 0.50)

    animateIn('.stanza-b', 0.53)
    animateOut('.stanza-b', 0.62)

    const stanzaC = stage.querySelector('.stanza-c')
    if (stanzaC) {
      mainTimeline.set(stanzaC, { display: 'flex', visibility: 'visible' }, 0.65)
      mainTimeline.to(stanzaC, { autoAlpha: 1, duration: 0.01 }, 0.65)
      mainTimeline.fromTo(stanzaC.querySelectorAll('.char, .char-tremble'), {
        opacity: 0,
        filter: 'blur(30px)',
        y: 40
      }, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.06,
        stagger: 0.002,
        ease: 'power3.out'
      }, 0.652)
      
      const trembleChars = stanzaC.querySelectorAll('.char-tremble')
      trembleChars.forEach((char, i) => {
        mainTimeline.to(char, {
          x: 'random(-6, 6)',
          y: 'random(-6, 6)',
          duration: 0.005,
          repeat: 12,
          yoyo: true,
          ease: 'none'
        }, 0.70 + (i * 0.001))
      })
      animateOut('.stanza-c', 0.76)
    }

          // Step 7: FINALE - REFINED MOMENTUM
          const finale = stage.querySelector('.line-finale')
          if (finale) {
            mainTimeline.set(finale, { display: 'flex', visibility: 'visible' }, 0.77)
            mainTimeline.to(finale, { autoAlpha: 1, duration: 0.01 }, 0.77)
            
            // Ensure finale-3 is hidden initially
            mainTimeline.set(finale.querySelector('.finale-3'), { autoAlpha: 0 }, 0.77)
            
              // 1. "This is a quiet orbit of change" (on black)
              mainTimeline.fromTo(finale.querySelectorAll('.finale-2 .char'), {
                opacity: 0,
                filter: 'blur(20px)',
                y: 30,
              }, {
                opacity: 1,
                filter: 'blur(0px)',
                y: 0,
                duration: 0.05,
                stagger: 0.002,
                ease: 'power2.out'
              }, 0.78)

              // Fade out finale-2 before finale-3
              mainTimeline.to(finale.querySelectorAll('.finale-2 .char'), {
                opacity: 0,
                filter: 'blur(15px)',
                y: -20,
                duration: 0.03,
                stagger: 0.001,
                ease: 'power2.in'
              }, 0.85)
              
              // 2. " and my way of transience" (on bright)
              // SYNCED UNFOLD: Happens at 0.865
              mainTimeline.to(finale.querySelector('.finale-3'), { autoAlpha: 1, duration: 0.01 }, 0.875)
              
                mainTimeline.fromTo(finale.querySelectorAll('.finale-3 .char'), {
                  opacity: 0,
                  filter: 'blur(20px)',
                  y: 30,
                }, {
                  opacity: 1,
                  filter: 'blur(0px)',
                  y: 0,
                  duration: 0.06,
                  stagger: 0.002,
                  ease: 'power2.out'
                }, 0.88)
        
        
              // Exit animations at the very end
              mainTimeline.to(finale.querySelectorAll('.finale-3 .char'), {
                opacity: 0,
                filter: 'blur(25px)',
                y: -60,
                stagger: 0.001,
                duration: 0.03,
                ease: 'power2.in'
              }, 0.985)
            
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
      <span class="collection-label">COLLECTION</span>
      <img src="/paw-logo.png" alt="Paw Logo" class="nav-logo" />
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
                <div class="finale-2 greeny-text" v-html="wrapChars('This is a quiet orbit of change')"></div>
                <div class="finale-3 smoke-text" v-html="wrapChars(' and my way of transience')"></div>
              </div>
      </div>
    </div>

    <section v-if="showGallerySection" class="gallery-section">
      <div class="gallery-content">
        <div class="gallery-header">
          <h2 class="gallery-title">The Collection</h2>
          <p class="gallery-subtitle">A GATHERING OF VERSE</p>
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
      color: #3d5a3a;
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
  font-size: clamp(1.2rem, 4vw, 1.8rem);
  color: #fafafa;
  line-height: 1.4;
  width: 85%;
  max-width: 60ch;
  will-change: transform, opacity, filter;
  opacity: 0;
  visibility: hidden;
  display: none;
  overflow-wrap: break-word;
  word-break: break-word;
  
  p { margin: 0; }
  
  :deep(.char) {
    display: inline-block;
    will-change: transform, filter, opacity;
    &.space { width: 0.25em; }
  }

  &.center-left { top: 40%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
  &.center-right { top: 60%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
  &.top-center { top: 30%; left: 50%; transform: translateX(-50%); text-align: center; }
  &.dead-center { top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
  &.heavy { font-weight: 500; letter-spacing: -0.01em; }
  &.hero {
    font-size: clamp(1.4rem, 6vw, 2.4rem);
    width: 90%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
  }
}

@media (min-width: 768px) {
  .poem-line {
    width: auto;
    font-size: clamp(1.1rem, 2.6vw, 1.8rem);
    &.center-left { top: 50%; left: 10%; transform: translateY(-50%); text-align: left; }
    &.center-right { top: 50%; right: 10%; transform: translateY(-50%); text-align: right; }
  }
}


.faint {
  opacity: 0.6;
  font-size: 0.4em;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  color: #3d5a3a;
}

.finale-3 {
  // Matched with finale-2
}

.smoke-text {
  color: #3d5a3a;
  font-weight: 400;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35em;
  letter-spacing: 0.05em;
}

.greeny-text {
  color: #3d5a3a;
  font-weight: 400;
}

@media (max-width: 768px) {
  .collection-nav {
    top: 1.5rem;
    right: 1.5rem;
    gap: 0.8rem;
    .collection-label { display: none; }
  }
  
  .gallery-section .gallery-header {
    margin-bottom: 4rem;
    .gallery-title {
      font-size: clamp(2.2rem, 10vw, 3.5rem);
      letter-spacing: 0.2em;
    }
  }
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
      margin-bottom: 8rem;
      
      .gallery-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: clamp(3.5rem, 8vw, 6rem);
        font-weight: 200;
        color: #3d5a3a;
        letter-spacing: 0.35em;
        line-height: 1.1;
        text-transform: uppercase;
        margin-bottom: 2rem;
      }
      
      .gallery-subtitle {
        font-family: 'Cormorant Garamond', serif;
        font-size: 0.85rem;
        color: #3d5a3a;
        letter-spacing: 0.8em;
        text-transform: uppercase;
        opacity: 0.6;
        font-weight: 300;
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
  background: #fdfaf6;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  .transport-line {
    width: 1px;
    height: 0;
    background: #3d5a3a;
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
  opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.collection-nav {
  position: fixed;
  top: 3.5rem;
  right: 4rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  z-index: 100;
  cursor: pointer;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  
  &:hover {
    transform: translateX(10px);
    .collection-label { 
      letter-spacing: 0.65em;
      opacity: 1;
    }
    .nav-logo {
      transform: rotate(90deg) scale(1.1);
    }
  }

  .nav-logo {
    width: 28px;
    height: 28px;
    object-fit: contain;
    transition: all 1s cubic-bezier(0.23, 1, 0.32, 1);
    filter: sepia(1) hue-rotate(70deg) saturate(1.5);
  }

  .collection-label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.8rem;
    font-weight: 300;
    letter-spacing: 0.5em;
    color: #3d5a3a;
    opacity: 0.8;
    text-transform: uppercase;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }
}
</style>
