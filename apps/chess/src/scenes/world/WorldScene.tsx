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
import { Tree, useTreeModel } from "../../models/Tree"
import { Ghost } from "../../models/Ghost"
import * as AC from "audio-composer"
import { useCapture } from "../../lib/useCapture"
import { Adventurer } from "./Adventurer"
import { useFrame } from "@react-three/fiber"
import { useEffect, useEffect as useLayoutEffect, useMemo, useRef } from "react"
import {
  CameraHelper,
  DirectionalLight,
  InstancedBufferGeometry,
  InstancedMesh,
  Mesh,
  Object3D,
  PlaneGeometry,
  RawShaderMaterial,
  RepeatWrapping,
  Texture,
  Vector3
} from "three"
import { useState } from "react"
import { GroundMaterial } from "./GroundMaterial"
import { getYPosition, useHeightmap } from "./useHeightmap"

export const World = ({ children }) => {
  return (
    <group>
      <ErrorBoundary fallback={<group></group>}>
        <Physics
          updatePriority={Stage.Physics}
          colliders={false}
          timeStep="vary"
        >
          {children}
          <ActiveCameraSystem />
          <ControlledMovementSystem />
          <ThirdPersonCameraSystem />
          <CameraHelperSystem />
          <GroundSystem />
        </Physics>
      </ErrorBoundary>
    </group>
  )
}

export const WorldScene = () => {
  // const ref = useRef<DirectionalLight>(null)

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
    <World>
      <Devtools />
      <Skybox />
      <OrbitControls />
      <PlayerCamera />
      <EditorCamera />

      <ambientLight
        intensity={0.1}
        layers-mask={bitmask(Layers.Default, Layers.TransparentFX)}
      />
      <directionalLight
        position={[20, 20, 100]}
        intensity={1}
        shadow-mapSize-width={width}
        shadow-mapSize-height={heigth}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        castShadow
        layers-mask={bitmask(Layers.Default, Layers.TransparentFX)}
      />
      <axesHelper scale={512} />
      <Player />
      <Instances />
    </World>
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

function Instances({ count = 500, temp = new Object3D() }) {
  const ref = useRef<InstancedMesh>(null)
  const heightmap = useHeightmap()
  useEffect(() => {
    // Set positions

    for (let i = 0; i < count; i++) {
      let x = Math.random() * 500 - 512 / 2
      let y = Math.random() * 500 - 512 / 2
      temp.position.set(
        x,
        getYPosition(heightmap!, x, y, 5, [512 / 2, 512 / 2]),
        y
      )
      temp.updateMatrix()
      ref.current!.setMatrixAt(i, temp.matrix)
    }
    // Update the instance
    ref.current!.instanceMatrix.needsUpdate = true
  }, [])
  const treeModel = useTreeModel()
  return (
    <instancedMesh
      ref={ref}
      args={[treeModel.geometry, treeModel.material, count]}
    ></instancedMesh>
  )
}

function GroundSystem() {
  let ref = useRef<Mesh<InstancedBufferGeometry, RawShaderMaterial>>(null)
  let groundRef = useRef<Mesh<PlaneGeometry, RawShaderMaterial>>(null)
  let noiseTexture = useNoiseTexture()
  let heightmap = useHeightmap()
  const groundGeometry = useMemo(() => {
    const geom = new PlaneGeometry(width, width, resolution / 8, resolution / 8)
    geom.lookAt(new Vector3(0, 1, 0))
    let attr = geom.getAttribute("position")
    for (var i = 0; i < attr.count; i++) {
      attr.setY(
        i,
        getYPosition(heightmap!, attr.getX(i), attr.getZ(i), 5.0, [
          512 / 2,
          512 / 2
        ])
      )
    }
    geom.computeVertexNormals()
    return geom
  }, [])

  useFrame(({ clock }, dt) => {
    let [player] = players
    if (!player || !ref.current || !groundRef.current) return
    ref.current.material.uniforms.time.value = clock.getElapsedTime() * 5

    ref.current.position.x = player.sceneObject.position.x
    ref.current.position.z = player.sceneObject.position.z

    // if (
    //   groundRef.current.position.z != player.sceneObject.position.z ||
    //   groundRef.current.position.x != player.sceneObject.position.x
    // ) {
    //   let x = player.sceneObject.position.x
    //   let y = player.sceneObject.position.z
    //   let attr = groundGeometry.getAttribute("position")
    //   for (var i = 0; i < attr.count; i++) {
    //     attr.setY(
    //       i,
    //       getYPosition(heightmap!, attr.getX(i) + x, attr.getZ(i) + y, 5.0, [
    //         512 / 2,
    //         512 / 2
    //       ])
    //     )
    //   }
    //   attr.needsUpdate = true
    //   groundGeometry.computeVertexNormals()
    //   // groundRef.current.position.x = player.sceneObject.position.x
    //   // groundRef.current.position.z = player.sceneObject.position.z
    // }
    ref.current.material.uniforms.posX.value = player.sceneObject.position.x
    ref.current.material.uniforms.posZ.value = player.sceneObject.position.z
    // groundRef.current.material.uniforms.posX.value =
    // player.sceneObject.position.x
    // groundRef.current.material.uniforms.posZ.value =
    // player.sceneObject.position.z

    // ref.current.visible = false
  })

  useControls({
    scale: {
      value: 5.0,
      onChange(v) {
        // groundRef.current!.material.uniforms.scale.value = v
        ref.current!.material.uniforms.scale.value = v
      }
    },
    offset: {
      value: [width / 2, width / 2],
      onChange(v) {
        // groundRef.current!.material.uniforms.offsetX.value = v[0]
        // groundRef.current!.material.uniforms.offsetY.value = v[1]
        ref.current!.material.uniforms.offsetX.value = v[0]
        ref.current!.material.uniforms.offsetY.value = v[1]
      }
    }
  })

  const texture = useTexture("/textures/grasslands.jpeg", (text) => {
    text.wrapS = text.wrapT = RepeatWrapping
  })

  return (
    <>
      <Grass
        offset={[512 / 2, 512 / 2]}
        ref={ref}
        noiseTexture={noiseTexture}
        scale={4.0}
      />
      <mesh ref={groundRef} geometry={groundGeometry} receiveShadow>
        {/* <GroundMaterial
          noiseTexture={noiseTexture}
          groundTexture={texture}
          scale={4.0}
          offset={[512 / 2, 512 / 2]}
          initialPosition={[0, 0]}
        /> */}
        <meshStandardMaterial map={texture} />
      </mesh>
    </>
  )
}

export function useNoiseTexture() {
  let noiseTexture = useTexture(
    // "/noise.jpg"
    "https://al-ro.github.io/images/grass/perlinFbm.jpg"
  )

  console.log(noiseTexture)
  noiseTexture.wrapS = RepeatWrapping
  noiseTexture.wrapT = RepeatWrapping
  return noiseTexture
}

function PlayerCamera() {
  const controls = useControls("camera", {
    editor: false
  })
  return (
    <ECS.Entity>
      <ECS.Component name="name" data="AnotherCamera" />
      <ECS.Component name="camera" data={{}} />
      {!controls.editor ? <ECS.Component name="active" data={true} /> : null}
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
      <ECS.Component name="name" data="EditorCamera" />
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
