import { Box, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { store } from "./editor";
import CameraSystem from "./camera";
import EditorSystem from "./editor";
import RenderSystem from "./render";
import LightSystem from "./light";
import MeshSystem from "./mesh";
import { Debug, Physics, RigidBody } from "@react-three/rapier";
import { Leva, LevaPanel, useControls, LevaInputs } from "leva";
import { Perf } from "r3f-perf";
declare global {
  export interface Components {}
}
import * as RC from "render-composer";

import PhysicsSystem from "./physics";
import { useStore } from "statery";
import { lazy, Suspense, useMemo } from "react";
import { game } from "../game";
import { controller } from "./input";
import { ControlledMovementSystem } from "./controller";
import { Model } from "../components/Model";
import { GLTFSystem } from "./gltf";

declare global {
  export interface Components {
    script?: string;
  }
}

export function PhysicsWorld({ children }) {
  const { editor } = useStore(store);
  return (
    <>
      <Physics>
        {editor && <Debug />}
        {children}
      </Physics>
    </>
  );
}

let map = {};
function ScriptedEntity({ entity }) {
  const Component = useMemo(() => {
    if (map[entity.script]) return map[entity.script];
    let el = lazy(() => import(/* @vite-ignore */ entity.script));
    map[entity.script] = el;
    return el;
  }, []);
  console.log(Component);
  return <Component entity={entity} />;
}

const scripts = game.world.with("script");
function ScriptSystem() {
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
  );
}

export const Stage = {
  Early: -200,
  Physics: -100,
  Normal: 0,
  Late: 100,
  Render: 200,
};

const Controller = () => {
  useFrame(() => {
    controller.update();
  }, Stage.Early);

  return null;
};
export function World({ children = null }) {
  return (
    <>
      <RC.Canvas dpr={1} shadows={true}>
        {/* <Canvas
          shadows
          id="main-canvas"
          onPointerMissed={(e) => store.set({ entities: [] })}
        > */}
        <RC.RenderPipeline updatePriority={Stage.Render}>
          <PhysicsWorld>
            <Suspense>
              {children}
              <Controller />
              <ScriptSystem />
              <GLTFSystem />
              <ControlledMovementSystem />
              <MeshSystem />
              <CameraSystem />
              <RenderSystem />
              <PhysicsSystem />
              <LightSystem />
              <EditorSystem />
            </Suspense>
          </PhysicsWorld>
        </RC.RenderPipeline>
        {/* <Perf position="bottom-left" /> */}
        {/* </Canvas> */}
      </RC.Canvas>
      <EditorPanels />
    </>
  );
}
function EditorPanels() {
  return (
    <Leva
      hidden={true}
      // hidden={!useStore(store).editor}
      theme={{
        space: {
          rowGap: "2px",
          md: "10px",
        },
        sizes: {
          titleBarHeight: "28px",
        },
      }}
    />
  );
}
