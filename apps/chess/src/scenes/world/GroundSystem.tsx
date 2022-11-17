import { GrassMaterial, resolution } from "./GrassMaterial"
import { GroundMaterial } from "./GroundMaterial"
import { useControls } from "leva"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import {
  InstancedBufferGeometry,
  Material,
  Mesh,
  PlaneGeometry,
  RawShaderMaterial,
  Vector3
} from "three"
import { useNoiseTexture } from "./useNoiseTexture"
import { game } from "./gameplay/state"

export const players = game.world.with("player", "sceneObject", "velocity")

export function GrassSystem() {
  let ref = useRef<Mesh<InstancedBufferGeometry, RawShaderMaterial>>(null)
  let noiseTexture = useNoiseTexture()
  const width = noiseTexture.source.data.width

  useFrame(({ clock }, dt) => {
    let [player] = players
    if (!player || !ref.current) return

    let grassMaterial = ref.current.material as RawShaderMaterial
    grassMaterial.uniforms.time.value = clock.getElapsedTime() * 5

    let x = player.sceneObject.position.x,
      z = player.sceneObject.position.z
    ref.current.position.x = x
    ref.current.position.z = z
    grassMaterial.uniforms.posX.value = x
    grassMaterial.uniforms.posZ.value = z
  })

  // useControls({
  //   scale: {
  //     value: 4.0,
  //     onChange(v: number) {
  //       ref.current!.material.uniforms.scale.value = v
  //     }
  //   },
  //   offset: {
  //     value: [width / 2, width / 2],
  //     onChange(v) {
  //       ref.current!.material.uniforms.offsetX.value = v[0]
  //       ref.current!.material.uniforms.offsetY.value = v[1]
  //     }
  //   }
  // })
  return (
    <GrassMaterial
      ref={ref}
      noiseTexture={noiseTexture}
      scale={4.0}
      offset={[width / 2, width / 2]}
    />
  )
}

export function GroundSystem() {
  let noiseTexture = useNoiseTexture()
  let groundRef = useRef<Mesh<PlaneGeometry, RawShaderMaterial>>(null)
  const width = noiseTexture.source.data.width

  const memo = useMemo(() => {
    const geom = new PlaneGeometry(width, width, resolution, resolution)
    geom.lookAt(new Vector3(0, 1, 0))
    geom.computeVertexNormals()
    return geom
  }, [])

  useFrame(({ clock }, dt) => {
    let [player] = players
    if (!player || !groundRef.current) return

    let x = player.sceneObject.position.x,
      z = player.sceneObject.position.z
    groundRef.current.position.x = x
    groundRef.current.position.z = z
    groundRef.current.material.uniforms.posX.value = x
    groundRef.current.material.uniforms.posZ.value = z
  })

  // useControls({
  //   scale: {
  //     value: 4.0,
  //     onChange(v) {
  //       groundRef.current!.material.uniforms.scale.value = v
  //     }
  //   },
  //   offset: {
  //     value: [width / 2, width / 2],
  //     onChange(v) {
  //       groundRef.current!.material.uniforms.offsetX.value = v[0]
  //       groundRef.current!.material.uniforms.offsetY.value = v[1]
  //     }
  //   }
  // })

  return (
    <mesh ref={groundRef} geometry={memo}>
      <GroundMaterial
        noiseTexture={noiseTexture}
        scale={4.0}
        offset={[width / 2, width / 2]}
        initialPosition={[0, 0]}
      />
    </mesh>
  )
}
