import * as Physics from "@hmans/physics3d"
import { bitmask, Layers } from "render-composer"
import { Vec3 } from "shader-composer"
import { Color } from "three"
import { Skybox } from "../../common/Skybox"
import { Stage } from "../../configuration"
import { Nebula } from "../menu/vfx/Nebula"
import { Asteroids } from "./Asteroids"
import { Bullets } from "./Bullets"
import { Debris } from "./vfx/Debris"
import { FollowCamera } from "./FollowCamera"
import { Player } from "./Player"
import { Sparks } from "./vfx/Sparks"
import { AgeSystem } from "./systems/AgeSystem"
import { BulletSystem } from "./systems/BulletSystem"
import { DestroyAfterSystem } from "./systems/DestroyAfterSystem"
import { ECSFlushSystem } from "./systems/ECSFlushSystem"
import { Board, SquareProps } from "./Board"
import { OrbitControls } from "@react-three/drei"
import { squareColor } from "~/lib/chess"
import { Piece } from "./Piece"

function Square({ size, square, ...props }: SquareProps) {
  const color = squareColor(square)
  return (
    <mesh {...props} scale={size}>
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={
          {
            light: "#d7ff7e",
            dark: "#456f00"
          }[color!]
        }
      />
    </mesh>
  )
}

export const GameplayScene = () => {
  return (
    <group>
      <Physics.World updatePriority={Stage.Physics} gravity={[0, 0, 0]}>
        <Skybox />
        <OrbitControls />
        <Board
          squareComponent={Square}
          pieceComponent={Piece}
          squareSize={2.5}
        />
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

        <AgeSystem />
        <DestroyAfterSystem />
        <BulletSystem />
        <ECSFlushSystem />
      </Physics.World>
    </group>
  )
}
