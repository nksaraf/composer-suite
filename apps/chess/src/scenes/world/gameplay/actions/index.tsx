import { Quaternion, Vector3 } from "three"
import { game } from "../../../../engine/src/state"
import { DebrisEmitter } from "../vfx/Debris"

export const spawnDebris = (position: Vector3, quaternion: Quaternion) => {
  game.world.createEntity({
    age: 0,
    destroyAfter: 3,
    debris: <DebrisEmitter position={position} quaternion={quaternion} />
  })
}
