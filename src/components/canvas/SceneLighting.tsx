export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={1.2} color="#f5ede0" />
      <directionalLight
        position={[4, 8, 4]}
        intensity={1.4}
        color="#ffe8c8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 2, -3]} intensity={0.4} color="#c8d8f0" />
    </>
  )
}
