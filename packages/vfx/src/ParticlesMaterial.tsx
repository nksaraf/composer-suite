import { forwardRef, useMemo } from "react"
import { AddEquation, CustomBlending, MeshStandardMaterial } from "three"
import CustomShaderMaterial from "three-custom-shader-material"
import { iCSMProps } from "three-custom-shader-material/types"
import CustomShaderMaterialImpl from "three-custom-shader-material/vanilla"
import * as shader from "./shader"

/*
This is a custom material that is derived from MeshStandardMaterial,
but with our custom vertex and fragment shader code injected.
This is extremely and very WIP, since not all mesh particles will be using
this kind of material.
*/

type ParticlesMaterialProps = Omit<iCSMProps, "ref"> & {
  billboard?: boolean
}

export const ParticlesMaterial = forwardRef<
  CustomShaderMaterialImpl,
  ParticlesMaterialProps
>(
  (
    { billboard = false, baseMaterial = MeshStandardMaterial, ...props },
    ref
  ) => {
    const uniforms = useMemo(
      () => ({
        u_time: {
          value: 0
        },
        u_billboard: { value: billboard }
      }),
      []
    )

    return (
      <CustomShaderMaterial
        ref={ref}
        baseMaterial={baseMaterial}
        uniforms={uniforms}
        blending={CustomBlending}
        blendEquation={AddEquation}
        depthTest={true}
        depthWrite={false}
        {...shader}
        {...props}
      />
    )
  }
)
