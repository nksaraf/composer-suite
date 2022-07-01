import { Factory, vec2, vec3 } from "../shadenfreude"

export const GeometryPositionNode = Factory(() => ({
  name: "Position",
  varyings: {
    v_position: vec3("position")
  },
  out: {
    value: vec3("v_position")
  }
}))

export const GeometryNormalNode = Factory(() => ({
  name: "Normal",
  varyings: {
    v_normal: vec3("normal")
  },
  out: {
    value: vec3("v_normal")
  }
}))

export const GeometryUVNode = Factory(() => ({
  name: "UV",
  varyings: {
    v_uv: vec2("uv")
  },
  out: {
    value: vec2("v_uv")
  }
}))
