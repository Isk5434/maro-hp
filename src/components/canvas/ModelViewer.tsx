import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useRef, Suspense } from 'react'

useGLTF.setDecoderPath('/draco/gltf/')
import * as THREE from 'three'
import { MODEL_CONFIG } from '../../config/model.config'

function PrimitiveHouse() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current || !MODEL_CONFIG.autoRotate) return
    groupRef.current.rotation.y += MODEL_CONFIG.autoRotateSpeed
  })

  const mat = <meshStandardMaterial color="#c4a882" roughness={0.8} metalness={0.05} />
  const roofMat = <meshStandardMaterial color="#8b6f4e" roughness={0.9} metalness={0} />

  return (
    <group ref={groupRef} position={MODEL_CONFIG.position} scale={MODEL_CONFIG.scale}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.0, 1.0]} />
        {mat}
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <coneGeometry args={[1.1, 0.7, 4]} />
        {roofMat}
      </mesh>
      <mesh position={[0, -0.25, 0.502]} castShadow>
        <boxGeometry args={[0.28, 0.5, 0.01]} />
        <meshStandardMaterial color="#6b4f35" roughness={0.95} />
      </mesh>
      {([-0.42, 0.42] as const).map((x) => (
        <mesh key={x} position={[x, 0.1, 0.502]} castShadow>
          <boxGeometry args={[0.22, 0.22, 0.01]} />
          <meshStandardMaterial color="#d4e8f0" roughness={0.1} metalness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, -0.502, 0]} receiveShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.004, 32]} />
        <meshStandardMaterial color="#e8d5b0" roughness={1} />
      </mesh>
    </group>
  )
}

function GltfModel() {
  const { scene } = useGLTF(MODEL_CONFIG.path)
  const groupRef = useRef<THREE.Group>(null)

  const normalizedScene = (() => {
    const clone = scene.clone()
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const normalizeScale = maxDim > 0 ? 2.0 / maxDim : 1
    clone.scale.setScalar(normalizeScale)
    const center = new THREE.Vector3()
    new THREE.Box3().setFromObject(clone).getCenter(center)
    clone.position.sub(center)
    return clone
  })()

  const floatTime = useRef(0)
  const baseY = MODEL_CONFIG.position[1]

  useFrame((_, delta) => {
    if (!groupRef.current) return
    floatTime.current += delta * 0.6
    groupRef.current.position.y = baseY + Math.sin(floatTime.current) * 0.18
  })

  return (
    <group ref={groupRef} position={MODEL_CONFIG.position} rotation={MODEL_CONFIG.rotation}>
      <primitive object={normalizedScene} />
    </group>
  )
}

if (!MODEL_CONFIG.usePrimitives) {
  useGLTF.preload(MODEL_CONFIG.path)
}

export function ModelViewer() {
  if (MODEL_CONFIG.usePrimitives) {
    return <PrimitiveHouse />
  }
  return (
    <Suspense fallback={null}>
      <GltfModel />
    </Suspense>
  )
}
