import { onMounted, onUnmounted, watch, shallowRef } from 'vue'
import { Howl } from 'howler'
import { useAppStore } from '@/stores/appState'
import gsap from 'gsap'

export const useAudio = () => {
  const appStore = useAppStore()
  const ambientSound = shallowRef<Howl | null>(null)

  onMounted(() => {
    if (!process.client) return

    try {
      ambientSound.value = new Howl({
        src: ['https://actions.google.com/sounds/v1/ambiences/humming_waves.ogg'],
        loop: true,
        volume: 0,
        autoplay: true,
        onload: () => {
          if (ambientSound.value) {
            ambientSound.value.fade(0, 0.05, 3000)
          }
        },
        onloaderror: (id, error) => {
          console.warn('Audio load error:', error)
        }
      })
    } catch (e) {
      console.error('Howler initialization failed:', e)
    }
  })

  // Generative Whisper Mapping
  watch(() => appStore.introStep, (step) => {
    if (!ambientSound.value) return
    const sound = ambientSound.value
    
    // Volume maps to narrative tension
    const volMap = [0.05, 0.1, 0.15, 0.2, 0.18, 0.15, 0.12, 0.08, 0.05]
    const targetVol = volMap[step] || 0.05
    
    gsap.to(sound, {
      duration: 2,
      onUpdate: () => {
        // sound.volume() is a method, but we can't easily animate it with GSAP directly on the object
        // So we use a proxy or just fade
      }
    })
    
    sound.fade(sound.volume(), targetVol, 2000)
    
    // Pitch shift for "organic" feel
    const targetRate = 0.85 + (step * 0.03)
    sound.rate(targetRate)
  })

  onUnmounted(() => {
    if (ambientSound.value) {
      try {
        ambientSound.value.stop()
        ambientSound.value.unload()
      } catch (e) {
        // Ignore
      }
    }
  })

  return {
    ambientSound
  }
}
