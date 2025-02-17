import { Animate } from "@hmans/things"
import {
  CameraShake,
  Float as FloatAnimation,
  useTexture
} from "@react-three/drei"
import { GroupProps, useThree } from "@react-three/fiber"
import { pipe } from "fp-ts/function"
import { composable, modules } from "material-composer-r3f"
import { between, plusMinus } from "randomish"
import {
  Abs,
  Add,
  GlobalTime,
  Input,
  InstanceID,
  Mul,
  Negate,
  NormalizePlusMinusOne,
  Smoothstep,
  UV,
  Vec2,
  Vec3
} from "shader-composer"
import { PSRDNoise2D } from "shader-composer-toybox"
import { Color, DoubleSide } from "three"
import {
  Emitter,
  InstancedParticles,
  useParticleAttribute,
  useParticleLifetime
} from "vfx-composer-r3f"
import { SphericalAura } from "./effects/Aura"
import { Lava } from "./modules/Lava"
import { smokeUrl } from "./textures"

export const time = GlobalTime

export default function AsteroidExample() {
  return (
    <group>
      <CameraShake intensity={1.5} />
      <Asteroid scale={0.5} />
    </group>
  )
}

const Asteroid = (props: GroupProps) => (
  <group {...props}>
    <group
      rotation-z={-Math.PI / 3}
      rotation-y={Math.PI / 3}
      position={[-2, -1, 0]}
    >
      <FloatAnimation speed={340} rotationIntensity={0} floatIntensity={0.3}>
        <Rock />
        <InnerAura />
        <MiddleAura />
        <OuterAura />
      </FloatAnimation>

      <Sparks />
      <RockSplitters />
      <SmokeTrail />
      <Clouds />
      <WindLines />
    </group>
  </group>
)

const Rock = () => (
  <Animate fun={(g, dt) => (g.rotation.x = g.rotation.y += 0.4 * dt)}>
    <mesh>
      <icosahedronGeometry args={[1, 3]} />

      <composable.meshBasicMaterial>
        <modules.SurfaceWobble offset={Mul(time, 0.4)} amplitude={0.1} />

        <Lava
          offset={Mul(Vec3([0.4, 0.8, 0.5]), time)}
          scale={0.3}
          octaves={5}
          power={1}
        />
      </composable.meshBasicMaterial>
    </mesh>
  </Animate>
)

const InnerAura = () => (
  <SphericalAura
    scale={[1.5, 3, 1.5]}
    position-y={1.8}
    gradient={[
      [new Color("#d62828").multiplyScalar(1.5), 0],
      [new Color("#fb8b24").multiplyScalar(2), 0.5],
      [new Color("#fb8b24").multiplyScalar(2), 0.9],
      [new Color("#f8f9fa").multiplyScalar(8), 1]
    ]}
    tiling={Vec2([3, 0.5])}
    offset={Vec2([0, Negate(Add(time, UV.x))])}
    wobble={0.04}
  />
)

const MiddleAura = () => (
  <SphericalAura
    scale={[1.6, 2, 1.6]}
    position-y={0.8}
    fullness={0.7}
    gradient={[
      [new Color("#d62828").multiplyScalar(1.5), 0],
      [new Color("#fb8b24").multiplyScalar(2), 0.5],
      [new Color("#fb8b24").multiplyScalar(2), 0.9],
      [new Color("#f8f9fa").multiplyScalar(8), 1]
    ]}
    tiling={Vec2([3, 0.5])}
    offset={Vec2([0, Negate(Add(time, UV.x))])}
    wobble={0.04}
  />
)

const OuterAura = () => (
  <SphericalAura
    scale={[1.8, 1.5, 1.8]}
    position-y={0.4}
    fullness={0.6}
    gradient={[
      [new Color("#3a86ff").multiplyScalar(1.5), 0],
      [new Color("#8338ec").multiplyScalar(2), 0.5],
      [new Color("#8338ec").multiplyScalar(2), 0.9],
      [new Color("#ff006e").multiplyScalar(10), 1]
    ]}
    tiling={Vec2([3, 0.5])}
    offset={Vec2([0, Negate(Add(time, UV.x))])}
    wobble={0.02}
  />
)

const Sparks = () => {
  const lifetime = useParticleLifetime()
  const getNoise = (offset: Input<"float">) =>
    PSRDNoise2D(Vec2([offset, InstanceID]))
  const clock = useThree((s) => s.clock)

  return (
    <InstancedParticles capacity={200}>
      <planeGeometry args={[0.2, 0.2]} />
      <composable.meshBasicMaterial side={DoubleSide}>
        <modules.Color
          color={pipe(
            InstanceID,
            (v) => getNoise(20),
            (v) => NormalizePlusMinusOne(v),
            (v) => Mul(v, 10),
            (v) => Mul(new Color("#fb8b24"), v)
          )}
        />

        <modules.Lifetime {...lifetime} />

        <modules.Scale scale={Add(2, getNoise(123))} />

        <modules.SurfaceWobble
          offset={Vec3([time, InstanceID, 0])}
          amplitude={0.5}
        />

        <modules.Translate
          offset={Vec3([Mul(getNoise(99), 5), getNoise(67), getNoise(567)])}
        />

        <modules.Velocity
          direction={Vec3([
            Mul(getNoise(87843), 2),
            Mul(Add(Abs(getNoise(123)), 1.3), 20),
            Mul(getNoise(278499), 2)
          ])}
          space="local"
          time={lifetime.age}
        />

        <modules.Scale scale={lifetime.age} />
      </composable.meshBasicMaterial>

      <Emitter
        rate={() => 80 + Math.sin(clock.elapsedTime * 2) * 40}
        setup={({ mesh, position }) => {
          lifetime.write(mesh, 4)
          const theta = plusMinus(Math.PI)
          position.set(Math.cos(theta) * 1.5, 0, Math.sin(theta) * 1.5)
        }}
      />
    </InstancedParticles>
  )
}

const RockSplitters = () => {
  const lifetime = useParticleLifetime()
  const getNoise = (offset: Input<"float">) =>
    PSRDNoise2D(Vec2([offset, InstanceID]))

  return (
    <InstancedParticles capacity={100} safetyCapacity={10}>
      <icosahedronGeometry />

      <composable.meshStandardMaterial color="#222">
        <modules.Lifetime {...lifetime} />

        <modules.Translate
          offset={Vec3([Mul(getNoise(99), 5), getNoise(67), getNoise(567)])}
        />

        <modules.Velocity
          direction={Vec3([
            Mul(getNoise(87843), 2),
            Mul(Add(Abs(getNoise(123)), 1.3), 40),
            Mul(getNoise(278499), 2)
          ])}
          space="local"
          time={lifetime.age}
        />

        <modules.Acceleration
          direction={Vec3([0, -60, 0])}
          space="world"
          time={lifetime.age}
        />

        <modules.Scale scale={Add(2, getNoise(123))} />
      </composable.meshStandardMaterial>

      <Emitter
        rate={10}
        setup={({ mesh, position, scale }) => {
          lifetime.write(mesh, 10)
          position.setScalar(plusMinus(0.5))
          scale.setScalar(between(0.1, 0.2))
        }}
      />
    </InstancedParticles>
  )
}

const SmokeTrail = () => {
  const texture = useTexture(smokeUrl)

  const lifetime = useParticleLifetime()
  const color = useParticleAttribute(() => new Color())

  return (
    <group>
      <InstancedParticles capacity={150} safetyCapacity={10}>
        <planeGeometry />
        <composable.meshStandardMaterial
          map={texture}
          opacity={0.5}
          transparent
          depthWrite={false}
          color="#123"
        >
          <modules.Color color={color} />
          <modules.Billboard />
          <modules.Scale scale={Add(Mul(lifetime.progress, 3), 0.5)} />
          <modules.Scale scale={Smoothstep(-0.5, 0.1, lifetime.progress)} />
          <modules.Alpha
            alpha={(alpha) => Mul(alpha, Smoothstep(1, 0.8, lifetime.progress))}
          />

          <modules.Velocity
            direction={Vec3([0, 10, 0])}
            time={lifetime.age}
            space="local"
          />
          <modules.Lifetime {...lifetime} />
        </composable.meshStandardMaterial>

        <Emitter
          rate={100}
          setup={({ mesh, position, scale }) => {
            lifetime.write(mesh, between(1, 2))
            position.set(plusMinus(1), 3 + plusMinus(1), plusMinus(1))
            scale.setScalar(between(1, 3))
            color.write(mesh, (v) =>
              v.set("#666").multiplyScalar(Math.random())
            )
          }}
        />
      </InstancedParticles>
    </group>
  )
}

const Clouds = () => {
  const texture = useTexture(smokeUrl)

  const lifetime = useParticleLifetime()

  return (
    <group>
      <InstancedParticles capacity={100} safetyCapacity={10}>
        <planeGeometry />
        <composable.meshStandardMaterial
          map={texture}
          opacity={0.02}
          transparent
          depthWrite={false}
        >
          <modules.Lifetime {...lifetime} />

          <modules.Billboard />

          <modules.Velocity
            direction={Vec3([0, 10, 0])}
            time={lifetime.age}
            space="local"
          />
        </composable.meshStandardMaterial>

        <Emitter
          rate={10}
          setup={({ mesh, position, scale }) => {
            lifetime.write(mesh, 10)
            position.set(plusMinus(20), -40 + plusMinus(1), plusMinus(4))
            scale.setScalar(between(5, 20))
          }}
        />
      </InstancedParticles>
    </group>
  )
}

const WindLines = () => {
  const lifetime = useParticleLifetime()

  return (
    <group>
      <InstancedParticles>
        <planeGeometry args={[0.1, 3.2]} />

        <composable.meshBasicMaterial color="#555" side={DoubleSide}>
          <modules.Velocity
            direction={Vec3([0, 100, 0])}
            time={lifetime.age}
            space="local"
          />
          <modules.Lifetime {...lifetime} />
        </composable.meshBasicMaterial>

        <Emitter
          rate={30}
          setup={({ mesh, position, scale }) => {
            lifetime.write(mesh, 10)
            position.set(plusMinus(20), -40 + plusMinus(1), plusMinus(4))
            scale.setScalar(between(1, 2))
          }}
        />
      </InstancedParticles>
    </group>
  )
}
