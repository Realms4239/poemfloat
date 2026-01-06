<script setup lang="ts">
import { useRenderLoop, useTresContext } from '@tresjs/core'
import { Color, ShaderMaterial, DoubleSide, FogExp2, Vector3 } from 'three'
import { shallowRef, unref, watch, computed } from 'vue'
import meltingVert from '@/assets/shaders/background/melting.vert'
import meltingFrag from '@/assets/shaders/background/melting.frag'
import tailVert from '@/assets/shaders/background/tail.vert'
import tailFrag from '@/assets/shaders/background/tail.frag'
import GalleryScene from '@/components/canvas/GalleryScene.vue'
import { useAppStore } from '@/stores/appState'
import { useMouse } from '@vueuse/core'
import gsap from 'gsap'

const appStore = useAppStore()
const { onLoop } = useRenderLoop()
const { x, y } = useMouse()

const mouseParallax = computed(() => {
  if (typeof window === 'undefined') return { x: 0, y: 0 }
  const mx = x.value || 0
  const my = y.value || 0
  return {
    x: (mx / window.innerWidth - 0.5) * 0.4,
    y: -(my / window.innerHeight - 0.5) * 0.4
  }
})

const context = useTresContext()
const sceneRef = shallowRef<any>(null)
const fogRef = shallowRef<FogExp2 | null>(null)
const materialRef = shallowRef<ShaderMaterial>()
const tailMaterialRef = shallowRef<ShaderMaterial>()

if (context && context.scene) {
  watch(() => {
    try {
      return unref(context.scene)
    } catch (e) {
      return null
    }
  }, (newScene) => {
    if (newScene && !fogRef.value) {
      const fog = new FogExp2('#fdfaf6', 0.015)
      newScene.fog = fog
      fogRef.value = fog
      sceneRef.value = newScene
    }
  }, { immediate: true })
}

const colors = {
  cream: ['#fdfaf6', '#f5f0e6', '#e8e4d8', '#faf8f2'],
  green: ['#1a3c1a', '#2d5a27', '#3d5a3a', '#4ea14a'],
  black: ['#030303', '#080808', '#0d0d0d', '#121212'],
  elegant: ['#fdfaf6', '#f5f5f0', '#f0f0e8', '#f8f8f2'] // Even cleaner elegant palette
}

const uniforms = {
  uTime: { value: 0 },
  uColorA: { value: new Color(colors.cream[0]) },
  uColorB: { value: new Color(colors.cream[1]) },
  uColorC: { value: new Color(colors.cream[2]) },
  uColorD: { value: new Color(colors.cream[3]) },
  uTurbulence: { value: 0.12 },
  uBrightness: { value: 1.0 }
}

const tailUniforms = {
  uTime: { value: 0 },
  uOpacity: { value: 0 }
}

onLoop(({ delta }) => {
  if (materialRef.value?.uniforms?.uTime) {
    materialRef.value.uniforms.uTime.value += delta * 0.6 // Slower, more elegant motion
  }
  
  if (tailMaterialRef.value?.uniforms?.uTime) {
    tailMaterialRef.value.uniforms.uTime.value += delta
  }
})

// REFINED TRANSITION LOGIC
watch(() => appStore.introStep, (step) => {
  const u = materialRef.value?.uniforms
  if (!u) return
  
  let targetColors = colors.cream
  let targetTurbulence = 0.12
  let targetFogDensity = 0.015
  let targetFogColor = '#fdfaf6'
  
    // TAIL FADE LOGIC - Explicitly handles forward and backward
    if (step === 3) {
      if (tailMaterialRef.value) {
        gsap.to(tailMaterialRef.value.uniforms.uOpacity, { value: 1.0, duration: 1.2, ease: 'power2.out', overwrite: true })
      }
    } else {
        if (tailMaterialRef.value) {
          // Smoother fade-out for the tail to avoid abrupt ending
          const fadeOutDuration = (step === 4 || step === 2) ? 2.5 : 0.8
          gsap.to(tailMaterialRef.value.uniforms.uOpacity, { value: 0, duration: fadeOutDuration, ease: 'sine.inOut', overwrite: true })
        }

    }

  if (step === 0) {
    targetColors = colors.cream
    targetTurbulence = 0.12
    targetFogDensity = 0.015
  } else if (step === 1) {
    targetColors = colors.green
    targetTurbulence = 0.2
    targetFogDensity = 0.03
    targetFogColor = '#1a3c1a'
  } else if (step >= 2 && step <= 6) {
    targetColors = colors.black
    targetTurbulence = 0.25
    targetFogDensity = 0.08
    targetFogColor = '#030303'
  } else if (step === 7) {
    targetColors = colors.elegant
    targetTurbulence = 0.05
    targetFogDensity = 0.008
    targetFogColor = '#fdfaf6'
    
    // THE BUMP - Camera shake/flash simulation via uniforms
    gsap.to(u.uTurbulence, { 
      value: 0.8, 
      duration: 0.1, 
      yoyo: true, 
      repeat: 1, 
      ease: 'power4.out' 
    })
    
    gsap.fromTo(u.uBrightness, { value: 1.8 }, { 
      value: 1.0, 
      duration: 1.0, 
      ease: 'expo.out' 
    })
    
    triggerExplosion()
  } else if (step >= 8) {
    targetColors = colors.elegant
    targetTurbulence = 0.08
    targetFogDensity = 0.012
    targetFogColor = '#fdfaf6'
  }
  
    const animateColor = (uniform: any, targetHex: string, duration = 2.0) => {
      if (!uniform?.value) return
      const target = new Color(targetHex)
      gsap.to(uniform.value, {
        r: target.r, g: target.g, b: target.b,
        duration: duration, ease: 'power2.inOut'
      })
    }

      const transitionDuration = step === 7 ? 0.7 : 2.0

    animateColor(u.uColorA, targetColors[0], transitionDuration)
    animateColor(u.uColorB, targetColors[1], transitionDuration)
    animateColor(u.uColorC, targetColors[2], transitionDuration)
    animateColor(u.uColorD, targetColors[3], transitionDuration)
    
    gsap.to(u.uTurbulence, { value: targetTurbulence, duration: transitionDuration, ease: 'power2.inOut' })
    
    if (fogRef.value) {
      gsap.to(fogRef.value, { density: targetFogDensity, duration: transitionDuration, ease: 'power2.inOut' })
      const fogColor = new Color(targetFogColor)
      gsap.to(fogRef.value.color, { 
        r: fogColor.r, g: fogColor.g, b: fogColor.b, 
        duration: transitionDuration, ease: 'power2.inOut' 
      })
    }
})

// Particle System Logic
const particleCount = 4000
const particlePositions = new Float32Array(particleCount * 3)
const particleVelocities = new Float32Array(particleCount * 3)

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 10
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6
  
  particleVelocities[i * 3] = 0
  particleVelocities[i * 3 + 1] = 0
  particleVelocities[i * 3 + 2] = 0
}

const pointsRef = shallowRef<any>(null)
let explosionTriggered = false
let particleOpacity = { value: 0 }

function triggerExplosion() {
  if (explosionTriggered) return
  explosionTriggered = true
  
  if (pointsRef.value) {
    const positions = pointsRef.value.geometry.attributes.position.array
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2
      
      const angle = Math.random() * Math.PI * 2
      const upAngle = Math.random() * Math.PI * 0.3
      const speed = 0.003 + Math.random() * 0.02
      
      particleVelocities[i * 3] = Math.cos(angle) * Math.sin(upAngle) * speed
      particleVelocities[i * 3 + 1] = Math.cos(upAngle) * speed + 0.005
      particleVelocities[i * 3 + 2] = -Math.random() * 0.02
    }
    pointsRef.value.geometry.attributes.position.needsUpdate = true
  }
  
  gsap.to(particleOpacity, {
    value: 0.8, 
    duration: 2.0,
    ease: 'expo.out',
    onUpdate: () => {
      if (pointsRef.value?.material) {
        pointsRef.value.material.opacity = particleOpacity.value
      }
    }
  })
}

onLoop(({ delta }) => {
  if (pointsRef.value && explosionTriggered) {
    const geometry = pointsRef.value.geometry
    if (!geometry?.attributes?.position) return
    
    const positions = geometry.attributes.position.array
    const time = Date.now() * 0.0008
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += particleVelocities[i * 3]
      positions[i * 3 + 1] += particleVelocities[i * 3 + 1]
      positions[i * 3 + 2] += particleVelocities[i * 3 + 2]
      
      particleVelocities[i * 3] *= 0.998
      particleVelocities[i * 3 + 1] *= 0.998
      
      positions[i * 3] += Math.sin(time * 2 + i * 0.1) * 0.001
      positions[i * 3 + 1] += Math.cos(time * 1.5 + i * 0.1) * 0.0005
    }
    geometry.attributes.position.needsUpdate = true
  }
})

const showGallery = computed(() => appStore.introStep >= 8 && appStore.isReady)
const showParticles = computed(() => appStore.introStep >= 7)
</script>

<template>
  <TresGroup :position="[mouseParallax.x, mouseParallax.y, 0]">
    <TresMesh :scale="[60, 60, 1]" :position="[0, 0, -8]">
      <TresPlaneGeometry :args="[1, 1]" />
      <TresShaderMaterial
        ref="materialRef"
        :vertex-shader="meltingVert"
        :fragment-shader="meltingFrag"
        :uniforms="uniforms"
        :side="DoubleSide"
      />
    </TresMesh>

    <TresMesh :position="[0, 1.8, -4]" :scale="[15, 8, 1]">
      <TresPlaneGeometry :args="[1, 1]" />
      <TresShaderMaterial
        ref="tailMaterialRef"
        :vertex-shader="tailVert"
        :fragment-shader="tailFrag"
        :uniforms="tailUniforms"
        :transparent="true"
        :depth-write="false"
        :blending="2" 
      />
    </TresMesh>

    <TresAmbientLight :intensity="1.2" />
    <TresDirectionalLight :position="[5, 5, 5]" :intensity="1.0" />

    <TresPoints v-if="showParticles" ref="pointsRef">
      <TresBufferGeometry>
        <TresBufferAttribute
          name="position"
          :args="[particlePositions, 3]"
        />
      </TresBufferGeometry>
      <TresPointsMaterial 
        :size="0.08" 
        :transparent="true" 
        :opacity="0" 
        color="#3d5a3a" 
        :depth-write="false"
        :blending="2"
        :size-attenuation="true"
      />
    </TresPoints>

    <GalleryScene v-if="showGallery" />
  </TresGroup>
</template>
