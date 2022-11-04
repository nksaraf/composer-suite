import { Capsule } from "@react-three/drei"
import {
  BallCollider,
  CapsuleCollider,
  CuboidCollider,
  interactionGroups,
  RigidBody
} from "@react-three/rapier"
import { Tag } from "miniplex"
import { ECS, Layers } from "./gameplay/state"
import { CharacterModel } from "../../models/Sekiro"
import { Tree } from "../../models/Tree"
import { Ghost } from "../../models/Ghost"
import { useThree, useFrame, advance } from "@react-three/fiber"
import { createStateMachine } from "state-composer"
import { controller } from "../../input"
import { useEffect, useRef } from "react"
import { Velocity } from "material-composer/modules"
import { AnimationAction, Quaternion, Vector2, Vector3 } from "three"
import { Cow } from "../../models/Cow"
import { Adventurer } from "./Adventurer"
export const GhostState = createStateMachine<"walking" | "idle">("idle")

window.addEventListener("keydown", (e) => {
  // debugger if they press `
  if (e.key === "`") {
    debugger
  }
})

const decceleration = new Vector3(-0.0005, -0.0001, -5.0)
const acceleration = new Vector3(1, 0.25, 50.0)
const quat = new Quaternion()
const yaxis = new Vector3(0, 1, 0)

export function ControlledMovementSystem() {
  const [player] = ECS.useArchetype("player", "sceneObject", "velocity")

  useFrame((_, dt) => {
    if (!player) return
    const velocity = player.velocity
    const { move, aim } = controller.controls

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

    const acc = acceleration.clone()
    // if (this._input._keys.shift) {
    //   acc.multiplyScalar(2.0)
    // }

    // if (this._stateMachine._currentState.Name == "dance") {
    //   acc.multiplyScalar(0.0)
    // }

    if (move.y > 0) {
      velocity.z += acc.z * dt
    }
    if (move.y < 0) {
      velocity.z -= acc.z * dt
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

    sideways.multiplyScalar(velocity.x * dt)
    forward.multiplyScalar(velocity.z * dt)

    controlObject.position.add(forward)
    controlObject.position.add(sideways)

    velocity

    oldPosition.copy(controlObject.position)
  })

  return null
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
    <ECS.Entity>
      <ECS.Component name="player" data={Tag} />
      <ECS.Component name="focus" data={Tag} />
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
          <Adventurer.Model ref={adventurer} scale={3} position-x={-3} />
        </Cow.Model>
        {/* <CharacterModel></CharacterModel> */}
      </ECS.Component>
      <ECS.Component name="velocity" data={new Vector3(0, 0, 0)} />
      {/* </CapsuleCollider> */}
      {/* </RigidBody> */}
      {/* </ECS.Component> */}
    </ECS.Entity>
  )
}
