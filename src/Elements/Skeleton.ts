import {  AnimationClip, Texture } from 'three'

import Character from './Character'


export default class Skeleton extends Character {

    


    constructor (model: any,animations: any, texture: Texture) {

        super(model, animations, texture)

        this.init()
    }

    private init () {
        this.setActions()
        if (this.currentAction) {
            this.currentAction.play()
        }
    }


    private setActions () {
        const animations = this.animations
        const Attack = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Attack'))
        const Cheer = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Cheer'))
        const Death = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Death'))
        const Idle = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Idle'))
        const Running = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Running'))
        const Walking = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking'))
        
        this.currentAction = Idle
        
        this.actions.Attack = Attack
        this.actions.Cheer = Cheer
        this.actions.Death = Death
        this.actions.Idle = Idle
        this.actions.Running = Running
        this.actions.Walking = Walking
    }

    update () {
        this.animate()

    }
}