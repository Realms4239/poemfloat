<script setup lang="ts">
import { useRenderLoop } from '@tresjs/core'
import { shallowRef, onMounted, onUnmounted, watch } from 'vue'
import { Text } from 'troika-three-text'
import { ShaderMaterial, Color, DoubleSide } from 'three'

const props = defineProps<{
  text: string
  color?: string
  size?: number
  maxWidth?: number
  font?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  lineHeight?: number
  isLiquid?: boolean
  wobble?: boolean
  glow?: boolean
}>()

const textRef = shallowRef()
let textInstance: any = null
let material: ShaderMaterial | null = null

const { onLoop } = useRenderLoop()

onMounted(() => {
  textInstance = new Text()
  material = new ShaderMaterial({
    transparent: true,
    side: DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(props.color || '#1a1a1a') },
      uLiquid: { value: props.isLiquid ? 1.0 : 0.0 },
      uWobble: { value: props.wobble ? 1.0 : 0.0 },
      uGlow: { value: props.glow ? 1.0 : 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uLiquid;
      uniform float uWobble;
      
      void main() {
        vUv = uv;
        vec3 pos = position;
        
        if (uLiquid > 0.5) {
          float distortion = sin(pos.x * 2.0 + uTime * 2.0) * 0.05;
          distortion += cos(pos.y * 3.0 + uTime * 1.5) * 0.03;
          pos.x += distortion;
          pos.y += distortion * 0.5;
        }

        if (uWobble > 0.5) {
          pos.y += sin(pos.x * 5.0 + uTime * 3.0) * 0.02;
          pos.z += cos(pos.y * 4.0 + uTime * 2.5) * 0.02;
        }
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uLiquid;
      uniform float uGlow;
      
      void main() {
        float alpha = 1.0;
        vec3 finalColor = uColor;

        if (uLiquid > 0.5) {
          alpha = 0.8 + 0.2 * sin(vUv.x * 10.0 + uTime);
        }

        if (uGlow > 0.5) {
          float glow = 0.5 + 0.5 * sin(uTime * 2.0);
          finalColor += vec3(1.0, 1.0, 1.0) * glow * 0.2;
        }
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `
  })

  textInstance.text = props.text
  textInstance.fontSize = props.size || 0.5
  textInstance.maxWidth = props.maxWidth || 10
  textInstance.textAlign = props.textAlign || 'left'
  textInstance.lineHeight = props.lineHeight || 1.2
  textInstance.material = material
  
  textInstance.sync(() => {
    if (textRef.value) {
      textRef.value.add(textInstance)
    }
  })
})

onLoop(({ delta }) => {
  if (material?.uniforms?.uTime) {
    material.uniforms.uTime.value += delta
  }
})

watch(() => props.text, (newText) => {
  if (textInstance) {
    textInstance.text = newText
    textInstance.sync()
  }
})

onUnmounted(() => {
  if (textInstance) textInstance.dispose()
  if (material) material.dispose()
})
</script>

<template>
  <TresGroup ref="textRef" />
</template>
