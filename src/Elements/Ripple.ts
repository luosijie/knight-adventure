import { ShaderMaterial, Mesh, Uniform, PlaneGeometry, Vector3 } from 'three'


import vertexShader from '@/shaders/ripple/vertex.glsl'
import fragmentShader from '@/shaders/ripple/fragment.glsl'
import { Position } from 'source-map-js'

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
            transparent: true
        })
        const geometry = new PlaneGeometry(.8, .8)
        geometry.rotateX(-Math.PI / 2)
        geometry.translate(0, .02, 0)
        return new Mesh(geometry, material)
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