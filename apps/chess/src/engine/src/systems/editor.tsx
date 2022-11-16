import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  PerspectiveCamera,
  TransformControls
} from "@react-three/drei"
import { useStore } from "statery"
import { makeStore } from "statery"
import { useControls, folder, buttonGroup } from "leva"
import { DirectionalLightProps, useFrame } from "@react-three/fiber"
import { Euler, MathUtils, Object3D, Vector3 } from "three"
import { TransformControls as TransformControlsImpl } from "three-stdlib"
import { useKeyboardShortcuts } from "../components/useKeyboardShortcuts"
import { useEffect, useRef, useState } from "react"
import { usePersistedControls } from "../components/usePersistedControls"

import { selectButton } from "../components/selectButton"
import { game } from "../../../scenes/world/gameplay/state"
import { With } from "miniplex"

declare global {
  export interface Components {
    transform?: {
      position: Vector3
      rotation: Euler
      scale: Vector3
    }
    name?: string
    active?: boolean
    directionalLight?: DirectionalLightProps
    helper$?: Object3D
    transformControls$?: TransformControlsImpl
  }
}

export const store = makeStore({
  entities: [] as Components[],
  editor: true
})

export function selectEntity(entity: Components) {
  store.set(({ entities: selectedEntities }) => {
    return { entities: [entity] }
  })
}

let i = 0

export default function EditorSystem() {
  const { editor } = useStore(store)
  useKeyboardShortcuts()

  const [{ grid, axis }, set] = usePersistedControls("editor", {
    grid: true,
    axis: true,
    camera: [10, 10, 10],
    enabled: {
      value: true,
      onChange(v) {
        console.log("editor changed")
        store.set({
          editor: v
        })
      }
    }
  })

  useControls({
    "add entity": buttonGroup({
      "🎥": () => {},
      "💡": () => {},
      "⏺️": () => {},
      "⏹️": () => {
        let e = game.world.add({
          transform: {
            position: new Vector3(0, 0, 0),
            rotation: new Euler(0, 0, 0),
            scale: new Vector3(1, 1, 1)
          },
          name: "unnamed" + i++,
          mesh: {
            geometry: {
              type: "boxGeometry",
              props: {
                args: [1, 1, 1]
              }
            },
            material: {
              type: "meshStandardMaterial",
              props: {
                color: "red"
              }
            }
          }
        })
        store.set({
          entities: [e]
        })
      }
    })
  })

  useEffect(() => {
    set({
      // @ts-ignore
      enabled: editor
    })
  }, [editor])

  return editor ? (
    <>
      <EditorControls />
      <EditorCamera />
      {grid && <gridHelper />}
      {axis && <axesHelper />}
      <GizmoHelper alignment={"bottom-right"}>
        <GizmoViewport />
      </GizmoHelper>
    </>
  ) : null
}

function EditorCamera() {
  const [{ camera }, set] = usePersistedControls("editor", {
    camera: [10, 10, 10]
  })
  return (
    <>
      <PerspectiveCamera position={camera} makeDefault />
      <OrbitControls
        makeDefault
        onChange={(e) => {
          set({
            camera: e?.target.object.position.toArray()
          })
        }}
      />
    </>
  )
}

export function EditorControls() {
  const { entities } = useStore(store)
  return (
    <>
      {entities.map((entity) => (
        <EntityControls key={entity as any} entity={entity} />
      ))}
      {entities.map((entity) => (
        <EntityTransformControls key={entity as any} entity={entity} />
      ))}
    </>
  )
}

let componentLibrary: {
  [key: string]: Parameters<typeof registerComponent>[1]
} = {}

function EntityTransformControls({
  entity
}: {
  entity: Components
}): JSX.Element {
  let ref = useRef<TransformControlsImpl>()
  useEffect(() => {
    function keyDown(event) {
      let control = ref.current
      switch (event.keyCode) {
        case 81: // Q
          control.setSpace(control.space === "local" ? "world" : "local")
          break

        case 16: // Shift
          control.setTranslationSnap(0.5)
          control.setRotationSnap(MathUtils.degToRad(15))
          control.setScaleSnap(0.25)
          break

        case 87: // W
          control.setMode("translate")
          break

        case 69: // E
          control.setMode("rotate")
          break

        case 82: // R
          control.setMode("scale")
          break

        case 187:
        case 107: // +, =, num+
          control.setSize(control.size + 0.1)
          break

        case 189:
        case 109: // -, _, num-
          control.setSize(Math.max(control.size - 0.1, 0.1))
          break

        case 88: // X
          control.showX = !control.showX
          break

        case 89: // Y
          control.showY = !control.showY
          break

        case 90: // Z
          control.showZ = !control.showZ
          break

        case 32: // Spacebar
          control.enabled = !control.enabled
          break

        case 27: // Esc
          control.reset()
          break
      }
    }
    window.addEventListener("keydown", keyDown)
    let keyUp = function (event) {
      let control = ref.current
      switch (event.keyCode) {
        case 16: // Shift
          control.setTranslationSnap(null)
          control.setRotationSnap(null)
          control.setScaleSnap(null)
          break
      }
    }

    window.addEventListener("keyup", keyUp)
    return () => {
      window.removeEventListener("keydown", keyDown)
      window.removeEventListener("keyup", keyUp)
    }
  })
  return (
    <game.Entity entity={entity}>
      <game.Component name="transformControls$">
        <TransformControls
          ref={ref}
          key={entity}
          {...entity.transform}
          onChange={(c) => {
            if (c?.type === "change" && c.target.object) {
              entity.transform.position
                ? entity.transform.position.copy(c.target.object.position)
                : (entity.transform.position = c.target.object.position)
              entity.transform.rotation
                ? entity.transform.rotation.copy(c.target.object.rotation)
                : (entity.transform.rotation = c.target.object.rotation)
              entity.transform.scale
                ? entity.transform.scale.copy(c.target.object.scale)
                : (entity.transform.scale = c.target.object.scale)
            }
          }}
        />
      </game.Component>
    </game.Entity>
  )
}

export function registerComponent<T extends keyof Components>(
  name: T,
  comp: {
    addTo(entity: Components): void
    controls(entity: With<Components, T>, reset: () => void): any
  }
) {
  // @ts-expect-error
  componentLibrary[name] = comp
}

function EntityControls({ entity }: { entity: Components }) {
  console.log("selected", entity)
  const [run, setRun] = useState(0)
  const [, set] = useControls(() => {
    let name = entity.name ?? "unnamed" + i++
    let controls = {}
    Object.keys(entity).forEach((key) => {
      if (componentLibrary[key]) {
        controls = {
          ...controls,
          ...(componentLibrary[key]?.controls?.(entity, () =>
            setRun((r) => r + 1)
          ) ?? {})
        }
      }
    })
    return {
      [name]: folder(
        {
          name: {
            value: name,
            onChange: (value) => {
              entity.name = value
              // entity.object.position.fromArray(value);
            }
          },

          // componentType: {
          //   options: ["mesh", "light", "camera", "grass"],
          // },
          // "add component": button(),
          ...controls,
          newComponent: selectButton({
            options: Object.keys(componentLibrary).filter((e) => !entity[e]),
            onClick: (get) => {
              let componentType = get(name + ".newComponent")
              componentLibrary[componentType]?.addTo(entity)
              setRun((r) => r + 1)
            }
          })
        },
        {
          color: "red"
        }
      )
    }
  }, [entity, run])

  useFrame(function editorControlsSystem() {
    if (entity.transform) {
      set({
        // @ts-expect-error
        position: entity.transform.position.toArray(),
        rotation: [
          entity.transform.rotation.x,
          entity.transform.rotation.y,
          entity.transform.rotation.z
        ],
        scale: entity.transform.scale.toArray()
      })
    }
  })

  return null
}
