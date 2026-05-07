import { useProgress } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/LoadingScreen.module.css'

interface ShardConfig {
  clipPath: string
  originX: number
  originY: number
  tx: number
  ty: number
  rotate: number
  delay: number
}

function buildShards(): ShardConfig[] {
  const COLS = 5
  const ROWS = 4
  const pts: [number, number][][] = []
  for (let r = 0; r <= ROWS; r++) {
    pts.push([])
    for (let c = 0; c <= COLS; c++) {
      const bx = (c / COLS) * 100
      const by = (r / ROWS) * 100
      const interior = c > 0 && c < COLS && r > 0 && r < ROWS
      const jx = interior ? (Math.random() - 0.5) * (100 / COLS) * 0.45 : 0
      const jy = interior ? (Math.random() - 0.5) * (100 / ROWS) * 0.45 : 0
      pts[r].push([bx + jx, by + jy])
    }
  }

  const result: ShardConfig[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tl = pts[r][c],     tr = pts[r][c + 1]
      const bl = pts[r + 1][c], br = pts[r + 1][c + 1]
      for (const tri of [[tl, tr, br], [tl, br, bl]] as [number, number][][]) {
        const ox = (tri[0][0] + tri[1][0] + tri[2][0]) / 3
        const oy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3
        const dx = ox - 50
        const dy = oy - 50
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const spd = 80 + Math.random() * 70
        result.push({
          clipPath: `polygon(${tri.map(p => `${p[0].toFixed(1)}% ${p[1].toFixed(1)}%`).join(', ')})`,
          originX: ox,
          originY: oy,
          tx: (dx / dist) * spd * (0.8 + Math.random() * 0.4),
          ty: (dy / dist) * spd * (0.8 + Math.random() * 0.4),
          rotate: (Math.random() - 0.5) * 360,
          delay: Math.random() * 200,
        })
      }
    }
  }
  return result
}

interface Props {
  onLoaded: () => void
}

export function LoadingScreen({ onLoaded }: Props) {
  const { progress, total } = useProgress()
  const [fakeProgress, setFakeProgress] = useState(0)
  const [fakeEnabled, setFakeEnabled] = useState(false)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'breaking' | 'done'>('loading')
  const [shards, setShards] = useState<ShardConfig[]>([])
  const [triggered, setTriggered] = useState(false)

  const displayProgress = total > 0 ? progress : (fakeEnabled ? fakeProgress : 0)

  useEffect(() => {
    const t = setTimeout(() => setFakeEnabled(true), 600)
    return () => clearTimeout(t)
  }, [])

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

  const completedRef = useRef(false)
  useEffect(() => {
    if (displayProgress < 100 || completedRef.current) return
    completedRef.current = true
    const t = setTimeout(() => {
      onLoaded()
      setPhase('ready')
    }, 800)
    return () => clearTimeout(t)
  }, [displayProgress, onLoaded])

  // After shards are rendered, trigger the scatter animation
  useEffect(() => {
    if (phase !== 'breaking') return
    const id = requestAnimationFrame(() => {
      setTriggered(true)
      setTimeout(() => setPhase('done'), 1100)
    })
    return () => cancelAnimationFrame(id)
  }, [phase])

  const handleEnter = () => {
    if (phase !== 'ready') return
    setShards(buildShards())
    setPhase('breaking')
  }

  if (phase === 'done') return null

  return (
    <div className={`${styles.overlay}${phase === 'breaking' ? ` ${styles.clear}` : ''}`}>
      {phase === 'loading' && (
        <>
          <p className={styles.title}>Loading</p>
          <div className={styles.barWrap}>
            <div className={styles.bar} style={{ width: `${displayProgress}%` }} />
          </div>
          <span className={styles.percent}>{Math.round(displayProgress)}%</span>
        </>
      )}

      {phase === 'ready' && (
        <button className={styles.enterBtn} onClick={handleEnter}>
          Enter
        </button>
      )}

      {phase === 'breaking' && shards.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--color-bg)',
            clipPath: s.clipPath,
            transformOrigin: `${s.originX}% ${s.originY}%`,
            pointerEvents: 'none',
            transform: triggered
              ? `translate(${s.tx}vw, ${s.ty}vh) rotate(${s.rotate}deg) scale(0.5)`
              : 'none',
            opacity: triggered ? 0 : 1,
            transition: triggered
              ? `transform 0.75s cubic-bezier(0.55, 0, 1, 0.45) ${s.delay}ms, opacity 0.6s ease ${s.delay}ms`
              : 'none',
          }}
        />
      ))}
    </div>
  )
}
