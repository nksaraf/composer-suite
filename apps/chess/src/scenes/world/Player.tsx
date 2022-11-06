import { Capsule, Html } from "@react-three/drei"
import {
  BallCollider,
  CapsuleCollider,
  CuboidCollider,
  interactionGroups,
  RigidBody
} from "@react-three/rapier"
import { ECS, Layers } from "./gameplay/state"
import { CharacterModel } from "../../models/Sekiro"
import { Tree } from "../../models/Tree"
import { Ghost } from "../../models/Ghost"
import { useThree, useFrame, advance } from "@react-three/fiber"
import { createStateMachine } from "state-composer"
import { controller } from "../../input"
import { useEffect, useMemo, useRef } from "react"
import { Velocity } from "material-composer/modules"
import {
  AnimationAction,
  Color,
  Float32BufferAttribute,
  PlaneGeometry,
  Quaternion,
  RepeatWrapping,
  Vector2,
  Vector3
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

import { useNoiseTexture } from "./WorldScene"
import { resolution, width } from "./grass"
import { lerp } from "three/src/math/MathUtils"
var tempVec = new Vector2()

function sample(data, x, y, wrappingS, wrappingT) {
  // Checks the texture wrapping and modifies the x and y accordingly
  // this.clampCoords( x, y, wrappingS, wrappingT, tempVec );

  // Convert the normalized units into pixel coords
  // console.log(x, y, data.width, data.height)
  x = Math.floor(x * data.width)
  y = Math.floor(y * data.height)

  // if (x >= data.width) x = data.width - 1
  // if (y >= data.height) y = data.height - 1
  // if (x < 0) x = 0
  // if (y < 0) y = 0
  x = Math.abs(x % data.width)
  y = Math.abs(y % data.height)
  var val = data.data[(data.width * y + (512 - x)) * 4]
  console.log(x, y, val)
  // console.log(val)

  return val / 255.0
}

const zeroArray = new Array(16).fill(0)
export function ControlledMovementSystem() {
  const { acceleration: accZ } = useControls({
    acceleration: { value: 50, step: 10 }
  })

  const texture = useNoiseTexture()

  let ref = useRef()
  const memo = useMemo(() => {
    let el = document.createElement("canvas")
    el.style.position = "fixed"
    el.style.top = "0px"
    el.height = 512
    el.width = 512
    let ctx = el.getContext("2d")
    console.log(texture.source.data.width)
    ctx?.drawImage(texture.source.data, 0, 0, 512, 512, 0, 0, 512, 512)
    // document.body.appendChild(el)
    return ctx?.getImageData(0, 0, 512, 512)
  }, [texture])

  console.log(memo)

  useFrame((_, dt) => {
    let [player] = players
    if (!player) return
    const velocity = player.velocity
    const { move, aim } = controller.controls

    console.log()

    acceleration.z = accZ

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

    // if (this._input._keys.shift) {
    //   acc.multiplyScalar(2.0)
    // }

    // if (this._stateMachine._currentState.Name == "dance") {
    //   acc.multiplyScalar(0.0)
    // }

    if (move.y > 0) {
      velocity.z += accZ * dt
    }
    if (move.y < 0) {
      velocity.z -= accZ * dt
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

    const scale = 2
    controlObject.position.y = lerp(
      controlObject.position.y,
      getYPosition(
        memo,
        controlObject.position.x,
        controlObject.position.z,
        scale
      ),
      dt * 5
    )
  })

  const mem = useMemo(() => {
    const geom = new PlaneGeometry(width, width, resolution, resolution)
    geom.lookAt(new Vector3(0, 1, 0))
    geom.computeVertexNormals()

    const color = new Color()
    const colors = []
    const count = geom.attributes.position.count

    for (let index = 0; index < count; index++) {
      const x = geom.attributes.position.array[index * 3]
      const y = geom.attributes.position.array[index * 3 + 2]

      // color.setHSL((t - 512) / 512, 1.0, 0.5)

      const color = sample(
        memo,
        (x - width / 2) / (width * 2.0),
        (y - width / 2) / (width * 2.0),
        RepeatWrapping,
        RepeatWrapping
      )
      console.log(color)
      colors.push(color, 0, 0)
    }
    geom.setAttribute("color", new Float32BufferAttribute(colors, 3))
    return geom
  }, [memo])

  return (
    <>
      {/* {zeroArray.map((a, i) =>
        zeroArray.map((a, j) => (
          <mesh
            position={[i * 32, getYPosition(memo, i * 32, j * 32, 2.0), j * 32]}
          >
            <boxGeometry />
          </mesh>
        ))
      )} */}
      <mesh position={[0, 0, 512]} geometry={mem}>
        <meshBasicMaterial vertexColors />
      </mesh>

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
function getYPosition(
  memo: ImageData | undefined,
  x: number,
  y: number,
  scale: number
): number {
  let width = 512
  let height =
    50.0 *
    (2.0 *
      sample(
        memo,
        (x - width / 2) / (width * 2.0),
        (y - width / 2) / (width * 2.0),
        RepeatWrapping,
        RepeatWrapping
      ) -
      1.0)

  return height
}
