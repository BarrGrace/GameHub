import { useCallback, useEffect, useRef } from 'react'

const SOUND_FILES = [
  'move',
  'wrong-move',
  'win',
  'lost',
  'draw',
  'wordle-success-cell',
  'wordle-wrong-location-cell',
]

export function useSound() {
  const cacheRef = useRef<Record<string, HTMLAudioElement>>({})

  useEffect(() => {
    SOUND_FILES.forEach((name) => {
      if (!cacheRef.current[name]) {
        const audio = new Audio(`/sounds/${name}.wav`)
        audio.preload = 'auto'
        cacheRef.current[name] = audio
      }
    })
  }, [])

  const play = useCallback((name: string, volume = 0.5) => {
    let audio = cacheRef.current[name]
    if (!audio) {
      audio = new Audio(`/sounds/${name}.wav`)
      cacheRef.current[name] = audio
    }
    audio.volume = volume
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [])

  return { play }
}