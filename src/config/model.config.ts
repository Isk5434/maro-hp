export const MODEL_CONFIG = {
  // To swap the 3D model:
  // 1. Place the new .glb file in /public/models/
  // 2. Change `path` to the new filename
  // 3. Adjust position / scale / rotation to fit
  // 4. Set usePrimitives: false to load the GLB
  path: '/models/main-model.glb',

  position: [0, -1.2, 0] as [number, number, number],
  scale: [1, 1, 1] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],

  autoRotate: false,
  autoRotateSpeed: 0.004,

  // true = use built-in primitive shapes (no GLB file needed)
  // false = load the GLB at `path`
  usePrimitives: false,
} as const
