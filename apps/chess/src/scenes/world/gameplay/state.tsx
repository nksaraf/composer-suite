import { RigidBodyApi } from "@react-three/rapier"
import { makeStore } from "statery"
import { AudioListener, Object3D, Vector3 } from "three"
import { createReactAPI } from "miniplex/react"

export enum Layers {
  Player,
  Bullet,
  Asteroid,
  Pickup
}

export const gameplayStore = makeStore({
  listener: null as AudioListener | null
})

import { World } from "miniplex"
const world = new World<Entity>()

export type Entity = {
  asteroid?: {
    spawnPosition: Vector3
    scale: number
  }

  player?: boolean
  bullet?: JSX.Element
  debris?: JSX.Element
  sparks?: JSX.Element
  smoke?: JSX.Element
  pickup?: JSX.Element
  asteroidExplosion?: JSX.Element

  sound?: JSX.Element

  velocity?: Vector3
  health?: number

  jsx?: JSX.Element

  sceneObject?: Object3D
  rigidBody?: RigidBodyApi

  age?: number
  destroyAfter?: number

  camera?: true
  focus?: true
  thirdPerson?: true
  helper?: true
  active?: true
}

export const ECS = createReactAPI<Entity>(world)
