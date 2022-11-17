import { Box, PerspectiveCamera, useGLTF } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { store } from "./editor"
import CameraSystem from "./camera"
import EditorSystem from "./editor"
import RenderSystem from "./render"
import LightSystem from "./light"
import MeshSystem from "./mesh"
import { Debug, Physics, RigidBody } from "@react-three/rapier"
import { LevaPanel, useControls, LevaInputs } from "leva"
import { Perf } from "r3f-perf"
declare global {
  export interface Components {}
}
import * as RC from "render-composer"

import PhysicsSystem from "./physics"
import { useStore } from "statery"
import { Suspense } from "react"
import { controller } from "./input"
import { ControlledMovementSystem } from "./controller"
import { Model } from "../lib/Model"
import { GLTFSystem } from "./gltf"
import { EditorPanels } from "../../../editor/EditorPanels"
import { ScriptSystem } from "./script"

declare global {
  export interface Components {
    script?: string
  }
}

export function PhysicsWorld({ children }) {
  const { editor } = useStore(store)
  return (
    <>
      <Physics>
        {editor && <Debug />}
        {children}
      </Physics>
    </>
  )
}

export const Stage = {
  Early: -200,
  Physics: -100,
  Normal: 0,
  Late: 100,
  Render: 200
}

const Controller = () => {
  useFrame(() => {
    controller.update()
  }, Stage.Early)

  return null
}
export function World({ children = null }) {
  return (
    <>
      <RC.Canvas dpr={1} shadows={true}>
        {/* <Canvas
          shadows
          id="main-canvas"
          onPointerMissed={(e) => store.set({ entities: [] })}
        > */}
        <RC.RenderPipeline updatePriority={Stage.Render}>
          <PhysicsWorld>
            <Suspense>
              {children}
              <Controller />
              <ScriptSystem />
              <GLTFSystem />
              <ControlledMovementSystem />
              <MeshSystem />
              <CameraSystem />
              <RenderSystem />
              <PhysicsSystem />
              <LightSystem />
              <EditorSystem />
            </Suspense>
          </PhysicsWorld>
        </RC.RenderPipeline>
        {/* <Perf position="bottom-left" /> */}
        {/* </Canvas> */}
      </RC.Canvas>
      <EditorPanels />
    </>
  )
}
