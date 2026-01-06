<script setup lang="ts">
import { onMounted, ref } from 'vue'
import gsap from 'gsap'

const props = defineProps<{
  text: string
  active: boolean
  delay?: number
}>()

const containerRef = ref<HTMLElement | null>(null)
const chars = props.text.split('')

onMounted(() => {
  if (containerRef.value) {
    gsap.set(containerRef.value.querySelectorAll('.char'), {
      opacity: 0,
      filter: 'blur(15px)',
      scale: 1.5,
      y: 10
    })
  }
})

watch(() => props.active, (isActive) => {
  if (isActive && containerRef.value) {
    const charElements = containerRef.value.querySelectorAll('.char')
    gsap.to(charElements, {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.03,
      ease: 'power3.out',
      delay: props.delay || 0
    })
  } else if (!isActive && containerRef.value) {
    const charElements = containerRef.value.querySelectorAll('.char')
    gsap.to(charElements, {
      opacity: 0,
      filter: 'blur(10px)',
      y: -10,
      duration: 0.8,
      stagger: 0.01,
      ease: 'power2.in'
    })
  }
})
</script>

<template>
  <div ref="containerRef" class="bleeding-text">
    <span 
      v-for="(char, i) in chars" 
      :key="i" 
      class="char"
      :class="{ 'space': char === ' ' }"
    >
      {{ char === ' ' ? '\u00A0' : char }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.bleeding-text {
  display: inline-flex;
  flex-wrap: wrap;
  white-space: pre-wrap;
}

.char {
  display: inline-block;
  will-change: transform, filter, opacity;
  
  &.space {
    width: 0.3em;
  }
}
</style>
