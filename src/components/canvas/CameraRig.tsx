import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'

interface Props {
  mouseNx: number
  mouseNy: number
}

export function CameraRig({ mouseNx, mouseNy }: Props) {
  const { camera } = useThree()
  const targetX = useRef(0)
  const targetY = useRef(0)

  useFrame(() => {
    targetX.current += (mouseNx * 0.08 - targetX.current) * 0.05
    targetY.current += (-mouseNy * 0.05 - targetY.current) * 0.05
    camera.rotation.y = targetX.current
    camera.rotation.x = targetY.current
  })

  return null
}
