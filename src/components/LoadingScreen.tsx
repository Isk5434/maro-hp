import gsap from 'gsap'
import { useProgress } from '@react-three/drei'
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from '../styles/LoadingScreen.module.css'

// ── Glass shard generation ──────────────────────────────────────────
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
  const COLS = 6, ROWS = 5
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
      const tl = pts[r][c], tr = pts[r][c + 1]
      const bl = pts[r + 1][c], br = pts[r + 1][c + 1]
      for (const tri of [[tl, tr, br], [tl, br, bl]] as [number, number][][]) {
        const ox = (tri[0][0] + tri[1][0] + tri[2][0]) / 3
        const oy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3
        const dx = ox - 50, dy = oy - 50
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

// ── Component ───────────────────────────────────────────────────────
interface Props {
  onLoaded: () => void
}

export function LoadingScreen({ onLoaded }: Props) {
  const { progress, total } = useProgress()
  const [fakeProgress, setFakeProgress] = useState(0)
  const [fakeEnabled, setFakeEnabled] = useState(false)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'entering' | 'done'>('loading')
  const [shards, setShards] = useState<ShardConfig[]>([])
  const [triggered, setTriggered] = useState(false)

  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const displayProgress = total > 0 ? progress : (fakeEnabled ? fakeProgress : 0)
  const isReady = phase === 'ready' || phase === 'entering'

  const setHeroMask = useCallback((value: string) => {
    document.querySelectorAll<HTMLElement>('[data-hero-mask]').forEach((el) => {
      el.style.setProperty('--hero-reveal-mask', value)
    })
  }, [])

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
      gsap.set('[data-hero-visual]', { scale: 1.06, opacity: 0 })
      gsap.set('[data-hero-title]', { opacity: 1 })
      gsap.set('[data-hero-subtitle]', { opacity: 1 })
      gsap.set('[data-hero-cta]', { y: 18, opacity: 0 })
      gsap.set('[data-hero-hint]', { opacity: 0 })
      setHeroMask('linear-gradient(-15deg, transparent 100%, black 150%)')
      onLoaded()
      setPhase('ready')
      document.body.classList.add('webgl-ready')
    }, 800)
    return () => clearTimeout(t)
  }, [displayProgress, onLoaded, setHeroMask])

  useEffect(() => {
    document.body.classList.add('is-loading')
    return () => {
      document.body.classList.remove('is-loading', 'webgl-ready')
    }
  }, [])

  // シャードが DOM に入ったら散乱 + hero reveal を開始
  useEffect(() => {
    if (phase !== 'entering' || shards.length === 0) return

    const id = requestAnimationFrame(() => {
      // CSS transition でシャードを吹き飛ばす
      setTriggered(true)

      // hero reveal は以前と同じタイムライン（文字アニメーション変更なし）
      const mask = { transparent: 100, black: 150 }
      const heroMaskTargets = document.querySelectorAll<HTMLElement>('[data-hero-mask]')

      const tl = gsap.timeline({
        delay: 0.15,
        defaults: { duration: 1.2, ease: 'expo.out' },
        onComplete: () => {
          document.body.classList.remove('is-loading', 'webgl-ready')
          setPhase('done')
        },
      })

      tl
        .to('[data-hero-visual]', { scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out' })
        .fromTo(
          mask,
          { transparent: 100, black: 150 },
          {
            duration: 3.6,
            transparent: -35,
            black: 0,
            ease: 'sine.out',
            onUpdate: () => {
              heroMaskTargets.forEach((el, index) => {
                const delay = index * 12
                const transparent = mask.transparent + delay
                const black = mask.black + delay
                el.style.setProperty(
                  '--hero-reveal-mask',
                  `linear-gradient(-15deg, transparent ${transparent}%, black ${black}%)`,
                )
              })
            },
          },
          '<25%',
        )
        .to('[data-hero-cta]', { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, '<45%')
        .to('[data-hero-hint]', { opacity: 0.55, duration: 0.45, ease: 'sine.out' }, '<20%')
    })

    return () => cancelAnimationFrame(id)
  }, [phase, shards.length])

  const handleEnter = () => {
    if (phase !== 'ready') return

    // ボタン・コンテンツ退場（DOM がある今すぐ開始）
    gsap.to(btnRef.current, {
      opacity: 0,
      letterSpacing: '0.38em',
      duration: 0.32,
      ease: 'power2.in',
    })
    gsap.to(contentRef.current, {
      scale: 0.94,
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in',
    })

    // シャード生成 → React が再描画 → useEffect が散乱 + reveal を起動
    setPhase('entering')
    setShards(buildShards())
  }

  if (phase === 'done') return null

  return (
    <div
      ref={overlayRef}
      className={`${styles.overlay} ${isReady ? styles.ready : ''} ${phase === 'entering' ? styles.clear : ''}`}
      aria-busy={phase === 'loading'}
      aria-live="polite"
    >
      <div ref={contentRef} className={styles.content}>
        <div className={styles.mark} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className={styles.switcher}>
          <div className={styles.loadingLine} aria-hidden={isReady}>
            <span className={styles.title}>Loading</span>
            {[0, 1, 2, 3].map((dot) => (
              <span key={dot} className={styles.dot} style={{ animationDelay: `${dot * 0.1}s` }} />
            ))}
          </div>

          <button ref={btnRef} className={styles.enterBtn} onClick={handleEnter} disabled={phase !== 'ready'}>
            Enter Site
          </button>
        </div>

        <span className={styles.percent}>{Math.round(displayProgress)}%</span>
      </div>

      {/* Glass Impacts: シャードが散乱してローダーを割る */}
      {shards.map((s, i) => (
        <div
          key={i}
          aria-hidden="true"
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
