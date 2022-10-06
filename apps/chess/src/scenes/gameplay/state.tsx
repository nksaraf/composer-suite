import { RigidBodyEntity } from "@hmans/physics3d"
import { Tag } from "miniplex"
import { makeStore } from "statery"
import { Object3D, Vector3 } from "three"
import { DEFAULT_POSITION } from "~/lib/chess/constants"
import { loadFen } from "~/lib/chess/state"
import { createECS } from "../../vendor/miniplex-react/createECS"
import { Square } from "~/lib/chess"
export enum Layers {
  Player,
  Asteroid
}

export const gameplayStore = makeStore({
  player: null as Object3D | null,
  board: loadFen(DEFAULT_POSITION)!,
  selectedSquare: "none" as Square | "none"
})

export type Entity = {
  asteroid?: {
    spawnPosition: Vector3
    scale: number
  }

  isBullet?: Tag
  isDebris?: Tag
  isSparks?: Tag
  isNebula?: Tag

  velocity?: Vector3
  health?: number

  jsx?: JSX.Element

  sceneObject?: Object3D
  rigidBody?: RigidBodyEntity

  age?: number
  destroyAfter?: number
}

export const ECS = createECS<Entity>()
