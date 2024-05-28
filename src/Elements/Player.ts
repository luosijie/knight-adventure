import { AnimationAction, AnimationClip, AnimationMixer, ArrowHelper, Group, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Raycaster, Scene, SkinnedMesh, SRGBColorSpace, Texture, Vector2, Vector3 } from 'three'

import fakeShadowMaterial from '@/materials/fakeShadowMaterial'

import Global from './Global'
import Character from './Character'
const global = Global.getInstance()

type Actions = {
    Attack: AnimationAction
    Cheer: AnimationAction
    Death: AnimationAction
    Death_Pose: AnimationAction
    Idle: AnimationAction
    Jump: AnimationAction
    Running: AnimationAction
    Walking: AnimationAction
    Walking_Backwards: AnimationAction
}



const SPEED = {
    FORWARD: .015,
    BACKWARD: .01,
    ROTATION: .02
}

const RAYPOINTS = {
    ORIGIN: new Vector3(0, .6, 0),
    DOWN: new Vector3(0, -1, 0),
    FORWARD: new Vector3(0, 0, -1)
}

export default class Player extends Character {

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

        this.initControls()
    }


    private createActions () {
        
        const animations = this.model.animations
        const Attack = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        const Cheer = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        const Death = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        const Death_Pose = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        const Idle = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === '2H_Melee_Idle'))
        const Jump = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        const Running = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        const Walking = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        const Walking_Backwards = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking_B'))
        
        this.currentAction = Idle
        return {
            Attack,
            Cheer,
            Death,
            Death_Pose,
            Idle,
            Jump,
            Running,
            Walking,
            Walking_Backwards
        }
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
                    this.speed = SPEED.FORWARD
                    this.setAction(this.actions.Walking)
                break
                case 's':
                    this.speed = -SPEED.BACKWARD
                    this.setAction(this.actions.Walking_Backwards)
                break
                case 'a':
                    this.rotation = SPEED.ROTATION
                    this.speed = SPEED.FORWARD
                    this.setAction(this.actions.Walking)
                    break
                case 'd':
                    this.rotation = -SPEED.ROTATION
                    this.speed = SPEED.FORWARD 

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

    setAction(action: AnimationAction) {
        if (this.currentAction === action) return

        this.cancelCurrentAction()
        this.currentAction = action
        this.currentAction.reset()
        this.currentAction.play()
    }

    update (navmesh: Mesh) {
        this.animate()

        if (this.rotation !== 0) this.main.rotateY(this.rotation)

        
        if (this.speed !== 0) {
            const target = new Object3D()
            this.main.getWorldPosition(target.position)
            target.applyQuaternion(this.main.quaternion)
            target.translateZ(-this.speed * 1.5)
            console.log(target.position.z)


            const rayOrigin = new Vector3()
            target.getWorldPosition(rayOrigin)
            rayOrigin.add(RAYPOINTS.ORIGIN)
            
            // TODO: intersect door
            // RAYPOINTS.FORWARD.applyQuaternion(this.main.quaternion)
            // this.raycaster.set(rayOrigin, RAYPOINTS.FORWARD)

            // this.helpers.forward.setDirection(RAYPOINTS.FORWARD)

            // const intersectsDoor = this.raycaster.intersectObjects([door.left, door.right])
            // console.log(intersectsDoor.length)
            // if (intersectsDoor.length) return

            // intersect ground

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