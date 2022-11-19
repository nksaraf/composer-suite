import React from "react"
import ReactDOM from "react-dom/client"
import * as SC from "shader-composer"
import "./index.css"

import * as UI from "ui-composer"
import { StartScreen } from "./src/lib/StartScreen"
import { Planet } from "./src/lib/planets/react"
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
import { GridSystem } from "./src/scripts/grid"
import { TopDownControlledMovementSystem } from "./src/scripts/top-down-controller"
import worker from "./src/scripts/terrain-worker?worker"
import { Vector3 } from "three"
import { useFrame } from "@react-three/fiber"
import { game } from "vinxi/game"
const vel = new Vector3(0, 0, 0)
function Systems() {
  return (
    <>
      <GridSystem />
      <GLTFSystem />
      <ScriptSystem />
      <MeshSystem />
      <LightSystem />
      <CameraSystem />
      {/* <Instances /> */}
      <RenderSystem />
      <Terrain />
      {/* <ControlledMovementSystem /> */}
      <TopDownControlledMovementSystem />
      {/* <TerrainSystem /> */}
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
const players = game.world.with("controller")
function Terrain() {
  useFrame(() => {
    const [player] = players
    vel.copy(player.transform.position)
  })
  return (
    <Planet
      worker={worker}
      lodOrigin={vel}
      radius={100}
      minCellResolution={1}
      minCellSize={1}
      position={new Vector3(0, -100, 0)}
    >
      <meshStandardMaterial color="blue" wireframe />
    </Planet>
  )
}
