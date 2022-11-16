import { ECS } from "./gameplay/state"
import { useFrame } from "@react-three/fiber"
import { createStateMachine } from "state-composer"
import { controller } from "../../input"
import { useEffect, useMemo } from "react"
import {
  Color,
  Float32BufferAttribute,
  PlaneGeometry,
  Quaternion,
  Vector2,
  Vector3,
  Vector3Tuple
} from "three"
import { Cow } from "../../models/Cow"
import { Adventurer } from "./Adventurer"
import { useControls } from "leva"
export const GhostState = createStateMachine<"walking" | "idle">("idle")

window.addEventListener("keydown", (e) => {
  // debugger if they press `
  if (e.key === "`") {
    debugger
  }
})

const decceleration = new Vector3(-0.0005, -0.0001, -5.0)
const acceleration = new Vector3(1, 0.25, 200.0)
const quat = new Quaternion()
const yaxis = new Vector3(0, 1, 0)

const players = ECS.world.with("player", "sceneObject", "velocity")

import { resolution, width } from "./grass"
import { lerp } from "three/src/math/MathUtils"
import { getYPosition, useHeightmap } from "./useHeightmap"
var tempVec = new Vector2()
import { useEntities } from "miniplex/react"
import { useRef } from "react"
const zeroArray = new Array(16).fill(0)
export function ControlledMovementSystem() {
  const { acceleration: accZ } = useControls({
    acceleration: { value: 75, step: 10 }
  })
  const [player] = useEntities(players)

  const { scale, offset } = useControls({
    scale: 5.0,
    offset: [width / 2, width / 2]
  })

  const heightmap = useHeightmap()

  let vec = new Vector3()
  let ref = useRef()

  useFrame((_, dt) => {
    let [player] = players
    if (!player) return
    const velocity = player.velocity
    const { move, aim, fire } = controller.controls

    let forwardAcceleration = accZ

    const frameDecceleration = new Vector3(
      velocity.x * decceleration.x,
      velocity.y * decceleration.y,
      velocity.z * decceleration.z
    )
    frameDecceleration.multiplyScalar(dt)
    frameDecceleration.z =
      Math.sign(frameDecceleration.z) *
      Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z))

    velocity.add(frameDecceleration)

    const controlObject = player.sceneObject
    const _Q = new Quaternion()
    const _A = new Vector3()
    const _R = controlObject.quaternion.clone()

    if (fire) {
      forwardAcceleration *= 2
    }

    // if (this._stateMachine._currentState.Name == "dance") {
    //   acc.multiplyScalar(0.0)
    // }

    if (move.y > 0) {
      velocity.z += forwardAcceleration * dt
    }
    if (move.y < 0) {
      velocity.z -= forwardAcceleration * dt
    }
    if (move.x < 0) {
      _A.set(0, 1, 0)
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * dt * acceleration.y)
      _R.multiply(_Q)
    }
    if (move.x > 0) {
      _A.set(0, 1, 0)
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * dt * acceleration.y)
      _R.multiply(_Q)
    }

    controlObject.quaternion.copy(_R)

    const oldPosition = new Vector3()
    oldPosition.copy(controlObject.position)

    const forward = new Vector3(0, 0, 1)
    forward.applyQuaternion(controlObject.quaternion)
    forward.normalize()

    const sideways = new Vector3(1, 0, 0)
    sideways.applyQuaternion(controlObject.quaternion)
    sideways.normalize()

    let prevPosition = controlObject.position.clone()
    let nextPosition = prevPosition.clone()

    prevPosition.sub(forward)
    prevPosition.sub(sideways)
    nextPosition.add(forward)
    nextPosition.add(forward)
    nextPosition.add(sideways)
    nextPosition.add(sideways)
    nextPosition.y = getYPosition(
      heightmap!,
      nextPosition.x,
      nextPosition.z,
      scale,
      offset
    )
    prevPosition.y = getYPosition(
      heightmap!,
      prevPosition.x,
      prevPosition.z,
      scale,
      offset
    )

    const angle = prevPosition.angleTo(nextPosition)
    vec.x = angle

    sideways.multiplyScalar(velocity.x * dt)
    forward.multiplyScalar(velocity.z * dt)

    controlObject.position.add(forward)
    controlObject.position.add(sideways)

    oldPosition.copy(controlObject.position)

    let y = getYPosition(
      heightmap!,
      controlObject.position.x,
      controlObject.position.z,
      scale,
      offset
    )
    controlObject.position.y = lerp(controlObject.position.y, y, dt * 3)

    // ref.current.position.copy(controlObject.position)
    // ref.current.position.y += 5

    // ref.current.quaternion.copy(
    //   new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), angle * Math.PI)
    // )
  })

  return (
    <>
      {/* <mesh ref={ref}>
        <boxGeometry />
      </mesh> */}
      {/* {zeroArray.map((a, i) =>
        zeroArray.map((a, j) => (
          <mesh
            position={[i * 32, getYPosition(memo, i * 32, j * 32, 2.0), j * 32]}
          >
            <boxGeometry />
          </mesh>
        ))
      )} */}
      {/* <NoisePlane
        scale={scale}
        imageData={memo}
        offset={offset}
        position={[512, 0, 512]}
      />
      <NoisePlane
        scale={scale}
        imageData={memo}
        offset={offset}
        position={[0, 0, 0]}
      />
      <NoisePlane
        scale={scale}
        imageData={memo}
        offset={offset}
        position={[-512, 0, -512]}
      />
      <NoisePlane
        scale={scale}
        imageData={memo}
        offset={offset}
        position={[0, 0, 512]}
      />

      <NoisePlane
        scale={scale}
        imageData={memo}
        offset={offset}
        position={[-512, 0, 0]}
      />
      <NoisePlane
        scale={scale}
        imageData={memo}
        offset={offset}
        position={[-512, 0, 512]}
      /> */}

      {/* <mesh position={[10, getYPosition(memo, 10, 10, 2.0), 10]}>
        <boxGeometry />
      </mesh>
      <mesh position={[20, getYPosition(memo, 20, 0, 2.0), 0]}>
        <boxGeometry />
      </mesh>
      <mesh position={[-20, getYPosition(memo, -20, 0, 2.0), 0]}>
        <boxGeometry />
      </mesh> */}
    </>
  )
}

export const Player = () => {
  let cow = Cow.useRef()
  let adventurer = Adventurer.useRef()
  useEffect(() => {
    cow.current.actions.Idle.play()
    adventurer.current.actions.Idle.play()
  }, [])
  useFrame((_, dt) => {
    if (!cow.current) return
    let prev = GhostState.get()

    const { move, aim } = controller.controls

    if (move.x != 0 || move.y != 0) {
      GhostState.enter("walking")
    } else {
      GhostState.enter("idle")
    }

    if (GhostState.is("idle") && prev !== "idle") {
      cow.current.actions.Walk.fadeOut(0.3)
      // cow.current.actions.Walk.setEffectiveTimeScale(5)
      adventurer.current.actions.Walk.fadeOut(0.3)
      adventurer.current.actions.Idle_Sword.reset().fadeIn(0.3).play()
      cow.current.actions.Idle.reset().fadeIn(0.3).play()
    }
    if (GhostState.is("walking") && prev !== "walking") {
      cow.current.actions.Idle.fadeOut(0.3)
      adventurer.current.actions.Idle_Sword.fadeOut(0.3)
      adventurer.current.actions.Walk.reset().fadeIn(0.3).play()
      cow.current.actions.Walk.reset().fadeIn(0.3).play()
    }

    cow.current.nodes.IKFrontLegR
  })

  return (
    <>
      <ECS.Entity>
        <ECS.Component name="name" data="MainPlayer" />
        <ECS.Component name="player" data={true} />
        <ECS.Component name="focus" data={true} />
        {/* <ECS.Component name="rigidBody"> */}
        {/* <RigidBody
          // type="dynamic"
          // angularDamping={3}
          // linearDamping={1}
          // enabledTranslations={[true, true, false]}
          // enabledRotations={[false, false, true]}
          // scale={0.5}
          colliders={false}
          mass={10}
          collisionGroups={interactionGroups(Layers.Player, [Layers.Pickup])}
        > */}
        {/* <CapsuleCollider args={[1, 2]} position={[0, 20, 0]}> */}
        <ECS.Component name="sceneObject">
          <Cow.Model ref={cow}>
            <Adventurer.Model
              ref={adventurer}
              scale={3}
              position-x={-3}
              castShadow
            />
          </Cow.Model>
          {/* <CharacterModel></CharacterModel> */}
        </ECS.Component>
        <ECS.Component name="velocity" data={new Vector3(0, 0, 0)} />
        {/* </CapsuleCollider> */}
        {/* </RigidBody> */}
        {/* </ECS.Component> */}
      </ECS.Entity>
    </>
  )
}
