import { PerspectiveCamera } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as AC from "audio-composer"
import { lazy, Suspense } from "react"
import * as RC from "render-composer"
import { PostProcessing } from "./common/PostProcessing"
import { Stage } from "./configuration"
import { controller } from "./input"
import { useCapture } from "./lib/useCapture"
import { GameState, store } from "./state"
const MenuScene = lazy(() => import("./scenes/menu/MenuScene"))
const WorldScene = lazy(() => import("./scenes/world/WorldScene"))

const Controller = () => {
  useFrame(() => {
    controller.update()
  }, Stage.Early)

  return null
}

const client = new QueryClient()

export const Game = () => {
  return (
    <RC.Canvas dpr={1} shadows={true}>
      <Controller />
      <RC.RenderPipeline updatePriority={Stage.Render}>
        <QueryClientProvider client={client}>
          <AC.AudioContext>
            <AC.Compressor>
              {/* <AC.Reverb seconds={2} decay={5}> */}
              <PostProcessing />
              <Suspense>
                <GameState.Match state="menu">
                  <Suspense>
                    <MenuScene />
                  </Suspense>
                </GameState.Match>

                <GameState.Match state="world">
                  <Suspense>
                    <WorldScene />
                  </Suspense>
                </GameState.Match>

                {/* <Perf matrixUpdate /> */}
              </Suspense>
              {/* </AC.Reverb> */}
            </AC.Compressor>
          </AC.AudioContext>
        </QueryClientProvider>
      </RC.RenderPipeline>
    </RC.Canvas>
  )
}
