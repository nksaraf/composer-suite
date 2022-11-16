import { useGLTF } from "@react-three/drei";
import { game } from "../game";
import { store } from "../systems/editor";

export function Model({ url, ...props }) {
  const entity = game.useCurrentEntity();
  const { scene } = useGLTF(url);
  return (
    <game.Component name="mesh$">
      <primitive
        object={scene}
        onClick={(e) => {
          e.stopPropagation();
          store.set(({ entities: selectedEntities }) => {
            if (e.shiftKey) {
              return { entities: [...selectedEntities, entity] };
            }
            return { entities: [entity] };
          });
        }}
      />
    </game.Component>
  );
}
