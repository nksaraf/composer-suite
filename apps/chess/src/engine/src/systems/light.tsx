import { Html, PivotControls, Plane, Sphere } from "@react-three/drei";
import { DirectionalLight, DirectionalLightHelper } from "three";
import { game } from "../game";
import { Helper } from "../components/Helper";
import { store } from "./editor";
import { useStore } from "statery";
import { DirectionalLightProps, useFrame } from "@react-three/fiber";
export const directionalLights = game.world.with("directionalLight");
export const directionalLightObjects = game.world.with("directionalLight$");

declare global {
  export interface Components {
    directionalLight?: DirectionalLightProps;
    directionalLight$?: DirectionalLight;
  }
}

export default function LightEditorSystem() {
  const { editor } = useStore(store);
  useFrame(() => {
    for (const entity of directionalLightObjects) {
      entity.directionalLight$.position.copy(entity.transform.position);
      entity.directionalLight$.rotation.copy(entity.transform.rotation);
      entity.directionalLight$.scale.copy(entity.transform.scale);
    }
  });
  return (
    <game.Entities in={directionalLights}>
      {(entity) => (
        <>
          <game.Component name="directionalLight$">
            {/* <PivotControls> */}
            <directionalLight
              {...entity.transform}
              {...entity.directionalLight}
            />
            {/* </PivotControls> */}
          </game.Component>
          {editor && (
            <game.Component name="helper$">
              <Sphere
                scale={0.25}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  store.set(({ entities: selectedEntities }) => {
                    console.log("e", e);
                    if (e.shiftKey) {
                      return { entities: [...selectedEntities, entity] };
                    }
                    return { entities: [entity] };
                  });
                }}
              >
                <Html
                  style={{
                    userSelect: "none",
                  }}
                  pointerEvents="none"
                >
                  <span
                    style={{
                      fontSize: "1rem",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      store.set(({ entities: selectedEntities }) => {
                        if (e.shiftKey) {
                          return { entities: [...selectedEntities, entity] };
                        }
                        return { entities: [entity] };
                      });
                    }}
                  >
                    💡
                  </span>
                </Html>
                <meshBasicMaterial color="black" />
              </Sphere>
            </game.Component>
          )}
          {editor && (
            <Helper
              entity={() => entity.directionalLight$}
              helper={DirectionalLightHelper}
            />
          )}
        </>
      )}
    </game.Entities>
  );
}
