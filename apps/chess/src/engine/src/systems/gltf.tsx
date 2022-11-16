import { Suspense, useState } from "react";
import { game } from "../game";
import { Model } from "../components/Model";
import { registerComponent } from "./editor";
import { folder } from "leva";

declare global {
  export interface Components {
    gltf?: {
      url: string;
    };
  }
}

registerComponent("gltf", {
  addTo(e) {},
  controls(entity) {
    return {
      gltf: folder(
        {
          url: {
            value: entity.gltf.url,
            onChange: (value) => {
              entity.gltf.url = value;
              entity.gltf$.setUrl(value);
            },
            transient: true,
          },
        },
        {
          collapsed: true,
        }
      ),
    };
  },
});

const gltfs = game.world.with("gltf");

function Gltf({ entity }) {
  const [url, setUrl] = useState(entity.gltf.url);
  entity.gltf$ = { setUrl };
  return <Model url={url} />;
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
  );
}
