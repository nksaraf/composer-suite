import { Suspense, useState } from "react"
import { registerComponent } from "./editor"
import { folder } from "leva"
import { game } from "../../../scenes/world/gameplay/state"
import { With } from "miniplex"
import { useGLTF } from "@react-three/drei"
import { useLayoutEffect } from "react"
import { store } from "../systems/editor"

declare global {
  export interface Components {
    gltf?: {
      url: string
    }
    gltf$?: {
      setUrl: (url: string) => void
    }
  }
}

registerComponent("gltf", {
  addTo(e) {
    game.world.addComponent(e, "gltf", {
      url: "/Ghost.gltf"
    })
  },
  controls(entity) {
    return {
      gltf: folder(
        {
          url: {
            value: entity.gltf?.url,
            onChange: (value) => {
              entity.gltf.url = value
              if (entity.gltf$) {
                entity.gltf$.setUrl(value)
              }
            },
            transient: true
          }
        },
        {
          collapsed: true
        }
      )
    }
  }
})

const gltfs = game.world.with("gltf")

function Gltf({ entity }: { entity: With<Components, "gltf"> }) {
  const [url, setUrl] = useState(entity.gltf.url)
  entity.gltf$ = { setUrl }
  return <Model url={url} />
}
export function GLTFSystem() {
  return (
    <game.Entities in={gltfs}>
      {(entity) => (
        <game.Entity entity={entity}>
          <Suspense>
            <Gltf entity={entity} />
          </Suspense>
        </game.Entity>
      )}
    </game.Entities>
  )
}

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
        onPointerDown={(e) => {
          e.stopPropagation()
          console.log(e)
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
