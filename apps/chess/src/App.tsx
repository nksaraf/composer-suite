import * as UI from "ui-composer"
import { StartScreen } from "./lib/StartScreen"

/* We need to make sure that this file imports _something_ from @react-three/fiber
because otherwise Vite gets confused. :( */
import "@react-three/fiber"
import { Game } from "./Game"
import { EditorPanels } from "./editor/EditorPanels"

export const App = () => {
  return (
    <StartScreen>
      <UI.Root>
        <UI.HorizontalGroup>
          <Game />
          <EditorPanels />
        </UI.HorizontalGroup>
      </UI.Root>
    </StartScreen>
  )
}
