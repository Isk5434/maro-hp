import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { SceneLighting } from './SceneLighting'
import { ModelViewer } from './ModelViewer'
import { PhoneEmergeScene } from './PhoneEmergeScene'
import { CameraRig } from './CameraRig'

interface Props {
  mouseNx: number
  mouseNy: number
  sceneProgress: number
}

export function SceneCanvas({ mouseNx, mouseNy, sceneProgress }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4.5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      shadows
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        background: 'transparent',
      }}
    >
      <Suspense fallback={null}>
        <SceneLighting />
        <ModelViewer />
        <PhoneEmergeScene progress={sceneProgress} />
        <CameraRig mouseNx={mouseNx} mouseNy={mouseNy} />
      </Suspense>
    </Canvas>
  )
}
