import { useCallback, useState } from 'react'
import { SvgFilters } from './components/SvgFilters'
import { LoadingScreen } from './components/LoadingScreen'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { AboutModal } from './components/AboutModal'
import { FollowMouse } from './components/FollowMouse'
import { SectionManager } from './components/SectionManager'
import { useMouseTracker } from './hooks/useMouseTracker'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [mouse, setMouse] = useState({ nx: 0, ny: 0 })

  useMouseTracker(({ nx, ny }) => setMouse({ nx, ny }))

  const handleBgToggle = useCallback(() => {
    setIsDark((d) => {
      const next = !d
      document.body.classList.toggle('dark-bg', next)
      return next
    })
  }, [])

  const handleLoaded = useCallback(() => setLoaded(true), [])

  return (
    <>
      <SvgFilters />
      <LoadingScreen onLoaded={handleLoaded} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          ...(loaded ? {} : { visibility: 'hidden' as const, pointerEvents: 'none' as const }),
        }}
        aria-hidden={!loaded}
      >
        <FollowMouse />
        <Header
          onAboutClick={() => setShowAbout(true)}
          isDark={isDark}
          onBgToggle={handleBgToggle}
        />
        <SectionManager mouseNx={mouse.nx} mouseNy={mouse.ny} />
        <Footer />
        <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      </div>
    </>
  )
}
