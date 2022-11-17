import { useTexture } from "@react-three/drei"
import { MeshProps } from "@react-three/fiber"
import React, { forwardRef, useLayoutEffect, useRef } from "react"
import mergeRefs from "react-merge-refs"
import { Mesh } from "three"
import { game } from "../state"
import { store } from "../systems/editor"

export const MeshComponent = forwardRef<
  Mesh,
  Omit<MeshProps, "geometry" | "material"> & {
    entity: any
    geometry: { type: string; props: any }
    material: { type: string; props: any }
  }
>(({ geometry, material, entity, ...props }, forwardedRef) => {
  const { texture } = useTexture(
    entity.assets?.map.url
      ? {
          texture: entity.assets.map.url
        }
      : {}
  )

  const ref = useRef()
  useLayoutEffect(() => {
    game.world.addComponent(entity, "mesh$", ref.current)
    return () => {
      game.world.removeComponent(entity, "mesh$")
    }
  }, [entity])
  return (
    <mesh
      ref={mergeRefs([ref, forwardedRef])}
      {...props}
      onClick={(e) => {
        e.stopPropagation()
        store.set(({ entities: selectedEntities }) => {
          if (e.shiftKey) {
            return { entities: [...selectedEntities, entity] }
          }
          return { entities: [entity] }
        })
      }}
    >
      {React.createElement(
        entity.mesh.geometry.type,
        entity.mesh.geometry.props
      )}
      {React.createElement(entity.mesh.material.type, {
        ...entity.mesh.material.props,
        map: texture
      })}
    </mesh>
  )
})
