<script setup lang="ts">
import { useRenderLoop } from '@tresjs/core'
import { 
  CatmullRomCurve3, 
  Vector3, 
  ShaderMaterial, 
  DoubleSide,
  Color
} from 'three'
import { shallowRef, watch } from 'vue'
import { useAppStore } from '@/stores/appState'
import gsap from 'gsap'

const appStore = useAppStore()

const materialRef = shallowRef<ShaderMaterial>()

const points = [
  new Vector3(-4, 0, 0),
  new Vector3(-2, 0.8, -1),
  new Vector3(0, 0, 0),
  new Vector3(2, -0.8, 1),
  new Vector3(4, 0, 0)
]
const curve = new CatmullRomCurve3(points)

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Wave movement
    float wave = sin(uv.x * 5.0 + uTime * 2.0) * 0.1;
    pos.y += wave;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  uniform float uProgress;
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uBaseColor;
  varying vec2 vUv;
  
  void main() {
    // Elegant filling with a soft edge
    float edge = 0.05;
    float fill = smoothstep(uProgress - edge, uProgress, vUv.x);
    
    // Glowing line effect
    float line = smoothstep(0.1, 0.0, abs(vUv.y - 0.5));
    
    vec3 color = mix(uColor, uBaseColor, fill);
    float alpha = mix(1.0, 0.3, fill) * line;
    
    // Suble pulse
    float pulse = sin(uTime * 3.0) * 0.1 + 0.9;
    
    gl_FragColor = vec4(color, alpha * pulse);
  }
`

const uniforms = {
  uProgress: { value: 0 },
  uTime: { value: 0 },
  uColor: { value: new Color('#FFD700') },
  uBaseColor: { value: new Color('#ffffff') }
}

watch(() => appStore.loadingProgress, (progress) => {
  if (typeof progress !== 'number') return
  const material = materialRef.value
  if (material?.uniforms?.uProgress) {
    gsap.to(material.uniforms.uProgress, {
      value: progress,
      duration: 0.8,
      ease: 'power2.out'
    })
  }
})

const { onLoop } = useRenderLoop()

onLoop(({ delta }) => {
  if (materialRef.value?.uniforms?.uTime) {
    materialRef.value.uniforms.uTime.value += delta
  }
})
</script>

<template>
  <TresMesh :position="[0, 0, -1]" :rotation="[0, 0, 0.1]">
    <TresTubeGeometry :args="[curve, 128, 0.015, 8, false]" />
    <TresShaderMaterial
      ref="materialRef"
      :vertex-shader="vertexShader"
      :fragment-shader="fragmentShader"
      :uniforms="uniforms"
      :transparent="true"
      :side="DoubleSide"
      :depth-test="false"
    />
  </TresMesh>
</template>
