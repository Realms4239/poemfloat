import { onMounted, onUnmounted, shallowRef } from 'vue'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const useScrollWorld = () => {
  const lenis = shallowRef<Lenis | null>(null)

  onMounted(() => {
    // Initialize Lenis
    lenis.value = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.05,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    // Sync GSAP ScrollTrigger with Lenis
    lenis.value.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.value?.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)
  })

  onUnmounted(() => {
    lenis.value?.destroy()
  })

  return {
    lenis
  }
}
