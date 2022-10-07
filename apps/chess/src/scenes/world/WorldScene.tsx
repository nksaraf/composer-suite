import { Debug, Physics, RigidBody } from "@react-three/rapier"
import { bitmask, Layers } from "render-composer"
import { Vec3 } from "shader-composer"
import { Color } from "three"
import { Skybox } from "../../common/Skybox"
import { Stage } from "../../configuration"
import { Nebula } from "../menu/vfx/Nebula"
import { ErrorBoundary } from "react-error-boundary"
import {
  OrbitControls,
  PerspectiveCamera,
  Plane,
  useTexture
} from "@react-three/drei"

export const WorldScene = () => {
  return (
    <group>
      <ErrorBoundary fallback={<group></group>}>
        <Physics
          updatePriority={Stage.Physics}
          gravity={[0, 0, 0]}
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

          {/* <Player />
        <Asteroids initial={100} />
        <Bullets />
        <Debris />
        <Sparks /> */}
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
