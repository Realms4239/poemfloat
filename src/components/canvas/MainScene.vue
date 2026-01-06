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
    x: (mx / window.innerWidth - 0.5) * 0.5,
    y: -(my / window.innerHeight - 0.5) * 0.5
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
      const fog = new FogExp2('#fdfaf6', 0.02)
      newScene.fog = fog
      fogRef.value = fog
      sceneRef.value = newScene
    }
  }, { immediate: true })
}

const colors = {
  cream: ['#fdfaf6', '#f5f0e6', '#e8e4d8', '#fce8e0'],
  green: ['#1a3c1a', '#2d5a27', '#3d7a38', '#4ea14a'],
  black: ['#050505', '#0a0a0a', '#0f0f0f', '#151515'],
  elegant: ['#f8f5f0', '#e0ddd5', '#d5e0d5', '#f0e8e0'] // More depth, less "flat white"
}

const uniforms = {
  uTime: { value: 0 },
  uColorA: { value: new Color(colors.cream[0]) },
  uColorB: { value: new Color(colors.cream[1]) },
  uColorC: { value: new Color(colors.cream[2]) },
  uColorD: { value: new Color(colors.cream[3]) },
  uTurbulence: { value: 0.15 },
  uBrightness: { value: 1.0 } // New uniform for the bump flash
}

const tailUniforms = {
  uTime: { value: 0 },
  uOpacity: { value: 0 }
}

onLoop(({ delta }) => {
  if (materialRef.value?.uniforms?.uTime) {
    materialRef.value.uniforms.uTime.value += delta * 0.8
  }
  
  if (tailMaterialRef.value?.uniforms?.uTime) {
    tailMaterialRef.value.uniforms.uTime.value += delta
  }
})

// Transition logic
watch(() => appStore.introStep, (step) => {
  const u = materialRef.value?.uniforms
  if (!u) return
  
  let targetColors = colors.cream
  let targetTurbulence = 0.15
  let targetFogDensity = 0.02
  let targetFogColor = '#fdfaf6'
  
  if (step === 0) {
    targetColors = colors.cream
    targetTurbulence = 0.15
    targetFogDensity = 0.02
  } else if (step === 1) {
    targetColors = colors.green
    targetTurbulence = 0.25
    targetFogDensity = 0.04
    targetFogColor = '#1a3c1a'
  } else if (step === 2) {
    targetColors = colors.black
    targetTurbulence = 0.35
    targetFogDensity = 0.12
    targetFogColor = '#050505'
  } else if (step === 3) {
    targetColors = colors.black
    targetTurbulence = 0.2
    targetFogDensity = 0.1
    targetFogColor = '#050505'
    if (tailMaterialRef.value) {
      gsap.to(tailMaterialRef.value.uniforms.uOpacity, { value: 1.0, duration: 1.5 })
    }
  } else if (step >= 4 && step <= 6) {
    targetColors = colors.black
    targetTurbulence = 0.3
    targetFogDensity = 0.15
    targetFogColor = '#050505'
    if (tailMaterialRef.value) {
      gsap.to(tailMaterialRef.value.uniforms.uOpacity, { value: 0, duration: 1.0 })
    }
  } else if (step === 7) {
    targetColors = colors.elegant
    targetTurbulence = 0.08
    targetFogDensity = 0.01
    targetFogColor = '#f8f5f0'
    
    // THE BUMP - Camera shake/flash simulation via uniforms
    gsap.to(u.uTurbulence, { 
      value: 1.2, 
      duration: 0.12, 
      yoyo: true, 
      repeat: 1, 
      ease: 'power4.out' 
    })
    
    // Brief brightness flash
    gsap.fromTo(u.uBrightness, { value: 2.0 }, { 
      value: 1.0, 
      duration: 0.6, 
      ease: 'power2.out' 
    })
    
    triggerExplosion()
  } else if (step >= 8) {
    targetColors = colors.elegant
    targetTurbulence = 0.12
    targetFogDensity = 0.02
    targetFogColor = '#f8f5f0'
  }
  
  const animateColor = (uniform: any, targetHex: string) => {
    if (!uniform?.value) return
    const target = new Color(targetHex)
    gsap.to(uniform.value, {
      r: target.r, g: target.g, b: target.b,
      duration: 2.5, ease: 'power2.inOut'
    })
  }

  animateColor(u.uColorA, targetColors[0])
  animateColor(u.uColorB, targetColors[1])
  animateColor(u.uColorC, targetColors[2])
  animateColor(u.uColorD, targetColors[3])
  
  gsap.to(u.uTurbulence, { value: targetTurbulence, duration: 2.5, ease: 'power2.inOut' })
  
  if (fogRef.value) {
    gsap.to(fogRef.value, { density: targetFogDensity, duration: 2.5, ease: 'power2.inOut' })
    const fogColor = new Color(targetFogColor)
    gsap.to(fogRef.value.color, { 
      r: fogColor.r, g: fogColor.g, b: fogColor.b, 
      duration: 2.5, ease: 'power2.inOut' 
    })
  }
})

// Particle System Logic
const particleCount = 2000
const particlePositions = new Float32Array(particleCount * 3)
const particleVelocities = new Float32Array(particleCount * 3)
const particleAlphas = new Float32Array(particleCount)

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 2
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2
  
  particleVelocities[i * 3] = (Math.random() - 0.5) * 0.05
  particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05
  particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05
  
  particleAlphas[i] = 0
}

const pointsRef = shallowRef<any>(null)
let explosionTriggered = false

function triggerExplosion() {
  if (explosionTriggered) return
  explosionTriggered = true
  
  if (pointsRef.value) {
    const positions = pointsRef.value.geometry.attributes.position.array
    for (let i = 0; i < particleCount; i++) {
      // Spawn in a wide horizontal area matching the hero text
      positions[i * 3] = (Math.random() - 0.5) * 12
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5 - 0.5 // Slightly below center
      positions[i * 3 + 2] = 0
      
      // Directed drift: Upwards and towards the depth
      const angle = (Math.random() - 0.5) * Math.PI * 0.2 // Upward cone
      const speed = 0.02 + Math.random() * 0.08
      particleVelocities[i * 3] = Math.sin(angle) * speed * 0.5
      particleVelocities[i * 3 + 1] = Math.cos(angle) * speed + 0.01 // Stronger upward
      particleVelocities[i * 3 + 2] = -Math.random() * 0.1 // Drift into distance
    }
  }
  
  gsap.to(particleAlphas, {
    0: 1, 
    duration: 0.8,
    ease: 'power2.out',
    onUpdate: () => {
      if (pointsRef.value) pointsRef.value.material.opacity = particleAlphas[0]
    }
  })
}

onLoop(({ delta }) => {
  if (pointsRef.value && appStore.introStep >= 7) {
    const geometry = pointsRef.value.geometry
    if (!geometry?.attributes?.position) return
    
    const positions = geometry.attributes.position.array
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += particleVelocities[i * 3]
      positions[i * 3 + 1] += particleVelocities[i * 3 + 1]
      positions[i * 3 + 2] += particleVelocities[i * 3 + 2]
      
      // Gentle air resistance
      particleVelocities[i * 3] *= 0.99
      particleVelocities[i * 3 + 1] *= 0.99
      particleVelocities[i * 3 + 2] *= 0.99
      
      // Adding a bit of "drift" and "shimmer"
      positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.002
    }
    geometry.attributes.position.needsUpdate = true
    pointsRef.value.rotation.y += delta * 0.05
    pointsRef.value.rotation.z += delta * 0.02
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

    <TresMesh :scale="[80, 80, 1]" :position="[0, 0, -12]" :rotation="[0, 0, 0.5]">
      <TresPlaneGeometry :args="[1, 1]" />
      <TresShaderMaterial
        :vertex-shader="meltingVert"
        :fragment-shader="meltingFrag"
        :uniforms="uniforms"
        :transparent="true"
        :opacity="0.3"
        :side="DoubleSide"
      />
    </TresMesh>

    <TresMesh :position="[0, 1.5, -4]" :scale="[15, 8, 1]">
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

    <TresAmbientLight :intensity="1.0" />
    <TresDirectionalLight :position="[5, 5, 5]" :intensity="0.8" />

    <TresPoints v-if="showParticles" ref="pointsRef">
      <TresBufferGeometry>
        <TresBufferAttribute
          name="position"
          :args="[particlePositions, 3]"
        />
      </TresBufferGeometry>
      <TresPointsMaterial 
        :size="0.06" 
        :transparent="true" 
        :opacity="0" 
        color="#4ea14a" 
        :depth-write="false"
        :blending="2"
      />
    </TresPoints>

    <GalleryScene v-if="showGallery" />
  </TresGroup>
</template>
