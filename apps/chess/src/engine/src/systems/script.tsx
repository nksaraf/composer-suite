import { lazy, Suspense, useMemo } from "react"
import { game } from "../../../scenes/world/gameplay/state"

let map = {}
function ScriptedEntity({ entity }) {
  const Component = useMemo(() => {
    if (map[entity.script]) return map[entity.script]
    let el = lazy(() => import(/* @vite-ignore */ entity.script))
    map[entity.script] = el
    return el
  }, [])
  console.log(Component)
  return <Component entity={entity} />
}
const scripts = game.world.with("script")
export function ScriptSystem() {
  return (
    <game.Entities in={scripts}>
      {(entity) => (
        <game.Entity entity={entity}>
          <Suspense>
            <ScriptedEntity entity={entity} />
          </Suspense>
        </game.Entity>
      )}
    </game.Entities>
  )
}
