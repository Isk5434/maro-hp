import { useRef, useState } from 'react'
import { useMouseTracker } from '../hooks/useMouseTracker'
import styles from '../styles/FollowMouse.module.css'

export function FollowMouse() {
  const dotRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useMouseTracker(({ x, y }) => {
    if (!dotRef.current) return
    if (!visible) setVisible(true)
    dotRef.current.style.transform = `translate(${x - 3}px, ${y - 3}px)`
  })

  return (
    <div
      ref={dotRef}
      className={`${styles.dot}${!visible ? ` ${styles.hidden}` : ''}`}
    />
  )
}
