import { AnimationAction, AnimationClip, AnimationMixer, ArrowHelper, Group, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Raycaster, Scene, SkinnedMesh, SRGBColorSpace, Texture, Vector3 } from 'three'

import fakeShadowMaterial from '@/materials/fakeShadowMaterial'

import Global from './Global'
import Character from './Character'

type Actions = {
    Attack: AnimationAction
    Cheer: AnimationAction
    Death: AnimationAction
    Death_Pose: AnimationAction
    Idle: AnimationAction
    Running: AnimationAction
    Walking: AnimationAction
}


export default class Skeleton extends Character {

    actions: Actions


    constructor (model: any, texture: Texture) {

        super(model, texture)

        this.actions = this.createActions()



        this.init()
    }

    private init () {

        if (this.currentAction) {
            this.currentAction.play()
        }
    }





    private createActions () {
        const animations = this.model.animations
        const Attack = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Attack'))
        const Cheer = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Cheer'))
        const Death = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Death'))
        const Death_Pose = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Death_Pose'))
        const Idle = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Idle'))
        const Running = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Running'))
        const Walking = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking'))
        
        this.currentAction = Attack
        return {
            Attack,
            Cheer,
            Death,
            Death_Pose,
            Idle,
            Running,
            Walking
        }
    }

    update () {
        this.animate()

    }
}