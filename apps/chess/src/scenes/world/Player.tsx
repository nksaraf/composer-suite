import { Capsule } from "@react-three/drei"
import { interactionGroups, RigidBody } from "@react-three/rapier"
import { Tag } from "miniplex"
import { ECS, Layers } from "../gameplay/state"

export function Player() {
  return (
    <ECS.Entity>
      <ECS.Component name="player" data={Tag} />
      <ECS.Component name="rigidBody">
        <RigidBody
          // angularDamping={3}
          // linearDamping={1}
          // enabledTranslations={[true, true, false]}
          // enabledRotations={[false, false, true]}
          // scale={0.5}
          colliders="cuboid"
          mass={1}
          collisionGroups={interactionGroups(Layers.Player, [Layers.Pickup])}
        >
          <ECS.Component name="sceneObject">
            <Capsule position={[0, 5, 0]}>
              <meshStandardMaterial color="red" />
            </Capsule>
          </ECS.Component>
        </RigidBody>
      </ECS.Component>
    </ECS.Entity>
  )
}
