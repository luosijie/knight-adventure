import { AnimationAction, AnimationClip, AnimationMixer, ArrowHelper, Group, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Raycaster, Scene, SkinnedMesh, SRGBColorSpace, Texture, Vector3 } from 'three'

import fakeShadowMaterial from '@/materials/fakeShadowMaterial'
import createDefaultMaterial from '@/materials/createDefaultMaterial'



export default class Character {
    model: any
    texture: Texture

    main: Object3D

    

    body: Object3D
    animationMixer: AnimationMixer

    currentAction: AnimationAction | null


    walking: boolean
    speed: number

    rotation: number

    raycaster: Raycaster

    fakeShadow: Mesh






    constructor (model: any, texture: Texture) {
        this.model = model
        this.texture = texture

        this.main = new Object3D()
        

        this.body = this.createBody()
        this.animationMixer = new AnimationMixer(this.body)

        this.fakeShadow = this.createFakeShadow()

        

        this.walking = false

        this.speed = 0

        this.rotation = 0

        this.currentAction = null
       

        this.raycaster = new Raycaster()


        const scale = .25
        this.main.scale.set(scale, scale, scale)        
        this.main.add(this.body)
        // this.main.add(this.fakeShadow)

    }


    private createFakeShadow () {
        const geometry = new PlaneGeometry(3,3)
        const material = fakeShadowMaterial()

        const mesh = new Mesh(geometry, material)
        mesh.position.z = .003

        return mesh
    }


    cancelCurrentAction () {
        if (this.currentAction) {
            this.currentAction.fadeOut(1)
        }
    }

    private createBody () {
        const body = this.model.scene
        
        const texturePlayer: Texture = this.texture
        texturePlayer.flipY = false   
        texturePlayer.colorSpace = SRGBColorSpace
        

        const material = createDefaultMaterial(texturePlayer)


        body.traverse((e:any) => {
            if (e instanceof SkinnedMesh || e instanceof Mesh) {
                e.castShadow = true
                if (e.name === 'Skeleton_Shield') {
                    // e.position.copy(new Vector3())
                    e.scale.copy(new Vector3(1, 1, 1))
                    console.log(e.name, e)
                }
                e.material = material
            }
        })

        return body
    }


    animate () {
    
        this.animationMixer.update(.02)
    }
}