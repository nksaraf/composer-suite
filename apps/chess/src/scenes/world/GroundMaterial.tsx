import { RawShaderMaterialProps } from "@react-three/fiber"
import { useControls } from "leva"
import { useRef } from "react"
import { forwardRef } from "react"
import mergeRefs from "react-merge-refs"
import { Color, RawShaderMaterial, Texture } from "three"

export const GroundMaterial = forwardRef<
  RawShaderMaterial,
  {
    noiseTexture: Texture
    offset: [number, number]
    scale: number
    initialPosition: [number, number]
  } & RawShaderMaterialProps
>(
  (
    {
      noiseTexture,
      offset = [0, 0],
      initialPosition = [0, 0],
      scale = 1.0,
      ...props
    },
    ref
  ) => {
    let color = "#456789"
    let material = useRef()
    useControls({
      groundColor: {
        value: color,
        onChange(v) {
          material.current!.uniforms.color.value.set(v)
        }
      }
    })

    return (
      <rawShaderMaterial
        ref={mergeRefs([ref, material])}
        uniforms={{
          noiseTexture: { value: noiseTexture },
          posX: { value: initialPosition[0] },
          posZ: { value: initialPosition[1] },
          width: { value: noiseTexture.source.data.width },
          color: { value: new Color(color) },
          scale: { value: scale },
          offsetX: { value: offset[0] },
          offsetY: { value: offset[1] }
        }}
        vertexShader={
          /* glsl */ `
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 modelMatrix;
        uniform float posZ;
        uniform float posX;
        uniform float offsetX;
        uniform float offsetY;

        uniform sampler2D noiseTexture;
        uniform highp float width;
        uniform highp float scale;
        uniform bool elevate;
    
        attribute vec3 position;
    
        varying lowp vec4 cord;
    
        void main() {
          vec3 pos = vec3(0.0);
          pos.x = posX;
          pos.z = posZ;
          pos.y = 0.0;
          
          vec2 texturePosition = (pos.xz + position.xz - vec2(offsetX, offsetY)) / (width * scale);
          cord = texture2D(noiseTexture, texturePosition);
          vec3 vPos = position.xyz;
          vPos.y = ((2.0 * cord.r) - 1.0) * 50.0;
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vPos, 1.0);
        }
      `
        }
        fragmentShader={
          /* glsl */ `
        uniform lowp vec3 color;
      varying lowp vec4 cord;
      void main() {
        gl_FragColor = vec4(color, 1.0);
      }
    `
        }
        {...props}
      />
    )
  }
)
