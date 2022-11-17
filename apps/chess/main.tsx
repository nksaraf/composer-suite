import React from "react"
import ReactDOM from "react-dom/client"
import * as SC from "shader-composer"
import "./index.css"

import * as UI from "ui-composer"
import { StartScreen } from "./src/lib/StartScreen"

/* We need to make sure that this file imports _something_ from @react-three/fiber
because otherwise Vite gets confused. :( */
import "@react-three/fiber"
import { GameCanvas } from "vinxi/GameCanvas"
import { CameraSystem } from "vinxi/systems/camera"
import EditorSystem from "vinxi/systems/editor"
import RenderSystem from "vinxi/systems/render"
import { GLTFSystem } from "vinxi/systems/gltf"
import { ControlledMovementSystem } from "vinxi/systems/controller"
import MeshSystem from "vinxi/systems/mesh"
import { ScriptSystem } from "vinxi/systems/script"
import LightSystem from "vinxi/systems/light"
import { Instances, GroundSystem as TerrainSystem } from "./src/lib/terrain"

function Systems() {
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
      <TerrainSystem />
      <EditorSystem />
    </>
  )
}

export const App = () => {
  return (
    <StartScreen>
      <UI.Root>
        <UI.HorizontalGroup>
          <GameCanvas>
            <Systems />
          </GameCanvas>
        </UI.HorizontalGroup>
      </UI.Root>
    </StartScreen>
  )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

SC.enableDebugging()
