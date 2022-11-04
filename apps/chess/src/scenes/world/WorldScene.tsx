import {
  Debug,
  interactionGroups,
  Physics,
  RigidBody
} from "@react-three/rapier"
import { bitmask, Layers } from "render-composer"
import { Skybox } from "../../common/Skybox"
import { Stage } from "../../configuration"
import { ErrorBoundary } from "react-error-boundary"
import {
  Box,
  Capsule,
  OrbitControls,
  PerspectiveCamera,
  Plane,
  useHelper,
  useTexture
} from "@react-three/drei"
import { ControlledMovementSystem, Player } from "./Player"
import { SidebarTunnel, store } from "../../state"
import {
  MiniplexEntityInspector,
  MiniplexInspector
} from "../../editor/MiniplexInspector"
import { ECS } from "./gameplay/state"
import { PlayerSystem } from "./gameplay/systems/PlayerSystem"
import {
  ActiveCameraSystem,
  CameraHelperSystem,
  ThirdPersonCameraSystem
} from "./systems/ThirdPersonCameraSystem"
import { Tree } from "../../models/Tree"
import { Ghost } from "../../models/Ghost"
import * as AC from "audio-composer"
import { useCapture } from "../../lib/useCapture"
import { Tag } from "miniplex"
import { Adventurer } from "./Adventurer"

export const WorldScene = () => {
  return (
    <group>
      <ErrorBoundary fallback={<group></group>}>
        <Physics
          updatePriority={Stage.Physics}
          colliders={false}
          timeStep="vary"
        >
          {/* <Debug /> */}
          <Skybox />
          <OrbitControls />
          <PlayerCamera />
          <EditorCamera />

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
          <Player />
          <ActiveCameraSystem />
          <ControlledMovementSystem />
          {/* <PlayerSystem /> */}
          <ThirdPersonCameraSystem />
          <CameraHelperSystem />
        </Physics>
      </ErrorBoundary>
    </group>
  )
}

function PlayerCamera() {
  return (
    <ECS.Entity>
      <ECS.Component name="camera" data={Tag} />
      <ECS.Component name="helper" data={Tag} />
      {/* <ECS.Component name="active" data={Tag} /> */}
      <ECS.Component name="thirdPerson" data={Tag} />
      <ECS.Component name="sceneObject">
        <PerspectiveCamera rotation-y={-0.8}>
          <AC.AudioListener />
        </PerspectiveCamera>
      </ECS.Component>
    </ECS.Entity>
  )
}

function EditorCamera() {
  return (
    <ECS.Entity>
      <ECS.Component name="camera" data={Tag} />
      {/* <ECS.Component name="helper" data={Tag} /> */}
      <ECS.Component name="active" data={Tag} />
      <ECS.Component name="sceneObject">
        <PerspectiveCamera position={[20, 20, 20]} />
      </ECS.Component>
    </ECS.Entity>
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
