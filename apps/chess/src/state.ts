import { createStateMachine } from "state-composer"
import { makeStore } from "statery"
import { PerspectiveCamera } from "three"

export const GameState = createStateMachine<"menu" | "world" | "chess">("menu")

export const startGame = () => GameState.enter("world")

export const store = makeStore({
  camera: null as PerspectiveCamera | null
})
