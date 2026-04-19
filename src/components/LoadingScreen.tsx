import { useProgress } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/LoadingScreen.module.css'

interface Props {
  onLoaded: () => void
}

export function LoadingScreen({ onLoaded }: Props) {
  const { progress, total } = useProgress()
  const [fakeProgress, setFakeProgress] = useState(0)
  const [hidden, setHidden] = useState(false)
  // Wait up to 800ms to see if real assets appear before starting fake progress
  const [fakeEnabled, setFakeEnabled] = useState(false)

  const displayProgress = total > 0 ? progress : (fakeEnabled ? fakeProgress : 0)

  // Delay fake progress start — give R3F canvases time to queue real assets
  useEffect(() => {
    const t = setTimeout(() => setFakeEnabled(true), 600)
    return () => clearTimeout(t)
  }, [])

  // Fake progress fallback when no real assets are detected
  useEffect(() => {
    if (!fakeEnabled || total > 0) return
    const start = performance.now()
    const duration = 1800
    let rafId: number
    const tick = () => {
      const elapsed = performance.now() - start
      const p = Math.min((elapsed / duration) * 100, 100)
      setFakeProgress(p)
      if (p < 100) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [fakeEnabled, total])

  // After assets are loaded (progress 100%), wait for models to actually render
  const completedRef = useRef(false)
  useEffect(() => {
    if (displayProgress < 100 || completedRef.current) return
    completedRef.current = true
    // 800ms grace period — lets the canvas paint a few animation frames
    const t = setTimeout(() => {
      setHidden(true)
      onLoaded()
    }, 800)
    return () => clearTimeout(t)
  }, [displayProgress, onLoaded])

  return (
    <div className={`${styles.overlay}${hidden ? ` ${styles.hidden}` : ''}`}>
      <p className={styles.title}>Loading</p>
      <div className={styles.barWrap}>
        <div className={styles.bar} style={{ width: `${displayProgress}%` }} />
      </div>
      <span className={styles.percent}>{Math.round(displayProgress)}%</span>
    </div>
  )
}
