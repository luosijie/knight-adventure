import { AnimationAction, AnimationMixer, LoopOnce, LoopRepeat, Mesh, Object3D, PlaneGeometry, Quaternion, ShaderMaterial, SkinnedMesh, SRGBColorSpace, Texture, Vector3 } from 'three'


import fakeShadowMaterial from '@/materials/fakeShadowMaterial'
import createDefaultMaterial from '@/materials/createDefaultMaterial'

import Global from './Global'
import uuid from '@/libs/uuid'
import createLifebar from '@/utils/createLifebar'
import EventEmitter from '@/libs/EventEmitter'
const global = Global.getInstance()


interface ActionConfig {
    fadeIn?: number
    loop?: any
    repetation?: number
}

export interface Config {
    scale?: number
    basicLife?: number
    demage?: number
    castShadow?: boolean
}

interface Next {
    position: Vector3
    quaternion: Quaternion
    dir: Vector3
    dist: number
}

interface Speeds  {
    Forward: number
    Backward: number
    Rotation: number
}

type Action = AnimationAction | null

export type Actions = {
    Attack: Action
    Cheer: Action
    Death: Action
    // Death_Pose: AnimationAction
    Idle: Action
    Running: Action
    Walking: Action
    WalkingBackwards: Action
}

export default class Character extends EventEmitter {
    id: string

    basicLife: number
    life: number
    demage: number
    castShadow: boolean


    liefbar: Mesh

    model: any
    texture: Texture
    animations: any

    main: Object3D
    scale: number
    

    body: Object3D
    animationMixer: AnimationMixer

    currentAction: AnimationAction | null

    actions: Actions

    speeds: Speeds

    walking: boolean

    fakeShadow: Mesh


    path: Array<Vector3>

    target: Vector3 | null
    next: Next | null

    range: number



    constructor (model: any, animations: any,texture: Texture, config: Config = { basicLife: 100 }) {
        super()
        
        this.id = uuid(20)

        this.scale = config.scale || .2
        this.basicLife = config.basicLife || 100
        this.life = config.basicLife || 100
        this.demage = config.demage || 1
        this.castShadow = config.castShadow === undefined ? true : true
        
        this.range = 2
        
        

        this.model = model
        this.animations = animations
        this.texture = texture


        this.main = new Object3D()

        this.actions = {
            Attack: null,
            Cheer: null,
            Death: null,
            // Death_Pose: AnimationAction
            Idle: null,
            Running: null,
            Walking: null,
            WalkingBackwards: null
        }

        this.body = this.createBody()
        this.animationMixer = new AnimationMixer(this.body)

        this.liefbar = createLifebar()
        this.liefbar.position.y = .6

        this.fakeShadow = this.createFakeShadow()

        this.walking = false

        this.speeds = {
            Forward: .8,
            Backward: .01,
            Rotation: .02
        }

        this.currentAction = null


        this.path = []

        this.target = null
        this.next = null

        
        
        // this.main.add(this.fakeShadow)
        this.body.scale.set(this.scale, this.scale, this.scale) 
        
        
        this.main.add(this.body)
        this.main.add(this.liefbar)
        // this.main.add(this.collision)

    }




    private createFakeShadow () {
        const geometry = new PlaneGeometry(3,3)
        const material = fakeShadowMaterial()

        const mesh = new Mesh(geometry, material)
        mesh.position.z = .003

        return mesh
    }



    setAction(action: Action, config: ActionConfig  = {} ) {
        if (action === null) return
        if (this.currentAction === action) return

        const fadeIn = config.fadeIn || 1
        const loop = config.loop || LoopRepeat
        const repetation = config.repetation || Infinity


        this.cancelCurrentAction()
        this.currentAction = action
        this.currentAction.reset()
        this.currentAction.setLoop(config.loop, repetation)
        this.currentAction.clampWhenFinished = loop === LoopOnce
        
        if (fadeIn) {
            this.currentAction.fadeIn(fadeIn)
        }
        

        this.currentAction.play()
    }

    cancelCurrentAction () {
        if (this.currentAction) {
            this.currentAction.fadeOut(1)
        }
    }

    private createBody () {
        const body = this.model
        
        const texturePlayer: Texture = this.texture
        texturePlayer.flipY = false   
        texturePlayer.colorSpace = SRGBColorSpace
        

        const material = createDefaultMaterial(texturePlayer)


        body.traverse((e:any) => {
            if (e instanceof SkinnedMesh || e instanceof Mesh) {
                e.castShadow = this.castShadow
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

    

    setPath (path: Array<Vector3>) {
        this.path = path

        if (this.path.length) {
            this.setNext(this.path.shift())
        }

        
    }

    setNext (position: Vector3 | null | undefined ) {
        if  (position === null || position === undefined) {
            this.next = null
            this.target = null

            this.setAction(this.actions.Idle)
            return null
        }

        position.y = 0

        const dir = position.clone().sub(this.main.position).normalize()

        const dummy = new Object3D()
        dummy.position.copy(this.main.position)
        dummy.lookAt(position)

        const dist = dummy.position.distanceTo(position)

        const next =  {
            position,
            quaternion: dummy.quaternion,
            dist,
            dir
        }

        this.next = next
        return next
    }

    clearPath () {
        this.next = null
        this.path = []

        this.target = null
    }

    async goTo (target: Vector3) {
        if (this.target) return
        this.target = target

        const res = await global.pathFinder.find(this.getPosition(), target)
        
        
        if (res && res.length) {
            const path = res.map(v => new Vector3(v.x, v.y, v.z))
            this.setPath(path)
        }

    }

    setPosition (x: number, y: number, z: number) {
        this.main.position.set(x, y, z)
    }

    getPosition () {
        return this.main.position
    }

    setRotation (x:number, y: number, z: number) {
        this.main.rotation.x = x
        this.main.rotation.y = y
        this.main.rotation.z = z
    }

    getHurt (value?: number) {
        value = value || 1
        this.life -= value

        this.setLifebar(this.life)

        if (this.life <= 0) {
            this.die()
        }
    }

    setLifebar( life: number) {
        if (this.liefbar.material instanceof ShaderMaterial) {
            this.liefbar.material.uniforms.uLife.value = life / this.basicLife
        }
    }

    die () {
        if (this.currentAction === this.actions.Death) return
        this.setAction(this.actions.Death, { loop: LoopOnce, repetation: 1 })
        this.liefbar.visible = false
        this.clearPath()
        
        this.emit('die')
    }

    animate () {
    
        this.animationMixer.update(global.time.delta)
       
        if (this.next) {
            this.setAction(this.actions.Walking)
            this.next.dist = this.main.position.distanceTo(this.next.position)
      

            if (this.next.dist < global.time.delta * this.speeds.Forward) {
                this.main.position.copy(this.next.position)
                this.setNext(this.path.shift())
            } else {
                this.main.position.add(this.next.dir.clone().multiplyScalar(global.time.delta * this.speeds.Forward))
                // this.main.position.lerp(this.next.position, global.time.delta * .6)
                this.main.quaternion.slerp(this.next.quaternion, .06)
            }

        } 


    }
}