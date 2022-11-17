import { makeStore } from "statery"
import { AudioListener } from "three"

export enum Layers {
  Player,
  Bullet,
  Asteroid,
  Pickup
}

export const gameplayStore = makeStore({
  listener: null as AudioListener | null
})

import { parse } from "../world"

import json from "../../../src/scenes/world/home.json?raw"
// const rawData = await fetch("/__editor/scene/home.json").then((res) =>
//   res.text()
// )

let world: ReturnType<typeof parse>
if (globalThis.world) {
  world = globalThis.world
} else {
  world = parse(json)
}
console.log(world)

globalThis.game = world

export const game = world
