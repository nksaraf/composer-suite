import { Html, Sphere } from "@react-three/drei"
import { CameraHelper, Object3D, PerspectiveCamera, Vector3 } from "three"
import { Helper } from "../components/Helper"
import { registerComponent, selectEntity, store } from "./editor"

import { useEntities } from "miniplex/react"
import { PerspectiveCameraProps, useFrame, useThree } from "@react-three/fiber"
import { useLayoutEffect } from "react"
import { useStore } from "statery"
import { folder } from "leva"
import { usePersistedControls } from "../components/usePersistedControls"
import { game } from "../../../scenes/world/gameplay/state"
import { Stage } from "../../../configuration"

declare global {
  export interface Components {
    cameraTarget?: {
      positionOffset: [number, number, number]
      lookAtOffset: [number, number, number]
    }
    camera?: PerspectiveCameraProps
    camera$?: PerspectiveCamera
    controls?: any
  }
}

registerComponent("cameraTarget", {
  addTo(e) {
    game.world.addComponent(e, "cameraTarget", {
      positionOffset: [5, 5, 5],
      lookAtOffset: [0, 0, 0]
    })
  },
  controls(entity) {
    return {
      cameraTarget: folder(
        {
          positionOffset: {
            step: 0.5,
            value: entity.cameraTarget.positionOffset,
            onChange: (value) => {
              entity.cameraTarget.positionOffset = value
            },
            transient: true
          },
          lookAtOffset: {
            step: 0.5,
            value: entity.cameraTarget.lookAtOffset,
            onChange: (value) => {
              entity.cameraTarget.lookAtOffset = value
            },
            transient: true
          }
        },
        {
          collapsed: true
        }
      )
    }
  }
})

export const cameras = game.world.with("camera")
export const activeCameras = game.world.with("camera$", "transform", "active")
export const cameraObjects = game.world.with("camera$", "transform")
export const cameraTargets = game.world.with("cameraTarget", "transform")

const offset = new Vector3(-3, 10, -20)
const lookAt = new Vector3(0, 1, 5)
const idealLookAt = new Vector3()
const tmpTarget = new Vector3()
const tmpLookAt = new Vector3()
const object = new Object3D()

export const CameraLookAtSystem = () => {
  const [camera] = useEntities(activeCameras)
  const [target] = useEntities(cameraTargets)
  const set = useThree(({ set }) => set)
  const [controls] = usePersistedControls("systems", {
    followCamera: false
  })
  const { editor } = useStore(store)

  useFrame(function cameraLookAt(_, dt) {
    if (editor && !controls.followCamera) {
      return
    }

    if (camera) {
      if (!target) {
        // object.position.copy(camera.transform.position);
        // object.setRotationFromEuler(camera.transform.rotation);
        camera.camera$.lookAt(0, 0, 0)
        camera.transform.rotation.copy(camera.camera$.rotation)
      } else {
        // lookAt.set(...target.cameraTarget.lookAtOffset)
        // offset.set(...target.cameraTarget.positionOffset)
        // based on code from https://github.com/simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera/blob/main/main.js
        const idealTarget = tmpTarget
          .copy(offset)
          .applyEuler(target.transform?.rotation)
          .add(target.transform.position)

        const t = (1 - Math.pow(0.001, dt)) / 3

        const cameraLookAt = tmpLookAt
          .copy(lookAt)
          .applyEuler(target.transform?.rotation)
          .add(target.transform.position)

        idealLookAt.lerp(cameraLookAt, t)

        camera.camera$?.position.lerp(idealTarget, t)
        camera.transform.position.lerp(idealTarget, t)
        camera.camera$.lookAt(idealLookAt)
        camera.transform.rotation.setFromQuaternion(camera.camera$.quaternion)
      }
    }
  }, Stage.Late)
  return null
}

export const ActiveCameraSystem = () => {
  const [camera] = useEntities(activeCameras)
  const set = useThree(({ set }) => set)
  const activeCamera = useThree(({ camera }) => camera)
  const size = useThree(({ size }) => size)
  const { editor } = useStore(store)

  useLayoutEffect(() => {
    console.log("setting active camera", camera)
    if (camera && !editor) {
      const oldCam = activeCamera
      console.log(camera)
      set(() => ({ camera: camera?.camera$ as PerspectiveCamera }))

      return () => set(() => ({ camera: oldCam }))
    }
    // The camera should not be part of the dependency list because this components camera is a stable reference
    // that must exchange the default, and clean up after itself on unmount.
  }, [set, camera?.camera$, editor])

  useLayoutEffect(() => {
    if (camera?.camera$) {
      ;(camera.camera$ as PerspectiveCamera).aspect = size.width / size.height
    }
  }, [size, camera?.camera$])

  useLayoutEffect(() => {
    if (camera?.camera$) {
      ;(camera.camera$ as PerspectiveCamera).updateProjectionMatrix()
    }
  }, [camera?.camera$])
  return null
}

export default function CameraSystem() {
  const { editor } = useStore(store)
  useFrame(() => {
    for (var entity of cameraObjects) {
      if (!entity.controls || editor) {
        entity.camera$.position.copy(entity.transform.position)
        entity.transform.rotation &&
          entity.camera$.rotation.copy(entity.transform.rotation)
        entity.transform.scale &&
          entity.camera$.scale.copy(entity.transform.scale)
      }
    }
  })
  return (
    <>
      <game.Entities in={cameras}>
        {(entity) => (
          <>
            <game.Component name="camera$">
              <perspectiveCamera {...entity.transform} {...entity.camera} />
            </game.Component>
            {editor && (
              <game.Component name="helper$">
                <Sphere
                  scale={0.25}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    selectEntity(entity)
                  }}
                >
                  <Html
                    style={{
                      userSelect: "none"
                    }}
                    pointerEvents="all"
                  >
                    <span
                      style={{
                        fontSize: "1rem"
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        selectEntity(entity)
                      }}
                    >
                      🎥
                    </span>
                  </Html>
                  <meshBasicMaterial color="black" />
                </Sphere>
              </game.Component>
            )}
            {editor && (
              <Helper entity={() => entity.camera$} helper={CameraHelper} />
            )}
          </>
        )}
      </game.Entities>
      <CameraLookAtSystem />
      <ActiveCameraSystem />
    </>
  )
}
