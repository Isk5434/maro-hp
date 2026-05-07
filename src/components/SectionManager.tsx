import { useEffect, useRef, useCallback, useState } from 'react'
import { SITE_CONTENT } from '../config/content'
import { SceneCanvas } from './canvas/SceneCanvas'
import { HeroSection } from './HeroSection'
import styles from '../styles/SectionManager.module.css'

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

const CARDS = SITE_CONTENT.selectionCards
const SCENE_START_SCROLL = 0
const SCENE_SCROLL_LENGTH = 10.0
const PHASE3_START_SCROLL = 10.6
const PHASE3_SCROLL_LENGTH = 0.8

interface Props {
  mouseNx: number
  mouseNy: number
}

export function SectionManager({ mouseNx, mouseNy }: Props) {
  const scrollRef     = useRef<HTMLDivElement>(null)
  const glassRef      = useRef<HTMLDivElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)

  const [sceneProgress, setSceneProgress] = useState(0)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const heroH = el.clientHeight
    const relScroll = el.scrollTop - heroH
    const sceneStart = heroH * SCENE_START_SCROLL
    const sceneLength = heroH * SCENE_SCROLL_LENGTH
    const sceneRaw = Math.max(0, Math.min(1, (relScroll - sceneStart) / sceneLength))
    setSceneProgress(sceneRaw)

    // glass/cards rise after the phone scene has room to settle.
    const phase3Start = heroH * PHASE3_START_SCROLL
    const phase3Length = heroH * PHASE3_SCROLL_LENGTH
    const glassRaw = Math.max(0, Math.min(1, (relScroll - phase3Start) / phase3Length))
    const glassT = easeInOut(glassRaw)
    if (glassRef.current) {
      glassRef.current.style.transform = `translateY(${lerp(100, 0, glassT)}%)`
      glassRef.current.style.opacity = String(glassT)
    }
    if (canvasWrapRef.current) {
      canvasWrapRef.current.style.transform = `translateY(${lerp(0, 10, glassT)}%)`
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div className={styles.wrapper}>
      <div ref={scrollRef} className={styles.scrollOuter}>
        {/* ── Phase 0: Hero ── */}
        <HeroSection mouseNx={mouseNx} mouseNy={mouseNy} />

        {/* ── Phase 1: Canvas + Cards ── */}
        <div className={styles.selectionWrapper}>
          <div className={styles.stickyFrame}>
            <div ref={canvasWrapRef} className={styles.canvasArea}>
              <SceneCanvas
                mouseNx={mouseNx}
                mouseNy={mouseNy}
                sceneProgress={sceneProgress}
              />
            </div>

            <div ref={glassRef} className={styles.glassPanel}>
              <div className={styles.cardGrid}>
                {CARDS.map((card) => (
                  <a
                    key={card.id}
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.selectionCard}
                  >
                    <span className={styles.cardCategory}>{card.category}</span>
                    <span className={styles.cardLabel}>{card.label}</span>
                    <span className={styles.cardDivider} />
                    <span className={styles.cardSub}>{card.sub}</span>
                    <span className={styles.cardView}>VIEW &nbsp;→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.scrollSpacer} />
        </div>
      </div>
    </div>
  )
}
