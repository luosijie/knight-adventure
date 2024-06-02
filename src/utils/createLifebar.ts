import { DoubleSide, Mesh, PlaneGeometry, ShaderMaterial, Uniform } from "three";

import vertexShader from '@/shaders/lifebar/vertex.glsl'
import fragmentShader from '@/shaders/lifebar/fragment.glsl'

export default function () {
    const geometry = new PlaneGeometry(.4, .04)
    const material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uLife: new Uniform(1)
        },
        side: DoubleSide
    })
    return new Mesh(geometry, material)
}