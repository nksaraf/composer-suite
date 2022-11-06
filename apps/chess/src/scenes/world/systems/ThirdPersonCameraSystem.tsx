import { useHelper } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEntities } from "miniplex/react"
import { useEffect, useLayoutEffect } from "react"
import { CameraHelper, PerspectiveCamera, Quaternion, Vector3 } from "three"
import { Stage } from "../../../configuration"
import { controller } from "../../../input"
import { ECS } from "../gameplay/state"

const offset = new Vector3(-3, 10, -20)
const lookAt = new Vector3(0, 1, 5)
const idealLookAt = new Vector3()
const tmpTarget = new Vector3()
const tmpLookAt = new Vector3()

const players = ECS.world.with("player", "sceneObject", "velocity")
const cameras = ECS.world.with("camera", "sceneObject", "thirdPerson")
export const ThirdPersonCameraSystem = () => {
  useFrame((_, dt) => {
    let [player] = players
    let [camera] = cameras
    // console.log(player, camera)
    if (camera && player) {
      // based on code from https://github.com/simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera/blob/main/main.js
      const idealTarget = tmpTarget
        .copy(offset)
        .applyQuaternion(player.sceneObject.quaternion)
        .add(player.sceneObject.position)

      const t = 1.0 - Math.pow(0.001, dt)

      const cameraLookAt = tmpLookAt
        .copy(lookAt)
        .applyQuaternion(player.sceneObject.quaternion)
        .add(player.sceneObject.position)

      idealLookAt.lerp(cameraLookAt, t)

      camera.sceneObject.position.lerp(idealTarget, t)
      camera.sceneObject.lookAt(idealLookAt)
    }
  }, Stage.Late)

  return null
}

const activeCameras = ECS.world.with("camera", "sceneObject", "active")
export const ActiveCameraSystem = () => {
  const [camera] = useEntities(activeCameras)
  const set = useThree(({ set }) => set)
  const activeCamera = useThree(({ camera }) => camera)

  useEffect(() => {
    controller.devices.keyboard.onActivity.addListener(() => {
      if (controller.devices.keyboard.getKey("C")) {
      }
    })
  }, [])

  useLayoutEffect(() => {
    console.log("setting active camera", camera)
    if (camera) {
      const oldCam = activeCamera
      set(() => ({ camera: camera?.sceneObject as PerspectiveCamera }))
      return () => set(() => ({ camera: oldCam }))
    }
    // The camera should not be part of the dependency list because this components camera is a stable reference
    // that must exchange the default, and clean up after itself on unmount.
  }, [set, camera?.sceneObject])
  return null
}

const cameraWithHelpers = ECS.world.with("camera", "sceneObject", "helper")
export const CameraHelperSystem = () => {
  const cameras = useEntities(cameraWithHelpers)
  return (
    <>
      {cameras.entities.map((e) => {
        return <CameraHelperC camera={e} />
      })}
    </>
  )
}

function CameraHelperC({
  camera
}: {
  camera: typeof cameraWithHelpers.entities[0]
}) {
  useHelper({ current: camera?.sceneObject }, CameraHelper)
  return null
}
