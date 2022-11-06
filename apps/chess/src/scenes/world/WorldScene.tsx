import {
  Debug,
  interactionGroups,
  Physics,
  RigidBody
} from "@react-three/rapier"
import { bitmask, Layers } from "render-composer"
import { Skybox } from "../../common/Skybox"
import { Stage } from "../../configuration"
import { ErrorBoundary } from "react-error-boundary"
import { Perf } from "r3f-perf"
import {
  Box,
  Capsule,
  Html,
  OrbitControls,
  PerspectiveCamera,
  Plane,
  useHelper,
  useTexture
} from "@react-three/drei"
import { Grass, resolution, width } from "./grass"
import { createGround, Ground, GroundMaterial } from "./createGround"

import { useControls } from "leva"
import { ControlledMovementSystem, Player } from "./Player"
import { SidebarTunnel, store } from "../../state"
import {
  MiniplexEntityInspector,
  MiniplexInspector
} from "../../editor/MiniplexInspector"
import { ECS } from "./gameplay/state"
import {
  ActiveCameraSystem,
  CameraHelperSystem,
  ThirdPersonCameraSystem
} from "./systems/ThirdPersonCameraSystem"
import { Tree } from "../../models/Tree"
import { Ghost } from "../../models/Ghost"
import * as AC from "audio-composer"
import { useCapture } from "../../lib/useCapture"
import { Adventurer } from "./Adventurer"
import { useFrame } from "@react-three/fiber"
import { useEffect as useLayoutEffect, useMemo, useRef } from "react"
import {
  CameraHelper,
  DirectionalLight,
  Mesh,
  PlaneGeometry,
  RepeatWrapping,
  Vector3
} from "three"
import { useState } from "react"

export const WorldScene = () => {
  const ref = useRef()

  // useHelper(
  //   {
  //     get current() {
  //       return ref.current.shadow.camera
  //     }
  //   },
  //   CameraHelper
  // )

  const { width, heigth } = useControls({
    width: { value: 512, step: 5 },
    heigth: { value: 512, step: 5 }
  })
  return (
    <group>
      <ErrorBoundary fallback={<group></group>}>
        <Physics
          updatePriority={Stage.Physics}
          colliders={false}
          timeStep="vary"
        >
          <Devtools />
          <Skybox />
          <OrbitControls />
          <PlayerCamera />
          <EditorCamera />
          {/* <Tree /> */}

          <ambientLight
            intensity={0.1}
            layers-mask={bitmask(Layers.Default, Layers.TransparentFX)}
          />
          <directionalLight
            position={[20, 20, 20]}
            intensity={1}
            shadow-mapSize-width={width}
            shadow-mapSize-height={heigth}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            castShadow
            ref={ref}
            layers-mask={bitmask(Layers.Default, Layers.TransparentFX)}
          />
          <axesHelper scale={512} />
          <Html>
            <div
              style={{}}
              // ref={(el) => {
              //   el.appendChild(noiseTexture.source.data)
              // }}
            ></div>
          </Html>
          {/* <Ground /> */}
          {/* <primitive object={grass} /> */}
          <Player />
          <ActiveCameraSystem />
          <ControlledMovementSystem />
          {/* <PlayerSystem /> */}
          <ThirdPersonCameraSystem />
          <CameraHelperSystem />
          <GrassSystem />
        </Physics>
      </ErrorBoundary>
    </group>
  )
}

function Devtools() {
  const { physics, performance } = useControls(
    "debug",
    {
      physics: false,
      performance: false
    },
    {
      collapsed: true
    }
  )
  return (
    <>
      {physics && <Debug />}
      {performance && <Perf position="top-left" />}
    </>
  )
}

const players = ECS.world.with("player", "sceneObject", "velocity")

function GrassSystem() {
  let ref = useRef<Mesh>()
  let groundRef = useRef<Mesh>()
  let noiseTexture = useNoiseTexture()
  // const mem = useMemo(() => {
  //   return createGround(noiseTexture)
  // }, [noiseTexture])
  const { grass } = useControls({
    grass: true
  })

  const memo = useMemo(() => {
    const geom = new PlaneGeometry(width, width, resolution, resolution)
    geom.lookAt(new Vector3(0, 1, 0))
    geom.computeVertexNormals()
    return geom
  }, [])

  useFrame(({ clock }, dt) => {
    let [player] = players
    if (!player || !ref.current || !groundRef.current) return
    ref.current.material.uniforms.time.value = clock.getElapsedTime() * 5

    ref.current.position.x = player.sceneObject.position.x
    ref.current.position.z = player.sceneObject.position.z

    groundRef.current.position.x = player.sceneObject.position.x
    groundRef.current.position.z = player.sceneObject.position.z

    ref.current.material.uniforms.posX.value = player.sceneObject.position.x
    ref.current.material.uniforms.posZ.value = player.sceneObject.position.z
    groundRef.current.material.uniforms.posX.value =
      player.sceneObject.position.x
    groundRef.current.material.uniforms.posZ.value =
      player.sceneObject.position.z

    // ref.current.visible = false
  })

  const { scale } = useControls({
    scale: {
      value: 2,
      onChange(v) {
        groundRef.current.material.uniforms.scale.value = v
      }
    }
  })
  // ground.geometry.computeVertexNormals()
  // console.log(ground.material)
  // ground.receiveShadow = true

  return (
    <>
      <Grass ref={ref} noiseTexture={noiseTexture} visible={grass} />
      {/* <Ground noiseTexture={noiseTexture} ref={groundRef} /> */}
      <mesh ref={groundRef} geometry={memo}>
        <GroundMaterial noiseTexture={noiseTexture} scale={scale} />
      </mesh>
    </>
  )
}

export function useNoiseTexture() {
  let noiseTexture = useTexture(
    "https://al-ro.github.io/images/grass/perlinFbm.jpg"
  )

  console.log(noiseTexture)
  noiseTexture.wrapS = RepeatWrapping
  noiseTexture.wrapT = RepeatWrapping
  return noiseTexture
}

function PlayerCamera() {
  const controls = useControls("camera", {
    editor: true
  })
  return (
    <ECS.Entity>
      <ECS.Component name="camera" data={true} />
      {!controls.editor ? (
        <ECS.Component name="active" data={true} />
      ) : (
        <ECS.Component name="helper" data={true} />
      )}
      {/* <ECS.Component name="active" data={Tag} /> */}
      <ECS.Component name="thirdPerson" data={true} />
      <ECS.Component name="sceneObject">
        <PerspectiveCamera rotation-y={-0.8}>
          <AC.AudioListener />
        </PerspectiveCamera>
      </ECS.Component>
    </ECS.Entity>
  )
}

function EditorCamera() {
  const controls = useControls("camera", {
    editor: false
  })
  return (
    <ECS.Entity>
      <ECS.Component name="camera" data={true} />
      {/* <ECS.Component name="helper" data={Tag} /> */}
      {controls.editor && <ECS.Component name="active" data={true} />}
      <ECS.Component name="sceneObject">
        <PerspectiveCamera position={[100, 100, 100]} />
      </ECS.Component>
    </ECS.Entity>
  )
}

// function Ground() {
//   const props = useTexture("/textures/grass.jpeg")
//   return (
//     <RigidBody type="fixed" colliders="cuboid">
//       <Plane scale={100} rotation-x={-Math.PI / 2}>
//         <meshStandardMaterial map={props} />
//       </Plane>
//     </RigidBody>
//   )
// }

export default WorldScene
