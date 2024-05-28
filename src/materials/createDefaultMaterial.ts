import { MeshStandardMaterial, Texture, Uniform } from 'three'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import vertexShader from '@/shaders/default/vertex.glsl'
import fragmentShader from '@/shaders/default/fragment.glsl'

export default function (texture: Texture) {
    // const matarial = new CustomShaderMaterial({
    //     baseMaterial: MeshStandardMaterial,
    //     vertexShader,
    //     fragmentShader,
    //     uniforms: {
    //         uTexture: new Uniform(texture)
    //     },
    //     metalness: 0,
    //     roughness: 1,
    //     // color: '#ffffff',
    //     // metalness: .5,
    //     // roughness: .2,
    //     // envMap,
    //     silent: true
    // })

    const material = new MeshStandardMaterial({
        map: texture,
        metalness: 0,
        roughness: 1
    })

    return material
}