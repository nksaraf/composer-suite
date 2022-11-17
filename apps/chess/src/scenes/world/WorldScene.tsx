import { bitmask, Layers } from "render-composer"
import { Skybox } from "../../common/Skybox"

import { Devtools } from "./Devtools"
import { Systems } from "./Systems"

export function Scene() {
  return (
    <>
      <Devtools />
      <Skybox />

      <ambientLight
        intensity={0.1}
        layers-mask={bitmask(Layers.Default, Layers.TransparentFX)}
      />
      {/* <directionalLight
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
      /> */}

      {/* Systems */}
      <Systems />
    </>
  )
}

export default Scene
