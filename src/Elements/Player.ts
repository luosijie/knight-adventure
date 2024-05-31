import { AnimationClip, Mesh, Object3D, Raycaster, Texture, Vector3 } from 'three'

import Character from './Character'
import fakeShadowMaterial from '@/materials/fakeShadowMaterial'


const RAYPOINTS = {
    ORIGIN: new Vector3(0, .6, 0),
    DOWN: new Vector3(0, -1, 0),
    FORWARD: new Vector3(0, 0, -1)
}

export default class Player extends Character {

    speed: number
    rotation: number

    raycaster: Raycaster






    constructor (model: any, animations: any, texture: Texture) {

        super(model, animations, texture)

        
        this.raycaster = new Raycaster()   

        this.speed = 0
        this.rotation = 0

        this.init()
    }

    private init () {
        this.setActions()
        if (this.currentAction) {
            this.currentAction.play()
        }

        this.initControls()
    }


    private setActions () {
        
        const animations = this.animations
        const Attack = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        const Cheer = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        const Death = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        const Idle = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === '2H_Melee_Idle'))
        
        const Running = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        const Walking = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        const WalkingBackwards = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        
        this.currentAction = Idle
        this.actions.Attack = Attack
        this.actions.Cheer = Cheer
        this.actions.Death = Death
        this.actions.Idle = Idle
        this.actions.Running = Running
        this.actions.Walking = Walking
        this.actions.WalkingBackwards = WalkingBackwards
    }


    private initControls() {
        // Key Down
        window.addEventListener('keydown', (evt:KeyboardEvent) => {
            
            switch (evt.key) {
                // TODO: player jump
                case 'Space' :
                    // this.actions.jumping.reset()
                    // this.actions.jumping.play()
                    break
                case 'w':
                    this.speed = this.speeds.Forward
                    this.setAction(this.actions.Walking)
                break
                case 's':
                    this.speed = -this.speeds.Backward
                    this.setAction(this.actions.WalkingBackwards)
                break
                case 'a':
                    this.rotation = this.speeds.Rotation
                    this.speed = this.speeds.Forward
                    this.setAction(this.actions.Walking)
                    break
                case 'd':
                    this.rotation = -this.speeds.Rotation
                    this.speed = this.speeds.Forward 

                    this.setAction(this.actions.Walking)

            }
        })

        // Key Up
        window.addEventListener('keyup', (evt:KeyboardEvent) => {
     

            switch (evt.key) {
                // TODO: player jump
                case 'Space' :
                    // this.actions.jumping.reset()
                    // this.actions.jumping.play()
                    break
                case 'w':
                    this.speed = 0
                break
                case 's':
                    this.speed = 0
                break
                case 'a':
                    this.rotation = 0
                    break
                case 'd':
                    this.rotation = 0

            }
            
            if (this.speed === 0 && this.rotation === 0) {
                this.setAction(this.actions.Idle)
            }
        })
    }

    update (navmesh: Mesh) {
        this.animate()

        if (this.rotation !== 0) {
            this.main.rotateY(this.rotation)
            this.main.updateMatrix()
        }

        
        if (this.speed !== 0) {
            const target = new Object3D()
            this.main.getWorldPosition(target.position)
            target.applyQuaternion(this.main.quaternion)
            target.translateZ(this.speed * 1.5)


            const rayOrigin = new Vector3()
            target.getWorldPosition(rayOrigin)
            rayOrigin.add(RAYPOINTS.ORIGIN)
            

            this.raycaster.set(rayOrigin, RAYPOINTS.DOWN)

            const intersects = this.raycaster.intersectObjects([navmesh])

            if (intersects.length > 0) {
                const i = intersects[0]
                this.main.position.copy(i.point)
                // this.main.position.lerp(i.point, .6)
            } 

        }
    }
}