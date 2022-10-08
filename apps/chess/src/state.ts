import { createStateMachine } from "state-composer"
import { makeStore } from "statery"
import { PerspectiveCamera } from "three"
import tunnel from "tunnel-rat"

export type GameState = "nothing" | "menu" | "gameplay" | "world"

export const GameState = createStateMachine<GameState>("world")

export const startGame = () => GameState.enter("world")

/* A global store for global things. This will eventually be replaced
with more Miniplex entities. */
export const store = makeStore({
  camera: null as PerspectiveCamera | null
})

export const SidebarTunnel = tunnel()
