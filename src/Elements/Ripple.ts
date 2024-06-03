import { ShaderMaterial, Mesh, Uniform, PlaneGeometry, Vector3, DoubleSide } from 'three'


import vertexShader from '@/shaders/ripple/vertex.glsl'
import fragmentShader from '@/shaders/ripple/fragment.glsl'

interface Uniforms {
    [uniform:string]: Uniform
}

export default class Ripple {

    uniforms : Uniforms
    mesh: Mesh

    constructor () {
        this.uniforms = {
            uProgress: new Uniform(0)
        }
       
        this.mesh = this.createMesh()
    }

    private createMesh () {
        const material = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: this.uniforms,
            transparent: true,
            side: DoubleSide
        })
        const geometry = new PlaneGeometry(.8, .8)
        geometry.rotateX(-Math.PI / 2)
        geometry.translate(0, .016, 0)
        const mesh = new Mesh(geometry, material)
        return mesh
        //
    }

    reset (position: Vector3) {
        this.mesh.position.x = position.x
        this.mesh.position.z = position.z
        this.uniforms.uProgress.value = 1
    }


    update () {
        this.uniforms.uProgress.value -= .02
    }
}