import { useMemo } from "react"
import { GridHelper } from "three"
import { game } from "vinxi/game"
import { Helper } from "vinxi/lib/Helper"
import { MeshComponent } from "vinxi/lib/MeshComponent"

let grids = game.world.with("grid")

function Grid({ width, height }) {
  const array = useMemo(() => {
    let array = []
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        array.push([i, j])
      }
    }
    return array
  }, [width, height])
}

export function GridSystem() {
  return (
    <game.Entities in={grids}>
      {(entity) => {
        return (
          <game.Entity entity={entity}>
            <game.Component name="gltf$">
              {/* <MeshComponent
                entity={entity}
                geometry={{
                  type: "planeGeometry",
                  props: {
                    args: [10, 10]
                  }
                }}
                material={{
                  type: "meshBasicMaterial",
                  props: {
                    color: "red"
                  }
                }}
              /> */}
              <group>
                <gridHelper />
              </group>
            </game.Component>
          </game.Entity>
        )
      }}
    </game.Entities>
  )
}
