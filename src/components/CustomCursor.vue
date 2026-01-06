<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useMouse, useWindowSize, useScroll } from '@vueuse/core'
import gsap from 'gsap'

const { x, y } = useMouse({ type: 'client' })
const { y: scrollY } = useScroll(window)
const { width, height } = useWindowSize()

const lastScrollY = ref(0)
const cursorRef = ref<HTMLElement | null>(null)
const followerRef = ref<HTMLElement | null>(null)

const isHovering = ref(false)
const isClicking = ref(false)

let ctx: gsap.Context

onMounted(() => {
  ctx = gsap.context(() => {
    const pos = { x: 0, y: 0 }
    // Elastic physics settings
    const speed = 0.18

    // We'll set these up inside the ticker if refs exist
    let xSet: Function, ySet: Function, rSet: Function, sXSet: Function, sYSet: Function

    gsap.ticker.add(() => {
      if (!followerRef.value || !cursorRef.value) return

      if (!xSet) {
        pos.x = x.value
        pos.y = y.value
        xSet = gsap.quickSetter(followerRef.value, "x", "px")
        ySet = gsap.quickSetter(followerRef.value, "y", "px")
        rSet = gsap.quickSetter(followerRef.value, "rotation", "deg")
        sXSet = gsap.quickSetter(followerRef.value, "scaleX")
        sYSet = gsap.quickSetter(followerRef.value, "scaleY")
      }

      // Smooth lag
      const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio())
      pos.x += (x.value - pos.x) * dt
      pos.y += (y.value - pos.y) * dt
      
      const dx = x.value - pos.x
      const dy = y.value - pos.y
      const vel = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      
      // TAIL FIX: Reduce stretch if velocity is artificially high or if scrolling
      // We also cap the stretch more aggressively to prevent "permanent" tails
        const isScrolling = Math.abs(scrollY.value - (lastScrollY.value || 0)) > 2
        const stretchLimit = isScrolling ? 0.1 : 0.5
        const stretch = Math.min(vel / 150, stretchLimit)
        
          const targetScaleX = isHovering.value ? 1.08 : (1 + stretch)
          const targetScaleY = isHovering.value ? 1.08 : (1 - stretch * 0.4)
        
        xSet(pos.x)
      ySet(pos.y)
      rSet(angle)
      sXSet(targetScaleX)
      sYSet(targetScaleY)
      
      if (cursorRef.value) {
        gsap.set(cursorRef.value, { x: x.value, y: y.value })
      }
      
      lastScrollY.value = scrollY.value
    })

    const onMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const interactive = target.closest('a, button, .collection-nav, .poem-miniature, .nav-logo, [role="button"]')
      
        if (interactive && followerRef.value && cursorRef.value) {
          isHovering.value = true
          gsap.to(followerRef.value, {
            backgroundColor: 'rgba(61, 90, 58, 0.15)',
            borderColor: 'rgba(61, 90, 58, 0.7)',
            borderWidth: '2px',
            duration: 0.4,
            ease: 'expo.out'
          })
          gsap.to(cursorRef.value, {
            scale: 0.4,
            backgroundColor: '#3d5a3a',
            duration: 0.4,
            ease: 'expo.out'
          })
        }
      }

      const onMouseLeave = () => {
        isHovering.value = false
        if (followerRef.value && cursorRef.value) {
          gsap.to(followerRef.value, {
            backgroundColor: 'transparent',
            borderColor: 'rgba(253, 250, 246, 0.4)',
            borderWidth: '1px',
            duration: 0.4,
            ease: 'power2.out'
          })
          gsap.to(cursorRef.value, {
            scale: 1,
            backgroundColor: '#fdfaf6',
            duration: 0.4,
            ease: 'power2.out'
          })
        }
      }


    window.addEventListener('mouseover', onMouseEnter)
    window.addEventListener('mouseout', onMouseLeave)
    window.addEventListener('mousedown', () => {
      isClicking.value = true
      if (cursorRef.value && followerRef.value) {
        gsap.to([cursorRef.value, followerRef.value], { scale: 0.8, duration: 0.2 })
      }
    })
    window.addEventListener('mouseup', () => {
      isClicking.value = false
      if (cursorRef.value && followerRef.value) {
        gsap.to([cursorRef.value, followerRef.value], { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.3)' })
      }
    })
  })
})

onUnmounted(() => {
  if (ctx) ctx.revert()
})
</script>

<template>
  <div class="custom-cursor-container">
    <div ref="followerRef" class="cursor-follower"></div>
    <div ref="cursorRef" class="cursor-main"></div>
  </div>
</template>

<style lang="scss" scoped>
.custom-cursor-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}

.cursor-main {
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  mix-blend-mode: difference;
  will-change: transform, background-color;
}

.cursor-follower {
  position: absolute;
  top: 0;
  left: 0;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  mix-blend-mode: difference;
  pointer-events: none;
  will-change: transform, background-color, border-color, border-width;
}
</style>
