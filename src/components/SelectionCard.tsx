import type { FC } from 'react'
import styles from '../styles/SectionManager.module.css'

interface CardData {
  id: string
  href?: string
  category: string
  label: string
  sub: string
}

interface Props {
  card: CardData
  className?: string
}

export const SelectionCard: FC<Props> = ({ card, className }) => {
  return (
    <a
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.selectionCard}${className ? ` ${className}` : ''}`}
    >
      <span className={styles.cardCategory}>{card.category}</span>
      <span className={styles.cardLabel}>{card.label}</span>
      <span className={styles.cardDivider} />
      <span className={styles.cardSub}>{card.sub}</span>
      <span className={styles.cardView}>VIEW &nbsp;→</span>
    </a>
  )
}
