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
import Scene from "./src/scenes/world/WorldScene"

export const App = () => {
  return (
    <StartScreen>
      <UI.Root>
        <UI.HorizontalGroup>
          <GameCanvas>
            <Scene />
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
