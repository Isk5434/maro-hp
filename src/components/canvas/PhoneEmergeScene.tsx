import { useRef, useMemo, Suspense, Component, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const base = import.meta.env.BASE_URL

const ISLANDS = [
  { id: 'temple', path: `${base}models/floating-island-temple.glb`, targetPos: [-1.8,  0.2,  0.0] as [number,number,number], delay: 0,    scaleNorm: 1.0,  floatAmp: 0.13, floatSpeed: 0.42, floatOff: 0.0 },
  { id: 'pagoda', path: `${base}models/pagoda.glb`,                  targetPos: [ 2.0,  0.1, -0.3] as [number,number,number], delay: 0.12, scaleNorm: 0.85, floatAmp: 0.15, floatSpeed: 0.38, floatOff: 1.8 },
  { id: 'float',  path: `${base}models/floating-island.glb`,         targetPos: [-1.4, -0.8, -0.3] as [number,number,number], delay: 0.24, scaleNorm: 0.75, floatAmp: 0.12, floatSpeed: 0.46, floatOff: 3.2 },
  { id: 'rock',   path: `${base}models/low-poly-rock-island.glb`,    targetPos: [ 1.2, -0.9,  0.2] as [number,number,number], delay: 0.36, scaleNorm: 0.65, floatAmp: 0.14, floatSpeed: 0.60, floatOff: 0.0 },
]

ISLANDS.forEach(({ path }) => useGLTF.preload(path))

const PHONE_ENTER_SECONDS = 1.5
const PHONE_SETTLE_SECONDS = 1.5
const ISLAND_EMERGE_SECONDS = 1.5
const ISLAND_START_SECONDS = PHONE_ENTER_SECONDS
const TIMELINE_SECONDS = ISLAND_START_SECONDS + Math.max(...ISLANDS.map(({ delay }) => delay)) + ISLAND_EMERGE_SECONDS
const PHONE_START_SCALE = 11.5
const PHONE_SETTLED_SCALE = 0.94
const PHONE_ENTER_START_X = 0.12
const PHONE_ENTER_END_X = 0.95
const PHONE_ENTER_START_Z = 1.15
const PHONE_ENTER_END_Z = -3
const PHONE_ENTER_ROTATION_Z = Math.PI * 2.5
const PHONE_FINAL_ROTATION_Z = 5 * Math.PI / 2 - 0.6
const PHONE_SETTLE_EXTRA_ROTATION_Z = Math.PI * 2

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
function easeOut3(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

// ── ジオメトリ製スマホ ────────────────────────────────────────────
function PhoneBody() {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.5, 1.05, 0.065]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.25} metalness={0.75} />
      </mesh>
      <mesh position={[0, 0, 0.036]}>
        <boxGeometry args={[0.44, 0.92, 0.004]} />
        <meshStandardMaterial
          color="#0a1628"
          roughness={0.05}
          metalness={0.1}
          emissive="#1a4a8a"
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[0.08, 0.44, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.012, 16]} />
        <meshStandardMaterial color="#111" roughness={0.15} metalness={0.95} />
      </mesh>
    </group>
  )
}

// ── スマホ登場アニメーション ───────────────────────────────────────
// PhoneScene.template.js の createInteraction() を R3F 版に移植
// フェーズ1 (0→1.5s): 青い画面で覆う近距離から入り z軸450°回転
// フェーズ2 (1.5→3s): 横向きに傾いて着地
function AnimatedPhone({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current) return
    const elapsed = progress * TIMELINE_SECONDS

    if (elapsed < PHONE_ENTER_SECONDS) {
      const t = easeInOut(elapsed / PHONE_ENTER_SECONDS)
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(PHONE_START_SCALE, PHONE_SETTLED_SCALE, t))
      groupRef.current.position.set(0.05, 0, THREE.MathUtils.lerp(PHONE_ENTER_START_Z, PHONE_ENTER_END_Z, t))
      groupRef.current.rotation.set(
        THREE.MathUtils.lerp(PHONE_ENTER_START_X, PHONE_ENTER_END_X, t),
        0,
        THREE.MathUtils.lerp(0, PHONE_ENTER_ROTATION_Z, t),
      )
    } else if (elapsed < PHONE_ENTER_SECONDS + PHONE_SETTLE_SECONDS) {
      const t = easeInOut((elapsed - PHONE_ENTER_SECONDS) / PHONE_SETTLE_SECONDS)
      groupRef.current.scale.setScalar(PHONE_SETTLED_SCALE)
      groupRef.current.position.set(
        THREE.MathUtils.lerp(0.05, 0, t),
        THREE.MathUtils.lerp(0, -0.4, t),
        THREE.MathUtils.lerp(-3, 0, t),
      )
      groupRef.current.rotation.set(
        THREE.MathUtils.lerp(PHONE_ENTER_END_X, -1.5, t),
        THREE.MathUtils.lerp(0, 0.25, t),
        THREE.MathUtils.lerp(
          PHONE_ENTER_ROTATION_Z,
          PHONE_FINAL_ROTATION_Z + PHONE_SETTLE_EXTRA_ROTATION_Z,
          t,
        ),
      )
    } else {
      const ft = elapsed - PHONE_ENTER_SECONDS - PHONE_SETTLE_SECONDS
      groupRef.current.scale.setScalar(PHONE_SETTLED_SCALE)
      groupRef.current.position.set(0, -0.4 + Math.sin(ft * 0.5) * 0.02, 0)
      groupRef.current.rotation.set(-1.5, 0.25, PHONE_FINAL_ROTATION_Z)
    }
  })

  return (
    <group ref={groupRef}>
      <PhoneBody />
    </group>
  )
}

// ── 1島分：下からせり上がり登場 → 持続フロート ────────────────────
interface IslandProps {
  path: string
  targetPos: [number, number, number]
  delay: number
  scaleNorm: number
  floatAmp: number
  floatSpeed: number
  floatOff: number
  progress: number
}

function IslandEmergeItem({
  path, targetPos, delay, scaleNorm,
  floatAmp, floatSpeed, floatOff, progress,
}: IslandProps) {
  const { scene } = useGLTF(path)
  const groupRef = useRef<THREE.Group>(null)

  const normalizedScene = useMemo(() => {
    const clone = scene.clone()
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const s = maxDim > 0 ? scaleNorm / maxDim : 1
    clone.scale.setScalar(s)
    const center = new THREE.Vector3()
    new THREE.Box3().setFromObject(clone).getCenter(center)
    clone.position.sub(center)
    return clone
  }, [scene, scaleNorm])

  useFrame(() => {
    if (!groupRef.current) return

    // 島は phone settle 開始 (1.5s) + delay 後に登場
    const t = progress * TIMELINE_SECONDS - ISLAND_START_SECONDS - delay
    if (t < 0) { groupRef.current.visible = false; return }
    groupRef.current.visible = true

    const emergeRaw = Math.min(1, t / ISLAND_EMERGE_SECONDS)
    const eased = easeOut3(emergeRaw)

    const floatPhase = Math.max(0, t - ISLAND_EMERGE_SECONDS)
    const floatY = Math.sin(floatPhase * floatSpeed + floatOff) * floatAmp

    groupRef.current.position.set(
      targetPos[0],
      THREE.MathUtils.lerp(targetPos[1] - 5, targetPos[1], eased) + floatY * eased,
      targetPos[2],
    )
    groupRef.current.rotation.y = THREE.MathUtils.lerp(-Math.PI, 0, eased) + floatPhase * 0.0008
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, eased))
  })

  return (
    <group ref={groupRef}>
      <primitive object={normalizedScene} />
    </group>
  )
}

class ErrBound extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

export function PhoneEmergeScene({ progress }: { progress: number }) {
  return (
    <group>
      <AnimatedPhone progress={progress} />
      {ISLANDS.map((cfg) => (
        <ErrBound key={cfg.id}>
          <Suspense fallback={null}>
            <IslandEmergeItem
              path={cfg.path}
              targetPos={cfg.targetPos}
              delay={cfg.delay}
              scaleNorm={cfg.scaleNorm}
              floatAmp={cfg.floatAmp}
              floatSpeed={cfg.floatSpeed}
              floatOff={cfg.floatOff}
              progress={progress}
            />
          </Suspense>
        </ErrBound>
      ))}
    </group>
  )
}
