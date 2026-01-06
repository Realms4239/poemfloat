<script setup lang="ts">
import { 
  BloomPmndrs, 
  NoisePmndrs, 
  ChromaticAberrationPmndrs, 
  VignettePmndrs, 
  EffectComposerPmndrs 
} from '@tresjs/post-processing'
</script>

<template>
  <Suspense>
    <EffectComposerPmndrs :multisampling="4">
      <BloomPmndrs 
        :intensity="1.5"
        :luminance-threshold="0.2"
        :luminance-smoothing="0.9"
        :mipmap-blur="true"
      />
      <ChromaticAberrationPmndrs 
        :offset="[0.0015, 0.0015]" 
      />
      <NoisePmndrs 
        :opacity="0.04"
        :premultiply="true"
      />
      <VignettePmndrs 
        :offset="0.3"
        :darkness="0.5"
      />
    </EffectComposerPmndrs>
  </Suspense>
</template>
