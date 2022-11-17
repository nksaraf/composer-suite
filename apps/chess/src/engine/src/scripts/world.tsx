import { bitmask, Layers } from "render-composer"
import { PostProcessing } from "../../../scenes/world/PostProcessing"
import { Skybox } from "../../../scenes/world/Skybox"

export default function World() {
  return (
    <>
      <PostProcessing />
      <Skybox />

      <ambientLight
        intensity={0.1}
        layers-mask={bitmask(Layers.Default, Layers.TransparentFX)}
      />
    </>
  )
}
