import { Physics } from "@react-three/rapier"
import { Stage } from "../../configuration"
import { ErrorBoundary } from "react-error-boundary"

export const World = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <group>
      <ErrorBoundary fallback={<group></group>}>
        <Physics
          updatePriority={Stage.Physics}
          colliders={false}
          timeStep="vary"
        >
          {children}
        </Physics>
      </ErrorBoundary>
    </group>
  )
}
