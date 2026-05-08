import gsap from 'gsap'
import { useProgress } from '@react-three/drei'
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from '../styles/LoadingScreen.module.css'

interface Props {
  onLoaded: () => void
}

export function LoadingScreen({ onLoaded }: Props) {
  const { progress, total } = useProgress()
  const [fakeProgress, setFakeProgress] = useState(0)
  const [fakeEnabled, setFakeEnabled] = useState(false)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'entering' | 'done'>('loading')

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

  const handleEnter = () => {
    if (phase !== 'ready' || !overlayRef.current) return
    setPhase('entering')

    const mask = { transparent: 100, black: 150 }
    const heroMaskTargets = document.querySelectorAll<HTMLElement>('[data-hero-mask]')

    const tl = gsap.timeline({
      defaults: { duration: 1.2, ease: 'expo.out' },
      onComplete: () => {
        document.body.classList.remove('is-loading', 'webgl-ready')
        setPhase('done')
      },
    })

    tl
      .to(btnRef.current, {
        opacity: 0,
        letterSpacing: '0.38em',
        duration: 0.32,
        ease: 'power2.in',
      })
      .to(
        contentRef.current,
        {
          scale: 0.94,
          opacity: 0,
          duration: 0.35,
          ease: 'power2.in',
        },
        '<',
      )
      .to(overlayRef.current, {
        autoAlpha: 0,
        scale: 1.1,
        ease: 'power2.inOut',
        duration: 0.6,
      })
      .to(
        '[data-hero-visual]',
        { scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out' },
        '<',
      )
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
  }

  if (phase === 'done') return null

  return (
    <div
      ref={overlayRef}
      className={`${styles.overlay} ${isReady ? styles.ready : ''}`}
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
    </div>
  )
}
