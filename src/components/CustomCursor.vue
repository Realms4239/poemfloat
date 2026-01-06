<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMouse, useWindowSize } from '@vueuse/core'
import gsap from 'gsap'

const { x, y } = useMouse()
const { width, height } = useWindowSize()

const cursorRef = ref<HTMLElement | null>(null)
const followerRef = ref<HTMLElement | null>(null)

const isHovering = ref(false)
const isClicking = ref(false)

let ctx: gsap.Context

onMounted(() => {
  ctx = gsap.context(() => {
    const pos = { x: 0, y: 0 }
    const mouse = { x: 0, y: 0 }
    // Elastic physics settings
    const speed = 0.18
    const spring = 0.1

    const xSet = gsap.quickSetter(followerRef.value, "x", "px")
    const ySet = gsap.quickSetter(followerRef.value, "y", "px")
    const rSet = gsap.quickSetter(followerRef.value, "rotation", "deg")
    const sXSet = gsap.quickSetter(followerRef.value, "scaleX")
    const sYSet = gsap.quickSetter(followerRef.value, "scaleY")

    gsap.ticker.add(() => {
      const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio())
      
      // Update position with lag for elastic feel
      pos.x += (x.value - pos.x) * dt
      pos.y += (y.value - pos.y) * dt
      
      const dx = x.value - pos.x
      const dy = y.value - pos.y
      const vel = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      
      // Mercury-like stretching based on velocity
      const stretch = Math.min(vel / 120, 0.6)
      const targetScaleX = isHovering.value ? 2.8 : (1 + stretch)
      const targetScaleY = isHovering.value ? 2.8 : (1 - stretch * 0.5)
      
      xSet(pos.x)
      ySet(pos.y)
      rSet(angle)
      sXSet(targetScaleX)
      sYSet(targetScaleY)
      
      // Main center dot
      gsap.set(cursorRef.value, { x: x.value, y: y.value })
    })

    const onMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const interactive = target.closest('a, button, .collection-nav, .poem-miniature, .nav-logo, [role="button"]')
      
      if (interactive) {
        isHovering.value = true
        gsap.to(followerRef.value, {
          backgroundColor: 'rgba(78, 161, 74, 0.12)',
          borderColor: 'rgba(78, 161, 74, 0.6)',
          borderWidth: '2px',
          duration: 0.4,
          ease: 'expo.out'
        })
        gsap.to(cursorRef.value, {
          scale: 0.4,
          backgroundColor: '#4ea14a',
          duration: 0.4,
          ease: 'expo.out'
        })
      }
    }

    const onMouseLeave = () => {
      isHovering.value = false
      gsap.to(followerRef.value, {
        backgroundColor: 'transparent',
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderWidth: '1px',
        duration: 0.4,
        ease: 'power2.out'
      })
      gsap.to(cursorRef.value, {
        scale: 1,
        backgroundColor: '#fff',
        duration: 0.4,
        ease: 'power2.out'
      })
    }

    window.addEventListener('mouseover', onMouseEnter)
    window.addEventListener('mouseout', onMouseLeave)
    window.addEventListener('mousedown', () => {
      isClicking.value = true
      gsap.to([cursorRef.value, followerRef.value], { scale: 0.8, duration: 0.2 })
    })
    window.addEventListener('mouseup', () => {
      isClicking.value = false
      gsap.to([cursorRef.value, followerRef.value], { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.3)' })
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
