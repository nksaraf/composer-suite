import { Composable, Modules } from "material-composer-r3f"
import { insideCircle, power } from "randomish"
import { useLayoutEffect } from "react"
import { $, Input, InstanceID, Lerp, Round } from "shader-composer"
import { Random } from "shader-composer-toybox"
import { Color, Quaternion, Vector3 } from "three"
import { InstancedParticles, Particle, ParticleProps } from "vfx-composer-r3f"
import { useSegmentedBucket } from "../lib/SegmentedBucket"
import { archetypes, Asteroid, ECS, PhysicsLayers } from "../state"
import { physics } from "../systems/PhysicsSystem"
import { bitmask } from "../util/bitmask"

import { Entity } from "../../engine/src/state"

export const RenderableEntity = ({ render }: Pick<Entity, "render">) => render!

export const InstanceRNG =
  ({ seed }: { seed?: Input<"float"> } = {}) =>
  (offset: Input<"float"> = Math.random() * 10) =>
    Random($`${offset} + float(${InstanceID}) * 1.1005`)

export const Asteroids = () => {
  const segmentedAsteroids = useSegmentedBucket(archetypes.asteroids)

  console.log("Rerendering Asteroids component. You should only see this once.")

  useLayoutEffect(() => {
    for (let i = 0; i < 1000; i++) {
      const pos = insideCircle(100)
      spawnAsteroid({ position: [pos.x, pos.y, 0] })
    }

    return () => {
      for (const asteroid of archetypes.asteroids) {
        ECS.world.remove(asteroid)
      }
    }
  }, [])

  const rand = InstanceRNG()

  return (
    <InstancedParticles capacity={20000}>
      <icosahedronGeometry />

      <Composable.MeshStandardMaterial metalness={0.1} roughness={0.8}>
        <Modules.Color
          color={Lerp(new Color("#444"), new Color("#888"), Round(rand(12)))}
        />
      </Composable.MeshStandardMaterial>

      {segmentedAsteroids.entities.map((segment, i) => (
        <ECS.Entities key={i} in={segment} children={RenderableEntity} />
      ))}

      {/* <ECS.Entities in={archetypes.asteroids} children={RenderableEntity} /> */}
    </InstancedParticles>
  )
}

const tmpVec3 = new Vector3()

export const spawnAsteroid = (
  props: ParticleProps,
  scale = 1 + power(2) * 1
) => {
  const entity = ECS.world.add({
    isAsteroid: true,

    health: 1000 * scale,

    physics: physics({
      radius: scale * 0.8,
      restitution: 0.1,
      mass: 40 * scale,
      linearDamping: 0.01,
      angularDamping: 0.01,

      groupMask: bitmask(PhysicsLayers.Asteroid),
      collisionMask: bitmask([
        PhysicsLayers.Player,
        PhysicsLayers.Bullet,
        PhysicsLayers.Asteroid
      ]),

      onContactStart: (other, force) => {
        entity.physics!.angularVelocity.add(
          tmpVec3.randomDirection().multiplyScalar(force / 500)
        )
      }
    }),

    spatialHashing: true,
    neighbors: [],

    render: (
      <ECS.Component name="transform">
        <Particle
          {...props}
          scale={scale}
          quaternion={new Quaternion().random()}
        />
      </ECS.Component>
    )
  })

  return entity as Asteroid
}
