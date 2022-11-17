import { useFrame } from "@react-three/fiber"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as AC from "audio-composer"
import { Suspense } from "react"
import * as RC from "render-composer"
import { Stage } from "./configuration"
import { controller } from "../input"
import { Physics } from "@react-three/rapier"
import { ErrorBoundary } from "react-error-boundary"
import { SidebarTunnel } from "./state"
import { Devtools } from "./Devtools"

export const World = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <group>
      <ErrorBoundary fallback={<group></group>}>
        <Physics
          updatePriority={Stage.Physics}
          colliders={false}
          timeStep="vary"
        >
          <Devtools />
          {children}
        </Physics>
      </ErrorBoundary>
    </group>
  )
}

const Controller = () => {
  useFrame(function updateController() {
    controller.update()
  }, Stage.Early)

  return null
}

const client = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  }
})

export const GameCanvas = ({ children, ...props }: RC.CanvasProps) => {
  return (
    <>
      <RC.Canvas dpr={1} shadows={true} {...props}>
        <Controller />
        <RC.RenderPipeline updatePriority={Stage.Render}>
          <QueryClientProvider client={client}>
            <AC.AudioContext>
              <AC.Compressor>
                <AC.Reverb seconds={2} decay={5}>
                  <Suspense>
                    <World>{children}</World>
                  </Suspense>
                </AC.Reverb>
              </AC.Compressor>
            </AC.AudioContext>
          </QueryClientProvider>
        </RC.RenderPipeline>
      </RC.Canvas>
      <SidebarTunnel.Out />
    </>
  )
}
