import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

import { resolve } from "path"
import fs from "fs-extra"
import _debug from "debug"
import tsconfiPaths from "vite-tsconfig-paths"
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite"
import { createMiddleware } from "@hattip/adapter-node"

function hattip({
  handler
}: {
  handler: (
    config: ResolvedConfig,
    server: ViteDevServer
  ) => Parameters<typeof createMiddleware>[0]
}): Plugin {
  let config: ResolvedConfig

  function configureServer(server: ViteDevServer) {
    return () => {
      server.middlewares.use(createMiddleware(handler(config, server), {}))
    }
  }

  return {
    name: "vite-plugin-vinxi",
    enforce: "pre",

    configResolved(_config) {
      config = _config
    },
    configureServer
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: "assets",
  plugins: [
    tsconfiPaths(),
    react(),
    hattip({
      handler: (config, server) => async (event) => {
        let url = new URL(event.request.url)
        console.log("url", url.pathname)
        if (url.pathname === "/index.html") {
          let file = fs.readFileSync(resolve(config.root, "index.html"))
          return new Response(
            await server.transformIndexHtml(url.pathname, file.toString()),
            {
              headers: {
                "content-type": "text/html"
              }
            }
          )
        }
        if (
          event.request.method === "POST" &&
          url.pathname === "/__editor/save"
        ) {
          const { name, scene } = await event.request.json()
          console.log("saving", name, scene)
          fs.writeFileSync(name, scene)
        }
        if (
          event.request.method === "GET" &&
          url.pathname.startsWith("/__editor/scene")
        ) {
          const scene = fs.readFileSync(
            resolve(config.root, "scenes" + url.pathname.replace("/scene", "")),
            "utf-8"
          )
          return new Response(scene, {
            headers: {
              "Content-Type": "application/json"
            }
          })
        }
        return new Response(``)
        // find out which scene is the editor for
      }
    })
  ]
})
