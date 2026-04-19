import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { FloatingObjects } from './FloatingObjects'
import { CameraRig } from './CameraRig'

interface Props {
  mouseNx: number
  mouseNy: number
}

export function HeroCanvas({ mouseNx, mouseNy }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 48 }}
      gl={{ antialias: true, alpha: true }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={1.4} color="#f8f0e0" />
        <directionalLight position={[5, 8, 5]} intensity={2.0} color="#fff8e8" />
        <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#c8d8f0" />
        <pointLight position={[0, 3, 2]} intensity={0.4} color="#ffe0c0" />
        <FloatingObjects />
        <CameraRig mouseNx={mouseNx} mouseNy={mouseNy} />
      </Suspense>
    </Canvas>
  )
}
