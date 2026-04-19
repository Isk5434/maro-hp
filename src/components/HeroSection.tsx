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
      <HeroCanvas mouseNx={mouseNx} mouseNy={mouseNy} />

      <div className={styles.content}>
        <h1 className={styles.heading}>{hero.heading}</h1>
        <p className={styles.subtitle}>{hero.subtitle}</p>
        <button className={styles.cta}>
          {hero.cta} &nbsp;↓
        </button>
      </div>

      <div className={styles.scrollHint}>
        <div className={styles.scrollLine} />
        <span>scroll</span>
      </div>
    </section>
  )
}
