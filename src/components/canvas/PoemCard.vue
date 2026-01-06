<script setup lang="ts">
import { useRenderLoop } from '@tresjs/core'
import { shallowRef } from 'vue'
import type { Poem } from '@/core/domain/entities/Poem'

const props = defineProps<{
  poem: Poem
  index: number
}>()

const groupRef = shallowRef()

const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
  if (groupRef.value) {
    groupRef.value.position.y = Math.sin(elapsed + props.index) * 0.1
  }
})
</script>

<template>
  <TresGroup ref="groupRef" :position="[props.index * 15, 0, 0]">
    <LiquidText
      :text="props.poem.title"
      :color="props.poem.theme.secondaryColor"
      :size="0.6"
      :is-liquid="true"
      :glow="props.poem.slug === 'moonlight-path'"
      :wobble="props.poem.slug === 'green-pulse'"
    />

    <TresGroup :position="[0, -1.5, 0]">
      <LiquidText
        :text="props.poem.content.join('\n')"
        :color="props.poem.theme.secondaryColor"
        :size="0.25"
        :max-width="8"
        :line-height="1.5"
        :glow="props.poem.slug === 'moonlight-path'"
      />
    </TresGroup>
  </TresGroup>
</template>
