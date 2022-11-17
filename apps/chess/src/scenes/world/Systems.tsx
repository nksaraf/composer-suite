import { CameraSystem } from "../../engine/src/systems/camera"
import EditorSystem from "../../engine/src/systems/editor"
import RenderSystem from "../../engine/src/systems/render"
import { GLTFSystem } from "../../engine/src/systems/gltf"
import { ControlledMovementSystem } from "../../engine/src/systems/controller"
import MeshSystem from "../../engine/src/systems/mesh"
import { ScriptSystem } from "../../engine/src/systems/script"
import LightSystem from "../../engine/src/systems/light"
import { Instances, GroundSystem } from "./ground"

export function Systems() {
  return (
    <>
      <GLTFSystem />
      <ScriptSystem />
      <MeshSystem />
      <LightSystem />
      <CameraSystem />
      <Instances />
      <RenderSystem />
      <ControlledMovementSystem />
      <GroundSystem />
      <EditorSystem />
    </>
  )
}
