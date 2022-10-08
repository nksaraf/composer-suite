import { Debug, Physics, RigidBody } from "@react-three/rapier"
import { bitmask, Layers } from "render-composer"
import { Skybox } from "../../common/Skybox"
import { Stage } from "../../configuration"
import { ErrorBoundary } from "react-error-boundary"
import {
  Capsule,
  OrbitControls,
  PerspectiveCamera,
  Plane,
  useTexture
} from "@react-three/drei"
import { Player } from "./Player"
import { SidebarTunnel } from "../../state"
import {
  MiniplexEntityInspector,
  MiniplexInspector
} from "../../editor/MiniplexInspector"
import { ECS } from "../gameplay/state"
import { PlayerSystem } from "../gameplay/systems/PlayerSystem"

export const WorldScene = () => {
  return (
    <group>
      <ErrorBoundary fallback={<group></group>}>
        <Physics
          updatePriority={Stage.Physics}
          colliders={false}
          timeStep="vary"
        >
          <Debug />
          <Skybox />
          <OrbitControls />
          <PerspectiveCamera position={[20, 20, 20]} makeDefault />

          {/* <FollowCamera /> */}

          <ambientLight
            intensity={0.1}
            layers-mask={bitmask(Layers.Default, Layers.TransparentFX)}
          />
          <directionalLight
            position={[20, 20, 20]}
            intensity={1}
            layers-mask={bitmask(Layers.Default, Layers.TransparentFX)}
          />
          <axesHelper />
          <Ground />
          {/*

        <Nebula
          dimensions={Vec3([50, 50, 15])}
          amount={80}
          opacity={0.05}
          minSize={8}
          maxSize={30}
          rotationSpeed={0.1}
          color={new Color("#fff")}
        /> */}
          <Player />
          <SidebarTunnel.In>
            <MiniplexInspector world={ECS.world} />
            <PlayerInspector />
          </SidebarTunnel.In>
          {/* <Player />
        <Asteroids initial={100} />
        <Bullets />
        <Debris />
        <Sparks /> */}
          <PlayerSystem />
        </Physics>
      </ErrorBoundary>
    </group>
  )
}

function Ground() {
  const props = useTexture("/textures/grass.jpeg")
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <Plane scale={100} rotation-x={-Math.PI / 2}>
        <meshStandardMaterial map={props} />
      </Plane>
    </RigidBody>
  )
}

const PlayerInspector = () => {
  const [player] = ECS.useArchetype("player")

  return player ? <MiniplexEntityInspector entity={player} /> : null
}

export default WorldScene
