import { useGLTF } from "@react-three/drei"
import { useLayoutEffect } from "react"
import { game } from "../../../scenes/world/gameplay/state"
import { store } from "../systems/editor"

export function Model({ url, ...props }: { url: string }) {
  const entity = game.useCurrentEntity()!
  const { scene } = useGLTF(url)

  useLayoutEffect(() => {
    entity.mesh$ = scene
  }, [entity, scene])
  return (
    <game.Component name="mesh$">
      <primitive
        object={scene}
        key={scene}
        onClick={(e) => {
          e.stopPropagation()
          store.set(({ entities: selectedEntities }) => {
            if (e.shiftKey) {
              return { entities: [...selectedEntities, entity] }
            }
            return { entities: [entity] }
          })
        }}
      />
    </game.Component>
  )
}
