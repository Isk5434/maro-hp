import { HeroCanvas } from './canvas/HeroCanvas'
import { SITE_CONTENT } from '../config/content'
import styles from '../styles/HeroSection.module.css'

interface Props {
  mouseNx: number
  mouseNy: number
}

export function HeroSection({ mouseNx, mouseNy }: Props) {
  const { hero } = SITE_CONTENT

  return (
    <section className={styles.hero}>
      <div data-hero-visual style={{ position: 'absolute', inset: 0 }}>
        <HeroCanvas mouseNx={mouseNx} mouseNy={mouseNy} />
      </div>

      <div className={styles.content}>
        <h1 className={styles.heading} data-hero-title data-hero-mask>{hero.heading}</h1>
        <p className={styles.subtitle} data-hero-subtitle data-hero-mask>{hero.subtitle}</p>
        <button className={styles.cta} data-hero-cta>
          {hero.cta} &nbsp;↓
        </button>
      </div>

      <div className={styles.scrollHint} data-hero-hint>
        <div className={styles.scrollLine} />
        <span>scroll</span>
      </div>
    </section>
  )
}
